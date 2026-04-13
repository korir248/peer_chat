import { useRef, useEffect, useState } from "react";
import { Send, QrCode, ArrowLeft, Smile } from "lucide-react";
import { Node as PNode, Identity, Message } from "../types";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

function truncate(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

interface Props {
  selectedNode: PNode;
  selectedNodeData: PNode | undefined;
  identity: Identity | null;
  nodeId: string;
  messages: Message[];
  messageInput: string;
  isMobile: boolean;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onBack: () => void;
  onShowQR: () => void;
}

export function ChatPane({
  selectedNode,
  selectedNodeData,
  nodeId,
  messages,
  messageInput,
  isMobile,
  onInputChange,
  onSend,
  onBack,
  onShowQR,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(new Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onInputChange(messageInput + emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <>
      {/* Header */}
      <div style={chatHeader}>
        <div style={chatLeft}>
          {isMobile && (
            <button style={menuBtn} onClick={onBack} title="Back">
              <ArrowLeft size={18} />
            </button>
          )}
          <div style={chatAv}>
            {(
              selectedNodeData?.alias?.[0] ??
              selectedNode.endpoint_id.slice(0, 2)
            ).toUpperCase()}
          </div>
          <div>
            <div style={chatName}>
              {selectedNodeData?.alias ?? truncate(selectedNode.endpoint_id)}
            </div>
            <div style={chatSub}>{truncate(selectedNode.endpoint_id)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {!isMobile && (
            <div style={connPill}>
              <span style={greenDot} />
              connected
            </div>
          )}
          {isMobile && (
            <button style={iconBtn} onClick={onShowQR} title="Show QR">
              <QrCode size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={messagesStyle}>
        {messages.length === 0 && (
          <p style={noMessages}>No messages yet. Say hello!</p>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.from === nodeId;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                marginBottom: 2,
                justifyContent: isOwn ? "flex-end" : "flex-start",
              }}
            >
              <div style={{ maxWidth: isMobile ? "85%" : "70%" }}>
                <div style={isOwn ? bubbleOwn : bubble}>{msg.content}</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                    fontSize: 10,
                    color: "#9ca3af",
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={inputArea}>
        {/* Emoji picker */}
        <div style={{ position: "relative" }} ref={pickerRef}>
          <button
            onClick={() => setShowPicker((v) => !v)}
            style={{
              ...iconBtn,
              color: showPicker ? "#111827" : "#9ca3af",
              background: showPicker ? "#f3f4f6" : "#ffffff",
            }}
            title="Emoji"
          >
            <Smile size={16} />
          </button>

          {showPicker && (
            <div style={pickerPopover}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.LIGHT}
                lazyLoadEmojis
                searchPlaceholder="Search emoji…"
                previewConfig={{ showPreview: false }}
                height={380}
                width={isMobile ? 300 : 340}
              />
            </div>
          )}
        </div>

        <input
          value={messageInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={`Message ${selectedNodeData?.alias ?? truncate(selectedNode.endpoint_id)}…`}
          style={msgInput}
        />
        <button onClick={onSend} style={sendBtn}>
          <Send size={14} />
        </button>
      </div>
    </>
  );
}

const chatHeader: React.CSSProperties = {
  padding: "0 16px",
  height: 60,
  borderBottom: "0.5px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
};

const chatLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const menuBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280",
  padding: 4,
  marginRight: 4,
};

const chatAv: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 600,
  flexShrink: 0,
  background: "#f3f4f6",
  color: "#111827",
};

const chatName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
};

const chatSub: React.CSSProperties = {
  fontSize: 11,
  color: "#9ca3af",
  fontFamily: "monospace",
};

const connPill: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  fontWeight: 500,
  color: "#059669",
  background: "#d1fae5",
  padding: "4px 10px",
  borderRadius: 20,
};

const greenDot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "currentColor",
  display: "inline-block",
  flexShrink: 0,
};

const iconBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "0.5px solid #e5e7eb",
  background: "#ffffff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280",
  flexShrink: 0,
};

const messagesStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const noMessages: React.CSSProperties = {
  textAlign: "center",
  fontSize: 12,
  color: "#9ca3af",
  marginTop: 32,
};

const bubble: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 14,
  fontSize: 13,
  lineHeight: 1.5,
  color: "#111827",
  background: "#f3f4f6",
  border: "0.5px solid #e5e7eb",
  display: "inline-block",
  width: "100%",
};

const bubbleOwn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 14,
  fontSize: 13,
  lineHeight: 1.5,
  color: "#ffffff",
  background: "#111827",
  display: "inline-block",
  width: "100%",
};

const inputArea: React.CSSProperties = {
  padding: "12px 16px",
  borderTop: "0.5px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
};

const pickerPopover: React.CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 8px)",
  left: 0,
  zIndex: 100,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  borderRadius: 12,
  overflow: "hidden",
};

const msgInput: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  fontSize: 13,
  background: "#f9fafb",
  border: "0.5px solid #e5e7eb",
  borderRadius: 10,
  color: "#111827",
  outline: "none",
};

const sendBtn: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
