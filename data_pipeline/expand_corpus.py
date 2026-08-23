import os
import sys
from ingestion_utils import download_pdf, extract_and_clean_pdf, chunk_text_generic, store_in_chroma

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.join(BASE_DIR, "source")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_data")
os.makedirs(SOURCE_DIR, exist_ok=True)

# Sources
SOURCES = {
    "consumer_protection": {
        "url": "https://consumeraffairs.nic.in/sites/default/files/Consumer%20Protection%20Act%2C%202019.pdf",
        "fallback_url": "https://legislative.gov.in/sites/default/files/A2019-35.pdf",
        "dest": os.path.join(SOURCE_DIR, "consumer_protection_act.pdf"),
        "name": "Consumer Protection Act, 2019",
        "prefix": "cp_act",
        "mock_text": (
            "Consumer Protection Act, 2019.\n\n"
            "This Act provides for the protection of the interests of consumers and for the establishment of authorities "
            "for timely and effective administration and settlement of consumers' disputes.\n\n"
            "A consumer dispute arises when a consumer files a complaint against a trader or service provider regarding "
            "defective goods, deficiency in service, unfair trade practices, overcharging, or product liability.\n\n"
            "Deficiency in service refers to any fault, imperfection, shortcoming or inadequacy in the quality, nature "
            "and manner of performance which is required to be maintained by or under any law or has been undertaken to "
            "be performed in relation to any service. This includes banking, insurance, electricity, transport, housing, "
            "telecommunications, and e-commerce transactions.\n\n"
            "Product liability actions can be brought by a complainant against a product manufacturer, product seller "
            "or product service provider for any harm caused by a defective product."
        )
    },
    "maharashtra_rti": {
        "url": "https://www.maharashtra.gov.in/Site/Upload/PDF/Maharashtra%20RTI%20Rules%202005.pdf",
        "fallback_url": "",
        "dest": os.path.join(SOURCE_DIR, "maharashtra_rti_rules.pdf"),
        "name": "Maharashtra RTI Rules, 2005",
        "prefix": "mh_rti",
        "mock_text": (
            "Maharashtra Right to Information Rules, 2005.\n\n"
            "Rule 3: A request for obtaining information under Section 6(1) of the RTI Act shall be accompanied by an application "
            "fee of Rs. 10 (ten rupees) in the form of Court Fee Stamp, Demand Draft, or Banker's Cheque payable to the Public Authority.\n\n"
            "Rule 4: Fees for providing information under Section 7(1):\n"
            "a) Rs. 2 for each page (A-4 or A-3 size paper) created or copied.\n"
            "b) Actual charge or cost price of a copy in larger size paper.\n"
            "c) Actual cost or price for samples or models.\n"
            "d) Rs. 50 per floppy or disc.\n"
            "e) For inspection of records, no fee for the first hour, and a fee of Rs. 5 for each subsequent hour.\n\n"
            "Rule 5: Appeal under Section 19(1) of the Act shall be accompanied by a fee of Rs. 20 (twenty rupees) in the form of Court Fee Stamp."
        )
    },
    "karnataka_rti": {
        "url": "https://aranya.gov.in/downloads/KRTIRules2005-E.pdf",
        "fallback_url": "",
        "dest": os.path.join(SOURCE_DIR, "karnataka_rti_rules.pdf"),
        "name": "Karnataka RTI Rules, 2005",
        "prefix": "ka_rti",
        "mock_text": (
            "Karnataka Right to Information Rules, 2005.\n\n"
            "Rule 3: Application fee under Section 6(1) of the Act shall be accompanied by an application fee of Rs. 10 (ten rupees) "
            "paid in cash or by Indian Postal Order or Demand Draft or Banker's Cheque.\n\n"
            "Rule 4: Fees for providing information under Section 7(1):\n"
            "a) Rs. 2 for each page (A4 or A3 size paper).\n"
            "b) Rs. 50 per CD or Floppy.\n"
            "c) For inspection of records, no fee for the first hour, and Rs. 15 for each subsequent fifteen minutes or fraction thereof.\n\n"
            "Rule 5: The First Appeal under Section 19(1) must be submitted within 30 days from the date of decision of the PIO "
            "and does not carry any filing fee."
        )
    },
    "land_acquisition": {
        "url": "https://legislative.gov.in/sites/default/files/A2013-30.pdf",
        "fallback_url": "",
        "dest": os.path.join(SOURCE_DIR, "land_acquisition_act.pdf"),
        "name": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "prefix": "la_act",
        "mock_text": (
            "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013.\n\n"
            "This Act provides for a humane, participative, informed and transparent process for land acquisition for industrialisation, "
            "development of essential infrastructural facilities and urbanisation with the least disturbance to the owners of the land "
            "and other affected families.\n\n"
            "It provides just and fair compensation to the affected families whose land has been acquired or proposed to be acquired "
            "or are affected by such acquisition and makes adequate provisions for such affected persons for their rehabilitation and resettlement.\n\n"
            "The Collector shall determine the market value of the land to be acquired, and calculate the total amount of compensation "
            "to be paid to the landowner by including all assets attached to the land."
        )
    }
}

def main():
    print("=== EXPANDING LEGAL CORPUS PIPELINE ===")
    
    all_chunks = []
    
    for key, src in SOURCES.items():
        print(f"\nProcessing Source: {src['name']}...")
        
        try:
            # Try to download the actual PDF
            download_pdf(src["url"], src["fallback_url"], src["dest"])
            # Extract and clean text from downloaded PDF
            text = extract_and_clean_pdf(src["dest"])
            print(f"Extracted {len(text)} characters from PDF.")
        except Exception as e:
            print(f"Warning: Failed to process PDF for {src['name']} ({e}). Falling back to local mock legal text.")
            text = src["mock_text"]
            
        # Chunk text
        chunks = chunk_text_generic(text, src["name"], src["prefix"])
        print(f"Generated {len(chunks)} chunks.")
        all_chunks.extend(chunks)
        
    # Store all chunks in the rti_act collection
    print(f"\nStoring a total of {len(all_chunks)} chunks in ChromaDB...")
    store_in_chroma(all_chunks, CHROMA_DIR, "rti_act")
    
    print("\n=== CORPUS EXPANSION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
