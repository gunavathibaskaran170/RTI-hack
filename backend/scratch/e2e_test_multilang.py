import requests

def test_flow():
    base_url = "http://127.0.0.1:8000"
    session = requests.Session()
    
    # 1. Login
    print("Step 1: Logging in...")
    login_res = session.post(f"{base_url}/api/auth/login", json={"email": "test@rightpath.in"})
    print(f"Login Status: {login_res.status_code}")
    print(f"Login Response: {login_res.json()}\n")
    
    # 2. Submit non-English complaint (Tamil)
    # "எங்கள் தெருவில் மின்വിളக்குகள் 3 மாதங்களாக எரியவில்லை. தயவுசெய்து பராமரிப்பு பதிவேடுகள் மற்றும் செலவு விவரங்களை வழங்கவும்."
    # (Streetlights in our street have not been working for 3 months. Please provide maintenance records and cost details.)
    tamil_complaint = (
        "எங்கள் தெருவில் மின்விளக்குகள் 3 மாதங்களாக எரியவில்லை. "
        "தயவுசெய்து பராமரிப்பு பதிவேடுகள் மற்றும் செலவு விவரங்களை வழங்கவும்."
    )
    
    payload = {
        "raw_complaint": tamil_complaint,
        "target_language": "ta"
    }
    
    print("Step 2: Submitting Tamil complaint...")
    comp_res = session.post(f"{base_url}/api/complaints", json=payload)
    print(f"Submit Status: {comp_res.status_code}")
    
    if comp_res.status_code == 200:
        data = comp_res.json()
        output_path = "scratch/e2e_test_multilang_output.txt"
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("--- API RESPONSE PAYLOAD ---\n")
            f.write(f"Case ID: {data.get('case_id')}\n")
            f.write(f"Is RTI Eligible: {data.get('is_rti_eligible')}\n")
            f.write(f"Info Sought: {data.get('info_sought')}\n")
            f.write(f"Likely Department: {data.get('likely_department')}\n")
            f.write(f"Location: {data.get('location')}\n")
            f.write(f"Confidence Tier: {data.get('confidence_tier')}\n\n")
            
            f.write("--- TRANSLATED EXPLANATION (TAMIL) ---\n")
            f.write(f"{data.get('explanation')}\n\n")
            
            f.write("--- DRAFTED RTI APPLICATION (ENGLISH) ---\n")
            f.write(f"{data.get('draft_text')}\n")
            
        print(f"Success: Integration test output written to {output_path}")
    else:
        print(f"Error Response: {comp_res.text}")

if __name__ == "__main__":
    test_flow()
