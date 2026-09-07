import api from "./api";

export const askDocument = async (
  documentId,
  question,
  sessionId
) => {
  const response = await api.post(
    `/documents/${documentId}/ask`,
    {
      question,
      sessionId,
    }
  );

  return response.data;
};
export const getChatHistory = async (
  documentId,
  sessionId
) => {
  const response = await api.get(
    `/documents/${documentId}/chat`,
    {
      params: {
        sessionId,
      },
    }
  );

  return response.data;
};

export const askDocumentStream = async (
  documentId,
  question,
  sessionId,
  onEvent
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/documents/${documentId}/ask-stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        sessionId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("STREAM API ERROR:", errorText);

    throw new Error("Failed to get AI response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events = buffer.split(/\r?\n\r?\n/);

    buffer = events.pop() || "";

    for (const event of events) {
      const dataLine = event
        .split(/\r?\n/)
        .find((line) => line.startsWith("data:"));

      if (!dataLine) {
        continue;
      }

      const jsonText = dataLine
        .replace(/^data:\s*/, "")
        .trim();

      if (!jsonText) {
        continue;
      }

      try {
        const data = JSON.parse(jsonText);

        console.log("SSE DATA:", data);

        // -------------------------
        // STREAM START
        // -------------------------
        if (data.type === "start") {
          console.log("STREAM START:", data);

          onEvent({
            type: "start",
            sessionId: data.sessionId,
            sources: data.sources || [],
          });

          continue;
        }

        // -------------------------
        // AI TOKEN
        // -------------------------
        if (data.type === "chunk") {
          const content = data.content;

          if (!content) {
            continue;
          }

          // content is:
          // data: {"token": "According"}

          const tokenText = content
            .replace(/^data:\s*/, "")
            .trim();

          try {
            const tokenData = JSON.parse(tokenText);

            if (tokenData.token !== undefined) {
              console.log(
                "CHUNK RECEIVED:",
                tokenData.token
              );

              onEvent({
                type: "chunk",
                content: tokenData.token,
              });
            }

            if (tokenData.done === true) {
              console.log("TOKEN STREAM DONE");

              onEvent({
                type: "done",
              });
            }
          } catch (error) {
            console.error(
              "TOKEN JSON ERROR:",
              tokenText,
              error
            );
          }

          continue;
        }

        // -------------------------
        // STREAM DONE
        // -------------------------
        if (data.type === "done") {
          console.log("STREAM DONE");

          onEvent({
            type: "done",
          });

          continue;
        }

        // -------------------------
        // ERROR
        // -------------------------
        if (data.type === "error") {
          console.error(
            "STREAM ERROR:",
            data
          );

          onEvent({
            type: "error",
            message:
              data.message ||
              "AI streaming failed",
          });
        }
      } catch (error) {
        console.error(
          "SSE PARSE ERROR:",
          jsonText,
          error
        );
      }
    }
  }
};
export const getChatSessions = async (
  documentId
) => {
  const response = await api.get(
    `/documents/${documentId}/chat/sessions`
  );

  return response.data;
};
export const deleteChatSession = async (
  documentId,
  sessionId
) => {
  const response = await api.delete(
    `/documents/${documentId}/chat/sessions/${sessionId}`
  );

  return response.data;
};
export const updateChatSession = async (
  documentId,
  sessionId,
  title
) => {
  const response = await api.put(
    `/documents/${documentId}/chat/sessions/${sessionId}`,
    {
      title,
    }
  );

  return response.data;
};