import { CHAT_BASE, getAccessToken } from "@/shared/api/axiosClient";
import type { StreamEvent, ChatMessage, ChatSession } from "@/shared/types";
import axiosClient from "@/shared/api/axiosClient";

/**
 * Stream a chat message via SSE.
 *
 * @param message - User's message text
 * @param sessionId - Existing session ID or null (auto-created)
 * @param onEvent - Callback fired on every event (text chunks, tool calls, product cards, final)
 * @returns The session ID for subsequent messages
 */
export async function streamChat(
  message: string,
  sessionId: string | null,
  onEvent: (msg: ChatMessage) => void,
): Promise<string> {
  const body: Record<string, unknown> = { message };
  if (sessionId) body.session_id = sessionId;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${CHAT_BASE}/v1/chat/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: "unknown error" }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const assistantMsg: ChatMessage = {
    role: "assistant",
    content: "",
    isStreaming: true,
  };
  onEvent(assistantMsg);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      try {
        const ev: StreamEvent = JSON.parse(line.slice(6));

        // 1. Append text chunks
        if (ev.chunk) {
          assistantMsg.content += ev.chunk;
          onEvent({ ...assistantMsg });
        }

        // 2. Show tool calls
        if (ev.tool_calls?.length) {
          assistantMsg.toolCalls = ev.tool_calls;
          onEvent({ ...assistantMsg });
        }

        // 3. Show product cards
        if (ev.product_cards?.length) {
          assistantMsg.productCards = ev.product_cards;
          onEvent({ ...assistantMsg });
        }

        // 4. Final event
        if (ev.done) {
          assistantMsg.isStreaming = false;
          assistantMsg.tokensUsed = ev.tokens_used;
          onEvent({ ...assistantMsg });
          return ev.session_id || sessionId!;
        }

        // 5. Error
        if (ev.error) {
          throw new Error(ev.error);
        }
      } catch {
        // skip malformed JSON
      }
    }
  }

  return sessionId!;
}

/** Create a new chat session */
export function createChatSession() {
  return axiosClient
    .post<{ session_id: string }>(`${CHAT_BASE}/v1/chat/sessions`, {})
    .then((r) => r.data);
}

/** Get chat session details */
export function getChatSession(id: string) {
  return axiosClient
    .get<ChatSession>(`${CHAT_BASE}/v1/chat/sessions/${id}`)
    .then((r) => r.data);
}

/** Fetch past messages for a session — restores chat history on page reload */
export function getChatMessages(id: string) {
  return axiosClient
    .get<{ role: string; content: string }[]>(`${CHAT_BASE}/v1/chat/sessions/${id}/messages`)
    .then((r) => r.data);
}
