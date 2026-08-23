import chromadb
from app.core.config import Config

class ChromaClient:
    def __init__(self):
        # Initialize the persistent client with the configured path
        self.client = chromadb.PersistentClient(path=Config.CHROMA_PATH)
        self.collection = self.client.get_collection("rti_act")
        
    def query_similarity(self, query_text: str, n_results: int = 3, where: dict = None):
        """
        Queries Chroma for top-N similar document chunks.
        Returns parsed list of results with metadata and content.
        """
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where
            )
            parsed_results = []
            if results and results["documents"] and len(results["documents"][0]) > 0:
                docs = results["documents"][0]
                ids = results["ids"][0]
                metadatas = results["metadatas"][0] if results["metadatas"] else [None] * len(docs)
                distances = results["distances"][0] if results["distances"] else [0.0] * len(docs)
                
                for i in range(len(docs)):
                    parsed_results.append({
                        "id": ids[i],
                        "document": docs[i],
                        "metadata": metadatas[i],
                        "distance": distances[i]
                    })
            return parsed_results
        except Exception as e:
            print(f"Error querying ChromaDB: {e}")
            return []
