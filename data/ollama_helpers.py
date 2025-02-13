import requests
import time
from typing import List, Dict, Any

def generate_embedding(text: str, model: str = "deepseek-coder:6.7b", base_url: str = "http://localhost:11434") -> List[float]:
    """Generate embeddings using Ollama."""
    url = f"{base_url}/api/embeddings"
    
    try:
        response = requests.post(
            url,
            json={
                "model": model,
                "prompt": text
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()["embedding"]
    except requests.exceptions.RequestException as e:
        print(f"Error generating embedding: {e}")
        raise

def batch_generate_embeddings(texts: List[str], batch_size: int = 5) -> List[List[float]]:
    """Generate embeddings for a list of texts in batches."""
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch_embeddings = [generate_embedding(text) for text in batch]
        embeddings.extend(batch_embeddings)
        # Add a small delay between batches to prevent overwhelming the server
        time.sleep(0.5)
    return embeddings 