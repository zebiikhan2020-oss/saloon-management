
"use client";

import { useEffect, useRef, useState } from "react";

const suggestions = [
  "How many appointments do we have today?",
  "Show me revenue for the last 30 days.",
  "Which services are most popular?",
  "Show staff performance for the last 7 days.",
  "What is our average customer rating?",
  "Show staff attendance and leave statistics.",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const requestRef = useRef(false);

  // ========================================
  // SCROLL TO LATEST MESSAGE
  // ========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ========================================
  // LOAD CONVERSATIONS ON PAGE LOAD
  // ========================================

  useEffect(() => {
    loadConversations();
  }, []);

  async function readResponse(response) {
    return response.json().catch(() => ({}));
  }

  async function loadConversations() {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        "/api/admin/ai/conversations",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load chat history."
        );
      }

      const list = data.conversations || [];

      setConversations(list);

      if (list.length > 0) {
        await loadConversation(list[0].id);
      } else {
        await createConversation();
      }
    } catch (error) {
      console.error("LOAD CONVERSATIONS ERROR:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  // ========================================
  // CREATE NEW CONVERSATION
  // ========================================

  async function createConversation() {
    if (creatingChat || loading) return null;

    try {
      setCreatingChat(true);

      const response = await fetch(
        "/api/admin/ai/conversations",
        {
          method: "POST",
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create new chat."
        );
      }

      const conversation = data.conversation;

      setConversations((previous) => [
        conversation,
        ...previous.filter(
          (item) => item.id !== conversation.id
        ),
      ]);

      setActiveConversationId(conversation.id);
      setMessages([]);
      setQuestion("");
      setEditingMessageId(null);
      setEditingContent("");
      setSidebarOpen(false);

      return conversation.id;
    } catch (error) {
      console.error("CREATE CONVERSATION ERROR:", error);
      alert(error.message || "Unable to create new chat.");
      return null;
    } finally {
      setCreatingChat(false);
    }
  }

  // ========================================
  // LOAD SELECTED CONVERSATION
  // ========================================

  async function loadConversation(id) {
    try {
      const response = await fetch(
        `/api/admin/ai/conversations/${id}/messages`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load conversation."
        );
      }

      setActiveConversationId(id);
      setMessages(data.messages || []);
      setQuestion("");
      setEditingMessageId(null);
      setEditingContent("");
      setSidebarOpen(false);
    } catch (error) {
      console.error("LOAD CHAT ERROR:", error);
      alert(error.message || "Unable to load conversation.");
    }
  }

  // ========================================
  // REFRESH ACTIVE CONVERSATION MESSAGES
  // ========================================

  async function refreshActiveMessages(id) {
    const response = await fetch(
      `/api/admin/ai/conversations/${id}/messages`,
      {
        cache: "no-store",
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to refresh messages."
      );
    }

    setMessages(data.messages || []);
  }

  // ========================================
  // DELETE CONVERSATION
  // ========================================

  async function deleteConversation(id) {
    if (
      loading ||
      deletingConversationId ||
      creatingChat
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingConversationId(id);

      const response = await fetch(
        `/api/admin/ai/conversations/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete conversation."
        );
      }

      const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== id
      );

      setConversations(remainingConversations);

      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
        setQuestion("");
        setEditingMessageId(null);
        setEditingContent("");

        if (remainingConversations.length > 0) {
          await loadConversation(remainingConversations[0].id);
        } else {
          await createConversation();
        }
      }
    } catch (error) {
      console.error("DELETE CONVERSATION ERROR:", error);

      alert(
        error.message || "Unable to delete conversation."
      );
    } finally {
      setDeletingConversationId(null);
    }
  }

  // ========================================
  // COPY MESSAGE
  // ========================================

  async function copyMessage(message) {
    try {
      await navigator.clipboard.writeText(message.content);

      setCopiedMessageId(message.id);

      setTimeout(() => {
        setCopiedMessageId(null);
      }, 1800);
    } catch (error) {
      console.error("COPY MESSAGE ERROR:", error);
      alert("Unable to copy message.");
    }
  }

  // ========================================
  // START EDITING USER MESSAGE
  // ========================================

  function startEditing(message) {
    if (loading || !message.id) return;

    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }

  function cancelEditing() {
    setEditingMessageId(null);
    setEditingContent("");
  }

  // ========================================
  // SEND / EDIT / REGENERATE MESSAGE
  // ========================================

  async function sendMessage(
    value = question,
    editMessageId = null
  ) {
    const text = value.trim();

    if (
      !text ||
      requestRef.current ||
      loading ||
      historyLoading ||
      creatingChat ||
      deletingConversationId
    ) {
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await createConversation();

      if (!conversationId) return;
    }

    requestRef.current = true;
    setQuestion("");
    setLoading(true);

    if (editMessageId) {
      const targetIndex = messages.findIndex(
        (message) => message.id === editMessageId
      );

      if (targetIndex !== -1) {
        setMessages((previous) =>
          previous
            .slice(0, targetIndex + 1)
            .map((message, index) =>
              index === targetIndex
                ? { ...message, content: text }
                : message
            )
        );
      }

      setEditingMessageId(null);
      setEditingContent("");
    } else {
      setMessages((previous) => [
        ...previous,
        {
          role: "user",
          content: text,
          temporary: true,
        },
      ]);
    }

    try {
      const response = await fetch("/api/admin/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: text,
          conversationId,
          ...(editMessageId ? { editMessageId } : {}),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "AI Assistant is temporarily unavailable."
        );
      }

      await refreshActiveMessages(conversationId);

      // Refresh sidebar history
      const historyResponse = await fetch(
        "/api/admin/ai/conversations",
        {
          cache: "no-store",
        }
      );

      const historyData = await readResponse(historyResponse);

      if (historyResponse.ok) {
        setConversations(
          historyData.conversations || []
        );
      }
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);

      try {
        await refreshActiveMessages(conversationId);
      } catch (refreshError) {
        console.error("REFRESH MESSAGES ERROR:", refreshError);
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error.message ||
            "Something went wrong. Please try again.",
          error: true,
          temporary: true,
        },
      ]);
    } finally {
      setLoading(false);
      requestRef.current = false;
    }
  }

  // ========================================
  // SAVE EDIT
  // ========================================

  function saveEdit(messageId) {
    if (!editingContent.trim() || loading) return;

    sendMessage(editingContent, messageId);
  }

  // ========================================
  // REGENERATE AI RESPONSE
  // ========================================

  function regenerateResponse(assistantIndex) {
    if (loading) return;

    for (let i = assistantIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user" && messages[i].id) {
        sendMessage(messages[i].content, messages[i].id);
        return;
      }
    }

    alert("Original question could not be found.");
  }

  // ========================================
  // FORM SUBMIT
  // ========================================

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  // ========================================
  // FORMAT CHAT DATE
  // ========================================

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    });
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="relative flex min-h-[calc(100vh-70px)] bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">

      {/* MOBILE SIDEBAR OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-[calc(100vh-70px)] lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>

            <div>
              <h2 className="font-bold">AI Assistant</h2>
              <p className="text-xs text-slate-400">
                Chat History
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* NEW CHAT */}

        <div className="p-3">
          <button
            type="button"
            onClick={createConversation}
            disabled={
              creatingChat ||
              loading ||
              !!deletingConversationId
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <span className="text-lg">+</span>
            New Chat
          </button>
        </div>

        {/* CONVERSATION LIST */}

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Previous Conversations
          </p>

          {historyLoading ? (
            <div className="py-6 text-center text-sm text-slate-400">
              Loading history...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-slate-400">
              No conversations yet.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-1 rounded-xl border transition ${
                    activeConversationId === conversation.id
                      ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !loading &&
                        !deletingConversationId &&
                        conversation.id !== activeConversationId
                      ) {
                        loadConversation(conversation.id);
                      } else if (
                        conversation.id === activeConversationId
                      ) {
                        setSidebarOpen(false);
                      }
                    }}
                    disabled={loading || !!deletingConversationId}
                    className="min-w-0 flex-1 p-3 text-left disabled:opacity-70"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-sm">💬</span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {conversation.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(conversation.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    title="Delete conversation"
                    aria-label={`Delete ${conversation.title}`}
                    onClick={() =>
                      deleteConversation(conversation.id)
                    }
                    disabled={
                      loading ||
                      !!deletingConversationId
                    }
                    className="mr-2 rounded-lg p-2 text-slate-400 opacity-100 transition hover:bg-rose-100 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-rose-950"
                  >
                    {deletingConversationId === conversation.id
                      ? "..."
                      : "🗑️"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Read-only database access
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}

      <main className="flex min-w-0 flex-1 flex-col p-3 sm:p-5 lg:p-6">

        {/* HEADER */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            >
              ☰
            </button>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                AI Admin Assistant
              </h1>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Ask questions about your salon business.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Read-only access
          </div>
        </div>

        {/* CHAT CONTAINER */}

        <div className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* MESSAGES */}

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

            {historyLoading ? (
              <div className="flex min-h-[350px] items-center justify-center text-sm text-slate-400">
                Loading your conversations...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl dark:bg-indigo-950">
                  🤖
                </div>

                <h2 className="text-xl font-bold">
                  How can I help you?
                </h2>

                <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  I can analyze appointments, revenue, services,
                  staff performance, reviews and attendance using
                  your salon database.
                </p>

                <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => sendMessage(item)}
                      disabled={
                        loading ||
                        creatingChat ||
                        !!deletingConversationId
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isEditing =
                  editingMessageId === message.id;

                return (
                  <div
                    key={message.id || `temporary-${index}`}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="w-fit max-w-[95%] sm:max-w-[85%]">

                      {/* MESSAGE BUBBLE */}

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isEditing
                            ? "border-2 border-indigo-400 bg-white text-slate-900 shadow-md dark:border-indigo-500 dark:bg-slate-100 dark:text-slate-900"
                            : message.role === "user"
                            ? "rounded-br-sm bg-indigo-600 text-white"
                            : message.error
                            ? "rounded-bl-sm border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                            : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        }`}
                      >
                        <p className="mb-1 text-xs font-semibold opacity-70">
                          {message.role === "user"
                            ? "You"
                            : "AI Assistant"}
                        </p>

                        {isEditing ? (
                          <div className="min-w-0 w-full space-y-3">

                            <textarea
                              autoFocus
                              value={editingContent}
                              onChange={(event) =>
                                setEditingContent(event.target.value)
                              }
                              maxLength={1000}
                              rows={4}
                              className="block min-h-28 w-full min-w-0 resize-y rounded-xl border-2 border-indigo-400 bg-white p-4 text-sm font-medium !text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                            />

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs text-slate-500">
                                {editingContent.length}/1000
                              </span>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => saveEdit(message.id)}
                                  disabled={
                                    !editingContent.trim() ||
                                    loading
                                  }
                                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                  Save & Regenerate
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-sm leading-7">
                            {message.content}
                          </p>
                        )}
                      </div>

                      {/* MESSAGE ACTIONS */}

                      {!message.error &&
                        !message.temporary &&
                        !isEditing && (
                          <div
                            className={`mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => copyMessage(message)}
                              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {copiedMessageId === message.id
                                ? "✓ Copied"
                                : "📋 Copy"}
                            </button>

                            {message.role === "user" && (
                              <button
                                type="button"
                                onClick={() => startEditing(message)}
                                disabled={loading}
                                className="transition hover:text-indigo-600 disabled:opacity-40 dark:hover:text-indigo-400"
                              >
                                ✏️ Edit
                              </button>
                            )}

                            {message.role === "assistant" && (
                              <button
                                type="button"
                                onClick={() =>
                                  regenerateResponse(index)
                                }
                                disabled={loading}
                                className="transition hover:text-indigo-600 disabled:opacity-40 dark:hover:text-indigo-400"
                              >
                                🔄 Regenerate
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })
            )}

            {/* LOADING INDICATOR */}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    AI Assistant
                  </p>

                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
                    Analyzing your data...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !loading
                  ) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                placeholder="Ask anything about your salon..."
                maxLength={1000}
                rows={2}
                disabled={
                  loading ||
                  historyLoading ||
                  !!deletingConversationId ||
                  !!editingMessageId
                }
                className="max-h-32 min-h-12 flex-1 resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-indigo-950"
              />

              <button
                type="submit"
                disabled={
                  !question.trim() ||
                  loading ||
                  historyLoading ||
                  creatingChat ||
                  !!deletingConversationId ||
                  !!editingMessageId
                }
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">Send</span>
                <span>➤</span>
              </button>
            </div>

            <div className="mt-2 flex justify-between gap-2 text-xs text-slate-400">
              <span>
                Enter to send · Shift + Enter for new line
              </span>

              <span>{question.length}/1000</span>
            </div>
          </form>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          AI responses are based on available salon database
          information. This assistant has read-only access.
        </p>
      </main>
    </div>
  );
}
