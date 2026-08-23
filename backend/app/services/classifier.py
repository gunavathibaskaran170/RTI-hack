import json
import re
from app.core.llm_client import GroqClient

class ComplaintClassifier:
    def __init__(self):
        self.client = GroqClient()
        
    def detect_and_translate(self, text: str) -> dict:
        """
        Detects the language of the input text and translates it to English if it's not English.
        Returns a dictionary: {"language": "...", "translation": "..."}
        """
        system_prompt = (
            "You are a translation and language detection expert.\n"
            "Analyze the input text. Output a JSON object with exactly two keys:\n"
            '1. "language": the ISO 639-1 code of the detected language (one of: "en", "hi", "ta", "te", "ml").\n'
            '2. "translation": the English translation of the text. If the text is already in English, return the original text.\n\n'
            "Provide ONLY the raw JSON object. Do not explain your answer."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]
        
        try:
            response = self.client.call_chat_completion(messages, response_json=False, temperature=0.0)
            # Remove think block
            clean_text = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL | re.IGNORECASE).strip()
            start_idx = clean_text.find('{')
            end_idx = clean_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_str = clean_text[start_idx:end_idx + 1]
                result = json.loads(json_str)
                return {
                    "language": str(result.get("language", "en")),
                    "translation": str(result.get("translation", text))
                }
        except Exception as e:
            print(f"Error in detect_and_translate: {e}")
            
        return {"language": "en", "translation": text}

    def translate_explanation(self, text: str, target_lang: str) -> str:
        """
        Translates a legal explanation/guidance string into the target language.
        Keeps section numbers and legal citations in English.
        """
        if not target_lang or target_lang.lower() == "en":
            return text
            
        lang_names = {
            "hi": "Hindi (हिन्दी)",
            "ta": "Tamil (தமிழ்)",
            "te": "Telugu (తెలుగు)",
            "ml": "Malayalam (മലയാളം)"
        }
        
        target_lang_name = lang_names.get(target_lang.lower(), "English")
        if target_lang_name == "English":
            return text
            
        system_prompt = (
            f"You are a legal translator translating content into {target_lang_name}.\n"
            "Translate the input English text accurately. Keep legal citations, sections (like 'Section 6', 'Section 7(1)'), numbers, dates, and names in English/original form so they remain legally precise.\n"
            "Output ONLY the translated text. Do not explain or write greetings."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]
        
        try:
            response = self.client.call_chat_completion(messages, response_json=False, temperature=0.0)
            clean_response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL | re.IGNORECASE).strip()
            return clean_response
        except Exception as e:
            print(f"Error translating explanation to {target_lang}: {e}")
            return text

    def analyze_complaint(self, raw_complaint: str) -> dict:
        """
        Calls Groq API to classify a citizen's complaint (assuming English input) and parses the JSON response.
        """
        system_prompt = (
            "You are an expert legal classifier for the RightPath application under the Indian Right to Information (RTI) Act, 2005.\n"
            "Analyze the citizen's complaint and output a JSON object classifying it.\n\n"
            "The JSON object must contain exactly these keys:\n"
            '1. "is_rti_eligible" (boolean): True if the complaint seeks information/records held by a public authority. False otherwise.\n'
            '2. "info_sought" (string): A short, specific query of the records/information they want to ask for (e.g., "Pothole repair history and expenditure records for Sector 4").\n'
            '3. "likely_department" (string): Must map to one of:\n'
            '   - "Public Works Department"\n'
            '   - "Water Supply and Sanitation Department"\n'
            '   - "Municipal Corporation"\n'
            '   - "Electricity Board"\n'
            '   - "Revenue and Land Records"\n'
            '   - "Other"\n'
            '4. "location" (string): Extract location details (city, state, or PIN code if mentioned). E.g. "Bangalore, Karnataka". If none is found, return "Unknown".\n'
            '5. "confidence_tier" (string): Determine the tier. Must be one of:\n'
            '   - "needs_lawyer": Choose this if the complaint involves serious criminal disputes, civil lawsuits, complex property disputes, or matters strictly exempted under Section 8 of the RTI Act (e.g. national security, cabinet papers before decision, personal privacy with no public interest, copyright infringement).\n'
            '   - "settled": Choose this if the request is straightforward, involves public works, civic issues, water supply, electricity, billing discrepancies, or clear public records.\n'
            '   - "jurisdiction_dependent": Choose this if the issue is a standard civic issue but lacks clear location details to map to a PIO.\n'
            '6. "explanation" (string): Detailed plain-language reason for your classification, especially if confidence_tier is "needs_lawyer".\n'
            '7. "complaint_type" (string): Determine the legal category. Must be one of:\n'
            '   - "RTI-eligible": For standard requests for public records, civic works, and government department data.\n'
            '   - "consumer-dispute": For complaints regarding defective goods, deficiencies of services, product liability, banking, e-commerce, or overcharging.\n'
            '   - "land/property": For land acquisition compensation, rehabilitation, resettlement, or land title disputes.\n'
            '   - "Other"\n\n'
            "Provide ONLY the raw JSON object. Do not explain your answer outside of the JSON."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Citizen Complaint:\n{raw_complaint}"}
        ]
        
        try:
            # Setting response_json=False and parsing manually is more robust on Groq
            response = self.client.call_chat_completion(messages, response_json=False, temperature=0.0)
            
            # 1. Clean the think block if present
            clean_text = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL | re.IGNORECASE).strip()
            
            # 2. Find the JSON block between the first '{' and last '}'
            start_idx = clean_text.find('{')
            end_idx = clean_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_str = clean_text[start_idx:end_idx + 1]
                result = json.loads(json_str)
            else:
                raise ValueError("Could not find JSON object block in response.")
                
            return {
                "is_rti_eligible": bool(result.get("is_rti_eligible", True)),
                "info_sought": str(result.get("info_sought", "")),
                "likely_department": str(result.get("likely_department", "Other")),
                "location": str(result.get("location", "Unknown")),
                "confidence_tier": str(result.get("confidence_tier", "settled")),
                "explanation": str(result.get("explanation", "")),
                "complaint_type": str(result.get("complaint_type", "RTI-eligible"))
            }
        except Exception as e:
            print(f"Error in analyze_complaint: {e}")
            # Safe fallback classification
            return {
                "is_rti_eligible": True,
                "info_sought": "Information regarding civic issue.",
                "likely_department": "Other",
                "location": "Unknown",
                "confidence_tier": "settled",
                "explanation": "Default classification due to processing error.",
                "complaint_type": "RTI-eligible"
            }
