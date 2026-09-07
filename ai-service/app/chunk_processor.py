def create_chunks(text, chunk_size=1000, overlap=200):
    if not text:
        return []

    chunks = []

    start = 0
    text_length = len(text)
    chunk_index = 0

    while start < text_length:
        end = start + chunk_size

        content = text[start:end].strip()

        if content:
            chunks.append({
                "chunk_index": chunk_index,
                "content": content,
                "character_count": len(content)
            })

            chunk_index += 1

        start += chunk_size - overlap

    return chunks