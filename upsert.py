import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import json
import uuid
from data.ollama_helpers import batch_generate_embeddings

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

# Qdrant Cloud Configuration
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

if not QDRANT_URL or not QDRANT_API_KEY:
    raise ValueError("Please set QDRANT_URL and QDRANT_API_KEY environment variables")

# Connect to Qdrant Cloud
client = QdrantClient(url=QDRANT_URL)

# Create collections for both contracts and tickets
collections = ["contracts", "tickets"]
for collection_name in collections:
    try:
        client.delete_collection(collection_name)
    except:
        pass
        
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=4096, distance=Distance.COSINE)
    )
    print(f"✅ Created collection {collection_name}")

# Load and process contracts
with open('data/contracts.txt', 'r') as f:
    contracts_data = json.load(f)

# Prepare contract texts for batch processing
contract_texts = [
    f"{contract['summary']} {contract['terms']}"
    for contract in contracts_data
]

# Generate embeddings in batches
contract_vectors = batch_generate_embeddings(contract_texts)

contract_points = [
    PointStruct(
        id=str(uuid.uuid4()),
        vector=vector,
        payload=contract
    )
    for vector, contract in zip(contract_vectors, contracts_data)
]

# Upload contracts
client.upsert(collection_name="contracts", points=contract_points)
print(f"✅ Uploaded {len(contract_points)} contracts")

# Load and process tickets
with open('data/tickets.txt', 'r') as f:
    tickets_data = json.load(f)

# Prepare ticket texts for batch processing
ticket_texts = [
    f"{ticket['subject']} {ticket['description']}"
    for ticket in tickets_data
]

# Generate embeddings in batches
ticket_vectors = batch_generate_embeddings(ticket_texts)

ticket_points = [
    PointStruct(
        id=str(uuid.uuid4()),
        vector=vector,
        payload=ticket
    )
    for vector, ticket in zip(ticket_vectors, tickets_data)
]

# Upload tickets
client.upsert(collection_name="tickets", points=ticket_points)
print(f"✅ Uploaded {len(ticket_points)} tickets")

print("🎉 All data uploaded successfully!")