import re
from app.db.connection import get_db_connection

class JurisdictionResolver:
    @staticmethod
    def resolve(department: str, location: str) -> dict:
        """
        Deterministically resolves the best-match PIO from the jurisdictions database
        based on department and location (using PIN prefix or keyword matching).
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Retrieve all jurisdictions for the target department
        cursor.execute(
            "SELECT pio_name, pio_address, pio_email, location_pattern FROM jurisdictions WHERE department = ?;",
            (department,)
        )
        candidates = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        if not candidates:
            # Fallback if department has no entries
            return {
                "pio_name": "Public Information Officer",
                "pio_address": f"Concerned PIO, {department} Department Office, {location}",
                "pio_email": "pio@department.gov.in",
                "is_fallback": True
            }
            
        # 2. Extract PIN code (6-digit number) from location string
        pin_match = re.search(r'\b\d{6}\b', location)
        pin = pin_match.group(0) if pin_match else None
        
        location_lower = location.lower()
        
        best_match = None
        match_score = -1 # Higher is better: 3 for PIN, 2 for City/Keyword, 1 for State/Region
        
        for cand in candidates:
            pattern = cand["location_pattern"].lower()
            
            # Case A: Pattern is a wildcard prefix like '560*'
            if pattern.endswith('*'):
                prefix = pattern[:-1]
                if pin and pin.startswith(prefix):
                    score = 3
                    if score > match_score:
                        best_match = cand
                        match_score = score
            # Case B: Standard string pattern match
            else:
                if pattern in location_lower:
                    # Give higher score for specific cities, lower for broad states
                    score = 2 if len(pattern) > 8 else 1
                    if score > match_score:
                        best_match = cand
                        match_score = score
                        
        if best_match:
            return {
                "pio_name": best_match["pio_name"],
                "pio_address": best_match["pio_address"],
                "pio_email": best_match["pio_email"],
                "is_fallback": False
            }
            
        # 3. Fallback: Return the first candidate for this department, customized with user location
        first_cand = candidates[0]
        return {
            "pio_name": first_cand["pio_name"],
            "pio_address": f"{first_cand['pio_name']}, {first_cand['pio_address']} (Jurisdiction fallback for: {location})",
            "pio_email": first_cand["pio_email"],
            "is_fallback": True
        }
