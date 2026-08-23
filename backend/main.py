import os
import time
import uuid
import datetime
import jwt
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import Config
from app.core.chroma_client import ChromaClient
from app.db.connection import get_db_connection, init_db
from app.models.schemas import UserRegister, CaseCreate, CaseResponse, DocumentResponse, ComplaintAnalysisResponse, DraftRequest
from app.services.classifier import ComplaintClassifier
from app.services.jurisdiction_resolver import JurisdictionResolver
from app.services.drafter import DocumentDrafter
from app.services.sla_state_machine import SLAService

# In-memory IP rate limiter for complaints
ip_rate_limits = {}

def check_rate_limit(request: Request):
    """
    Simple in-memory rate limiter for complaint submissions (POST /api/complaints).
    Limits to 5 requests per minute per client IP.
    """
    client_ip = request.client.host if request.client else "unknown_ip"
    now = time.time()
    if client_ip in ip_rate_limits:
        timestamps = ip_rate_limits[client_ip]
        # Retain only timestamps from the last 60 seconds
        timestamps = [t for t in timestamps if now - t < 60]
        ip_rate_limits[client_ip] = timestamps
        
        if len(timestamps) >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many complaints submitted. Please wait a minute."
            )
    else:
        ip_rate_limits[client_ip] = []
        
    ip_rate_limits[client_ip].append(now)

def create_session_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

def decode_session_token(token: str) -> dict:
    try:
        return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None

def get_current_user_id(request: Request) -> str:
    """
    Extracts the user_id from the session cookie.
    Raises 401 if cookie is missing or token is invalid.
    """
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session cookie missing."
        )
    # Handle standard 401 Unauthorized
    payload = decode_session_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token invalid or expired."
        )
    return payload["user_id"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite Database
    init_db()
    
    # 2. Start Overdue SLA Monitor Background Job
    scheduler = BackgroundScheduler()
    # Check every 15 seconds in demo mode for quick escalation, otherwise check every 60 seconds
    interval_sec = 15 if Config.DEMO_MODE else 60
    scheduler.add_job(SLAService.check_deadlines, "interval", seconds=interval_sec)
    scheduler.start()
    print(f"SLA Background Engine started with checking interval of {interval_sec}s.")
    
    yield
    
    # 3. Shutdown scheduler
    scheduler.shutdown()
    print("SLA Background Engine shut down.")

app = FastAPI(
    title="RightPath RTI Copilot Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration — allow localhost for dev, Render URLs for production
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    # Deployed Render frontend (explicit — required for credentials:include)
    "https://rightpath-frontend-okfe.onrender.com",
    "https://rightpath-frontend.onrender.com",
]
# Add any additional frontend URL from env (set in Render dashboard)
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url and frontend_url not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.(onrender\.com|vercel\.app)",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize ChromaDB Client
try:
    chroma_client = ChromaClient()
except Exception as e:
    print(f"ChromaDB initialization failed: {e}")
    chroma_client = None

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/login")
def login(user_data: UserRegister, response: Response):
    """
    Passwordless email-based registration/login.
    Creates user if needed and sets HttpOnly session cookie.
    """
    email = user_data.email.lower().strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
    user = cursor.fetchone()
    
    if user:
        user_id = user["id"]
    else:
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        cursor.execute(
            "INSERT INTO users (id, email, created_at) VALUES (?, ?, ?);",
            (user_id, email, datetime.datetime.now().isoformat())
        )
        conn.commit()
        
    conn.close()
    
    # Create JWT session token
    token = create_session_token(user_id, email)
    
    # Set HTTP-only Cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=Config.COOKIE_SECURE,
        samesite=Config.COOKIE_SAMESITE,
        max_age=7 * 24 * 3600, # 7 days
        path="/"
    )
    
    return {"message": "Login successful", "email": email, "user_id": user_id}

@app.post("/api/auth/logout")
def logout(response: Response):
    """
    Clears the authentication session cookie.
    """
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
def get_me(request: Request):
    """
    Returns currently logged-in user profile.
    """
    token = request.cookies.get("session_token")
    if not token:
        return {"logged_in": False}
    payload = decode_session_token(token)
    if not payload:
        return {"logged_in": False}
    return {"logged_in": True, "user_id": payload["user_id"], "email": payload["email"]}

# --- COMPLAINTS & CASE PIPELINE ---

@app.post("/api/complaints/analyze", response_model=ComplaintAnalysisResponse)
def analyze_complaint_step1(
    case_input: CaseCreate, 
    request: Request,
    user_id: str = Depends(get_current_user_id)
):
    """
    Step 1 of 2-Step Flow:
    Accepts plain text complaints. Performs language translation, Groq LLM classification,
    and resolves PIO jurisdiction.
    Returns extracted fields BEFORE drafting the official RTI application.
    """
    check_rate_limit(request)
    
    raw_complaint = case_input.raw_complaint.strip()
    target_language = case_input.target_language.strip().lower() if case_input.target_language else "en"
    
    if not raw_complaint:
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty.")
        
    classifier = ComplaintClassifier()
    
    # Language detection and translation
    lang_info = classifier.detect_and_translate(raw_complaint)
    detected_lang = lang_info["language"]
    translated_complaint = lang_info["translation"]
    
    # LLM Classifier on translated text
    analysis = classifier.analyze_complaint(translated_complaint)
    
    # Create Case record in ANALYZED state
    case_id = f"case_{uuid.uuid4().hex[:10]}"
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO cases (id, user_id, raw_complaint, raw_complaint_original, raw_complaint_language, classification, confidence_tier, department, location, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        case_id,
        user_id,
        translated_complaint,
        raw_complaint,
        detected_lang,
        analysis["info_sought"],
        analysis["confidence_tier"],
        analysis["likely_department"],
        analysis["location"],
        "ANALYZED",
        datetime.datetime.now().isoformat()
    ))
    conn.commit()
    
    pio_details = JurisdictionResolver.resolve(analysis["likely_department"], analysis["location"])
    
    if analysis["confidence_tier"] == "needs_lawyer":
        explanation_raw = analysis["explanation"] or "This complaint involves matters exempted under Section 8 of the RTI Act or requires professional representation."
        translated_explanation = classifier.translate_explanation(explanation_raw, target_language)
        conn.close()
        return {
            "case_id": case_id,
            "is_rti_eligible": False,
            "info_sought": analysis["info_sought"],
            "likely_department": analysis["likely_department"],
            "location": analysis["location"],
            "confidence_tier": "needs_lawyer",
            "explanation": translated_explanation,
            "draft_text": None,
            "pio_name": pio_details.get("pio_name"),
            "pio_address": pio_details.get("pio_address"),
            "pio_email": pio_details.get("pio_email")
        }

    explanation_msg = (
        f"We understood your grievance as an RTI query regarding '{analysis['info_sought']}' "
        f"for the {analysis['likely_department']} located in '{analysis['location']}'."
    )
    translated_explanation = classifier.translate_explanation(explanation_msg, target_language)
    conn.close()
    
    return {
        "case_id": case_id,
        "is_rti_eligible": analysis["is_rti_eligible"],
        "info_sought": analysis["info_sought"],
        "likely_department": analysis["likely_department"],
        "location": analysis["location"],
        "confidence_tier": analysis["confidence_tier"],
        "explanation": translated_explanation,
        "draft_text": None,
        "pio_name": pio_details.get("pio_name"),
        "pio_address": pio_details.get("pio_address"),
        "pio_email": pio_details.get("pio_email")
    }

@app.post("/api/cases/{case_id}/draft")
def generate_case_draft(
    case_id: str,
    draft_req: DraftRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Step 2 of 2-Step Flow:
    Triggered ONLY after user confirms or edits the extracted understanding.
    Queries ChromaDB RAG, drafts the RTI application, and saves to database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM cases WHERE id = ?;", (case_id,))
    case_row = cursor.fetchone()
    if not case_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found.")
        
    if case_row["user_id"] != user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied.")
        
    # Update fields if user edited them in step 2 confirmation
    info_sought = draft_req.confirmed_info_sought or case_row["classification"]
    department = draft_req.confirmed_department or case_row["department"]
    location = draft_req.confirmed_location or case_row["location"]
    target_language = draft_req.target_language or "en"
    
    cursor.execute("""
        UPDATE cases SET classification = ?, department = ?, location = ?, status = 'DRAFTED' WHERE id = ?;
    """, (info_sought, department, location, case_id))
    conn.commit()
    
    # Resolve PIO
    pio_details = JurisdictionResolver.resolve(department, location)
    
    # Query Chroma
    chroma_chunks = []
    if chroma_client:
        chroma_chunks = chroma_client.query_similarity(info_sought, n_results=3)
        
    # Fetch user email
    cursor.execute("SELECT email FROM users WHERE id = ?;", (user_id,))
    user_row = cursor.fetchone()
    email = user_row["email"] if user_row else "citizen@rightpath.in"
    
    drafter = DocumentDrafter()
    draft_result = drafter.draft_rti_application(
        raw_complaint=case_row["raw_complaint"],
        pio_details=pio_details,
        chroma_chunks=chroma_chunks,
        applicant_email=email
    )
    draft_content = draft_result.get("draft_text", "")
    explanation_content = draft_result.get("explanation", "")
    
    # Save document
    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
        INSERT INTO documents (id, case_id, type, content, generated_at)
        VALUES (?, ?, ?, ?, ?);
    """, (doc_id, case_id, "rti_application", draft_content, datetime.datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    classifier = ComplaintClassifier()
    translated_success = classifier.translate_explanation(explanation_content, target_language)
    
    return {
        "case_id": case_id,
        "info_sought": info_sought,
        "department": department,
        "location": location,
        "confidence_tier": case_row["confidence_tier"],
        "explanation": translated_success,
        "draft_text": draft_content
    }

@app.post("/api/complaints", response_model=ComplaintAnalysisResponse)
def analyze_complaint(
    case_input: CaseCreate, 
    request: Request,
    user_id: str = Depends(get_current_user_id)
):
    """
    Backward-compatible single-shot endpoint. Calls Step 1 then Step 2 internally.
    """
    step1_res = analyze_complaint_step1(case_input, request, user_id)
    if step1_res["confidence_tier"] == "needs_lawyer":
        return step1_res
        
    draft_req = DraftRequest(
        confirmed_info_sought=step1_res["info_sought"],
        confirmed_department=step1_res["likely_department"],
        confirmed_location=step1_res["location"],
        target_language=case_input.target_language
    )
    step2_res = generate_case_draft(step1_res["case_id"], draft_req, user_id)
    return {
        "case_id": step1_res["case_id"],
        "is_rti_eligible": step1_res["is_rti_eligible"],
        "info_sought": step2_res["info_sought"],
        "likely_department": step2_res["department"],
        "location": step2_res["location"],
        "confidence_tier": step1_res["confidence_tier"],
        "explanation": step2_res["explanation"],
        "draft_text": step2_res["draft_text"],
        "pio_name": step1_res.get("pio_name"),
        "pio_address": step1_res.get("pio_address"),
        "pio_email": step1_res.get("pio_email")
    }

@app.post("/api/cases/{case_id}/file")
def file_case(case_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Submits a case. Sets statutory 30-day (or compressed demo mode) deadline countdown.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ownership Validation
    cursor.execute("SELECT user_id, status FROM cases WHERE id = ?;", (case_id,))
    case = cursor.fetchone()
    if not case:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found.")
    if case["user_id"] != user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied. Case belongs to another user.")
        
    now = datetime.datetime.now()
    # If Demo Mode is True, set deadline to 2 minutes, otherwise 30 days
    if Config.DEMO_MODE:
        deadline = now + datetime.timedelta(minutes=2)
    else:
        deadline = now + datetime.timedelta(days=30)
        
    cursor.execute(
        "UPDATE cases SET status = 'FILED', filed_at = ?, deadline_at = ? WHERE id = ?;",
        (now.isoformat(), deadline.isoformat(), case_id)
    )
    conn.commit()
    conn.close()
    
    return {"message": "Case marked as FILED", "deadline_at": deadline.isoformat()}

@app.post("/api/cases/{case_id}/resolve")
def resolve_case(case_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Marks case as resolved upon receiving PIO response.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ownership Validation
    cursor.execute("SELECT user_id FROM cases WHERE id = ?;", (case_id,))
    case = cursor.fetchone()
    if not case:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found.")
    if case["user_id"] != user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied. Case belongs to another user.")
        
    cursor.execute("UPDATE cases SET status = 'RESOLVED' WHERE id = ?;", (case_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Case marked as RESOLVED"}

@app.get("/api/cases", response_model=List[CaseResponse])
def get_cases(user_id: str = Depends(get_current_user_id)):
    """
    Retrieves all cases owned by the current logged-in user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, raw_complaint, classification, confidence_tier, department, location, status, filed_at, deadline_at, created_at
        FROM cases WHERE user_id = ? ORDER BY created_at DESC;
    """, (user_id,))
    cases_rows = cursor.fetchall()
    
    cases_response = []
    for crow in cases_rows:
        case_id = crow["id"]
        # Fetch related documents
        cursor.execute("SELECT id, case_id, type, content, generated_at FROM documents WHERE case_id = ?;", (case_id,))
        doc_rows = cursor.fetchall()
        docs = [dict(d) for d in doc_rows]
        
        cases_response.append({
            "id": crow["id"],
            "user_id": user_id,
            "raw_complaint": crow["raw_complaint"],
            "classification": crow["classification"],
            "confidence_tier": crow["confidence_tier"],
            "department": crow["department"],
            "location": crow["location"],
            "status": crow["status"],
            "filed_at": crow["filed_at"],
            "deadline_at": crow["deadline_at"],
            "created_at": crow["created_at"],
            "documents": docs
        })
        
    conn.close()
    return cases_response

@app.get("/api/cases/{case_id}", response_model=CaseResponse)
def get_case_by_id(case_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Retrieves detail view for a specific case.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, user_id, raw_complaint, classification, confidence_tier, department, location, status, filed_at, deadline_at, created_at
        FROM cases WHERE id = ?;
    """, (case_id,))
    crow = cursor.fetchone()
    
    if not crow:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found.")
        
    if crow["user_id"] != user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied. Case belongs to another user.")
        
    cursor.execute("SELECT id, case_id, type, content, generated_at FROM documents WHERE case_id = ?;", (case_id,))
    doc_rows = cursor.fetchall()
    docs = [dict(d) for d in doc_rows]
    
    conn.close()
    
    return {
        "id": crow["id"],
        "user_id": user_id,
        "raw_complaint": crow["raw_complaint"],
        "classification": crow["classification"],
        "confidence_tier": crow["confidence_tier"],
        "department": crow["department"],
        "location": crow["location"],
        "status": crow["status"],
        "filed_at": crow["filed_at"],
        "deadline_at": crow["deadline_at"],
        "created_at": crow["created_at"],
        "documents": docs
    }

# --- CHATBOT, TRANSLATOR, SCHEMES & PITCH ENDPOINTS ---

from app.core.llm_client import GroqClient
import json

class ChatbotQueryRequest(BaseModel):
    messages: List[dict]
    target_language: str = "en"

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "en"

class SchemeEvaluateRequest(BaseModel):
    answers: dict
    target_language: str = "en"

class PitchGenerateRequest(BaseModel):
    grievance: str
    target_language: str = "en"

HINT_WORDS = {
    "pension": "Check Welfare Schemes: You might be eligible for Old Age Pension, PM-Kisan, or state pension schemes.",
    "pothole": "File an RTI: Request road repair contracts, measurement books, and inspector logs for pothole complaints.",
    "road": "File an RTI: Request construction tenders, contractor completion certificates, and maintenance records.",
    "delay": "Statutory Warning: Under Section 7(1), PIOs must respond within 30 days. Consider drafting a First Appeal.",
    "scheme": "Scheme Navigator: Use the Scheme Eligibility tool to check eligibility for PM-Kisan, PMAY, or health benefits.",
    "money": "Audit Public Funds: Request line-item budgets, vouchers, and project expense ledgers under Section 6(1).",
    "water": "Civic Grievance: Request water quality test records, water supply schedule logs, or municipal budget details.",
    "garbage": "Sanitation Check: Request sanitation work logs, contractor shift records, and waste management budgets.",
    "street light": "Infrastructure Check: Request repair logs, electricity bills, and street light installation records."
}

@app.post("/api/chatbot/query")
def chatbot_query(req: ChatbotQueryRequest, user_id: str = Depends(get_current_user_id)):
    """
    RAG-grounded conversational chatbot endpoint for doubt clearance.
    Returns generated message along with matching suggestion chips.
    """
    messages = req.messages
    target_lang = req.target_language
    
    # Extract last user message for RAG query and hint matching
    last_user_message = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_message = m.get("content", "")
            break
            
    # Hint suggestions logic
    suggestions = []
    if last_user_message:
        lower_msg = last_user_message.lower()
        for kw, sug in HINT_WORDS.items():
            if kw in lower_msg:
                suggestions.append(sug)
                
    # RAG search
    context_text = ""
    if chroma_client and last_user_message:
        try:
            results = chroma_client.query_similarity(last_user_message, n_results=3)
            chunks = []
            for item in results:
                doc = item.get("document", "")
                meta = item.get("metadata") or {}
                stype = meta.get("source_type", "faq")
                topic = meta.get("section_or_topic", "General")
                chunks.append(f"[Source: {stype} | Topic: {topic}]\n{doc}")
            context_text = "\n\n".join(chunks)
        except Exception as e:
            print(f"Chroma RAG error: {e}")
            
    # System Prompt Construction
    system_prompt = (
        "You are RightPath's senior Legal Rights Advisor. Your goal is to clear user doubts in a simple, "
        "reassuring, and authoritative manner. Provide clear explanations of legal rights, steps, and options.\n"
        "Explain statutory timelines and RTI procedures where applicable.\n"
        "Answer the user query in simple terms based on the provided statutory context (RTI rules, precedents, and FAQs).\n"
        "Keep your response concise, clear, and action-oriented. Do not speculate."
    )
    if context_text:
        system_prompt += f"\n\nRetrieved Statutory Context (ground your answer on this):\n{context_text}"
        
    if target_lang.lower() not in ["en", "english"]:
        system_prompt += f"\n\nIMPORTANT: Write your complete response in the language matching code: {target_lang}"

    # Build messages array for LLM
    llm_messages = [{"role": "system", "content": system_prompt}]
    # Retain last 6 messages to keep it token-efficient but conversational
    llm_messages.extend(messages[-6:])
    
    try:
        llm = GroqClient()
        response_text = llm.call_chat_completion(llm_messages, response_json=False, temperature=0.0)
    except Exception as e:
        print(f"Error calling LLM for chatbot: {e}")
        response_text = "I apologize, but I am experiencing issues connecting to my knowledge base right now. Please try again."
        
    return {
        "response": response_text,
        "suggestions": suggestions
    }

@app.post("/api/translator/translate")
def translate_notice(req: TranslateRequest, user_id: str = Depends(get_current_user_id)):
    """
    Translates complex legalese notices side-by-side.
    """
    text = req.text
    target_lang = req.target_language
    
    system_prompt = (
        "You are an expert legal translator. Analyze the raw government or legal notice text and return a JSON object "
        "explaining it in simple, actionable terms for an ordinary citizen.\n"
        "You must return a JSON object with exactly three keys:\n"
        "1. \"simple_meaning\": A plain-language translation of the notice (what it means in simple terms).\n"
        "2. \"deadlines\": A list of strings showing any key dates or deadlines mentioned, along with urgency levels.\n"
        "3. \"required_actions\": A list of strings detailing specific actions the citizen must take next.\n\n"
        f"IMPORTANT: Translate all content values into the language matching code: {target_lang}\n\n"
        "Output must be valid JSON matching this schema:\n"
        "{\n"
        "  \"simple_meaning\": \"...\",\n"
        "  \"deadlines\": [\"...\"],\n"
        "  \"required_actions\": [\"...\"]\n"
        "}"
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Notice Content:\n{text}"}
    ]
    
    try:
        llm = GroqClient()
        res_content = llm.call_chat_completion(messages, response_json=True, temperature=0.0)
        data = json.loads(res_content)
    except Exception as e:
        print(f"Error parsing notice translation: {e}")
        data = {
            "simple_meaning": f"Could not parse the notice automatically. Here is the text: {text[:200]}...",
            "deadlines": ["No deadlines could be automatically extracted."],
            "required_actions": ["Review the notice with a legal advisor or upload a clearer text/scan."]
        }
        
    return data

@app.post("/api/schemes/evaluate")
def evaluate_schemes(req: SchemeEvaluateRequest, user_id: str = Depends(get_current_user_id)):
    """
    Evaluates user answers against welfare eligibility guidelines.
    """
    answers = req.answers
    target_lang = req.target_language
    
    # Format answers dict as a readable string
    answers_str = "\n".join([f"{k}: {v}" for k, v in answers.items()])
    
    system_prompt = (
        "You are a government welfare schemes eligibility expert. Evaluate the citizen profile against these three schemes:\n"
        "1. PM-Kisan (cultivable land holding, income tax status)\n"
        "2. PMAY (housing ownership, annual household income limits)\n"
        "3. Ayushman Bharat (health insurance eligibility, rural background, occupation indicators)\n\n"
        "Based on the user answers provided, evaluate their eligibility for each scheme. Return a JSON object with this schema:\n"
        "{\n"
        "  \"eligible_schemes\": [\n"
        "    {\n"
        "      \"name\": \"Scheme Name\",\n"
        "      \"status\": \"Eligible\" / \"Ineligible\" / \"Possibly Eligible (Requires more detail)\",\n"
        "      \"reason\": \"Brief explanation of eligibility or why they might not qualify.\",\n"
        "      \"benefit\": \"Expected benefits of the scheme.\"\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        f"IMPORTANT: Translate all content values into the language matching code: {target_lang}\n\n"
        "Output must be valid JSON matching the schema."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Citizen Answers:\n{answers_str}"}
    ]
    
    try:
        llm = GroqClient()
        res_content = llm.call_chat_completion(messages, response_json=True, temperature=0.0)
        data = json.loads(res_content)
    except Exception as e:
        print(f"Error evaluating schemes: {e}")
        data = {
            "eligible_schemes": [
                {
                    "name": "PM-Kisan",
                    "status": "Possibly Eligible",
                    "reason": "Verify land holding size (< 2 hectares) with the revenue department.",
                    "benefit": "Rs. 6,000 per year paid in three equal installments."
                },
                {
                    "name": "Pradhan Mantri Awas Yojana (PMAY)",
                    "status": "Possibly Eligible",
                    "reason": "Verify that no member of the household owns a brick/pucca house anywhere in India.",
                    "benefit": "Subsidy or assistance for home construction."
                }
            ]
        }
        
    return data

@app.post("/api/pitch/generate")
def generate_pitch(req: PitchGenerateRequest, user_id: str = Depends(get_current_user_id)):
    """
    Generates a 4-slide pitch deck structure summarizing the grievance case.
    """
    grievance = req.grievance
    target_lang = req.target_language
    
    system_prompt = (
        "You are a case presentation designer. Create a 4-slide presentation deck summarizing the citizen grievance case.\n"
        "Structure the deck content to help the citizen present their issue to municipal or public authorities.\n"
        "Return a JSON object containing exactly a list of 4 slide dictionaries. Schema:\n"
        "{\n"
        "  \"slides\": [\n"
        "    {\n"
        "      \"number\": 1,\n"
        "      \"title\": \"Slide Title\",\n"
        "      \"bullets\": [\"Bullet point 1\", \"Bullet point 2\"]\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        f"IMPORTANT: Translate all slide text to matching language code: {target_lang}\n\n"
        "Output must be valid JSON matching the schema."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Citizen Grievance:\n{grievance}"}
    ]
    
    try:
        llm = GroqClient()
        res_content = llm.call_chat_completion(messages, response_json=True, temperature=0.0)
        data = json.loads(res_content)
    except Exception as e:
        print(f"Error generating pitch: {e}")
        data = {
            "slides": [
                {
                    "number": 1,
                    "title": "Grievance Overview",
                    "bullets": ["Summary of the citizen issue", "Target department responsible"]
                },
                {
                    "number": 2,
                    "title": "Factual Timeline",
                    "bullets": ["When the incident occurred", "Impact of the unresolved delay"]
                },
                {
                    "number": 3,
                    "title": "Legal Basis",
                    "bullets": ["Information requested under Section 6(1)", "PIO's statutory duty to respond under Section 7(1)"]
                },
                {
                    "number": 4,
                    "title": "Action Requested",
                    "bullets": ["Immediate inspection or resolution required", "Filing details logged in RightPath tracker"]
                }
            ]
        }
        
    return data
