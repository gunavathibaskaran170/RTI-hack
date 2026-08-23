from app.core.llm_client import GroqClient

# source_type values treated as formal legal citations in the filed document
FORMAL_CITATION_TYPES = {"act", "rules"}

# source_type values used only for supplementary reasoning / plain-language explanation
SUPPLEMENTARY_CONTEXT_TYPES = {"faq", "precedent", "sample_format", "state_rule"}


class DocumentDrafter:
    def __init__(self):
        self.client = GroqClient()

    def _split_chunks_by_type(self, chroma_chunks: list) -> tuple:
        """
        Splits Chroma chunks into:
          - formal_chunks: source_type in {act, rules} → cited in filed document
          - supplementary_chunks: faq / precedent / sample_format / state_rule → inform explanation only
        Returns (formal_chunks, supplementary_chunks).
        """
        formal = []
        supplementary = []
        for chunk in chroma_chunks:
            meta = chunk.get("metadata") or {}
            stype = meta.get("source_type", "act")
            if stype in FORMAL_CITATION_TYPES:
                formal.append(chunk)
            else:
                supplementary.append(chunk)
        return formal, supplementary

    def _format_formal_citations(self, formal_chunks: list) -> str:
        """
        Formats formal (act/rules) chunks as numbered legal citations for the filed document.
        """
        if not formal_chunks:
            return "(No formal legal citations retrieved — cite Section 6(1) of the RTI Act, 2005 by default.)"
        out = ""
        for i, chunk in enumerate(formal_chunks, 1):
            meta = chunk.get("metadata") or {}
            sec_num = meta.get("section_number", meta.get("rule_number", "Unknown"))
            sec_title = meta.get("section_title", meta.get("section_or_topic", "Unknown"))
            source_type = meta.get("source_type", "act")
            label = "RTI Act, 2005" if source_type == "act" else "RTI Rules, 2012"
            out += f"Citation {i} [{label}, Section/Rule {sec_num} — {sec_title}]:\n{chunk['document']}\n\n"
        return out

    def _format_supplementary_context(self, supplementary_chunks: list) -> str:
        """
        Formats supplementary (faq/precedent/state_rule/sample_format) chunks as background context.
        These must NOT appear as formal citations in the filed document.
        """
        if not supplementary_chunks:
            return ""
        out = ""
        for i, chunk in enumerate(supplementary_chunks, 1):
            meta = chunk.get("metadata") or {}
            stype = meta.get("source_type", "faq")
            topic = meta.get("section_or_topic", meta.get("citation", ""))
            state = meta.get("state", "")
            label = f"[{stype.upper()}"
            if state:
                label += f" — {state}"
            if topic:
                label += f" | {topic[:60]}"
            label += "]"
            out += f"Context {i} {label}:\n{chunk['document']}\n\n"
        return out

    def draft_rti_application(
        self,
        raw_complaint: str,
        pio_details: dict,
        chroma_chunks: list,
        applicant_email: str
    ) -> dict:
        """
        Drafts a formal RTI application grounded on Chroma citations and resolved PIO details.
        Returns a dictionary with 'draft_text' and 'explanation' fields.
        """
        formal_chunks, supplementary_chunks = self._split_chunks_by_type(chroma_chunks)

        formal_citations_text = self._format_formal_citations(formal_chunks)
        supplementary_context_text = self._format_supplementary_context(supplementary_chunks)

        system_prompt = (
            "You are a senior legal assistant specializing in the Indian Right to Information (RTI) Act, 2005.\n"
            "Your job is to draft a formal, legally structured, and authoritative RTI application for a citizen, "
            "along with a plain-language explanation of the application. You must return a JSON object containing "
            "exactly two keys: \"draft_text\" and \"explanation\".\n\n"
            "JSON SCHEMA:\n"
            "{\n"
            "  \"draft_text\": \"(A plain text string containing the drafted RTI Application)\",\n"
            "  \"explanation\": \"(A plain-language explanation of the drafted application)\"\n"
            "}\n\n"
            "CITATION RULES FOR draft_text:\n"
            "- You must include a 'Legal Grounds' section in the body of the application containing formal citations.\n"
            "- You may ONLY cite sources marked as 'RTI Act, 2005' or 'RTI Rules, 2012' from the FORMAL LEGAL CITATIONS provided below. Never cite FAQ, precedent, or sample_format sources in the filed document itself.\n"
            "- Address the application to the provided Public Information Officer (PIO) name and address.\n"
            "- State that the applicant is an Indian Citizen seeking information under Section 6(1) of the RTI Act, 2005.\n"
            "- Formulate clear, numbered, specific questions based on the raw complaint.\n"
            "- Keep the tone calm, formal, and authoritative.\n"
            "- Do NOT invent or hallucinate any section numbers or legal provisions not present in the formal citations.\n\n"
            "GUIDELINES FOR explanation:\n"
            "- Explain the reasoning behind the questions and the legal grounds in simple terms for the citizen.\n"
            "- Integrate relevant details from the SUPPLEMENTARY CONTEXT (FAQs, precedents, state rules) to explain the citizen's rights (e.g. fees, timelines) without citing them in the official document."
        )

        user_message = (
            f"Resolved PIO:\n"
            f"Name: {pio_details.get('pio_name')}\n"
            f"Address: {pio_details.get('pio_address')}\n"
            f"Email: {pio_details.get('pio_email')}\n\n"
            f"FORMAL LEGAL CITATIONS (cite ONLY these in the filed document):\n"
            f"{formal_citations_text}\n"
        )

        if supplementary_context_text:
            user_message += (
                f"SUPPLEMENTARY CONTEXT (use for explanation only — do NOT cite formally in the application):\n"
                f"{supplementary_context_text}\n"
            )

        user_message += (
            f"Citizen Complaint details:\n"
            f"{raw_complaint}\n\n"
            f"Applicant Email: {applicant_email}\n\n"
            f"Please draft the complete RTI Application and return the JSON object."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        try:
            res_content = self.client.call_chat_completion(messages, response_json=True, temperature=0.0)
            import json
            data = json.loads(res_content)
            return {
                "draft_text": data.get("draft_text", ""),
                "explanation": data.get("explanation", "")
            }
        except Exception as e:
            print(f"Error drafting RTI Application: {e}")
            fallback_text = (
                f"To:\n{pio_details.get('pio_name')}\n{pio_details.get('pio_address')}\n\n"
                f"Subject: Application under Section 6(1) of the RTI Act, 2005.\n\n"
                f"Sir/Madam,\n"
                f"Regarding the complaint: {raw_complaint}\n"
                f"Please provide the required information as per the statutory guidelines.\n\n"
                f"Legal Grounds:\n"
                f"This application is filed under Section 6(1) of the RTI Act, 2005."
            )
            fallback_explanation = (
                "Your official RTI application has been drafted in English and grounded on the RTI Act, 2005. "
                "Review your document below before marking as filed."
            )
            return {
                "draft_text": fallback_text,
                "explanation": fallback_explanation
            }

    def draft_first_appeal(
        self,
        raw_complaint: str,
        pio_details: dict,
        original_application_content: str,
        applicant_email: str
    ) -> str:
        """
        Drafts a formal Section 19(1) First Appeal document.
        Cites the PIO's failure to respond within the statutory 30-day timeline
        (Section 7(1) breach / Section 7(2) deemed refusal).
        """
        system_prompt = (
            "You are a senior legal assistant specializing in the Indian Right to Information (RTI) Act, 2005.\n"
            "Your job is to draft a formal, legally structured First Appeal under Section 19(1) of the RTI Act, 2005.\n\n"
            "Context details:\n"
            "1. The original RTI application was filed to the PIO but went unanswered for 30 days.\n"
            "2. This failure constitutes a breach of Section 7(1) (failure to decide within 30 days) "
            "and is a deemed refusal under Section 7(2).\n"
            "3. State that the applicant is filing this First Appeal to the First Appellate Authority (FAA) of the department.\n"
            "4. Ask for the immediate disclosure of the requested information and penalties on the officer under Section 20.\n"
            "5. Maintain a formal, legal, and serious tone.\n"
            "6. Output ONLY the drafted First Appeal document in plain text/markdown."
        )

        user_message = (
            f"Resolved PIO details:\n"
            f"Name: {pio_details.get('pio_name')}\n"
            f"Address: {pio_details.get('pio_address')}\n\n"
            f"Original Complaint details:\n"
            f"{raw_complaint}\n\n"
            f"Original In-App Application Draft:\n"
            f"{original_application_content}\n\n"
            f"Applicant Email: {applicant_email}\n\n"
            f"Please draft the complete First Appeal."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        try:
            return self.client.call_chat_completion(messages, response_json=False, temperature=0.0)
        except Exception as e:
            print(f"Error drafting First Appeal: {e}")
            return (
                "Error drafting First Appeal. Please manually file a First Appeal under "
                "Section 19(1) to the department's First Appellate Authority."
            )

    def draft_second_appeal(
        self,
        raw_complaint: str,
        pio_details: dict,
        original_application_content: str,
        first_appeal_content: str,
        applicant_email: str,
        faa_order_summary: str = ""
    ) -> str:
        """
        Drafts a formal Section 19(3) Second Appeal to the Central/State Information Commission.
        Triggered when the FAA fails to respond or upholds an unjustified refusal.
        """
        system_prompt = (
            "You are a senior legal assistant specializing in the Indian Right to Information (RTI) Act, 2005.\n"
            "Your job is to draft a formal, legally structured Second Appeal under Section 19(3) of the RTI Act, 2005.\n\n"
            "Context:\n"
            "1. The First Appellate Authority (FAA) either failed to respond within 30/45 days or "
            "upheld the PIO's refusal without adequate justification.\n"
            "2. This Second Appeal is addressed to the Central Information Commission (CIC) or the "
            "relevant State Information Commission.\n"
            "3. Under Section 19(8), the Commission may direct disclosure, award compensation, "
            "impose penalties up to Rs. 25,000 on the PIO under Section 20(1), and recommend "
            "disciplinary action.\n"
            "4. State grounds clearly: failure of FAA to decide / unjustified exemption claim.\n"
            "5. Maintain a formal, legal, and serious tone.\n"
            "6. Output ONLY the drafted Second Appeal document in plain text/markdown."
        )

        user_message = (
            f"Original PIO Details:\n"
            f"Name: {pio_details.get('pio_name')}\n"
            f"Address: {pio_details.get('pio_address')}\n\n"
            f"Original Complaint:\n{raw_complaint}\n\n"
            f"Original RTI Application:\n{original_application_content}\n\n"
            f"First Appeal Filed:\n{first_appeal_content}\n\n"
        )

        if faa_order_summary:
            user_message += f"FAA Order / Response Summary:\n{faa_order_summary}\n\n"

        user_message += (
            f"Applicant Email: {applicant_email}\n\n"
            f"Please draft the complete Second Appeal under Section 19(3)."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        try:
            return self.client.call_chat_completion(messages, response_json=False, temperature=0.0)
        except Exception as e:
            print(f"Error drafting Second Appeal: {e}")
            return (
                "Error drafting Second Appeal. Please manually file a Second Appeal under "
                "Section 19(3) to the Central Information Commission (CIC) or the relevant "
                "State Information Commission."
            )
