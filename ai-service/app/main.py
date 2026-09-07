from fastapi import FastAPI, UploadFile, File
from app.pdf_processor import extract_text_from_pdf
import os
import tempfile
from app.text_processor import clean_text
from app.chunk_processor import create_chunks
from app.embedding_processor import prepare_chunks_for_embedding
from app.embedding_model import (
    generate_embedding,
    generate_embeddings
)
from app.llm_service import generate_answer, generate_questions, rewrite_question_with_llm,generate_answer_stream
app = FastAPI()
from fastapi.responses import StreamingResponse
import json



@app.get("/health")
def health():
    return {
        "message": "LearnAI AI service is running"
    }


@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    file_content = await file.read()

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(file_content)
        temp_path = temp_file.name

    try:
        extracted_text = extract_text_from_pdf(temp_path)
        cleaned_text = clean_text(extracted_text)
        chunks = create_chunks(cleaned_text)
        prepared_chunks = prepare_chunks_for_embedding(chunks)

        return {
            "filename": file.filename,
            "original_characters": len(extracted_text),
            "cleaned_characters": len(cleaned_text),
            "chunk_count": len(chunks),
            "chunks": chunks,
            "text": cleaned_text
        }

    finally:
        os.remove(temp_path)
@app.post("/create-embeddings")
async def create_embeddings(data: dict):
    texts = data.get("texts")

    if not texts:
        return {
            "message": "Texts are required"
        }

    embeddings = generate_embeddings(texts)

    return {
        "count": len(embeddings),
        "dimensions": len(embeddings[0]),
        "embeddings": embeddings
    }
@app.post("/create-query-embedding")
async def create_query_embedding(data: dict):
    text = data.get("text")

    if not text:
        return {
            "message": "Text is required"
        }

    embedding = generate_embedding(text)

    return {
        "dimensions": len(embedding),
        "embedding": embedding
    }
@app.post("/generate-answer")
async def generate_answer_endpoint(data: dict):
    question = data.get("question")
    context = data.get("context")

    if not question:
        return {
            "message": "Question is required"
        }

    if not context:
        return {
            "message": "Context is required"
        }

    answer = generate_answer(
        question,
        context
    )

    return {
        "question": question,
        "answer": answer
    }
@app.post("/generate-rag-answer")
async def generate_rag_answer(data: dict):
    question = data.get("question")
    context = data.get("context")
    conversation_history = data.get(
        "conversationHistory",
        ""
    )

    if not question:
        return {
            "message": "Question is required"
        }

    if not context:
        return {
            "message": "Context is required"
        }

    answer = generate_answer(
        question,
        context,
        conversation_history
    )

    return {
        "question": question,
        "answer": answer
    }
@app.post("/generate-questions")
async def generate_questions_endpoint(data: dict):
    context = data.get("context")
    count = data.get("count", 5)

    if not context:
        return {
            "message": "Context is required"
        }

    result = generate_questions(
        context,
        count
    )

    return {
        "questions": result
    }
@app.post("/rewrite-question")
async def rewrite_question(data: dict):
    question = data.get("question")
    conversation_history = data.get(
        "conversationHistory",
        ""
    )

    if not question:
        return {
            "message": "Question is required"
        }

    rewritten_question = rewrite_question_with_llm(
        question,
        conversation_history
    )

    cleaned_question = rewritten_question.strip().strip('"').strip("'")

    return {
        "question": cleaned_question
    }
@app.post("/generate-rag-answer-stream")
async def generate_rag_answer_stream(data: dict):
    question = data.get("question")
    context = data.get("context")
    conversation_history = data.get(
        "conversationHistory",
        ""
    )

    if not question:
        return {
            "message": "Question is required"
        }

    if not context:
        return {
            "message": "Context is required"
        }

    stream = generate_answer_stream(
        question,
        context,
        conversation_history
    )

    def event_generator():
        for token in stream:
            yield f"data: {json.dumps({'token': token})}\n\n"

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )