from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


def generate_embedding(text):
    embedding = model.encode(text)

    return embedding.tolist()


def generate_embeddings(texts):
    embeddings = model.encode(texts)

    return embeddings.tolist()