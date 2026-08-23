"""
expand_rti_corpus.py
────────────────────
Expands the existing "rti_act" ChromaDB collection with 6 new categories
of official RTI knowledge. All content is pre-verified and stored offline;
no live web-fetching occurs at query time.

Source categories:
  1. RTI Rules, 2012            → source_type="rules"
  2. CIC FAQs                   → source_type="faq"
  3. Model RTI Application Format → source_type="sample_format"
  4. Second Appeal Procedure    → source_type="faq" (section_or_topic="second_appeal")
  5. Key CIC/Court Precedents   → source_type="precedent"
  6. State RTI Rules (MH/KA/TN) → source_type="state_rule" + state=<name> + jurisdiction_dependent="true"
"""

import os
import sys
import datetime
import chromadb

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_data")
SOURCE_DIR = os.path.join(BASE_DIR, "source")
os.makedirs(SOURCE_DIR, exist_ok=True)

# Add BASE_DIR to path so we can import ingestion_utils
sys.path.insert(0, BASE_DIR)
from ingestion_utils import (
    chunk_faq_pairs,
    chunk_per_rule,
    chunk_per_case,
    validate_chunk,
    store_in_chroma,
)

INGESTED_DATE = datetime.date.today().isoformat()


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE 1 ─ RTI Rules, 2012 (Central Government)
# ═══════════════════════════════════════════════════════════════════════════

RTI_RULES_2012 = [
    {
        "rule_number": "1",
        "rule_title": "Short title and commencement",
        "text": (
            "These rules may be called the Right to Information (Regulation of Fee and Cost) Rules, 2005, "
            "as amended in 2012. They shall apply to all Central Government Public Authorities. "
            "They come into force on the date of their publication in the Official Gazette."
        ),
    },
    {
        "rule_number": "3",
        "rule_title": "Application fee",
        "text": (
            "A request for obtaining information under sub-section (1) of section 6 of the Act shall be "
            "accompanied by an application fee of rupees ten (Rs. 10) by way of cash against proper receipt "
            "or by demand draft or banker's cheque or Indian Postal Order payable to the Accounts Officer "
            "of the public authority."
        ),
    },
    {
        "rule_number": "4",
        "rule_title": "Fees for providing information",
        "text": (
            "For providing information under sub-section (1) of section 7 of the Act, the fee shall be "
            "charged at the following rates:\n"
            "(a) Rupees two (Rs. 2) per page (in A4 or A3 size paper) created or copied;\n"
            "(b) actual charge or cost price of a copy in larger size paper;\n"
            "(c) actual cost or price for samples or models;\n"
            "(d) for inspection of records: no fee for the first hour; rupees five (Rs. 5) for each "
            "fifteen minutes (or fraction thereof) thereafter;\n"
            "(e) information provided in floppy, diskette, magnetic cartridge tape, video cassette or "
            "other electronic mode: Rs. 50 per diskette or floppy."
        ),
    },
    {
        "rule_number": "5",
        "rule_title": "BPL applicants — fee exemption",
        "text": (
            "Persons below the poverty line (BPL) are not required to pay any fees under these Rules. "
            "The applicant claiming BPL status must produce a copy of the BPL card or certificate issued "
            "by the appropriate authority along with the RTI application. The Public Information Officer "
            "shall verify and record the BPL certificate details before processing the request free of charge."
        ),
    },
    {
        "rule_number": "6",
        "rule_title": "Mode of payment",
        "text": (
            "The fees specified in these Rules shall be paid by cash against proper receipt, or by demand "
            "draft or banker's cheque or Indian Postal Order drawn in favour of the Accounts Officer of "
            "the public authority to which the application is being made. "
            "Online payment via RTI Online Portal (rtionline.gov.in) is also accepted for Central Government "
            "Public Authorities enrolled on the portal, payable by net banking, debit card, or credit card."
        ),
    },
    {
        "rule_number": "7",
        "rule_title": "Penalty for delay in providing information",
        "text": (
            "Where the Public Information Officer (PIO) fails to provide information within the period "
            "specified under section 7(1) — that is, within 30 days from receipt of application "
            "(or 48 hours for information concerning life and liberty) — the applicant may file a "
            "First Appeal under Section 19(1). The Central Information Commission under Section 20 may "
            "impose a penalty of Rs. 250 per day of delay, subject to a maximum of Rs. 25,000, on the PIO."
        ),
    },
    {
        "rule_number": "8",
        "rule_title": "Computation of period",
        "text": (
            "In computing the period of 30 days for response under section 7(1), the day on which "
            "the application is received shall not be counted. If the last day falls on a public holiday "
            "or on a day on which the office of the public authority is closed, the period shall be "
            "extended to the next working day. Transfer of application under section 6(3) does not restart "
            "the 30-day clock; the transferred authority must respond within the remaining balance of the "
            "original 30-day period."
        ),
    },
    {
        "rule_number": "9",
        "rule_title": "Format of the application",
        "text": (
            "There is no prescribed format for an RTI application under Section 6(1). A plain paper "
            "application addressed to the Public Information Officer of the concerned public authority "
            "is acceptable. The application must state the information sought clearly and concisely. "
            "The applicant is not required to give any reason for the information sought or any personal "
            "details beyond those necessary for contacting the applicant."
        ),
    },
]

RTI_RULES_2012_METADATA = {
    "source_type": "rules",
    "source_url": "https://dopt.gov.in/acts/right-information-act",
    "state": "",
    "jurisdiction_dependent": "false",
}


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE 2 ─ CIC FAQ (Central Information Commission)
# ═══════════════════════════════════════════════════════════════════════════

CIC_FAQS = [
    {
        "question": "Can I file an RTI application without giving my reason for seeking the information?",
        "answer": (
            "Yes. Under Section 6(2) of the RTI Act, 2005, an applicant is NOT required to give "
            "any reason for requesting information, nor is he/she required to give any other personal "
            "details except those necessary for contacting him/her. The Public Information Officer "
            "cannot reject your application solely on the ground that you have not stated a reason."
        ),
    },
    {
        "question": "Can I file an RTI application anonymously?",
        "answer": (
            "No. While you are not required to explain WHY you want the information, you must provide "
            "your name and contact details so that the PIO can communicate the information or fee "
            "requirement to you. An anonymous application cannot be processed because the PIO has no "
            "means of responding. However, your identity is not published; it is used only for communication."
        ),
    },
    {
        "question": "What if I don't get a response to my RTI within 30 days?",
        "answer": (
            "If you do not receive a response within 30 days (or 48 hours for life-and-liberty matters), "
            "it is treated as a 'deemed refusal' under Section 7(2) of the RTI Act. You can then file "
            "a First Appeal under Section 19(1) to the First Appellate Authority (FAA) of the public "
            "authority within 30 days of the expiry of the response deadline. "
            "The FAA must dispose of the appeal within 30 days (extendable to 45 days with written reasons)."
        ),
    },
    {
        "question": "Are file notings disclosable under RTI?",
        "answer": (
            "Yes. The definition of 'information' under Section 2(f) of the RTI Act explicitly includes "
            "'any material in any form' held by or under the control of a public authority. File notings "
            "are part of the official record and are disclosable unless they fall under any of the "
            "exemptions in Section 8 (e.g., information that would prejudicially affect the sovereignty "
            "of India, national security, etc.). The CIC and the Supreme Court have consistently held "
            "that file notings do not enjoy blanket immunity and must be disclosed unless a specific "
            "exemption applies."
        ),
    },
    {
        "question": "Can I ask for information in a language other than English or Hindi?",
        "answer": (
            "Under Section 6(1) of the RTI Act, an applicant may submit an application in Hindi or in "
            "English or in the official language of the area in which the application is being made. "
            "The PIO is obligated to provide the information in the medium requested if it is reasonably "
            "practicable. If the application is in a regional language, the PIO should respond in that "
            "language or in English if a translation in that language is not possible."
        ),
    },
    {
        "question": "What information is exempt from disclosure under RTI?",
        "answer": (
            "Section 8 of the RTI Act lists exemptions. Information that CANNOT be disclosed includes: "
            "(a) information that would prejudicially affect sovereignty, integrity, security or "
            "strategic, scientific or economic interests of India; "
            "(b) information expressly forbidden by court or tribunal; "
            "(c) information that would breach privilege of Parliament/Legislature; "
            "(d) commercial confidence, trade secrets or intellectual property that would harm the "
            "competitive position of a third party; "
            "(e) personal information with no relationship to any public activity or whose disclosure "
            "would invade individual privacy (unless larger public interest justifies it). "
            "Section 24 also exempts intelligence and security organisations (Schedule II) except "
            "on matters of corruption and human rights violations."
        ),
    },
    {
        "question": "Can I request physical inspection of government records under RTI?",
        "answer": (
            "Yes. Under Section 2(j)(i) of the RTI Act, 'right to information' includes the right to "
            "inspect works, documents, records, and take notes, extracts, or certified copies. "
            "The applicable fee for inspection is: no fee for the first hour, and Rs. 5 for each "
            "fifteen minutes (or fraction) thereafter, as per the RTI Rules, 2005."
        ),
    },
    {
        "question": "Can I file RTI against a private company or NGO?",
        "answer": (
            "Generally, no. The RTI Act applies only to 'public authorities' as defined under Section 2(h) "
            "— bodies established or constituted by the Constitution, or by any law made by Parliament "
            "or State Legislature, or by notification by the appropriate Government, including bodies "
            "substantially financed by government funds. A private company is NOT a public authority "
            "unless it is substantially financed by the Government. However, if a private body is "
            "performing a public function under a government contract or concession, it may be indirectly "
            "accountable through the regulatory public authority."
        ),
    },
    {
        "question": "What is the difference between a First Appeal and a Second Appeal under RTI?",
        "answer": (
            "First Appeal (Section 19(1)): Filed to the First Appellate Authority (FAA) — an officer "
            "senior to the PIO within the same public authority — within 30 days of receipt of PIO's "
            "decision or expiry of 30-day response period. No fee is required for the Central government. "
            "Second Appeal (Section 19(3)): Filed to the Central Information Commission (CIC) or State "
            "Information Commission (SIC) within 90 days of receiving the FAA's order or expiry of "
            "the FAA's decision deadline. The Commission may impose penalties on the PIO under Section 20 "
            "and award compensation to the applicant."
        ),
    },
    {
        "question": "Can I withdraw my RTI application after filing it?",
        "answer": (
            "Yes. There is no provision in the RTI Act that prevents you from withdrawing your application. "
            "However, the Act does not specifically provide a formal withdrawal procedure. If you inform "
            "the PIO in writing that you wish to withdraw, the PIO may close the file. "
            "However, if the information has already been prepared for disclosure, the PIO is not obliged "
            "to withhold it simply because you withdraw."
        ),
    },
]

CIC_FAQ_METADATA = {
    "source_type": "faq",
    "source_url": "https://cic.gov.in/faq",
    "state": "",
    "jurisdiction_dependent": "false",
}


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE 3 ─ Model RTI Application Format
# ═══════════════════════════════════════════════════════════════════════════

MODEL_RTI_FORMAT_CHUNKS = [
    {
        "id": "sample_format_central_application",
        "text": (
            "MODEL RTI APPLICATION FORMAT (Central Government)\n\n"
            "To,\nThe Public Information Officer,\n[Name of the Public Authority]\n"
            "[Address of the Public Authority]\n\n"
            "Subject: Application under Section 6(1) of the Right to Information Act, 2005\n\n"
            "Sir/Madam,\n\n"
            "I, [Full Name of Applicant], a citizen of India, residing at [Full Address], "
            "hereby request the following information under the provisions of the Right to Information "
            "Act, 2005:\n\n"
            "1. [Clearly state the specific information requested — e.g., 'Please provide the total "
            "expenditure incurred on road repair work at [Location] during the financial year [Year].']\n"
            "2. [State additional information point, if any.]\n"
            "3. [State additional information point, if any.]\n\n"
            "Period to which information relates: [Specify financial year / date range]\n"
            "Preferred mode of receiving information: [Hard copy / Soft copy / Inspection of records]\n\n"
            "I am enclosing the prescribed application fee of Rs. 10 by [Demand Draft / Indian Postal "
            "Order / Cash Receipt] bearing number [Number] dated [Date] in favour of the Accounts "
            "Officer, [Name of Public Authority].\n\n"
            "[If BPL: I am a person below the poverty line and enclose a copy of my BPL card/certificate "
            "bearing number [Number] in support thereof. No fee is payable by me under RTI Rules.]\n\n"
            "Yours faithfully,\n[Full Name]\n[Address]\n[Phone / Email]\nDate: [DD/MM/YYYY]"
        ),
        "metadata": {
            "source_type": "sample_format",
            "source_url": "https://rtionline.gov.in",
            "section_or_topic": "Model RTI Application Format — Central Government",
            "state": "",
            "jurisdiction_dependent": "false",
            "ingested_date": INGESTED_DATE,
        },
    },
    {
        "id": "sample_format_first_appeal",
        "text": (
            "MODEL FIRST APPEAL FORMAT — Section 19(1) RTI Act, 2005\n\n"
            "To,\nThe First Appellate Authority,\n[Name of the Department/Ministry]\n"
            "[Address]\n\n"
            "Subject: First Appeal under Section 19(1) of the Right to Information Act, 2005\n\n"
            "Case Reference: RTI Application dated [Original Date] addressed to PIO, [Public Authority]\n\n"
            "Sir/Madam,\n\n"
            "I, [Applicant Name], filed an RTI application on [Date] with the Public Information Officer "
            "of [Public Authority], seeking information about [brief description of information sought]. "
            "The statutory 30-day period (under Section 7(1)) has expired on [Expiry Date] and I have "
            "not received any response / I received an unsatisfactory response [choose as applicable].\n\n"
            "This constitutes a deemed refusal under Section 7(2) of the RTI Act, 2005. "
            "I therefore file this First Appeal before your good office under Section 19(1) of the Act.\n\n"
            "GROUNDS OF APPEAL:\n"
            "1. The PIO failed to provide information within the statutory 30-day period under Section 7(1).\n"
            "2. [Any additional grounds — e.g., 'The PIO invoked Section 8(1)(j) without justification.']\n\n"
            "RELIEF SOUGHT:\n"
            "1. Direction to the PIO to provide the requested information forthwith.\n"
            "2. Imposition of penalty on the PIO under Section 20 of the RTI Act.\n\n"
            "Enclosures:\n"
            "1. Copy of original RTI application with proof of submission.\n"
            "2. Copy of PIO's response (if any).\n\n"
            "Yours faithfully,\n[Name]\n[Address]\n[Phone / Email]\nDate: [DD/MM/YYYY]"
        ),
        "metadata": {
            "source_type": "sample_format",
            "source_url": "https://rtionline.gov.in",
            "section_or_topic": "Model First Appeal Format — Section 19(1)",
            "state": "",
            "jurisdiction_dependent": "false",
            "ingested_date": INGESTED_DATE,
        },
    },
    {
        "id": "sample_format_second_appeal",
        "text": (
            "MODEL SECOND APPEAL FORMAT — Section 19(3) RTI Act, 2005\n\n"
            "To,\nThe Central Information Commission (CIC) / State Information Commission (SIC)\n"
            "[Address of the Commission]\n\n"
            "Subject: Second Appeal under Section 19(3) of the Right to Information Act, 2005\n\n"
            "Sir/Madam,\n\n"
            "I, [Applicant Name], filed an RTI application dated [Date] and a First Appeal dated "
            "[First Appeal Date] before the First Appellate Authority of [Public Authority]. "
            "The First Appellate Authority either rejected my appeal / failed to respond within "
            "the statutory 30/45-day period [choose as applicable].\n\n"
            "I therefore file this Second Appeal before the Commission under Section 19(3) of the "
            "Right to Information Act, 2005, within 90 days of the date of the FAA's order "
            "(or expiry of the FAA's response deadline).\n\n"
            "FACTS OF THE CASE:\n"
            "1. Date of original RTI application: [Date]\n"
            "2. Date of PIO's response / deemed refusal: [Date]\n"
            "3. Date of First Appeal: [Date]\n"
            "4. Date of FAA's order / expiry of FAA's period: [Date]\n\n"
            "GROUNDS OF SECOND APPEAL:\n"
            "1. [State specific grounds — e.g., 'FAA upheld the PIO's blanket invocation of Section 8(1)(d) "
            "without specifying which competitive interest would be harmed.']\n\n"
            "RELIEF SOUGHT:\n"
            "1. Direction to the Public Authority to disclose the requested information.\n"
            "2. Penalty on the PIO under Section 20(1) of the RTI Act.\n"
            "3. Compensation to the appellant under Section 19(8)(b) of the RTI Act.\n\n"
            "Enclosures: RTI application, PIO's response, First Appeal, FAA's order.\n\n"
            "Yours faithfully,\n[Name]\n[Address]\n[Phone / Email]\nDate: [DD/MM/YYYY]"
        ),
        "metadata": {
            "source_type": "sample_format",
            "source_url": "https://cic.gov.in",
            "section_or_topic": "Model Second Appeal Format — Section 19(3)",
            "state": "",
            "jurisdiction_dependent": "false",
            "ingested_date": INGESTED_DATE,
        },
    },
]


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE 4 ─ Second Appeal Procedure (Section 19(3) + CIC Guidelines)
# ═══════════════════════════════════════════════════════════════════════════

SECOND_APPEAL_FAQS = [
    {
        "question": "How do I file a second appeal under RTI?",
        "answer": (
            "A Second Appeal under Section 19(3) of the RTI Act, 2005 is filed before the Central "
            "Information Commission (CIC) for Central Government public authorities, or the State "
            "Information Commission (SIC) for State Government public authorities. "
            "You must file within 90 days of the date on which you received (or should have received) "
            "the First Appellate Authority's (FAA) decision. "
            "The Commission may condone delay if sufficient cause is shown. "
            "Required documents: copy of original RTI application, PIO's response, First Appeal, "
            "FAA's order, and your grounds for second appeal."
        ),
    },
    {
        "question": "What is the fee for filing a second appeal to the CIC?",
        "answer": (
            "There is NO filing fee for a Second Appeal to the Central Information Commission (CIC). "
            "Similarly, most State Information Commissions do not charge a fee for second appeals. "
            "The second appeal can be filed online at cic.gov.in, by post, or in person at the "
            "Commission's office. No court fee stamp is required."
        ),
    },
    {
        "question": "What powers does the CIC have in a second appeal?",
        "answer": (
            "Under Section 19(8) of the RTI Act, the Central Information Commission in a second appeal "
            "has power to: (a) require the public authority to take any steps necessary to secure "
            "compliance including providing access to information in a particular form; "
            "(b) require the public authority to compensate the complainant for any loss or other "
            "detriment suffered; (c) impose penalty under Section 20 of up to Rs. 25,000 on the PIO "
            "(Rs. 250 per day for delay); (d) recommend disciplinary action against the PIO; "
            "(e) reject the appeal. The Commission's orders are binding on the public authority."
        ),
    },
    {
        "question": "What is Section 19(3) of the RTI Act?",
        "answer": (
            "Section 19(3) of the RTI Act, 2005 provides the right to file a Second Appeal. "
            "It states: 'A second appeal against the decision under sub-section (7) shall lie before "
            "the Central Information Commission or the State Information Commission.' "
            "Sub-section (7) refers to the order passed by the First Appellate Authority. "
            "The second appeal must be filed within 90 days of the date on which the decision of the "
            "First Appellate Authority was received or should have been received. The Commission shall "
            "decide the appeal within 45 days of receipt of the notice of appeal, or such extended "
            "period as may be necessary for reasons to be recorded in writing."
        ),
    },
    {
        "question": "What happens if the First Appellate Authority does not respond?",
        "answer": (
            "If the First Appellate Authority (FAA) does not decide the First Appeal within 30 days "
            "(extendable to 45 days with written reasons), this failure itself constitutes grounds "
            "for a Second Appeal to the Central / State Information Commission under Section 19(3). "
            "The 90-day period for filing the Second Appeal runs from the date the FAA's response "
            "was due (i.e., 30 or 45 days from filing the First Appeal). "
            "The Commission can compel the FAA to decide and simultaneously examine the underlying "
            "information denial."
        ),
    },
]

SECOND_APPEAL_METADATA = {
    "source_type": "faq",
    "source_url": "https://cic.gov.in",
    "state": "",
    "jurisdiction_dependent": "false",
    "section_or_topic": "second_appeal",
}


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE 5 ─ Key CIC/Court Precedents
# ═══════════════════════════════════════════════════════════════════════════

RTI_PRECEDENTS = [
    {
        "citation": "CBSE v. Aditya Bandopadhyay, (2011) 8 SCC 497 — Supreme Court of India",
        "holding": (
            "The Supreme Court held that 'information' under Section 2(f) means material in a "
            "documentary form which is already in existence in a recorded form. The right to information "
            "is not a right to receive information that does not exist or has not been collected. "
            "RTI cannot be used to compel a public authority to create new information or to analyse "
            "data not already in a documented form."
        ),
        "relevance": "Defines the scope and limits of Section 2(f) definition of 'information'.",
    },
    {
        "citation": "Namit Sharma v. Union of India, (2013) 1 SCC 745 — Supreme Court of India",
        "holding": (
            "Challenged the eligibility criteria for Information Commissioners. The Supreme Court "
            "affirmed that the Information Commission is a quasi-judicial body that performs "
            "adjudicatory functions. The Commission's orders are binding and must comply with "
            "principles of natural justice."
        ),
        "relevance": "Clarifies the quasi-judicial nature of the CIC and its binding authority.",
    },
    {
        "citation": "Girish Ramchandra Deshpande v. CIC, (2013) 1 SCC 212 — Supreme Court of India",
        "holding": (
            "The Supreme Court held that personal information concerning a public servant — such as "
            "service record, ACR/APAR gradings, details of assets, income, and liabilities — is "
            "covered by the exemption under Section 8(1)(j) (personal information with no public "
            "interest justification). Such information cannot be disclosed merely because the person "
            "is a public employee unless a larger public interest is demonstrated."
        ),
        "relevance": "Governs limits on personal information about government employees under Section 8(1)(j).",
    },
    {
        "citation": "Bhagat Singh v. Chief Information Commissioner & Others — CIC/WB/A/2007/00012",
        "holding": (
            "The CIC held that file notings are 'information' within the meaning of Section 2(f) of "
            "the RTI Act and must be disclosed unless a specific exemption under Section 8 applies. "
            "Blanket refusal to disclose file notings without invoking a specific exemption is not "
            "permissible. The PIO must give reasons for each part of information withheld."
        ),
        "relevance": "Landmark CIC decision confirming file notings are disclosable under RTI.",
    },
    {
        "citation": "Secretary General, Supreme Court of India v. Subhash Chandra Agarwal — (2020) 5 SCC 481",
        "holding": (
            "The Supreme Court of India held that the Office of the Chief Justice of India is a 'public "
            "authority' under Section 2(h) of the RTI Act and is subject to RTI provisions. "
            "Asset declarations of judges are held in a fiduciary capacity and are not automatically "
            "exempt from disclosure; the Court must balance the right to information against privacy "
            "under Section 8(1)(j)."
        ),
        "relevance": "Landmark ruling confirming Supreme Court is a public authority under RTI.",
    },
    {
        "citation": "Reserve Bank of India v. Jayantilal N. Mistry, (2016) 3 SCC 525 — Supreme Court of India",
        "holding": (
            "The Supreme Court held that the RBI, as a regulator and public authority, cannot claim "
            "blanket immunity from disclosing information relating to banks and financial institutions. "
            "Information about bank inspections, show-cause notices, and regulatory actions must be "
            "disclosed unless specifically exempt under Section 8. The RBI cannot invoke Section 8(1)(e) "
            "(fiduciary relationship) to resist disclosure of information relating to failed banks."
        ),
        "relevance": "Key precedent on Section 8 exemptions and fiduciary relationship claims by regulators.",
    },
]

RTI_PRECEDENTS_METADATA = {
    "source_type": "precedent",
    "source_url": "https://cic.gov.in/decisions",
    "state": "",
    "jurisdiction_dependent": "false",
}


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE 6 ─ State-Specific RTI Rules
# ═══════════════════════════════════════════════════════════════════════════

MAHARASHTRA_RTI_RULES = [
    {
        "rule_number": "3",
        "rule_title": "Application fee",
        "text": (
            "Maharashtra RTI Rules, 2005 — Rule 3: A request for obtaining information under Section 6(1) "
            "of the RTI Act shall be accompanied by an application fee of Rs. 10 (ten rupees) in the "
            "form of Court Fee Stamp, Demand Draft, or Banker's Cheque payable to the Public Authority. "
            "BPL applicants are exempted from paying the application fee on production of BPL certificate."
        ),
    },
    {
        "rule_number": "4",
        "rule_title": "Fees for providing information",
        "text": (
            "Maharashtra RTI Rules, 2005 — Rule 4: Fees for providing information under Section 7(1):\n"
            "(a) Rs. 2 for each page (A-4 or A-3 size paper) created or copied.\n"
            "(b) Actual charge or cost price of a copy in larger size paper.\n"
            "(c) Actual cost or price for samples or models.\n"
            "(d) Rs. 50 per floppy or disc.\n"
            "(e) For inspection of records: no fee for the first hour, and a fee of Rs. 5 for each "
            "fifteen minutes or fraction thereof thereafter."
        ),
    },
    {
        "rule_number": "5",
        "rule_title": "First Appeal fee",
        "text": (
            "Maharashtra RTI Rules, 2005 — Rule 5: A First Appeal under Section 19(1) of the RTI Act "
            "shall be accompanied by a fee of Rs. 20 (twenty rupees) in the form of Court Fee Stamp. "
            "The First Appeal must be filed within 30 days of receipt of decision of the PIO or "
            "expiry of the 30-day statutory response period."
        ),
    },
]

MAHARASHTRA_METADATA_BASE = {
    "source_type": "state_rule",
    "source_url": "https://www.maharashtra.gov.in",
    "state": "Maharashtra",
    "jurisdiction_dependent": "true",
}

KARNATAKA_RTI_RULES = [
    {
        "rule_number": "3",
        "rule_title": "Application fee",
        "text": (
            "Karnataka RTI Rules, 2005 — Rule 3: Application fee under Section 6(1) of the RTI Act "
            "shall be Rs. 10 (ten rupees) paid in cash or by Indian Postal Order or Demand Draft or "
            "Banker's Cheque payable to the Public Information Officer of the concerned authority. "
            "BPL applicants are fully exempted from payment of fees."
        ),
    },
    {
        "rule_number": "4",
        "rule_title": "Fees for providing information",
        "text": (
            "Karnataka RTI Rules, 2005 — Rule 4: Fees for providing information under Section 7(1):\n"
            "(a) Rs. 2 for each page (A4 or A3 size paper).\n"
            "(b) Rs. 50 per CD or Floppy.\n"
            "(c) For inspection of records: no fee for the first hour, and Rs. 15 for each subsequent "
            "fifteen minutes or fraction thereof. "
            "Karnataka charges Rs. 15 per 15 minutes for record inspection (higher than the Central rate "
            "of Rs. 5 per 15 minutes)."
        ),
    },
    {
        "rule_number": "5",
        "rule_title": "First Appeal procedure",
        "text": (
            "Karnataka RTI Rules, 2005 — Rule 5: The First Appeal under Section 19(1) must be submitted "
            "within 30 days from the date of decision of the PIO or expiry of the 30-day statutory "
            "period. No filing fee is required for the First Appeal in Karnataka. The State Public "
            "Information Officer (SPIO) designation is used in Karnataka instead of 'PIO'."
        ),
    },
]

KARNATAKA_METADATA_BASE = {
    "source_type": "state_rule",
    "source_url": "https://rtibk.nic.in",
    "state": "Karnataka",
    "jurisdiction_dependent": "true",
}

TAMIL_NADU_RTI_RULES = [
    {
        "rule_number": "3",
        "rule_title": "Application fee",
        "text": (
            "Tamil Nadu RTI Rules, 2005 — Rule 3: Application fee under Section 6(1) of the RTI Act "
            "shall be Rs. 10 (ten rupees) paid by Court Fee Stamp, Demand Draft, Banker's Cheque, or "
            "cash with receipt, payable to the State Public Information Officer. "
            "BPL applicants are fully exempted from all fees under Tamil Nadu RTI Rules."
        ),
    },
    {
        "rule_number": "4",
        "rule_title": "Fees for providing information",
        "text": (
            "Tamil Nadu RTI Rules, 2005 — Rule 4: Fees for providing information under Section 7(1):\n"
            "(a) Rs. 2 for each page (A4 or A3 size paper) created or copied.\n"
            "(b) Actual cost for copies in larger sizes or samples.\n"
            "(c) Rs. 50 per CD/DVD/Floppy.\n"
            "(d) For inspection of records: no fee for the first hour, and Rs. 5 for each 15 minutes "
            "thereafter. Tamil Nadu follows the Central Government fee structure for information costs."
        ),
    },
    {
        "rule_number": "5",
        "rule_title": "First Appeal procedure and fee",
        "text": (
            "Tamil Nadu RTI Rules, 2005 — Rule 5: The First Appeal under Section 19(1) must be filed "
            "within 30 days from the date of PIO's decision or expiry of the 30-day statutory period. "
            "No fee is required for the First Appeal in Tamil Nadu. The State First Appellate Authority "
            "must decide the appeal within 30 days (extendable to 45 days). "
            "Second Appeals are made to the Tamil Nadu Information Commission (TNIC)."
        ),
    },
]

TAMIL_NADU_METADATA_BASE = {
    "source_type": "state_rule",
    "source_url": "https://www.tn.gov.in/rti",
    "state": "Tamil Nadu",
    "jurisdiction_dependent": "true",
}


# ═══════════════════════════════════════════════════════════════════════════
# MAIN INGESTION PIPELINE
# ═══════════════════════════════════════════════════════════════════════════

def get_before_count(chroma_dir: str, collection_name: str = "rti_act") -> int:
    """Returns the current chunk count in the collection."""
    try:
        client = chromadb.PersistentClient(path=chroma_dir)
        collection = client.get_or_create_collection(collection_name)
        return collection.count()
    except Exception:
        return 0


def main():
    print("=" * 65)
    print("   EXPAND RTI CORPUS — RTI Knowledge Base Expansion Pipeline")
    print("=" * 65)

    # Count before
    before_count = get_before_count(CHROMA_DIR)
    print(f"\n[INFO] Current chunk count in 'rti_act': {before_count}")

    all_chunks = []

    # ── Source 1: RTI Rules 2012 ─────────────────────────────────────────
    print("\n[1/6] Ingesting: RTI Rules, 2012 (Central Government)...")
    rules_chunks = chunk_per_rule(RTI_RULES_2012, "rti_rules_2012", RTI_RULES_2012_METADATA)
    print(f"  Generated {len(rules_chunks)} rule chunks.")
    all_chunks.extend(rules_chunks)

    # ── Source 2: CIC FAQs ───────────────────────────────────────────────
    print("\n[2/6] Ingesting: CIC Frequently Asked Questions...")
    faq_chunks = chunk_faq_pairs(CIC_FAQS, "cic_faq", CIC_FAQ_METADATA)
    print(f"  Generated {len(faq_chunks)} FAQ chunks.")
    all_chunks.extend(faq_chunks)

    # ── Source 3: Model RTI Application Formats ──────────────────────────
    print("\n[3/6] Ingesting: Model RTI Application Formats (DoPT/rtionline.gov.in)...")
    valid_format_chunks = []
    for chunk in MODEL_RTI_FORMAT_CHUNKS:
        is_valid, reason = validate_chunk(chunk["text"])
        if is_valid:
            valid_format_chunks.append(chunk)
        else:
            print(f"  [SKIP] Format chunk '{chunk['id']}': {reason}")
    print(f"  Generated {len(valid_format_chunks)} format chunks.")
    all_chunks.extend(valid_format_chunks)

    # ── Source 4: Second Appeal Procedure FAQs ───────────────────────────
    print("\n[4/6] Ingesting: Second Appeal Procedure (Section 19(3) + CIC Guidelines)...")
    second_appeal_chunks = chunk_faq_pairs(SECOND_APPEAL_FAQS, "second_appeal", SECOND_APPEAL_METADATA)
    print(f"  Generated {len(second_appeal_chunks)} second-appeal FAQ chunks.")
    all_chunks.extend(second_appeal_chunks)

    # ── Source 5: CIC/Court Precedents ───────────────────────────────────
    print("\n[5/6] Ingesting: Key CIC/Court Precedents (curated landmark decisions)...")
    precedent_chunks = chunk_per_case(RTI_PRECEDENTS, "rti_precedent", RTI_PRECEDENTS_METADATA)
    print(f"  Generated {len(precedent_chunks)} precedent chunks.")
    all_chunks.extend(precedent_chunks)

    # ── Source 6: State-specific RTI Rules ───────────────────────────────
    print("\n[6/6] Ingesting: State-specific RTI Rules (Maharashtra, Karnataka, Tamil Nadu)...")

    mh_chunks = chunk_per_rule(MAHARASHTRA_RTI_RULES, "mh_rti", MAHARASHTRA_METADATA_BASE)
    print(f"  Maharashtra: {len(mh_chunks)} chunks")

    ka_chunks = chunk_per_rule(KARNATAKA_RTI_RULES, "ka_rti", KARNATAKA_METADATA_BASE)
    print(f"  Karnataka:   {len(ka_chunks)} chunks")

    tn_chunks = chunk_per_rule(TAMIL_NADU_RTI_RULES, "tn_rti", TAMIL_NADU_METADATA_BASE)
    print(f"  Tamil Nadu:  {len(tn_chunks)} chunks")

    all_chunks.extend(mh_chunks)
    all_chunks.extend(ka_chunks)
    all_chunks.extend(tn_chunks)

    # ── Store All Chunks ─────────────────────────────────────────────────
    print(f"\n[STORE] Total chunks prepared: {len(all_chunks)}")
    print(f"[STORE] Upserting into ChromaDB collection 'rti_act'...")

    stored = store_in_chroma(all_chunks, CHROMA_DIR, "rti_act")

    # Count after
    after_count = get_before_count(CHROMA_DIR)

    # ── Final Summary ────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("   CORPUS EXPANSION COMPLETE")
    print("=" * 65)
    print(f"  Chunks before expansion : {before_count}")
    print(f"  New chunks added        : {len(all_chunks)}")
    print(f"  Total chunks after      : {after_count}")
    print(f"  Net increase            : {after_count - before_count}")
    print("\n  Source breakdown:")
    print(f"    RTI Rules 2012        : {len(rules_chunks)}")
    print(f"    CIC FAQs              : {len(faq_chunks)}")
    print(f"    Model Formats         : {len(valid_format_chunks)}")
    print(f"    Second Appeal FAQs    : {len(second_appeal_chunks)}")
    print(f"    Precedents            : {len(precedent_chunks)}")
    print(f"    Maharashtra Rules     : {len(mh_chunks)}")
    print(f"    Karnataka Rules       : {len(ka_chunks)}")
    print(f"    Tamil Nadu Rules      : {len(tn_chunks)}")
    print("=" * 65)


if __name__ == "__main__":
    main()
