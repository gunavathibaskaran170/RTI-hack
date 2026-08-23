import os
import re
import chromadb

# Ensure paths are resolved relative to the script directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_data")

# Basic english stopwords to filter out for the overlap check heuristic
STOPWORDS = {
    "a", "an", "the", "what", "is", "of", "to", "in", "for", "if", "under",
    "my", "how", "do", "i", "does", "have", "with", "within", "or", "and",
    "be", "on", "can", "not", "doesn't", "should", "would", "shall"
}

def check_keyword_overlap(query, document_text):
    """
    Checks if there is any overlap of keywords (excluding stopwords)
    between the query and the retrieved document.
    """
    query_words = set(re.findall(r'\b\w+\b', query.lower())) - STOPWORDS
    doc_words = set(re.findall(r'\b\w+\b', document_text.lower())) - STOPWORDS
    overlap = query_words.intersection(doc_words)
    return len(overlap) > 0, overlap


def check_source_type_match(retrieved_source_type: str, expected_types: list) -> bool:
    """
    Checks if the retrieved source_type matches any of the expected types.
    """
    return retrieved_source_type in expected_types


def run_tests():
    print("\n==================================================")
    print("      CHROMADB RETRIEVAL VERIFICATION RUN         ")
    print("==================================================")

    if not os.path.exists(CHROMA_DIR):
        print(f"Error: Chroma directory not found at: {CHROMA_DIR}")
        print("Please run ingest.py first to populate the vector store.")
        return False

    client = chromadb.PersistentClient(path=CHROMA_DIR)

    try:
        collection = client.get_collection("rti_act")
    except Exception as e:
        print(f"Error retrieving collection 'rti_act': {e}")
        return False

    count = collection.count()
    print(f"Connected to collection 'rti_act' containing {count} chunks.\n")

    # ----------------------------------------------------------------------
    # ORIGINAL TEST QUERIES (backward-compatible)
    # ----------------------------------------------------------------------
    original_queries = [
        "what happens if I don't get a reply to my RTI within 30 days",
        "how do I file a first appeal",
        "what information can be refused under RTI",
        "how many days does the government have to respond",
        "what is the penalty if the officer doesn't respond",
        "deficiency in service or product liability under Consumer Protection Act",
        "how is land acquisition market value compensation calculated by Collector"
    ]

    # ----------------------------------------------------------------------
    # NEW TYPED TEST QUERIES — each has an expected source_type
    # ----------------------------------------------------------------------
    typed_queries = [
        {
            "query": "can I file an RTI without giving my reason",
            "expected_source_types": ["faq"],
            "description": "Reason requirement — should hit FAQ"
        },
        {
            "query": "what is the fee for filing an RTI",
            "expected_source_types": ["rules", "state_rule"],
            "description": "Fee amount — should hit Rules or State Rule"
        },
        {
            "query": "how do I file a second appeal",
            "expected_source_types": ["faq"],
            "description": "Second appeal procedure — should hit FAQ or section_or_topic contains 'second_appeal'"
        },
        {
            "query": "are file notings available under RTI",
            "expected_source_types": ["faq", "precedent"],
            "description": "File notings — should hit FAQ or Precedent"
        },
        {
            "query": "what are the RTI fees in Karnataka",
            "expected_source_types": ["state_rule"],
            "description": "Karnataka-specific fees — should hit state_rule, state=Karnataka, jurisdiction_dependent=true"
        },
    ]

    all_passed = True

    # -- Run original queries -----------------------------------------------
    print("=" * 50)
    print("SECTION A: ORIGINAL RETRIEVAL QUERIES")
    print("=" * 50)

    for idx, q in enumerate(original_queries, 1):
        print(f"\nQUERY {idx}: \"{q}\"")
        print("-" * 50)

        results = collection.query(
            query_texts=[q],
            n_results=2
        )

        if not results or not results["documents"] or len(results["documents"][0]) == 0:
            print("  [ERROR] No results returned for this query.")
            all_passed = False
            continue

        docs = results["documents"][0]
        ids = results["ids"][0]
        metadatas = list(results["metadatas"][0]) if results["metadatas"] else [None] * len(docs)
        distances = results["distances"][0] if results["distances"] else [0.0] * len(docs)

        for r_idx in range(len(docs)):
            doc = docs[r_idx]
            doc_id = ids[r_idx]
            meta = metadatas[r_idx]
            dist = distances[r_idx]

            sec_num = meta.get("section_number", "Unknown") if meta else "Unknown"
            sec_title = meta.get("section_title", "Unknown") if meta else "Unknown"
            src_act = meta.get("source_act", "RTI Act, 2005") if meta else "RTI Act, 2005"
            source_type = meta.get("source_type", "act") if meta else "act"

            print(f"  [{r_idx+1}] ID: {doc_id} | Source: {src_act} | Section: {sec_num} ({sec_title}) | source_type: {source_type} | Distance: {dist:.4f}")

            has_overlap, common_words = check_keyword_overlap(q, doc)
            if not has_overlap:
                print(f"      [WARNING] Potential irrelevant retrieval (0 non-stopword overlap)!")
                all_passed = False

            snippet = doc.replace('\n', ' ').strip()
            if len(snippet) > 200:
                snippet = snippet[:197] + "..."
            print(f"      Snippet: {snippet}\n")

    # -- Run new typed queries ----------------------------------------------
    print("\n" + "=" * 50)
    print("SECTION B: NEW TYPED SOURCE_TYPE QUERIES")
    print("=" * 50)

    typed_passed = 0
    typed_total = len(typed_queries)

    for idx, tq in enumerate(typed_queries, 1):
        q = tq["query"]
        expected_types = tq["expected_source_types"]
        description = tq["description"]

        print(f"\nTYPED QUERY {idx}: \"{q}\"")
        print(f"  Description : {description}")
        print(f"  Expected    : source_type in {expected_types}")
        print("-" * 50)

        results = collection.query(
            query_texts=[q],
            n_results=3
        )

        if not results or not results["documents"] or len(results["documents"][0]) == 0:
            print("  [ERROR] No results returned for this query.")
            all_passed = False
            continue

        docs = results["documents"][0]
        ids = results["ids"][0]
        metadatas = list(results["metadatas"][0]) if results["metadatas"] else [None] * len(docs)
        distances = results["distances"][0] if results["distances"] else [0.0] * len(docs)

        top_match_passed = False
        
        for r_idx in range(len(docs)):
            doc = docs[r_idx]
            doc_id = ids[r_idx]
            meta = metadatas[r_idx] or {}
            dist = distances[r_idx]

            source_type = meta.get("source_type", "act")
            state = meta.get("state", "")
            jurisdiction_dependent = meta.get("jurisdiction_dependent", "false")
            section_or_topic = meta.get("section_or_topic", "")

            # Check if this row matches criteria
            row_matches = False
            
            # Base source_type check
            if check_source_type_match(source_type, expected_types):
                row_matches = True
                
            # Special check for second appeal query
            if "second appeal" in q.lower():
                if source_type == "faq" or "second_appeal" in section_or_topic.lower() or "second appeal" in section_or_topic.lower():
                    row_matches = True
            
            # Special check for Karnataka query
            if "karnataka" in q.lower():
                if source_type == "state_rule" and state.lower() == "karnataka" and jurisdiction_dependent == "true":
                    row_matches = True
                else:
                    row_matches = False

            if r_idx == 0:
                top_match_passed = row_matches

            type_match_str = "[OK]" if row_matches else "[FAIL]"

            print(f"  [{r_idx+1}] {type_match_str} ID: {doc_id}")
            print(f"      source_type: {source_type} | state: {state or 'N/A'} | jurisdiction_dependent: {jurisdiction_dependent}")
            if section_or_topic:
                print(f"      section_or_topic: {section_or_topic[:80]}")
            print(f"      Distance: {dist:.4f}")

            snippet = doc.replace('\n', ' ').strip()
            if len(snippet) > 180:
                snippet = snippet[:177] + "..."
            print(f"      Snippet: {snippet}\n")

        # Grade top result
        if top_match_passed:
            print(f"  [PASS] Top result matches expected query criteria")
            typed_passed += 1
        else:
            print(f"  [WARN] Top result does NOT match expected criteria")
            all_passed = False

    # -- Final Summary -----------------------------------------------------
    print("\n" + "=" * 50)
    print(f"TYPED QUERY RESULTS: {typed_passed}/{typed_total} typed queries retrieved correct source_type as top result")
    print("=" * 50)
    if all_passed:
        print("VERIFICATION STATUS: ALL TEST QUERIES PASSED SUCCESSFUL RETRIEVAL")
        return True
    else:
        print("VERIFICATION STATUS: RETRIEVAL FINISHED WITH WARNINGS/ERRORS")
        return False


if __name__ == "__main__":
    run_tests()
