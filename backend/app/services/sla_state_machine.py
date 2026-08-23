import datetime
import uuid
from app.db.connection import get_db_connection
from app.services.jurisdiction_resolver import JurisdictionResolver
from app.services.drafter import DocumentDrafter

class SLAService:
    @staticmethod
    def check_deadlines():
        """
        Scans SQLite database for cases with status 'FILED' where the deadline has elapsed.
        Escalates them to 'OVERDUE', drafts a First Appeal, and saves it.
        """
        now = datetime.datetime.now().isoformat()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get cases that are FILED and whose deadline_at has passed
        cursor.execute("""
            SELECT c.id, c.user_id, c.raw_complaint, c.department, c.location, u.email 
            FROM cases c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.status = 'FILED' AND c.deadline_at IS NOT NULL AND c.deadline_at <= ?;
        """, (now,))
        
        overdue_cases = [dict(row) for row in cursor.fetchall()]
        
        if not overdue_cases:
            conn.close()
            return
            
        print(f"[SLA ENGINE] Found {len(overdue_cases)} overdue cases. Escalating...")
        
        drafter = DocumentDrafter()
        
        for case in overdue_cases:
            case_id = case["id"]
            user_id = case["user_id"]
            raw_complaint = case["raw_complaint"]
            dept = case["department"]
            loc = case["location"]
            email = case["email"]
            
            print(f"[SLA ENGINE] Processing escalation for Case ID: {case_id}")
            
            try:
                # 1. Update status to 'OVERDUE'
                cursor.execute(
                    "UPDATE cases SET status = 'OVERDUE' WHERE id = ?;",
                    (case_id,)
                )
                
                # 2. Get the original drafted RTI application
                cursor.execute(
                    "SELECT content FROM documents WHERE case_id = ? AND type = 'rti_application';",
                    (case_id,)
                )
                orig_doc = cursor.fetchone()
                orig_content = orig_doc["content"] if orig_doc else "Original RTI Application Details not found."
                
                # 3. Resolve PIO details
                pio_details = JurisdictionResolver.resolve(dept, loc)
                
                # 4. Draft First Appeal
                appeal_content = drafter.draft_first_appeal(
                    raw_complaint=raw_complaint,
                    pio_details=pio_details,
                    original_application_content=orig_content,
                    applicant_email=email
                )
                
                # 5. Store First Appeal document
                doc_id = f"doc_{uuid.uuid4().hex[:10]}"
                cursor.execute("""
                    INSERT INTO documents (id, case_id, type, content, generated_at)
                    VALUES (?, ?, ?, ?, ?);
                """, (doc_id, case_id, "first_appeal", appeal_content, datetime.datetime.now().isoformat()))
                
                # 6. Update status to 'APPEAL_READY'
                cursor.execute(
                    "UPDATE cases SET status = 'APPEAL_READY' WHERE id = ?;",
                    (case_id,)
                )
                conn.commit()
                print(f"[SLA ENGINE] Case {case_id} successfully escalated to APPEAL_READY.")
                
            except Exception as e:
                conn.rollback()
                print(f"[SLA ENGINE] Error escalating case {case_id}: {e}")
                
        conn.close()
