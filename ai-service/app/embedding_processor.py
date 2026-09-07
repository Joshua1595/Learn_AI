def prepare_chunks_for_embedding(chunks):
    prepared = []

    for chunk in chunks:
        prepared.append({
            "chunk_index": chunk["chunk_index"],
            "content": chunk["content"],
            "character_count": chunk["character_count"]
        })

    return prepared