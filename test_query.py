import os
from qdrant_client import QdrantClient
import cohere
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv("/mnt/d/desktop/final-code/hackhthon-robotic-book/backend/.env")

# Connect to services
qdrant_url = os.getenv("QDRANT_URL")
qdrant_key = os.getenv("QDRANT_API_KEY")
cohere_key = os.getenv("COHERE_API_KEY")

if not all([qdrant_url, qdrant_key, cohere_key]):
    print("❌ Required environment variables not set")
    exit(1)

qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key)
co = cohere.Client(cohere_key)

collection_name = "physical_ai_book"

def test_query_functionality():
    print("🔍 Testing query functionality...")

    # Test query
    test_query = "What is Physical AI?"

    try:
        # Generate embedding for the query
        print(f".embedding query: '{test_query}'")
        query_embedding = co.embed(
            texts=[test_query],
            model="embed-english-v3.0",
            input_type="search_query"
        ).embeddings[0]

        print(f"✅ Generated embedding with {len(query_embedding)} dimensions")

        # Query Qdrant
        print("🔍 Querying Qdrant for similar content...")
        results = qdrant.query_points(
            collection_name=collection_name,
            query=query_embedding,
            limit=5,
            with_payload=True
        )

        # Handle the QueryResponse object
        if hasattr(results, 'points'):
            points = results.points
        else:
            points = results  # Fallback to older API

        print(f"📊 Found {len(points)} results")

        if points:
            print("\n📚 Retrieved content samples:")
            for i, r in enumerate(points):
                if hasattr(r, 'payload'):
                    p = r.payload
                    score = getattr(r, 'score', 0.0)
                else:
                    p = getattr(r, 'payload', {})
                    score = getattr(r, 'score', 0.0)

                if p:
                    print(f"\nResult {i+1} (Score: {score:.3f}):")
                    print(f"  Source: {p.get('source_file', 'Unknown')}")
                    print(f"  Chunk: {p.get('chunk_index', 'Unknown')}")
                    print(f"  Content preview: {p.get('text', '')[:150]}...")
        else:
            print("❌ No results returned from Qdrant")

    except Exception as e:
        print(f"❌ Error during query: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_query_functionality()