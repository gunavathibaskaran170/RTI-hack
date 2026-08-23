import unittest
import os
import sys
from pathlib import Path

# Add backend root to path to resolve imports
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from app.core.config import Config
from app.services.jurisdiction_resolver import JurisdictionResolver
from app.services.classifier import ComplaintClassifier
from app.db.connection import get_db_connection, init_db

class TestRightPathCopilot(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Enforce database initialization
        init_db()

    def test_deterministic_jurisdiction_resolution(self):
        """
        Tests that jurisdiction resolution is fully deterministic and correct based on PIN prefix.
        """
        # Test Case 1: Water Supply Department with Bangalore PIN 560037
        resolved = JurisdictionResolver.resolve("Water Supply and Sanitation Department", "560037, Bangalore City")
        self.assertFalse(resolved.get("is_fallback"))
        self.assertEqual(resolved["pio_name"], "Public Information Officer, BWSSB Central Office")
        self.assertIn("Cauvery Bhavan", resolved["pio_address"])
        self.assertEqual(resolved["pio_email"], "pio.water.blr@bwssb.gov.in")
        
        # Test Case 2: Public Works Department with Mumbai PIN 400012
        resolved2 = JurisdictionResolver.resolve("Public Works Department", "12, Fort, Mumbai 400012")
        self.assertFalse(resolved2.get("is_fallback"))
        self.assertEqual(resolved2["pio_name"], "Public Information Officer, PWD Mumbai Zone")
        self.assertEqual(resolved2["pio_email"], "pio.pwd.mumbai@mah.gov.in")

        # Test Case 3: Fallback state when location has no match
        resolved_fallback = JurisdictionResolver.resolve("Electricity Board", "999999, Unknown City")
        self.assertTrue(resolved_fallback.get("is_fallback"))
        self.assertEqual(resolved_fallback["pio_name"], "Public Information Officer, BESCOM Central Division")

    def test_needs_lawyer_hard_refusal(self):
        """
        Tests that complex legal cases or private litigation return 'needs_lawyer'
        and do not proceed to application drafting.
        """
        classifier = ComplaintClassifier()
        
        # Complaint describing a complex private property lawsuit
        complex_complaint = (
            "I want to file a lawsuit against my neighbor regarding a boundary wall dispute. "
            "We have an active civil suit pending in the District Court since 2024. My lawyer wants "
            "me to get information on their land registration details so we can sue them for criminal trespass."
        )
        
        analysis = classifier.analyze_complaint(complex_complaint)
        
        # Check that it triggers needs_lawyer
        self.assertEqual(analysis["confidence_tier"], "needs_lawyer")
        
        # Verify explanation exists to outline why they need a lawyer
        self.assertTrue(len(analysis["explanation"]) > 0)

    def test_hindi_complaint_translation(self):
        """
        Tests that submitting a complaint in Hindi translates it to English internally,
        classifies it correctly, and yields a Hindi explanation while keeping the draft in English.
        """
        classifier = ComplaintClassifier()
        hindi_complaint = (
            "मेरे इलाके की मुख्य सड़क पर 9 महीने से गहरे गड्ढे हैं और स्थानीय नगर निगम "
            "इस बारे में कोई कार्रवाई नहीं कर रहा है। कृपया इसके मरम्मत रिकॉर्ड और लागत विवरण प्रदान करें।"
        )
        
        # 1. Test language detection and translation
        lang_info = classifier.detect_and_translate(hindi_complaint)
        self.assertEqual(lang_info["language"], "hi")
        self.assertTrue(any(w in lang_info["translation"].lower() for w in ["road", "pothole", "street"]))
        
        # 2. Test classification on the translated English text
        analysis = classifier.analyze_complaint(lang_info["translation"])
        self.assertIn(analysis["likely_department"], ["Public Works Department", "Municipal Corporation"])
        
        # 3. Test explanation translation back to Hindi
        translated_explanation = classifier.translate_explanation(analysis["explanation"], "hi")
        self.assertTrue(len(translated_explanation) > 0)
        # Verify it has Hindi characters (Hindi Unicode range is \u0900-\u097f)
        has_hindi = any('\u0900' <= char <= '\u097f' for char in translated_explanation)
        self.assertTrue(has_hindi)

    def test_chatbot_endpoint_direct(self):
        """
        Tests chatbot endpoint function directly.
        """
        from main import chatbot_query, ChatbotQueryRequest
        req = ChatbotQueryRequest(
            messages=[{"role": "user", "content": "Tell me about my pension details"}],
            target_language="en"
        )
        res = chatbot_query(req, user_id="usr_test")
        self.assertIn("response", res)
        self.assertIn("suggestions", res)
        # Check hint word matching works
        self.assertTrue(len(res["suggestions"]) > 0)
        self.assertIn("PM-Kisan", res["suggestions"][0])

    def test_translator_endpoint_direct(self):
        """
        Tests notice translator endpoint function directly.
        """
        from main import translate_notice, TranslateRequest
        req = TranslateRequest(
            text="Take notice that the property tax must be paid before 31st August 2026 failing which 2% penalty will be levied.",
            target_language="en"
        )
        res = translate_notice(req, user_id="usr_test")
        self.assertIn("simple_meaning", res)
        self.assertIn("deadlines", res)
        self.assertIn("required_actions", res)

    def test_schemes_endpoint_direct(self):
        """
        Tests scheme eligibility evaluation endpoint function directly.
        """
        from main import evaluate_schemes, SchemeEvaluateRequest
        req = SchemeEvaluateRequest(
            answers={"land_holding": "1.5 hectares", "pays_income_tax": "No"},
            target_language="en"
        )
        res = evaluate_schemes(req, user_id="usr_test")
        self.assertIn("eligible_schemes", res)
        self.assertTrue(len(res["eligible_schemes"]) > 0)

    def test_pitch_endpoint_direct(self):
        """
        Tests case presentation slides generator endpoint function directly.
        """
        from main import generate_pitch, PitchGenerateRequest
        req = PitchGenerateRequest(
            grievance="The main road in Sector 4 has had deep potholes since January.",
            target_language="en"
        )
        res = generate_pitch(req, user_id="usr_test")
        self.assertIn("slides", res)
        self.assertEqual(len(res["slides"]), 4)

if __name__ == "__main__":
    unittest.main()
