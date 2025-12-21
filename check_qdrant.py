import os
from qdrant_client import QdrantClient
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv("/mnt/d/desktop/final-code/hackhthon-robotic-book/backend/.env")

# Connect to Qdrant
qdrant_url = os.getenv("QDRANT_URL")
qdrant_key = os.getenv("QDRANT_API_KEY")

if not qdrant_url or not qdrant_key:
    print("❌ QDRANT_URL or QDRANT_API_KEY not set in environment variables")
    print("Please check your .env file")
    exit(1)

try:
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key)
    collection_name = "physical_ai_book"

    # Check if collection exists
    try:
        collection_info = qdrant.get_collection(collection_name)
        print(f"✅ Collection '{collection_name}' exists")
        print(f"📊 Points count: {collection_info.points_count}")

        if collection_info.points_count > 0:
            # Sample some points to verify content
            try:
                records = qdrant.scroll(
                    collection_name=collection_name,
                    limit=2,
                    with_payload=True
                )

                print(f"\n📚 Sample records from collection:")
                for i, record in enumerate(records[0]):
                    payload = record.payload
                    print(f"\nRecord {i+1}:")
                    print(f"  Source file: {payload.get('source_file', 'Unknown')}")
                    print(f"  Chunk index: {payload.get('chunk_index', 'Unknown')}")
                    print(f"  Text preview: {payload.get('text', '')[:100]}...")
            except Exception as e:
                print(f"❌ Error retrieving records: {e}")
                print("ℹ️  Data exists but couldn't retrieve sample records")
        else:
            print("❌ Collection is empty - no data ingested")

    except Exception as e:
        print(f"❌ Collection '{collection_name}' does not exist or error occurred: {e}")

except Exception as e:
    print(f"❌ Error connecting to Qdrant: {e}")