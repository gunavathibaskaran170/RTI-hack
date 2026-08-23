import os
import re
import datetime
import requests
import pypdf
import chromadb

# ---------------------------------------------------------------------------
# DOWNLOAD & EXTRACT UTILITIES
# ---------------------------------------------------------------------------

def download_pdf(url: str, fallback_url: str, dest_path: str) -> str:
    """
    Downloads a PDF from a primary URL with a fallback URL.
    Returns the URL actually used, or raises FileNotFoundError.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"Attempting to download from primary source: {url}")
    try:
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        with open(dest_path, "wb") as f:
            f.write(r.content)
        print("Success: Downloaded from primary source.")
        return url
    except Exception as e:
        print(f"Warning: Primary source download failed: {e}")

    if fallback_url:
        print(f"Attempting to download from fallback source: {fallback_url}")
        try:
            r = requests.get(fallback_url, headers=headers, timeout=20)
            r.raise_for_status()
            with open(dest_path, "wb") as f:
                f.write(r.content)
            print("Success: Downloaded from fallback source.")
            return fallback_url
        except Exception as e:
            print(f"Warning: Fallback source download failed: {e}")

    if os.path.exists(dest_path):
        print(f"Success: Downloads failed, but local copy found at: {dest_path}")
        return "local_manual_copy"

    raise FileNotFoundError(f"Both download sources failed and no file exists at: {dest_path}")


def fetch_html_text(url: str) -> str:
    """
    Fetches a URL and returns the raw text content (stripped of HTML tags).
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    r = requests.get(url, headers=headers, timeout=20)
    r.raise_for_status()
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", " ", r.text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"\s{3,}", "\n\n", text)
    return text.strip()


def extract_and_clean_pdf(pdf_path: str) -> str:
    """
    Extracts pages from PDF, strips headers/footers, and collapses line endings.
    """
    reader = pypdf.PdfReader(pdf_path)
    pages_text = []

    for page in reader.pages:
        text = page.extract_text()
        pages_text.append(text or "")

    # Dynamically identify repeated headers/footers
    line_counts = {}
    total_pages = len(pages_text)
    for page_text in pages_text:
        lines = [l.strip() for l in page_text.split('\n') if l.strip()]
        first_lines = lines[:3]
        last_lines = lines[-3:] if len(lines) > 3 else lines

        for l in set(first_lines + last_lines):
            line_counts[l] = line_counts.get(l, 0) + 1

    headers_footers = {
        line for line, count in line_counts.items()
        if count >= 3 and count > 0.1 * total_pages and not line.isdigit()
    }

    cleaned_pages = []
    for page_text in pages_text:
        lines = page_text.split('\n')
        page_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped in headers_footers:
                continue
            if re.match(r'^\d+$', stripped):
                continue
            page_lines.append(line)
        cleaned_pages.append("\n".join(page_lines))

    full_text = ""
    for i, page_text in enumerate(cleaned_pages):
        full_text += f"\n--- PAGE {i+1} ---\n" + page_text

    full_text = re.sub(r'\n{3,}', '\n\n', full_text)
    full_text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', full_text)

    return full_text


# ---------------------------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------------------------

def validate_chunk(chunk: str) -> tuple:
    """
    Validates a chunk:
    1. Rejects if < 30 chars.
    2. Rejects if > 80% non-alphabetic characters.
    Returns (is_valid: bool, reason: str).
    """
    if len(chunk) < 30:
        return False, "Under 30 characters"

    alpha_count = sum(1 for c in chunk if c.isalpha())
    alpha_ratio = alpha_count / len(chunk) if len(chunk) > 0 else 0

    if alpha_ratio < 0.20:
        return False, f"Garbled text / low alphabetic ratio ({alpha_ratio:.1%} alpha)"

    return True, "Valid"


# ---------------------------------------------------------------------------
# CHUNKING STRATEGIES
# ---------------------------------------------------------------------------

def chunk_text_generic(text: str, source_name: str, chunk_prefix: str, max_chars: int = 1500) -> list:
    """
    Generically chunks a raw text body into blocks of max_chars, creating metadata.
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []
    current_chunk = []
    current_length = 0
    chunk_index = 0

    for p in paragraphs:
        if len(p) > max_chars:
            if current_chunk:
                chunks.append({
                    "id": f"{chunk_prefix}_chunk_{chunk_index}",
                    "text": "\n\n".join(current_chunk),
                    "metadata": {"source_act": source_name, "chunk_index": chunk_index}
                })
                chunk_index += 1
                current_chunk = []
                current_length = 0

            sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', p)
            curr_s_chunk = []
            curr_s_len = 0
            for s in sentences:
                if curr_s_len + len(s) + 1 > max_chars:
                    if curr_s_chunk:
                        chunks.append({
                            "id": f"{chunk_prefix}_chunk_{chunk_index}",
                            "text": " ".join(curr_s_chunk),
                            "metadata": {"source_act": source_name, "chunk_index": chunk_index}
                        })
                        chunk_index += 1
                    curr_s_chunk = [s]
                    curr_s_len = len(s)
                else:
                    curr_s_chunk.append(s)
                    curr_s_len += len(s) + 1
            if curr_s_chunk:
                chunks.append({
                    "id": f"{chunk_prefix}_chunk_{chunk_index}",
                    "text": " ".join(curr_s_chunk),
                    "metadata": {"source_act": source_name, "chunk_index": chunk_index}
                })
                chunk_index += 1
        else:
            if current_length + len(p) + 2 > max_chars:
                chunks.append({
                    "id": f"{chunk_prefix}_chunk_{chunk_index}",
                    "text": "\n\n".join(current_chunk),
                    "metadata": {"source_act": source_name, "chunk_index": chunk_index}
                })
                chunk_index += 1
                current_chunk = [p]
                current_length = len(p)
            else:
                current_chunk.append(p)
                current_length += len(p) + 2

    if current_chunk:
        chunks.append({
            "id": f"{chunk_prefix}_chunk_{chunk_index}",
            "text": "\n\n".join(current_chunk),
            "metadata": {"source_act": source_name, "chunk_index": chunk_index}
        })

    return chunks


def chunk_faq_pairs(text, source_name=None, prefix=None) -> list:
    """
    Chunks FAQ content. Supports two signatures:
    1. chunk_faq_pairs(faq_items: list, chunk_prefix: str, base_metadata: dict) -> list
    2. chunk_faq_pairs(text: str, source_name: str, prefix: str) -> list (splits on Q: / A: or numbered patterns)
    """
    if isinstance(text, list):
        faq_items = text
        chunk_prefix = source_name
        base_metadata = prefix if prefix is not None else {}
        chunks = []
        ingested_date = datetime.date.today().isoformat()

        for i, item in enumerate(faq_items):
            q = item.get("question", "").strip()
            a = item.get("answer", "").strip()
            if not q or not a:
                continue

            text_content = f"Q: {q}\nA: {a}"
            is_valid, reason = validate_chunk(text_content)
            if not is_valid:
                print(f"  [SKIP] FAQ chunk {i}: {reason}")
                continue

            metadata = {
                **base_metadata,
                "chunk_index": str(i),
                "section_or_topic": q[:80],
                "ingested_date": ingested_date,
            }
            chunks.append({
                "id": f"{chunk_prefix}_faq_{i}",
                "text": text_content,
                "metadata": metadata
            })
        return chunks
    else:
        faq_items = []
        pattern = r'(?i)\n*(?:Q(?:uestion)?\s*(?:\d+)?\s*[:\.-]\s*|\bQ\d+[:\.-]\s*)'
        parts = re.split(pattern, text)
        for part in parts:
            part = part.strip()
            if not part:
                continue
            ans_match = re.search(r'(?i)\n*(?:A(?:nswer)?\s*(?:\d+)?\s*[:\.-]\s*|\bA\d+[:\.-]\s*)', part)
            if ans_match:
                q = part[:ans_match.start()].strip()
                a = part[ans_match.end():].strip()
                faq_items.append({"question": q, "answer": a})
            else:
                if "?" in part:
                    idx = part.find("?") + 1
                    q = part[:idx].strip()
                    a = part[idx:].strip()
                    faq_items.append({"question": q, "answer": a})
        
        base_metadata = {
            "source_type": "faq",
            "source_url": "",
            "state": "",
            "jurisdiction_dependent": "false"
        }
        return chunk_faq_pairs(faq_items, prefix if prefix else "faq_prefix", base_metadata)


def chunk_per_rule(text, source_name=None, prefix=None) -> list:
    """
    Chunks procedural rules. Supports two signatures:
    1. chunk_per_rule(rules_items: list, chunk_prefix: str, base_metadata: dict) -> list
    2. chunk_per_rule(text: str, source_name: str, prefix: str) -> list (splits by rule/sub-rule number pattern)
    """
    if isinstance(text, list):
        rules_items = text
        chunk_prefix = source_name
        base_metadata = prefix if prefix is not None else {}
        chunks = []
        ingested_date = datetime.date.today().isoformat()

        for i, item in enumerate(rules_items):
            rule_num = str(item.get("rule_number", i))
            rule_title = item.get("rule_title", "").strip()
            text_val = item.get("text", "").strip()

            if not text_val:
                continue

            full_text = f"Rule {rule_num}"
            if rule_title:
                full_text += f" — {rule_title}"
            full_text += f"\n{text_val}"

            is_valid, reason = validate_chunk(full_text)
            if not is_valid:
                print(f"  [SKIP] Rule chunk {rule_num}: {reason}")
                continue

            metadata = {
                **base_metadata,
                "rule_number": rule_num,
                "section_or_topic": f"Rule {rule_num}: {rule_title}"[:100],
                "ingested_date": ingested_date,
            }
            chunks.append({
                "id": f"{chunk_prefix}_rule_{rule_num.replace('.', '_')}",
                "text": full_text,
                "metadata": metadata
            })
        return chunks
    else:
        pattern = r'(?i)\n*(?:Rule\s+\d+\b[.:\s\.-]*)'
        matches = list(re.finditer(pattern, text))
        rules_items = []
        for i in range(len(matches)):
            start = matches[i].end()
            end = matches[i+1].start() if i + 1 < len(matches) else len(text)
            rule_num_match = re.search(r'\d+', matches[i].group())
            rule_num = rule_num_match.group() if rule_num_match else str(i+1)
            
            rule_content = text[start:end].strip()
            lines = rule_content.split('\n')
            rule_title = lines[0].strip() if lines else ""
            rule_text = "\n".join(lines[1:]).strip() if len(lines) > 1 else rule_content
            
            rules_items.append({
                "rule_number": rule_num,
                "rule_title": rule_title,
                "text": rule_text or rule_content
            })
            
        base_metadata = {
            "source_type": "rules",
            "source_url": "",
            "state": "",
            "jurisdiction_dependent": "false"
        }
        return chunk_per_rule(rules_items, prefix if prefix else "rule_prefix", base_metadata)


def chunk_per_case(cases_list: list, chunk_prefix: str, base_metadata: dict = None) -> list:
    """
    Chunks legal precedents, one chunk per case.
    cases_list: list of dicts with keys 'citation', 'holding', 'relevance'.
    chunk_prefix: ID prefix for the chunks.
    base_metadata: optional shared metadata fields.
    """
    if base_metadata is None:
        base_metadata = {
            "source_type": "precedent",
            "source_url": "",
            "state": "",
            "jurisdiction_dependent": "false"
        }
    chunks = []
    ingested_date = datetime.date.today().isoformat()

    for i, case in enumerate(cases_list):
        citation = case.get("citation", "").strip()
        holding = case.get("holding", "").strip()
        relevance = case.get("relevance", "").strip()

        if not citation or not holding:
            continue

        text = f"Case: {citation}\nHolding/Ratio: {holding}"
        if relevance:
            text += f"\nRelevance: {relevance}"

        is_valid, reason = validate_chunk(text)
        if not is_valid:
            print(f"  [SKIP] Case chunk {citation}: {reason}")
            continue

        metadata = {
            **base_metadata,
            "citation": citation[:120],
            "section_or_topic": citation[:80],
            "ingested_date": ingested_date,
        }
        chunks.append({
            "id": f"{chunk_prefix}_case_{i}",
            "text": text,
            "metadata": metadata
        })

    return chunks


# ---------------------------------------------------------------------------
# CHROMADB STORAGE
# ---------------------------------------------------------------------------

def store_in_chroma(chunks: list, chroma_path: str, collection_name: str = "rti_act") -> int:
    """
    Stores chunked texts in ChromaDB using upsert (idempotent).
    Returns count of chunks stored.
    """
    if not chunks:
        print("Warning: No chunks to store.")
        return 0

    client = chromadb.PersistentClient(path=chroma_path)
    collection = client.get_or_create_collection(collection_name)

    ids = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    # Ensure all metadata values are strings (ChromaDB requirement)
    sanitized_metadatas = []
    for m in metadatas:
        sanitized_metadatas.append({k: str(v) for k, v in m.items()})

    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=sanitized_metadatas
    )
    print(f"Successfully stored {len(chunks)} chunks in collection '{collection_name}' at {chroma_path}.")
    return len(chunks)
