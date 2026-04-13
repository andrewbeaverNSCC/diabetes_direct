import { useState, useRef, useEffect } from "react";
// this code assumes you have installed Bootstrap.

const API_BASE = "http://localhost:8080/chat";

interface Message {
    role: "user" | "assistant";
    text: string;
}

function generateId(): string {
    return crypto.randomUUID();
}

export default function ChatWidget() {
    const [open, setOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", text: "Hi there! How can I help you today?" }
    ]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const conversationId = useRef<string>(generateId());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (): Promise<void> => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;
        setMessages(prev => [...prev, { role: "user", text: trimmed }]);
        setInput("");
        setLoading(true);
        try {
            const params = new URLSearchParams({
                message: trimmed,
                conversationId: conversationId.current,
            });
            const res = await fetch(`${API_BASE}?${params}`, { method: "GET" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const reply = await res.text();
            setMessages(prev => [...prev, { role: "assistant", text: reply }]);
        } catch (err) {
            console.error("Fetch error:", err);
            setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 9999 }}>

            {/* Chat card */}
            {open && (
                <div
                    className="card shadow mb-3"
                    style={{ width: 300, height: 380 }}
                >
                    {/* Header */}
                    <div className="card-header d-flex align-items-center gap-2 py-2">
            <span
                className="rounded-circle bg-success"
                style={{ width: 8, height: 8, display: "inline-block" }}
            />
                        <div className="flex-grow-1">
                            <div className="fw-medium" style={{ fontSize: 18 }}>Frederick Banting</div>
                            <div className="text-muted" style={{ fontSize: 16 }}>Online</div>
                        </div>
                        <button
                            className="btn-close"
                            style={{ fontSize: 14 }}
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                        />
                    </div>

                    {/* Messages */}
                    <div
                        className="card-body overflow-auto d-flex flex-column gap-2 p-2"
                        style={{ flex: 1 }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                            >
                                <div
                                    className={`px-2 py-2 rounded ${msg.role === "user" ? "text-white" : "bg-light border text-dark"}`}
                                    style={{
                                        maxWidth: "82%",
                                        fontSize: 15,
                                        lineHeight: 1.5,
                                        backgroundColor: msg.role === "user" ? "#185FA5" : undefined,
                                        borderRadius: msg.role === "user" ? "10px 4px 10px 10px" : "4px 10px 10px 10px",
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="d-flex justify-content-start">
                                <div className="bg-light border px-3 py-2 rounded d-flex gap-1 align-items-center">
                                    {([0, 0.2, 0.4] as number[]).map((d, i) => (
                                        <span
                                            key={i}
                                            className="rounded-circle bg-secondary"
                                            style={{ width: 6, height: 6, display: "inline-block", animation: `pulse 1.2s infinite ${d}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="card-footer d-flex gap-2 p-2">
                        <input
                            autoFocus
                            type="text"
                            className="form-control form-control-sm"
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={loading}
                        />
                        <button
                            className="btn btn-primary btn-sm d-flex align-items-center justify-content-center flex-shrink-0"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{ width: 32, height: 32, padding: 0 }}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* FAB */}
            <div className="d-flex justify-content-end">
                <button
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow"
                    onClick={() => setOpen(o => !o)}
                    style={{ width: 48, height: 48, padding: 0 }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            <style>{`@keyframes pulse { 0%,60%,100%{opacity:.3} 30%{opacity:1} }`}</style>
        </div>
    );
}