import ollama


MODEL_NAME = "llama3.2:3b"
import time

def generate_answer_stream(
    question,
    context,
    conversation_history=""
):
    prompt = f"""
You are a document question-answering assistant.

Answer the user's question using ONLY the provided
document sources.

Rules:
1. Use only the document sources.
2. Do not use outside knowledge.
3. Do not invent information.
4. Use conversation history only to understand references.
5. Every important factual statement should include
   the source that supports it.
6. Use citations exactly like:
   [Source 1]
   [Source 2]
   [Source 3]
7. Only cite sources that actually support the statement.
8. Do not create source numbers that do not exist.
9. If the answer is not supported by the sources, say:
"I couldn't find the answer in the document."
10. Keep the answer clear and concise.

Conversation history:
{conversation_history}

Document sources:
{context}

Question:
{question}

Answer:
"""

    start_time = time.time()

    print("OLLAMA REQUEST STARTED")

    stream = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=True
    )

    print(
        "OLLAMA STREAM CREATED:",
        round(time.time() - start_time, 2),
        "seconds"
    )

    first_token_time = None

    for chunk in stream:
        if first_token_time is None:
            first_token_time = time.time()

            print(
                "OLLAMA FIRST TOKEN:",
                round(
                    first_token_time - start_time,
                    2
                ),
                "seconds"
            )

        content = chunk["message"]["content"]

        if content:
            yield content

    print(
        "OLLAMA TOTAL GENERATION:",
        round(time.time() - start_time, 2),
        "seconds"
    )

def generate_answer(
    question,
    context,
    conversation_history=""
):
    prompt = f"""
You are a document question-answering assistant.

Your job is to answer the user's question using ONLY
information contained in the provided document sources.

Rules:
1. Use only the document sources.
2. Do not use outside knowledge.
3. Do not invent information.
4. Conversation history may be used to understand references
   such as "it", "he", "they", "that", or "which one".
5. The actual answer must come from the document sources.
6. Cite the source that supports each important statement.
7. Use citations exactly in this format:
   [Source 1]
   [Source 2]
   [Source 3]
8. Only cite a source when it actually supports the statement.
9. Do not create source numbers that do not exist.
10. If the document sources do not contain enough information,
    respond exactly:
"I couldn't find the answer in the document."
11. Keep the answer clear and concise.

Conversation history:
{conversation_history}

Document sources:
{context}

Question:
{question}

Answer:
"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=False
    )

    return response["message"]["content"].strip()
def generate_questions(
    context,
    count=5
):
    prompt = f"""
You are a multiple-choice quiz generator.

Generate EXACTLY {count} multiple-choice questions using ONLY
the information in the document context below.

STRICT RULES:
1. Generate exactly {count} questions.
2. Every question must be different.
3. Each question must have exactly 4 options.
4. Each question must have exactly one correct answer.
5. The correct answer MUST exactly match one option.
6. Use ONLY information from the document.
7. Do NOT use outside knowledge.
8. Do NOT invent facts.
9. Questions should test important concepts and understanding.
10. Return ONLY valid JSON.
11. Do NOT write explanations.
12. Do NOT write introductory or concluding text.
13. Do NOT use markdown or code fences.

Return exactly this JSON structure:

[
  {{
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "Option A"
  }}
]

Document context:
{context}
"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=False
    )

    return response["message"]["content"].strip()

def rewrite_question_with_llm(
    question,
    conversation_history=""
):
    prompt = f"""
You are a question understanding and rewriting assistant for a document question-answering system.

Your job is to convert the user's question into one clear, standalone,
retrieval-friendly question that best represents what the user wants to know.

IMPORTANT:
The rewritten question will be used to search a document.
Therefore, preserve the user's meaning while making the question clear
and specific for document retrieval.

Rules:
1. Understand the user's intent, not just the exact wording.
2. Correct obvious grammar mistakes and awkward phrasing.
3. Resolve references such as:
   "it", "they", "he", "she", "his", "her", "this", "that",
   "which one", "there", etc. using the conversation history.
4. If the user asks about a person, organization, degree, job, project,
   education, date, location, skill, or other entity mentioned in the
   conversation, make that entity explicit when possible.
5. Preserve the exact meaning of the user's question.
6. Do NOT answer the question.
7. Do NOT add facts that are not present in the user's question or
   conversation history.
8. Do NOT assume information that is not supported by the conversation.
9. Make the result suitable for semantic and keyword document search.
10. Keep the rewritten question concise.
11. Return ONLY the rewritten question.
12. Do not use quotation marks.
13. Do not include explanations, labels, bullet points, or extra text.

Examples:

User question:
"In which university Eyasu Graduated?"

Rewrite:
"What university did Eyasu graduate from?"

User question:
"where did Eyasu study?"

Rewrite:
"Where did Eyasu study?"

User question:
"What degree he got?"

Conversation:
"Where did Eyasu study?"

Rewrite:
"What degree did Eyasu obtain?"

User question:
"what about his education?"

Conversation:
"Tell me about Eyasu's work experience."

Rewrite:
"What is Eyasu's educational background?"

Conversation history:
{conversation_history}

Current question:
{question}

Rewritten question:
"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=False
    )

    rewritten_question = (
        response.get("message", {})
        .get("content", "")
        .strip()
    )

    if not rewritten_question:
        return question.strip()

    return rewritten_question