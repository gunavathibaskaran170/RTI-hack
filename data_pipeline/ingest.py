import os
import re
import sys
import datetime
import requests
import pypdf
import subprocess
import chromadb

# Ensure paths are resolved relative to the script directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.join(BASE_DIR, "source")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_data")
os.makedirs(SOURCE_DIR, exist_ok=True)

# URLs
PRIMARY_URL = "https://cic.gov.in/sites/default/files/RTI-Act_English.pdf"
FALLBACK_URL = "https://www.iitg.ac.in/rti/links/rti-act.pdf"
PDF_PATH = os.path.join(SOURCE_DIR, "rti_act.pdf")

def download_pdf():
    """
    Downloads the RTI Act PDF with fallback sources and proper timeouts.
    If both downloads fail, checks for a manually placed file.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    print("\n--- STAGE 1: DOWNLOAD PDF ---")
    
    # Try primary
    print(f"Attempting to download from primary source: {PRIMARY_URL}")
    try:
        r = requests.get(PRIMARY_URL, headers=headers, timeout=15)
        r.raise_for_status()
        with open(PDF_PATH, "wb") as f:
            f.write(r.content)
        print("Success: Downloaded from primary source.")
        return PRIMARY_URL
    except Exception as e:
        print(f"Warning: Primary source download failed: {e}")
        
    # Try fallback
    print(f"Attempting to download from fallback source: {FALLBACK_URL}")
    try:
        r = requests.get(FALLBACK_URL, headers=headers, timeout=15)
        r.raise_for_status()
        with open(PDF_PATH, "wb") as f:
            f.write(r.content)
        print("Success: Downloaded from fallback source.")
        return FALLBACK_URL
    except Exception as e:
        print(f"Warning: Fallback source download failed: {e}")
        
    # Manual check
    if os.path.exists(PDF_PATH):
        print(f"Success: Download failed, but local copy found at: {PDF_PATH}")
        return "local_manual_copy"
        
    # If all options failed, raise error
    error_msg = (
        f"\n[ERROR] Both download sources failed and no file exists at: {PDF_PATH}\n"
        f"Please manually download the RTI Act, 2005 PDF and place it at:\n"
        f"  {PDF_PATH}\n"
        f"Then re-run this script."
    )
    raise FileNotFoundError(error_msg)

def extract_and_clean_pdf(pdf_path):
    """
    Extracts page text, dynamically detects and removes headers/footers,
    collapses line endings, and resolves hyphenated line breaks.
    """
    print("\n--- STAGE 2: TEXT EXTRACTION & CLEANING ---")
    reader = pypdf.PdfReader(pdf_path)
    pages_text = []
    
    # 1. Extract raw page texts
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        pages_text.append(text or "")
        
    # 2. Dynamically identify repeated headers/footers
    # Examine first/last 3 lines on each page
    line_counts = {}
    total_pages = len(pages_text)
    for page_text in pages_text:
        lines = [l.strip() for l in page_text.split('\n') if l.strip()]
        first_lines = lines[:3]
        last_lines = lines[-3:] if len(lines) > 3 else lines
        
        for l in set(first_lines + last_lines):
            line_counts[l] = line_counts.get(l, 0) + 1
            
    # Keep lines that occur in >= 3 pages as potential header/footers
    # Ignore purely numeric strings (like page numbers) since they differ page by page
    headers_footers = {
        line for line, count in line_counts.items() 
        if count >= 3 and count > 0.1 * total_pages and not line.isdigit()
    }
    
    print("Detected headers/footers to strip:")
    for hf in headers_footers:
        print(f"  - {hf}")
        
    # 3. Clean pages and concatenate
    cleaned_pages = []
    for idx, page_text in enumerate(pages_text):
        lines = page_text.split('\n')
        page_lines = []
        for line in lines:
            stripped = line.strip()
            # Remove headers/footers
            if stripped in headers_footers:
                continue
            # Remove page numbers
            if re.match(r'^\d+$', stripped):
                continue
            # Skip page headers that might slightly vary
            if "right to information act" in stripped.lower() and len(stripped) < 40:
                continue
            page_lines.append(line)
        cleaned_pages.append("\n".join(page_lines))
        
    # Concatenate with page break markers
    full_text = ""
    for i, page_text in enumerate(cleaned_pages):
        full_text += f"\n--- PAGE {i+1} ---\n" + page_text
        
    # Collapse multiple consecutive newlines (3 or more -> 2)
    full_text = re.sub(r'\n{3,}', '\n\n', full_text)
    
    # Fix hyphenated line-break words (e.g., "informa-\ntion" -> "information")
    # Matches words split across lines
    full_text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', full_text)
    
    return full_text

def parse_sections(text):
    """
    Parses sections 1 to 31 sequentially using the validated regex strategy.
    """
    print("\n--- STAGE 3: PARSING SECTIONS ---")
    
    # Find the starting point of the Act (skip arrangement of sections)
    enacted_idx = text.lower().find("1. short title, extent and commencement.—")
    if enacted_idx == -1:
        # Fallback to "be it enacted" or start of Chapter I
        enacted_idx = text.lower().find("be it enacted by parliament")
        if enacted_idx == -1:
            enacted_idx = 0
            
    act_text = text[enacted_idx:]
    
    # Regex to find section headers.
    # Group 1: Section Number
    # Group 2: Section Title
    pattern = r'(?:^|\n)\s*(\d+)\.\s+([A-Z][A-Za-z0-9\s,\'’\(\)\-\/\’‘\"“\”\:\;\’‘\"\‘]*?)(?:\.\s*—|\.—|—|–|\.\s*–|\.\s*-|\.\s+(?=\()|\.\s+(?=[A-Z])|\.\s+|$)'
    
    matches = list(re.finditer(pattern, act_text))
    
    # Filter for sequential sections 1 to 31
    sections = {}
    last_sec = 0
    
    for m in matches:
        num_str = m.group(1)
        num = int(num_str)
        
        # We need sections in strict sequence from 1 to 31
        if num == last_sec + 1 and num <= 31:
            sections[num] = {
                "number": num,
                "title": m.group(2).strip(),
                "header_match": m
            }
            last_sec = num
            
    print(f"Identified {len(sections)} sections in strict sequence.")
    
    # Extract text block for each section
    parsed_data = []
    sorted_keys = sorted(sections.keys())
    
    for i, num in enumerate(sorted_keys):
        curr_sec = sections[num]
        curr_match = curr_sec["header_match"]
        
        # Text starts after this section's header match
        start_pos = curr_match.end()
        
        # Text ends at the start of the next section header
        if i + 1 < len(sorted_keys):
            next_sec_num = sorted_keys[i + 1]
            end_pos = sections[next_sec_num]["header_match"].start()
        else:
            # For Section 31, slice up to "THE FIRST SCHEDULE" or end of text
            first_sched_idx = act_text.lower().find("the first schedule")
            if first_sched_idx != -1 and first_sched_idx > start_pos:
                end_pos = first_sched_idx
            else:
                end_pos = len(act_text)
                
        section_content = act_text[start_pos:end_pos].strip()
        parsed_data.append({
            "number": num,
            "title": curr_sec["title"],
            "text": section_content
        })
        
    return parsed_data

def chunk_section(section_number, section_title, section_text, max_chars=1500):
    """
    Chunks a section's text into blocks of max 1500 chars,
    respecting subsection boundaries or sentence boundaries.
    """
    # Split section into paragraphs/subsections by newline
    paragraphs = [p.strip() for p in section_text.split('\n') if p.strip()]
    chunks = []
    current_chunk = []
    current_length = 0
    
    for p in paragraphs:
        if len(p) > max_chars:
            # Paragraph itself is too long; save whatever we have so far
            if current_chunk:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = []
                current_length = 0
            
            # Split paragraph into sentences
            sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', p)
            curr_s_chunk = []
            curr_s_len = 0
            for s in sentences:
                if curr_s_len + len(s) + (1 if curr_s_chunk else 0) > max_chars:
                    if curr_s_chunk:
                        chunks.append(" ".join(curr_s_chunk))
                    curr_s_chunk = [s]
                    curr_s_len = len(s)
                else:
                    curr_s_chunk.append(s)
                    curr_s_len += len(s) + (1 if len(curr_s_chunk) > 1 else 0)
            if curr_s_chunk:
                chunks.append(" ".join(curr_s_chunk))
        else:
            # Paragraph fits, check if it can be added to current chunk
            if current_length + len(p) + (2 if current_chunk else 0) > max_chars:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = [p]
                current_length = len(p)
            else:
                current_chunk.append(p)
                current_length += len(p) + (2 if len(current_chunk) > 1 else 0)
                
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
        
    return chunks

def validate_chunk(chunk):
    """
    Validates chunks:
    1. Rejects if < 30 chars.
    2. Rejects if > 80% non-alphabetic characters.
    """
    if len(chunk) < 30:
        return False, "Under 30 characters"
        
    # Count alphabetic letters
    alpha_count = sum(1 for c in chunk if c.isalpha())
    alpha_ratio = alpha_count / len(chunk) if len(chunk) > 0 else 0
    
    if alpha_ratio < 0.20:
        return False, f"Garbled text / low alphabetic ratio ({alpha_ratio:.1%} alpha)"
        
    return True, "Valid"

def check_idempotency(client, collection_name="rti_act"):
    """
    Checks if collection is already populated. Prompts user for action.
    """
    try:
        collections = [c.name for c in client.list_collections()]
        if collection_name in collections:
            col = client.get_collection(collection_name)
            count = col.count()
            if count > 0:
                print(f"\n[IDEMPOTENCY] Collection '{collection_name}' already exists with {count} chunks.")
                while True:
                    ans = input("Choose action - (s)kip ingestion, (o)verwrite collection, (a)ppend data [s/o/a]: ").strip().lower()
                    if ans in ['s', 'skip']:
                        return 'skip'
                    elif ans in ['o', 'overwrite']:
                        return 'overwrite'
                    elif ans in ['a', 'append']:
                        return 'append'
                    else:
                        print("Invalid option. Please enter 's', 'o', or 'a'.")
        return 'create'
    except Exception as e:
        print(f"Error checking collection status: {e}")
        return 'create'

def main():
    # Initialize Chroma Persistent Client
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    
    # 1. Idempotency Check
    action = check_idempotency(client, "rti_act")
    
    if action == 'skip':
        print("\nSkipping ingestion. Running verification queries...")
        run_verification()
        return
        
    # 2. Download
    source_url = download_pdf()
    
    # 3. Extraction & Cleaning
    full_text = extract_and_clean_pdf(PDF_PATH)
    
    # 4. Parse Sections
    parsed_sections = parse_sections(full_text)
    
    # Check if we successfully parsed critical sections
    critical_sections = [6, 7, 8, 19, 20]
    parsed_numbers = {s["number"] for s in parsed_sections}
    missing_critical = [cs for cs in critical_sections if cs not in parsed_numbers]
    
    if missing_critical:
        print(f"\n[WARNING] Missing critical sections from parsed results: {missing_critical}")
    else:
        print("\n[INFO] All critical sections (6, 7, 8, 19, 20) successfully parsed.")

    # 5. Chunking & Validation
    chunks_to_store = []
    skipped_sections = []
    
    summary_table = []
    summary_table.append(f"{'SEC #':<7} | {'CHAR COUNT':<10} | {'FIRST 60 CHARACTERS'}")
    summary_table.append("-" * 80)
    
    total_chunks_processed = 0
    total_chunks_valid = 0
    total_chunks_skipped = 0
    
    ingested_date = datetime.date.today().isoformat()
    
    for section in parsed_sections:
        sec_num = section["number"]
        sec_title = section["title"]
        sec_text = section["text"]
        
        # Chunk this section
        chunks = chunk_section(sec_num, sec_title, sec_text)
        
        for idx, chunk in enumerate(chunks):
            total_chunks_processed += 1
            is_valid, reason = validate_chunk(chunk)
            
            if is_valid:
                total_chunks_valid += 1
                chunk_id = f"sec_{sec_num}_chunk_{idx}"
                metadata = {
                    "section_number": str(sec_num),
                    "section_title": sec_title,
                    "source_url": source_url,
                    "ingested_date": ingested_date
                }
                chunks_to_store.append({
                    "id": chunk_id,
                    "document": chunk,
                    "metadata": metadata
                })
                
                # Add to summary table
                snippet = chunk.replace("\n", " ")[:60].strip()
                summary_table.append(f"{sec_num:<7} | {len(chunk):<10} | {snippet}...")
            else:
                total_chunks_skipped += 1
                skipped_sections.append({
                    "number": sec_num,
                    "title": sec_title,
                    "reason": reason,
                    "text_preview": chunk[:100]
                })
                
    # Print the validation summary table
    print("\n--- STAGE 4: VALIDATION SUMMARY TABLE ---")
    for row in summary_table:
        print(row)
        
    if skipped_sections:
        print("\n--- SKIPPED CHUNKS ---")
        for sc in skipped_sections:
            print(f"Sec {sc['number']}: skipped due to: {sc['reason']}")
            print(f"  Preview: {sc['text_preview']}...")
            
    # 6. Store in Chroma
    print("\n--- STAGE 5: STORING IN CHROMADB ---")
    if action == 'overwrite':
        print("Overwriting existing collection 'rti_act'...")
        try:
            client.delete_collection("rti_act")
        except Exception:
            pass
            
    collection = client.get_or_create_collection("rti_act")
    
    if chunks_to_store:
        documents = [c["document"] for c in chunks_to_store]
        ids = [c["id"] for c in chunks_to_store]
        metadatas = [c["metadata"] for c in chunks_to_store]
        
        # Using upsert to handle updates gracefully (avoid duplication in 'append' mode)
        collection.upsert(
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )
        print(f"Successfully upserted {len(chunks_to_store)} chunks into Chroma collection 'rti_act'.")
    else:
        print("Warning: No valid chunks found to store.")
        
    # Print final ingestion stats
    print("\n--- FINAL INGESTION SUMMARY ---")
    print(f"Source PDF Used: {source_url}")
    print(f"Total sections successfully parsed: {len(parsed_sections)}")
    print(f"Total valid chunks ingested: {total_chunks_valid}")
    print(f"Total chunks skipped during validation: {total_chunks_skipped}")
    
    # 7. Verification Subprocess
    print("\n--- STAGE 6: RUNNING VERIFICATION QUERIES ---")
    run_verification()

def run_verification():
    verify_script = os.path.join(BASE_DIR, "verify.py")
    if os.path.exists(verify_script):
        # Run verify.py using the virtual environment's python.exe
        python_exe = sys.executable
        res = subprocess.run([python_exe, verify_script], capture_output=True, text=True)
        print(res.stdout)
        if res.returncode == 0:
            print("Confirmation: verify.py test queries passed successfully.")
        else:
            print(f"Error: verify.py failed with return code {res.returncode}")
            print(res.stderr)
    else:
        print("Warning: verify.py not found. Please run verify.py manually to confirm query answers.")

if __name__ == "__main__":
    main()
