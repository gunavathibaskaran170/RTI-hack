from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserRegister(BaseModel):
    email: EmailStr

class CaseCreate(BaseModel):
    raw_complaint: str
    target_language: Optional[str] = "en"

class ComplaintAnalysisResponse(BaseModel):
    case_id: str
    is_rti_eligible: bool
    info_sought: str
    likely_department: str
    location: str
    confidence_tier: str # 'settled', 'jurisdiction_dependent', or 'needs_lawyer'
    explanation: Optional[str] = None
    draft_text: Optional[str] = None
    pio_name: Optional[str] = None
    pio_address: Optional[str] = None
    pio_email: Optional[str] = None

class DraftRequest(BaseModel):
    confirmed_info_sought: Optional[str] = None
    confirmed_department: Optional[str] = None
    confirmed_location: Optional[str] = None
    target_language: Optional[str] = "en"

class DocumentResponse(BaseModel):
    id: str
    case_id: str
    type: str
    content: str
    generated_at: str

class CaseResponse(BaseModel):
    id: str
    user_id: str
    raw_complaint: str
    classification: str
    confidence_tier: str
    department: str
    location: str
    status: str # 'DRAFTED', 'FILED', 'OVERDUE', 'APPEAL_READY', 'RESOLVED'
    filed_at: Optional[str] = None
    deadline_at: Optional[str] = None
    created_at: str
    documents: List[DocumentResponse] = []
