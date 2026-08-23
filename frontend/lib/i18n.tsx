"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "ta" | "te" | "ml";

export interface Translations {
  title: string;
  subtitle: string;
  placeholder: string;
  submit_btn: string;
  loading_text: string;
  disclaimer: string;
  nav_cases: string;
  nav_new: string;
  nav_know_rights: string;
  nav_nearby: string;
  nav_about: string;
  confidence_settled: string;
  confidence_dependent: string;
  confidence_refusal: string;
  status_drafted: string;
  status_filed: string;
  status_overdue: string;
  status_appeal: string;
  status_resolved: string;
  back_to_dashboard: string;
  first_appeal_title: string;
  first_appeal_alert: string;
  file_cta: string;
  mark_resolved_cta: string;
  download_rti_cta: string;
  download_appeal_cta: string;
  timeline_drafted: string;
  timeline_filed: string;
  timeline_overdue: string;
  timeline_appeal: string;
  timeline_resolved: string;
  refusal_header: string;
  refusal_sub: string;
  refusal_contacts: string;
  refusal_rational_header: string;
  refusal_download_summary: string;
  appeal_generated_header: string;
  appeal_generated_sub: string;
  explain_title: string;
  draft_title: string;
  days_remaining: string;
  lang_switcher: string;
  // Wizard & Usability
  hero_headline: string;
  hero_sub: string;
  hero_start_cta: string;
  hero_trust_tag: string;
  wiz_step1_title: string;
  wiz_step2_title: string;
  wiz_step3_title: string;
  wiz_step4_title: string;
  wiz_step5_title: string;
  wiz_cat_delay_title: string;
  wiz_cat_delay_desc: string;
  wiz_cat_money_title: string;
  wiz_cat_money_desc: string;
  wiz_cat_unanswered_title: string;
  wiz_cat_unanswered_desc: string;
  wiz_cat_works_title: string;
  wiz_cat_works_desc: string;
  wiz_need_help: string;
  wiz_voice_btn: string;
  // Know Your Rights
  kyr_title: string;
  kyr_subtitle: string;
  kyr_quiz_title: string;
  // Nearby Resources
  nr_title: string;
  nr_subtitle: string;
  nr_search_placeholder: string;
  nr_geolocation_btn: string;
}

const dictionaries: Record<Language, Translations> = {
  en: {
    title: "RightPath",
    subtitle: "Describe your civic grievance in plain words. We will draft your official RTI application.",
    placeholder: "e.g., The main road in Sector 4 has had potholes for 9 months and the municipal ward office won't answer our queries...",
    submit_btn: "Draft Application",
    loading_text: "Analyzing grievance and retrieving citations from RTI Act...",
    disclaimer: "RightPath is an AI copilot grounding drafts on official RTI Act documents. Review all details before filing.",
    nav_cases: "My Cases",
    nav_new: "Start Case",
    nav_know_rights: "Know Your Rights",
    nav_nearby: "Nearby Resources",
    nav_about: "Legal Trust",
    confidence_settled: "Settled Scope",
    confidence_dependent: "Jurisdiction Dependent",
    confidence_refusal: "Requires Legal Representation",
    status_drafted: "Drafted",
    status_filed: "Filed",
    status_overdue: "Response Overdue",
    status_appeal: "First Appeal Ready",
    status_resolved: "Resolved",
    back_to_dashboard: "Back to Dashboard",
    first_appeal_title: "Statutory Deadline Elapsed",
    first_appeal_alert: "The 30-day statutory response limit under Section 7(1) of the RTI Act has passed. You can now file a First Appeal.",
    file_cta: "File Application & Start 30-Day Tracker",
    mark_resolved_cta: "Mark Response Received",
    download_rti_cta: "Download RTI Application (TXT)",
    download_appeal_cta: "Download First Appeal (TXT)",
    timeline_drafted: "Grievance classified and application drafted",
    timeline_filed: "Official application filed with PIO",
    timeline_overdue: "30-day response window breached (Section 7(1))",
    timeline_appeal: "Section 19(1) First Appeal generated and ready for post",
    timeline_resolved: "PIO response received and logged",
    refusal_header: "This request requires formal legal representation.",
    refusal_sub: "Under Section 8 of the RTI Act, 2005, public authorities are exempt from disclosing certain categories of private, commercial, or security sensitive information. RightPath cannot generate applications for this dispute.",
    refusal_contacts: "Local District Legal Services Authorities (DLSA) & Legal Helpdesks:",
    refusal_rational_header: "Exemption Rationale",
    refusal_download_summary: "Download Case Summary for Counsel",
    appeal_generated_header: "First Appeal Generated",
    appeal_generated_sub: "A deemed refusal appeal under Section 19(1) has been drafted due to non-response from the Public Information Officer within 30 days.",
    explain_title: "Plain-Language Explanation",
    draft_title: "Official RTI Application (in English - Required for filing)",
    days_remaining: "days remaining",
    lang_switcher: "Language",
    hero_headline: "Understand and act on your legal rights — RightPath drafts and files it for you",
    hero_sub: "Transform plain-language civic grievances into legally grounded, official RTI applications. Grounded directly in statutory acts — verified by legal RAG, not AI guesses.",
    hero_start_cta: "Start Your Case",
    hero_trust_tag: "Statutory Law Copilot • Powered by RTI Act, 2005",
    wiz_step1_title: "Choose Problem Category",
    wiz_step2_title: "Guided Questions",
    wiz_step3_title: "Confirm Understanding",
    wiz_step4_title: "Review Grounded Draft",
    wiz_step5_title: "File & Track SLA",
    wiz_cat_delay_title: "Application or Certificate Delayed",
    wiz_cat_delay_desc: "Pensions, ration cards, driving licenses, or municipal certificates delayed beyond promised date.",
    wiz_cat_money_title: "Public Money & Expenditure Query",
    wiz_cat_money_desc: "Want to know how public funds were allocated or spent on local civic projects.",
    wiz_cat_unanswered_title: "Government Office Not Responding",
    wiz_cat_unanswered_desc: "Submitted letters or complaints to ward offices with no response or status update.",
    wiz_cat_works_title: "Public Works & Infrastructure Potholes",
    wiz_cat_works_desc: "Road repairs, drainage, streetlights, or public construction quality and budget records.",
    wiz_need_help: "Need Help?",
    wiz_voice_btn: "Voice Input",
    kyr_title: "Know Your Legal Rights (RTI Act 2005)",
    kyr_subtitle: "Clear, plain-language legal guide for Indian citizens.",
    kyr_quiz_title: "Is RTI Right for My Problem?",
    nr_title: "Nearby Legal & Administrative Resources",
    nr_subtitle: "Locate official PIO offices, District Legal Aid Centers, and local authorities.",
    nr_search_placeholder: "Enter PIN code or city (e.g. 560037, Bangalore)...",
    nr_geolocation_btn: "Use Current Location"
  },
  hi: {
    title: "राइटपाथ (RightPath)",
    subtitle: "अपनी नागरिक शिकायत को सरल शब्दों में लिखें। हम आपका आधिकारिक आरटीआई (RTI) आवेदन तैयार करेंगे।",
    placeholder: "जैसे, सेक्टर 4 की मुख्य सड़क पर 9 महीने से गड्ढे हैं और नगर निगम कार्यालय हमारे प्रश्नों का उत्तर नहीं दे रहा है...",
    submit_btn: "आवेदन का मसौदा तैयार करें",
    loading_text: "शिकायत का विश्लेषण और आरटीआई अधिनियम से उद्धरण प्राप्त किए जा रहे हैं...",
    disclaimer: "राइटपाथ एक एआई सह-पायलट है जो आरटीआई अधिनियम के दस्तावेजों पर आधारित है। दाखिल करने से पहले सभी विवरणों की समीक्षा करें।",
    nav_cases: "मेरे मामले",
    nav_new: "मामला शुरू करें",
    nav_know_rights: "अपने अधिकार जानें",
    nav_nearby: "निकटतम संसाधन",
    nav_about: "कानूनी विश्वास",
    confidence_settled: "निर्धारित (Settled)",
    confidence_dependent: "क्षेत्राधिकार निर्भर",
    confidence_refusal: "कानूनी प्रतिनिधित्व की आवश्यकता है",
    status_drafted: "तैयार किया गया",
    status_filed: "दाखिल किया गया",
    status_overdue: "जवाब की अवधि समाप्त",
    status_appeal: "प्रथम अपील तैयार",
    status_resolved: "सुलझाया गया",
    back_to_dashboard: "डैशबोर्ड पर वापस जाएं",
    first_appeal_title: "वैधानिक समय सीमा समाप्त",
    first_appeal_alert: "आरटीआई अधिनियम की धारा 7(1) के तहत 30 दिनों की वैधानिक प्रतिक्रिया सीमा समाप्त हो गई है। अब आप प्रथम अपील दायर कर सकते हैं।",
    file_cta: "आवेदन जमा करें और 30-दिवसीय ट्रैकर शुरू करें",
    mark_resolved_cta: "उत्तर प्राप्त हुआ चिन्हित करें",
    download_rti_cta: "आरटीआई आवेदन डाउनलोड करें (TXT)",
    download_appeal_cta: "प्रथम अपील डाउनलोड करें (TXT)",
    timeline_drafted: "शिकायत का वर्गीकरण और आवेदन का मसौदा तैयार किया गया",
    timeline_filed: "PIO के पास आधिकारिक आवेदन जमा किया गया",
    timeline_overdue: "30-दिवसीय प्रतिक्रिया खिड़की का उल्लंघन (धारा 7(1))",
    timeline_appeal: "धारा 19(1) प्रथम अपील तैयार है और डाक के लिए उपलब्ध है",
    timeline_resolved: "PIO उत्तर प्राप्त हुआ और दर्ज किया गया",
    refusal_header: "इस अनुरोध के लिए औपचारिक कानूनी प्रतिनिधित्व की आवश्यकता है।",
    refusal_sub: "आरटीआई अधिनियम, 2005 की धारा 8 के तहत, सार्वजनिक अधिकारियों को निजी, वाणिज्यिक या सुरक्षा संवेदनशील जानकारी की कुछ श्रेणियों का खुलासा करने से छूट दी गई है। राइटपाथ इस विवाद के लिए आवेदन उत्पन्न नहीं कर सकता है।",
    refusal_contacts: "स्थानीय जिला कानूनी सेवा प्राधिकरण (DLSA) और कानूनी सहायता केंद्र:",
    refusal_rational_header: "छूट का औचित्य",
    refusal_download_summary: "वकील के लिए मामले का सारांश डाउनलोड करें",
    appeal_generated_header: "प्रथम अपील तैयार की गई",
    appeal_generated_sub: "30 दिनों के भीतर जन सूचना अधिकारी से कोई प्रतिक्रिया न मिलने के कारण धारा 19(1) के तहत एक अपील तैयार की गई है।",
    explain_title: "सरल भाषा में स्पष्टीकरण",
    draft_title: "आधिकारिक आरटीआई आवेदन (अंग्रेजी में - दाखिल करने के लिए आवश्यक)",
    days_remaining: "दिन शेष",
    lang_switcher: "भाषा",
    hero_headline: "अपने कानूनी अधिकारों को समझें और कार्रवाई करें — राइटपाथ आवेदन तैयार और दाखिल करता है",
    hero_sub: "अपनी नागरिक समस्याओं को आधिकारिक आरटीआई आवेदनों में बदलें। आरटीआई अधिनियम पर आधारित।",
    hero_start_cta: "अपना मामला शुरू करें",
    hero_trust_tag: "वैधानिक कानून सह-पायलट • आरटीआई अधिनियम 2005 द्वारा संचालित",
    wiz_step1_title: "समस्या श्रेणी चुनें",
    wiz_step2_title: "निर्देशित प्रश्न",
    wiz_step3_title: "समझ की पुष्टि करें",
    wiz_step4_title: "मसौदे की समीक्षा करें",
    wiz_step5_title: "दाखिल करें और ट्रैक करें",
    wiz_cat_delay_title: "आवेदन या प्रमाण पत्र में देरी",
    wiz_cat_delay_desc: "पेंशन, राशन कार्ड, ड्राइविंग लाइसेंस या नगर निगम प्रमाण पत्र में देरी।",
    wiz_cat_money_title: "सरकारी धन और खर्च का विवरण",
    wiz_cat_money_desc: "यह जानना चाहते हैं कि स्थानीय नागरिक परियोजनाओं पर सरकारी धन कैसे खर्च किया गया।",
    wiz_cat_unanswered_title: "सरकारी कार्यालय जवाब नहीं दे रहा",
    wiz_cat_unanswered_desc: "वार्ड कार्यालयों में पत्र या शिकायतें प्रस्तुत की गईं लेकिन कोई जवाब नहीं मिला।",
    wiz_cat_works_title: "सार्वजनिक निर्माण और सड़क के गड्ढे",
    wiz_cat_works_desc: "सड़क मरम्मत, जल निकासी, स्ट्रीटलाइट्स या सार्वजनिक निर्माण की गुणवत्ता के रिकॉर्ड।",
    wiz_need_help: "सहायता चाहिए?",
    wiz_voice_btn: "आवाज से दर्ज करें",
    kyr_title: "अपने कानूनी अधिकार जानें (आरटीआई अधिनियम 2005)",
    kyr_subtitle: "भारतीय नागरिकों के लिए स्पष्ट, सरल कानूनी मार्गदर्शिका।",
    kyr_quiz_title: "क्या आरटीआई मेरी समस्या के लिए सही है?",
    nr_title: "निकटतम कानूनी और प्रशासनिक संसाधन",
    nr_subtitle: "आधिकारिक जन सूचना अधिकारी (PIO) कार्यालय और कानूनी सहायता केंद्र खोजें।",
    nr_search_placeholder: "पिन कोड या शहर दर्ज करें (उदा. 560037, बैंगलोर)...",
    nr_geolocation_btn: "वर्तमान स्थान का उपयोग करें"
  },
  ta: {
    title: "ரைட்பாத் (RightPath)",
    subtitle: "உங்கள் குடிமைப் புகாரை எளிய சொற்களில் விவரிக்கவும். உங்களது அதிகாரப்பூர்வ ஆர்டிஐ (RTI) விண்ணப்பத்தை நாங்கள் உருவாக்குவோம்.",
    placeholder: "உதாரணமாக, செக்டர் 4 இல் உள்ள முக்கிய சாலையில் 9 மாதங்களாக பள்ளங்கள் உள்ளன மற்றும் மாநகராட்சி வார்டு அலுவலகம் எங்கள் கேள்விகளுக்கு பதிலளிக்கவில்லை...",
    submit_btn: "விண்ணப்ப வரைவைத் தயாரி",
    loading_text: "புகாரை ஆய்வு செய்து ஆர்டிஐ சட்டத்தின் மேற்கோள்களை மீட்டெடுக்கிறது...",
    disclaimer: "ரைட்பாத் என்பது அதிகாரப்பூர்வ ஆர்டிஐ சட்ட ஆவணங்களை அடிப்படையாகக் கொண்ட ஒரு AI உதவியாளர் ஆகும். தாக்கல் செய்வதற்கு முன் அனைத்து விவரங்களையும் சரிபார்க்கவும்.",
    nav_cases: "எனது வழக்குகள்",
    nav_new: "வழக்கைத் தொடங்கு",
    nav_know_rights: "உங்கள் உரிமைகளை அறிவீர்",
    nav_nearby: "அருகிலுள்ள மையங்கள்",
    nav_about: "சட்ட நம்பிக்கை",
    confidence_settled: "தீர்க்கப்பட்டது",
    confidence_dependent: "அதிகார வரம்பிற்குட்பட்டது",
    confidence_refusal: "சட்டப்பூர்வ பிரதிநிதித்துவம் தேவை",
    status_drafted: "வரைவு செய்யப்பட்டது",
    status_filed: "தாக்கல் செய்யப்பட்டது",
    status_overdue: "பதில் வரம்பு மீறப்பட்டது",
    status_appeal: "முதல் மேல்முறையீடு தயார்",
    status_resolved: "தீர்க்கப்பட்டது",
    back_to_dashboard: "முகப்புப் பலகைக்குத் திரும்பு",
    first_appeal_title: "சட்டப்பூர்வ காலக்கெடு முடிந்தது",
    first_appeal_alert: "ஆர்டிஐ சட்டத்தின் பிரிவு 7(1) இன் கீழ் 30 நாள் சட்டப்பூர்வ பதில் வரம்பு கடந்துவிட்டது. நீங்கள் இப்போது முதல் மேல்முறையீடு தாக்கல் செய்யலாம்.",
    file_cta: "விண்ணப்பத்தைத் தாக்கல் செய்து 30 நாள் கண்காணிப்பானைத் தொடங்கு",
    mark_resolved_cta: "பதில் பெறப்பட்டது எனக் குறிக்கவும்",
    download_rti_cta: "ஆர்டிஐ விண்ணப்பத்தைப் பதிவிறக்கு (TXT)",
    download_appeal_cta: "முதல் மேல்முறையீட்டைப் பதிவிறக்கு (TXT)",
    timeline_drafted: "புகார் வகைப்படுத்தப்பட்டு விண்ணப்பம் வரைவு செய்யப்பட்டது",
    timeline_filed: "அதிகாரப்பூர்வ விண்ணப்பம் PIO-விடம் தாக்கல் செய்யப்பட்டது",
    timeline_overdue: "30 நாள் பதில் சாளரம் மீறப்பட்டது (பிரிவு 7(1))",
    timeline_appeal: "பிரிவு 19(1) முதல் மேல்முறையீடு உருவாக்கப்பட்டு அஞ்சலுக்குத் தயாராக உள்ளது",
    timeline_resolved: "PIO-விடம் இருந்து பதில் பெறப்பட்டு பதிவு செய்யப்பட்டது",
    refusal_header: "இந்த கோரிக்கைக்கு முறையான சட்டப் பிரதிநிதித்துவம் தேவை.",
    refusal_sub: "ஆர்டிஐ சட்டம், 2005 இன் பிரிவு 8 இன் கீழ், பொது அதிகாரிகளுக்கு சில தனிப்பட்ட, வணிக அல்லது பாதுகாப்பு சார்ந்த தகவல்களை வெளியிட விலக்கு அளிக்கப்பட்டுள்ளது. இந்த தகராறுக்கு ரைட்பாத் விண்ணப்பங்களை உருவாக்க முடியாது.",
    refusal_contacts: "வட்டார மாவட்ட சட்ட சேவைகள் ஆணையம் (DLSA) மற்றும் சட்ட உதவி மையங்கள்:",
    refusal_rational_header: "விலக்குக்கான காரணம்",
    refusal_download_summary: "வழக்கறிஞருக்கான வழக்குச் சுருக்கத்தைப் பதிவிறக்கு",
    appeal_generated_header: "முதல் மேல்முறையீடு உருவாக்கப்பட்டது",
    appeal_generated_sub: "30 நாட்களுக்குள் பொது தகவல் அதிகாரியிடமிருந்து பதில் வராததால் பிரிவு 19(1)-இன் கீழ் மேல்முறையீடு வரைவு செய்யப்பட்டுள்ளது.",
    explain_title: "எளிய மொழி விளக்கம்",
    draft_title: "அதிகாரப்பூர்வ ஆர்டிஐ விண்ணப்பம் (ஆங்கிலத்தில் - தாக்கல் செய்யத் தேவைப்படுகிறது)",
    days_remaining: "நாட்கள் மீதமுள்ளன",
    lang_switcher: "மொழி",
    hero_headline: "உங்கள் சட்டப்பூர்வ உரிமைகளைப் புரிந்து கொண்டு நடவடிக்கை எடுங்கள் — ரைட்பாத் வரைவு செய்து தாக்கல் செய்கிறது",
    hero_sub: "உங்கள் குடிமைப் புகார்களை அதிகாரப்பூர்வ ஆர்டிஐ விண்ணப்பங்களாக மாற்றவும். ஆர்டிஐ சட்டம் 2005 இன் அடிப்படையில்.",
    hero_start_cta: "வழக்கைத் தொடங்குங்கள்",
    hero_trust_tag: "சட்ட உதவியாளர் • ஆர்டிஐ சட்டம் 2005 மூலம் இயங்குகிறது",
    wiz_step1_title: "பிரச்சனை வகையைத் தேர்வு செய்",
    wiz_step2_title: "வழிகாட்டப்பட்ட கேள்விகள்",
    wiz_step3_title: "புரிதலை உறுதி செய்",
    wiz_step4_title: "வரைவை ஆய்வு செய்",
    wiz_step5_title: "தாக்கல் செய்து கண்காணி",
    wiz_cat_delay_title: "விண்ணப்பம் அல்லது சான்றிதழ் தாமதம்",
    wiz_cat_delay_desc: "ஓய்வூதியம், ரேஷன் கார்டு, ஓட்டுநர் உரிமம் அல்லது நகராட்சி சான்றிதழ்கள் தாமதமானது.",
    wiz_cat_money_title: "பொது நிதி மற்றும் செலவு விபரம்",
    wiz_cat_money_desc: "உள்ளாட்சித் திட்டங்களுக்கு அரசு நிதி எவ்வாறு செலவிடப்பட்டது என்பதை அறிய.",
    wiz_cat_unanswered_title: "அரசு அலுவலகம் பதிலளிக்கவில்லை",
    wiz_cat_unanswered_desc: "வார்டு அலுவலகங்களில் அளிக்கப்பட்ட மனுக்களுக்கு எவ்வித பதிலும் கிடைக்கவில்லை.",
    wiz_cat_works_title: "பொதுப்பணி மற்றும் சாலைப் பள்ளங்கள்",
    wiz_cat_works_desc: "சாலை பழுதுபார்ப்பு, வடிகால், தெருவிளக்குகள் அல்லது பொது கட்டுமானப் பதிவுகள்.",
    wiz_need_help: "உதவி தேவையா?",
    wiz_voice_btn: "குரல் மூலம் பேசு",
    kyr_title: "உங்கள் சட்டப்பூர்வ உரிமைகளை அறிவீர் (ஆர்டிஐ சட்டம் 2005)",
    kyr_subtitle: "இந்திய குடிமக்களுக்கான எளிய சட்ட வழிகாட்டி.",
    kyr_quiz_title: "என் பிரச்சனைக்கு ஆர்டிஐ சரியானதா?",
    nr_title: "அருகிலுள்ள சட்ட மற்றும் நிர்வாக மையங்கள்",
    nr_subtitle: "அதிகாரப்பூர்வ தகவல் அதிகாரி (PIO) அலுவலகங்கள் மற்றும் சட்ட உதவி மையங்களைக் கண்டறியவும்.",
    nr_search_placeholder: "பின்கோடு அல்லது நகரத்தை உள்ளிடவும் (எ.கா. 560037, பெங்களூர்)...",
    nr_geolocation_btn: "தற்போதைய இருப்பிடத்தைப் பயன்படுத்து"
  },
  te: {
    title: "రైట్‌పాత్ (RightPath)",
    subtitle: "మీ పౌర సమస్యను సరళమైన మాటలలో వివరించండి. మేము మీ అధికారిక ఆర్టీఐ (RTI) దరఖాస్తును సిద్ధం చేస్తాము.",
    placeholder: "ఉదాహరణకు, సెక్టర్ 4 లోని ప్రధాన రహదారిపై 9 నెలలుగా గుంతలు ఉన్నాయి మరియు మునిసిపల్ వార్డు కార్యాలయం మా ప్రశ్నలకు సమాధానం ఇవ్వడం లేదు...",
    submit_btn: "దరఖాస్తు రూపకల్పన చేయి",
    loading_text: "సమస్యను విశ్లేషించి ఆర్టీఐ చట్టం నుండి వివరాలను సేకరిస్తోంది...",
    disclaimer: "రైట్‌పాత్ అనేది అధికారిక ఆర్టీఐ చట్ట పత్రాలపై ఆధారపడిన ఒక AI సహాయకుడు. దాఖలు చేసే ముందు అన్ని వివరాలను తనిఖీ చేయండి.",
    nav_cases: "నా కేసులు",
    nav_new: "కేసు ప్రారంభించండి",
    nav_know_rights: "మీ హక్కులు తెలుసుకోండి",
    nav_nearby: "సమీప వనరులు",
    nav_about: "చట్టపరమైన నమ్మకం",
    confidence_settled: "పరిష్కరించబడింది",
    confidence_dependent: "అధికార పరిధి ఆధారితం",
    confidence_refusal: "న్యాయపరమైన ప్రాతినిధ్యం అవసరం",
    status_drafted: "రూపకల్పన చేయబడింది",
    status_filed: "దాఖలు చేయబడింది",
    status_overdue: "సమాధాన సమయం మించిపోయింది",
    status_appeal: "మొదటి అప్పీల్ సిద్ధం",
    status_resolved: "పరిష్కారం అయింది",
    back_to_dashboard: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్ళు",
    first_appeal_title: "చట్టబద్ధమైన గడువు ముగిసింది",
    first_appeal_alert: "ఆర్టీఐ చట్టం సెక్షన్ 7(1) ప్రకారం 30 రోజుల చట్టబద్ధమైన గడువు ముగిసింది. మీరు ఇప్పుడు మొదటి అప్పీల్‌ను దాఖలు చేయవచ్చు.",
    file_cta: "దరఖాస్తు దాఖలు చేసి 30 రోజుల ట్రాకర్‌ను ప్రారంభించు",
    mark_resolved_cta: "సమాధానం వచ్చినట్లు గుర్తు పెట్టు",
    download_rti_cta: "ఆర్టీఐ దరఖాస్తును డౌన్‌లోడ్ చేసుకోండి (TXT)",
    download_appeal_cta: "మొదటి అప్పీల్‌ను డౌన్‌లోడ్ చేసుకోండి (TXT)",
    timeline_drafted: "సమస్య వర్గీకరించబడి దరఖాస్తు సిద్ధం చేయబడింది",
    timeline_filed: "PIO వద్ద అధికారిక దరఖాస్తు దాఖలు చేయబడింది",
    timeline_overdue: "30 రోజుల సమాధాన గడువు మించిపోయింది (సెక్షన్ 7(1))",
    timeline_appeal: "సెక్షన్ 19(1) మొదటి అప్పీల్ రూపొందించబడింది మరియు పోస్ట్‌కు సిద్ధంగా ఉంది",
    timeline_resolved: "PIO సమాధానం స్వీకరించి నమోదు చేయబడింది",
    refusal_header: "ఈ అభ్యర్థనకు అధికారిక న్యాయ ప్రాతినిధ్యం అవసరం.",
    refusal_sub: "ఆర్టీఐ చట్టం, 2005 లోని సెక్షన్ 8 ప్రకారం, ప్రభుత్వ అధికారులు కొన్ని వ్యక్తిగత, వాణిజ్య లేదా భద్రతా సమాచారాన్ని బహిర్గతం చేయకుండా మినహాయింపు పొందారు. ఈ వివాదానికి రైట్‌పాత్ దరఖాస్తులను సిద్ధం చేయలేదు.",
    refusal_contacts: "స్థానిక జిల్లా చట్టపరమైన సేవల అధికారం (DLSA) & లీగల్ సహాయ కేంద్రాలు:",
    refusal_rational_header: "మినహాయింపు కారణం",
    refusal_download_summary: "న్యాయవాది కోసం కేసు సారాంశాన్ని డౌన్‌లోడ్ చేసుకోండి",
    appeal_generated_header: "మొదటి అప్పీల్ రూపొందించబడింది",
    appeal_generated_sub: "30 రోజుల్లోగా సమాచార అధికారి నుండి సమాధానం రాకపోవడం వల్ల సెక్షన్ 19(1) ప్రకారం అప్పీల్ రూపొందించబడింది.",
    explain_title: "సరళమైన భాషా వివరణ",
    draft_title: "అధికారిక ఆర్టీఐ దరఖాస్తు (ఆంగ్లంలో - దాఖలు చేయడానికి అవసరం)",
    days_remaining: "రోజులు మిగిలి ఉన్నాయి",
    lang_switcher: "భాష",
    hero_headline: "మీ చట్టపరమైన హక్కులను అర్థం చేసుకోండి — రైట్‌పాత్ దరఖాస్తులను సిద్ధం చేసి దాఖలు చేస్తుంది",
    hero_sub: "మీ పౌర సమస్యలను అధికారిక ఆర్టీఐ దరఖాస్తులుగా మార్చండి. ఆర్టీఐ చట్టం 2005 ఆధారంగా.",
    hero_start_cta: "మీ కేసు ప్రారంభించండి",
    hero_trust_tag: "చట్టపరమైన సహ సహాయకుడు • ఆర్టీఐ చట్టం 2005 ద్వారా నడపబడుతుంది",
    wiz_step1_title: "సమస్య వర్గాన్ని ఎంచుకోండి",
    wiz_step2_title: "మార్గాన్వేషణ ప్రశ్నలు",
    wiz_step3_title: "అర్థం చేసుకున్న వివరాలను ధృవీకరించండి",
    wiz_step4_title: "ముసాయిదాను సమీక్షించండి",
    wiz_step5_title: "దాఖలు చేసి ట్రాక్ చేయండి",
    wiz_cat_delay_title: "దరఖాస్తు లేదా సర్టిఫికేట్ ఆలస్యం",
    wiz_cat_delay_desc: "పింఛన్లు, రేషన్ కార్డులు, డ్రైవింగ్ లైసెన్సులు లేదా మున్సిపల్ సర్టిఫికేట్లు ఆలస్యమైనప్పుడు.",
    wiz_cat_money_title: "ప్రభుత్వ నిధులు మరియు ఖర్చు వివరాలు",
    wiz_cat_money_desc: "స్థానిక పౌర ప్రాజెక్టులపై ప్రభుత్వ నిధులు ఎలా ఖర్చు చేయబడ్డాయో తెలుసుకోవడానికి.",
    wiz_cat_unanswered_title: "ప్రభుత్వ కార్యాలయం స్పందించడం లేదు",
    wiz_cat_unanswered_desc: "వార్డు కార్యాలయాల్లో సమర్పించిన లేఖలు లేదా ఫిర్యాదులకు ఎటువంటి సమాధానం రాకపోతే.",
    wiz_cat_works_title: "పబ్లిక్ వర్క్స్ మరియు రోడ్డు గుంతలు",
    wiz_cat_works_desc: "రోడ్డు మరమ్మతులు, మురుగునీటి పారుదల, వీధి దీపాలు లేదా నిర్మాణ నాణ్యత రికార్డులు.",
    wiz_need_help: "సహాయం కావాలా?",
    wiz_voice_btn: "వాయిస్ ఇన్ పుట్",
    kyr_title: "మీ చట్టపరమైన హక్కులను తెలుసుకోండి (ఆర్టీఐ చట్టం 2005)",
    kyr_subtitle: "భారతీయ పౌరుల కోసం సులభమైన చట్టపరమైన మార్గదర్శిని.",
    kyr_quiz_title: "నా సమస్యకు ఆర్టీఐ సరైనదేనా?",
    nr_title: "సమీప చట్టపరమైన మరియు పరిపాలనా వనరులు",
    nr_subtitle: "అధికారిక సమాచార అధికారి (PIO) కార్యాలయాలు మరియు లీగల్ ఎయిడ్ కేంద్రాలను కనుగొనండి.",
    nr_search_placeholder: "పిన్ కోడ్ లేదా నగరాన్ని ఎంటర్ చేయండి (ఉదా. 560037, బెంగళూరు)...",
    nr_geolocation_btn: "ప్రస్తుత స్థానాన్ని ఉపయోగించండి"
  },
  ml: {
    title: "റൈറ്റ്പാത്ത് (RightPath)",
    subtitle: "നിങ്ങളുടെ സിവിക് പരാതി ലളിതമായ വാക്കുകളിൽ വിവരിക്കുക. നിങ്ങളുടെ ഔദ്യോഗിക വിവരാവകാശ (RTI) അപേക്ഷ ഞങ്ങൾ തയ്യാറാക്കും.",
    placeholder: "ഉദാഹരണത്തിന്, സെക്ടർ 4-ലെ പ്രധാന റോഡിൽ 9 മാസമായി കുഴികളുണ്ട്, മുനിസിപ്പൽ വാർഡ് ഓഫീസ് ഞങ്ങളുടെ ചോദ്യങ്ങൾക്ക് മറുപടി നൽകുന്നില്ല...",
    submit_btn: "അപേക്ഷ തയ്യാറാക്കുക",
    loading_text: "പരാതി വിശകലനം ചെയ്യുകയും വിവരാവകാശ നിയമത്തിൽ നിന്നുള്ള ഉദ്ധരണികൾ വീണ്ടെടുക്കുകയും ചെയ്യുന്നു...",
    disclaimer: "ഔദ്യോഗിക വിവരാവകാശ നിയമ രേഖകളെ അടിസ്ഥാനമാക്കിയുള്ള ഒരു AI സഹായ സംവിധാനമാണ് റൈറ്റ്പാത്ത്. ഫയൽ ചെയ്യുന്നതിന് മുമ്പ് എല്ലാ വിവരങ്ങളും പരിശോധിക്കുക.",
    nav_cases: "എന്റെ കേസുകൾ",
    nav_new: "കേസ് ആരംഭിക്കുക",
    nav_know_rights: "അവകാശങ്ങൾ അറിയുക",
    nav_nearby: "സമീപകാല കേന്ദ്രങ്ങൾ",
    nav_about: "നിയമപരമായ വിശ്വാസം",
    confidence_settled: "പരിഹരിക്കപ്പെട്ടത്",
    confidence_dependent: "അധികാര പരിധിക്ക് വിധേയം",
    confidence_refusal: "നിയമപരമായ സഹായം ആവശ്യമാണ്",
    status_drafted: "തയ്യാറാക്കിയത്",
    status_filed: "ഫയൽ ചെയ്തത്",
    status_overdue: "മറുപടി സമയം കഴിഞ്ഞു",
    status_appeal: "ഒന്നാം അപ്പീൽ തയ്യാറാണ്",
    status_resolved: "പരിഹരിച്ചു",
    back_to_dashboard: "ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക",
    first_appeal_title: "നിയമപരമായ സമയപരിധി കഴിഞ്ഞു",
    first_appeal_alert: "വിവരാവകാശ നിയമത്തിലെ സെക്ഷൻ 7(1) പ്രകാരമുള്ള 30 ദിവസത്തെ നിയമപരമായ സമയപരിധി കഴിഞ്ഞു. നിങ്ങൾക്ക് ഇപ്പോൾ ഒന്നാം അപ്പീൽ ഫയൽ ചെയ്യാം.",
    file_cta: "അപേക്ഷ ഫയൽ ചെയ്യുക, 30 ദിവസത്തെ ട്രാക്കർ ആരംഭിക്കുക",
    mark_resolved_cta: "മറുപടി ലഭിച്ചു എന്ന് അടയാളപ്പെടുത്തുക",
    download_rti_cta: "വിവരാവകാശ അപേക്ഷ ഡൗൺലോഡ് ചെയ്യുക (TXT)",
    download_appeal_cta: "ഒന്നാം അപ്പീൽ ഡൗൺലോഡ് ചെയ്യുക (TXT)",
    timeline_drafted: "പരാതി തരംതിരിക്കുകയും അപേക്ഷ തയ്യാറാക്കുകയും ചെയ്തു",
    timeline_filed: "ഔദ്യോഗിക അപേക്ഷ PIO-യ്ക്ക് സമർപ്പിച്ചു",
    timeline_overdue: "30 ദിവസത്തെ മറുപടി സമയപരിധി ലംഘിച്ചു (സെക്ഷൻ 7(1))",
    timeline_appeal: "സെക്ഷൻ 19(1) ഒന്നാം അപ്പീൽ തയ്യാറാക്കി തപാൽ ചെയ്യാൻ സജ്ജമാക്കിയിരിക്കുന്നു",
    timeline_resolved: "PIO-യുടെ മറുപടി ലഭിക്കുകയും രേഖപ്പെടുത്തുകയും ചെയ്തു",
    refusal_header: "ഈ അപേക്ഷയ്ക്ക് ഔപചാരിക നിയമസഹായം ആവശ്യമാണ്.",
    refusal_sub: "വിവരാവകാശ നിയമം, 2005-ലെ സെക്ഷൻ 8 പ്രകാരം, സ്വകാര്യ, വാണിജ്യ അല്ലെങ്കിൽ സുരക്ഷാ പ്രാധാന്യമുള്ള ചില വിവരങ്ങൾ വെളിപ്പെടുത്തുന്നതിൽ നിന്ന് പൊതു അധികാരികൾക്ക് ഒഴിവാക്കലുണ്ട്. ഈ തർക്കത്തിനായി റൈറ്റ്പാത്തിന് അപേക്ഷകൾ തയ്യാറാക്കാൻ കഴിയില്ല.",
    refusal_contacts: "പ്രാദേശിക ജില്ലാ നിയമ സേവന അതോറിറ്റിയും (DLSA) നിയമ സഹായ കേന്ദ്രങ്ങളും:",
    refusal_rational_header: "ഒഴിവാക്കലിന്റെ കാരണം",
    refusal_download_summary: "നിയമ ഉപദേശകനായി കേസ് സംഗ്രഹം ഡൗൺലോഡ് ചെയ്യുക",
    appeal_generated_header: "ഒന്നാം അപ്പീൽ തയ്യാറാക്കി",
    appeal_generated_sub: "30 ദിവസത്തിനകം പൊതുവിവരാവകാശ ഓഫീസറിൽ നിന്ന് മറുപടി ലഭിക്കാത്തതിനാൽ സെക്ഷൻ 19(1) പ്രകാരം അപ്പീൽ തയ്യാറാക്കിയിട്ടുണ്ട്.",
    explain_title: "ലളിതമായ ഭാഷാ വിശദീകരണം",
    draft_title: "ഔദ്യോഗിക വിവരാവകാശ അപേക്ഷ (ഇംഗ്ലീഷിൽ - ഫയൽ ചെയ്യാൻ ആവശ്യമാണ്)",
    days_remaining: "ദിവസങ്ങൾ ബാക്കിയുണ്ട്",
    lang_switcher: "ഭാഷ",
    hero_headline: "നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങൾ മനസ്സിലാക്കി നടപടിയെടുക്കുക — റൈറ്റ്പാത്ത് തയ്യാറാക്കി ഫയൽ ചെയ്യുന്നു",
    hero_sub: "നിങ്ങളുടെ സിവിക് പരാതികൾ ഔദ്യോഗിക വിവരാവകാശ അപേക്ഷകളാക്കി മാറ്റുക. വിവരാവകാശ നിയമം 2005 അടിസ്ഥാനമാക്കി.",
    hero_start_cta: "കേസ് ആരംഭിക്കുക",
    hero_trust_tag: "നിയമ സഹായ സംവിധാനം • വിവരാവകാശ നിയമം 2005 പ്രകാരം പ്രവർത്തിക്കുന്നു",
    wiz_step1_title: "വിഭാഗം തിരഞ്ഞെടുക്കുക",
    wiz_step2_title: "ചോദ്യങ്ങൾ",
    wiz_step3_title: "വിവരങ്ങൾ ഉറപ്പാക്കുക",
    wiz_step4_title: "കരട് പരിശോധിക്കുക",
    wiz_step5_title: "ഫയൽ ചെയ്യുക",
    wiz_cat_delay_title: "അപേക്ഷ അല്ലെങ്കിൽ സർട്ടിഫിക്കറ്റ് വൈകൽ",
    wiz_cat_delay_desc: "പെൻഷൻ, റേഷൻ കാർഡ്, ഡ്രൈവിംഗ് ലൈസൻസ് അല്ലെങ്കിൽ മുനിസിപ്പൽ സർട്ടിഫിക്കറ്റുകൾ വൈകിയാൽ.",
    wiz_cat_money_title: "പൊതുജന ധനവിനിയോഗ വിവരങ്ങൾ",
    wiz_cat_money_desc: "പ്രാദേശിക വികസന പദ്ധതികൾക്ക് സർക്കാർ പണം എങ്ങനെ ചെലവഴിച്ചുവെന്നറിയാൻ.",
    wiz_cat_unanswered_title: "സർക്കാർ ഓഫീസ് മറുപടി നൽകുന്നില്ല",
    wiz_cat_unanswered_desc: "വാർഡ് ഓഫീസുകളിൽ നൽകിയ പരാതികൾക്ക് മറുപടി ലഭിക്കാത്ത സാഹചര്യത്തിൽ.",
    wiz_cat_works_title: "പൊതുമരാമത്തും റോഡ് കുഴികളും",
    wiz_cat_works_desc: "റോഡ് അറ്റകുറ്റപ്പണികൾ, ഡ്രെയിനേജ്, തെരുവ് വിളക്കുകൾ അല്ലെങ്കിൽ നിർമ്മാണ വിവരങ്ങൾ.",
    wiz_need_help: "സഹായം വേണമെന്നുണ്ടോ?",
    wiz_voice_btn: "ശബ്ദം വഴി നൽകുക",
    kyr_title: "നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങൾ അറിയുക (RTI നിയമം 2005)",
    kyr_subtitle: "ഇന്ത്യൻ പൗരന്മാർക്കായുള്ള ലളിതമായ നിയമ ഗൈഡ്.",
    kyr_quiz_title: "എന്റെ പ്രശ്നത്തിന് വിവരാവകാശം അനുയോജ്യമാണോ?",
    nr_title: "സമീപത്തുള്ള നിയമപരമായ കേന്ദ്രങ്ങൾ",
    nr_subtitle: "ഔദ്യോഗിക പബ്ലിക് ഇൻഫർമേഷൻ ഓഫീസ് (PIO) കേന്ദ്രങ്ങളും ലീഗൽ എയ്ഡ് ഓഫീസുകളും കണ്ടെത്തുക.",
    nr_search_placeholder: "പിൻ കോഡ് അല്ലെങ്കിൽ നഗരം നൽകുക (उदा. 560037, ബാംഗ്ലൂർ)...",
    nr_geolocation_btn: "നിലവിലെ സ്ഥാനം ഉപയോഗിക്കുക"
  }
};

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("rightpath_lang") as Language;
    if (saved && dictionaries[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("rightpath_lang", lang);
  };

  const t = (key: keyof Translations): string => {
    return dictionaries[language][key] || dictionaries["en"][key] || String(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};
