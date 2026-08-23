import uuid
from app.db.connection import get_db_connection, init_db

def seed():
    # Ensure database tables exist
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if jurisdictions are already seeded
    cursor.execute("SELECT COUNT(*) FROM jurisdictions;")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Database already has {count} jurisdictions. Skipping seed.")
        conn.close()
        return

    # 30 realistic entries
    jurisdictions_data = [
        # --- Public Works Department (Roads, Infrastructure) ---
        ("Public Works Department", "560*", "Public Information Officer, PWD Bangalore Division", "PWD Office, K.R. Circle, Bangalore, Karnataka - 560001", "pio.pwd.blr@kar.nic.in"),
        ("Public Works Department", "400*", "Public Information Officer, PWD Mumbai Zone", "PWD Compound, Fort, Mumbai, Maharashtra - 400001", "pio.pwd.mumbai@mah.gov.in"),
        ("Public Works Department", "110*", "Public Information Officer, CPWD Delhi Division-I", "CPWD East Block, R.K. Puram, New Delhi - 110066", "pio.cpwd.delhi@nic.in"),
        ("Public Works Department", "600*", "Public Information Officer, PWD Chennai Circle", "Chepauk, Chennai, Tamil Nadu - 600005", "pio.pwd.chennai@tn.gov.in"),
        ("Public Works Department", "700*", "Public Information Officer, PWD Kolkata Division", "Writers Building, Block-A, Kolkata, West Bengal - 700001", "pio.pwd.kol@wb.gov.in"),
        ("Public Works Department", "Karnataka", "Public Information Officer, PWD Bangalore Division", "PWD Office, K.R. Circle, Bangalore, Karnataka - 560001", "pio.pwd.blr@kar.nic.in"),
        ("Public Works Department", "Maharashtra", "Public Information Officer, PWD Mumbai Zone", "PWD Compound, Fort, Mumbai, Maharashtra - 400001", "pio.pwd.mumbai@mah.gov.in"),
        
        # --- Water Supply and Sanitation ---
        ("Water Supply and Sanitation Department", "560*", "Public Information Officer, BWSSB Central Office", "Cauvery Bhavan, K.G. Road, Bangalore, Karnataka - 560009", "pio.water.blr@bwssb.gov.in"),
        ("Water Supply and Sanitation Department", "400*", "Public Information Officer, MCGM Water Works Department", "Municipal Head Office, Fort, Mumbai, Maharashtra - 400001", "pio.water.mumbai@mcgm.gov.in"),
        ("Water Supply and Sanitation Department", "110*", "Public Information Officer, Delhi Jal Board (DJB)", "Varunalaya Phase-II, Jhandewalan, New Delhi - 110005", "pio.water.delhi@djb.nic.in"),
        ("Water Supply and Sanitation Department", "600*", "Public Information Officer, CMWSSB Water Board", "No. 1, Pumping Station Road, Chintadripet, Chennai, Tamil Nadu - 600002", "pio.water.chennai@cmwssb.gov.in"),
        ("Water Supply and Sanitation Department", "700*", "Public Information Officer, KMC Water Supply Division", "5, S.N. Banerjee Road, Kolkata, West Bengal - 700013", "pio.water.kol@kmc.gov.in"),
        ("Water Supply and Sanitation Department", "Bengaluru", "Public Information Officer, BWSSB Central Office", "Cauvery Bhavan, K.G. Road, Bangalore, Karnataka - 560009", "pio.water.blr@bwssb.gov.in"),
        ("Water Supply and Sanitation Department", "Mumbai", "Public Information Officer, MCGM Water Works Department", "Municipal Head Office, Fort, Mumbai, Maharashtra - 400001", "pio.water.mumbai@mcgm.gov.in"),
        
        # --- Municipal Corporations / Civil Administration ---
        ("Municipal Corporation", "560*", "Public Information Officer, BBMP Head Office", "Hudson Circle, Bangalore, Karnataka - 560002", "pio.bbmp.central@kar.nic.in"),
        ("Municipal Corporation", "400*", "Public Information Officer, BMC Central Division", "Municipal Building, Mahapalika Marg, Mumbai, Maharashtra - 400001", "pio.bmc.mumbai@bmc.gov.in"),
        ("Municipal Corporation", "110*", "Public Information Officer, Municipal Corporation of Delhi (MCD)", "Civic Centre, Minto Road, New Delhi - 110002", "pio.mcd.delhi@mcd.nic.in"),
        ("Municipal Corporation", "600*", "Public Information Officer, Greater Chennai Corporation (GCC)", "Ripon Building, Chennai, Tamil Nadu - 600003", "pio.gcc.chennai@tn.gov.in"),
        ("Municipal Corporation", "700*", "Public Information Officer, Kolkata Municipal Corporation", "5, S.N. Banerjee Road, Kolkata, West Bengal - 700013", "pio.kmc.kol@kmc.gov.in"),
        ("Municipal Corporation", "Delhi", "Public Information Officer, Municipal Corporation of Delhi (MCD)", "Civic Centre, Minto Road, New Delhi - 110002", "pio.mcd.delhi@mcd.nic.in"),
        
        # --- Electricity Boards ---
        ("Electricity Board", "560*", "Public Information Officer, BESCOM Central Division", "Corporate Office, K.R. Circle, Bangalore, Karnataka - 560001", "pio.bescom@bescom.co.in"),
        ("Electricity Board", "400*", "Public Information Officer, MSEDCL Mumbai Zone", "Prakashgad, Bandra (East), Mumbai, Maharashtra - 400051", "pio.msedcl.mumbai@mahadiscom.in"),
        ("Electricity Board", "110*", "Public Information Officer, BSES Yamuna Power Ltd", "Shakti Kiran Building, Karkardooma, Delhi - 110092", "pio.bses.delhi@bses.com"),
        ("Electricity Board", "600*", "Public Information Officer, TANGEDCO Tamil Nadu Electricity Board", "NPKRR Maaligai, 144 Anna Salai, Chennai, Tamil Nadu - 600002", "pio.tneb.chennai@tneb.gov.in"),
        ("Electricity Board", "700*", "Public Information Officer, CESC West Bengal", "CESC House, Chowringhee Square, Kolkata, West Bengal - 700001", "pio.cesc.kol@cesc.co.in"),
        ("Electricity Board", "Kolkata", "Public Information Officer, CESC West Bengal", "CESC House, Chowringhee Square, Kolkata, West Bengal - 700001", "pio.cesc.kol@cesc.co.in"),
        
        # --- Revenue and Land Records ---
        ("Revenue and Land Records", "560*", "Public Information Officer, Revenue Department Bangalore", "Kandaya Bhavan, K.G. Road, Bangalore, Karnataka - 560009", "pio.revenue.blr@kar.nic.in"),
        ("Revenue and Land Records", "400*", "Public Information Officer, Mumbai Suburban Collectorate", "Administrative Building, Chembur, Mumbai, Maharashtra - 400071", "pio.collector.submumbai@mah.gov.in"),
        ("Revenue and Land Records", "110*", "Public Information Officer, Delhi Revenue Department Office", "5, Sham Nath Marg, Civil Lines, Delhi - 110054", "pio.revenue.delhi@delhi.gov.in"),
        ("Revenue and Land Records", "600*", "Public Information Officer, Land Revenue Commissionerate Chennai", "Ezhilagam, Chepauk, Chennai, Tamil Nadu - 600005", "pio.revenue.chennai@tn.gov.in"),
    ]
    
    for dept, pattern, name, address, email in jurisdictions_data:
        jur_id = f"jur_{uuid.uuid4().hex[:10]}"
        cursor.execute("""
        INSERT INTO jurisdictions (id, department, location_pattern, pio_name, pio_address, pio_email)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (jur_id, dept, pattern, name, address, email))
        
    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(jurisdictions_data)} jurisdictions.")

if __name__ == "__main__":
    seed()
