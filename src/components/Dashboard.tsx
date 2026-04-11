import { useState, useRef, useEffect } from "react";
import {
  Send,
  QrCode,
  Check,
  CheckCheck,
  Menu,
  ArrowLeft,
  X,
} from "lucide-react";
import { useP2P } from "../hooks/useP2P";
import { QRModal } from "./QRModal";

type ColorKey = "warning" | "success" | "danger" | "info";

const NODE_COLORS: Record<ColorKey, { bg: string; text: string }> = {
  warning: { bg: "#fef3c7", text: "#92400e" },
  success: { bg: "#d1fae5", text: "#065f46" },
  danger: { bg: "#fee2e2", text: "#991b1b" },
  info: { bg: "#dbeafe", text: "#1e40af" },
};

function getNodeColor(index: number): ColorKey {
  const keys = Object.keys(NODE_COLORS) as ColorKey[];
  return keys[index % keys.length];
}

function formatSeen(seconds: number): {
  label: string;
  fresh: boolean;
  stale: boolean;
} {
  if (seconds < 5) return { label: "just now", fresh: true, stale: false };
  if (seconds < 15)
    return { label: `${seconds}s ago`, fresh: true, stale: false };
  if (seconds < 60)
    return { label: `${seconds}s ago`, fresh: false, stale: false };
  if (seconds < 120)
    return {
      label: `${Math.floor(seconds / 60)}m ago`,
      fresh: false,
      stale: false,
    };
  return {
    label: `${Math.floor(seconds / 60)}m ago · leaving`,
    fresh: false,
    stale: true,
  };
}

function truncate(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function Dashboard() {
  const {
    identity,
    nodes,
    messages,
    //connectToNode,
    sendMessage,
    getNodeId,
  } = useP2P();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [
    searchTerm,
    // setSearchTerm
  ] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [seenSeconds, setSeenSeconds] = useState<Record<string, number>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeId = getNodeId();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedNode]);

  // Tick "last seen" counters
  useEffect(() => {
    const interval = setInterval(() => {
      setSeenSeconds((prev) => {
        const next = { ...prev };
        nodes.forEach((n) => {
          next[n.endpoint_id] = (next[n.endpoint_id] ?? 0) + 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nodes]);

  // Reset counter when a node is (re)discovered
  useEffect(() => {
    setSeenSeconds((prev) => {
      const next = { ...prev };
      nodes.forEach((n) => {
        if (!(n.endpoint_id in next)) next[n.endpoint_id] = 0;
      });
      return next;
    });
  }, [nodes]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedNode) return;
    await sendMessage(messageInput.trim(), selectedNode, nodeId);
    setMessageInput("");
  };

  const handleBackToNodes = () => {
    setSelectedNode(null);
    if (isMobile) setSidebarOpen(true);
  };

  const filteredNodes = nodes.filter(
    (n) =>
      n.endpoint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.alias?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const chatMessages = messages.filter(
    (m) =>
      (m.from === selectedNode && m.to === nodeId) ||
      (m.to === selectedNode && m.from === nodeId),
  );

  const unreadCount = (nid: string) =>
    messages.filter((m) => m.from === nid && !m.read).length;

  const selectedNodeData = nodes.find((n) => n.endpoint_id === selectedNode);
  const selectedNodeIndex = nodes.findIndex(
    (n) => n.endpoint_id === selectedNode,
  );
  const selectedColor =
    selectedNodeIndex >= 0
      ? NODE_COLORS[getNodeColor(selectedNodeIndex)]
      : NODE_COLORS.info;

  // Mobile: Show overlay sidebar when open
  if (isMobile && sidebarOpen) {
    return (
      <>
        <div style={s.mobileOverlay} onClick={() => setSidebarOpen(false)} />
        <div style={s.mobileSidebar}>
          <div style={s.sidebarTop}>
            <div style={s.meRow}>
              <div style={{ ...s.avatar, ...NODE_COLORS.info }}>
                {identity?.alias?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.meName}>{identity?.alias ?? "my node"}</div>
                <div style={s.meId}>{truncate(nodeId)}</div>
              </div>
              <button
                style={s.iconBtn}
                onClick={() => setShowQR(true)}
                title="Show QR"
              >
                <QrCode size={16} />
              </button>
              <button
                style={s.iconBtn}
                onClick={() => setSidebarOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
            {/* <div style={s.searchWrap}>
              <Search style={s.searchIcon} size={14} />
              <input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={s.searchInput}
              />
            </div> */}
          </div>

          <div style={s.sectionRow}>
            <span style={s.sectionLabel}>Nearby</span>
            <span style={s.networkPill}>
              <span style={s.greenDot} />
              {filteredNodes.length}
            </span>
          </div>

          <div style={s.nodeList}>
            {filteredNodes.map((node, i) => {
              const unread = unreadCount(node.endpoint_id);
              const secs = seenSeconds[node.endpoint_id] ?? 0;
              const seen = formatSeen(secs);
              const color = NODE_COLORS[getNodeColor(i)];

              return (
                <div
                  key={node.endpoint_id}
                  style={{
                    ...s.nodeItem,
                    opacity: seen.stale ? 0.35 : 1,
                  }}
                >
                  <div style={{ ...s.nodeAv, ...color }}>
                    {node.alias?.[0]?.toUpperCase() ??
                      node.endpoint_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={s.nodeInfo}>
                    <div style={s.nodeName}>
                      {node.alias ?? truncate(node.endpoint_id)}
                    </div>
                    <div
                      style={{
                        ...s.nodeSeen,
                        color: seen.fresh
                          ? "#059669"
                          : seen.stale
                            ? "#d1d5db"
                            : "#9ca3af",
                      }}
                    >
                      {seen.label}
                    </div>
                  </div>
                  {unread > 0 && <div style={s.badge}>{unread}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <QRModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          nodeId={nodeId}
          alias={identity?.alias}
        />
      </>
    );
  }

  // Main view (desktop or mobile with chat open)
  return (
    <div style={s.app}>
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        nodeId={nodeId}
        alias={identity?.alias}
      />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={s.sidebar}>
          <div style={s.sidebarTop}>
            <div style={s.meRow}>
              <div style={{ ...s.avatar, ...NODE_COLORS.info }}>
                {identity?.alias?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.meName}>{identity?.alias ?? "my node"}</div>
                <div style={s.meId}>{truncate(nodeId)}</div>
              </div>
              <button
                style={s.iconBtn}
                onClick={() => setShowQR(true)}
                title="Show QR"
              >
                <QrCode size={14} />
              </button>
            </div>
            {/* <div style={s.searchWrap}>
              <Search style={s.searchIcon} size={13} />
              <input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={s.searchInput}
              />
            </div> */}
          </div>

          <div style={s.sectionRow}>
            <span style={s.sectionLabel}>Nearby</span>
            <span style={s.networkPill}>
              <span style={s.greenDot} />
              {filteredNodes.length} node{filteredNodes.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={s.nodeList}>
            {filteredNodes.map((node, i) => {
              const unread = unreadCount(node.endpoint_id);
              const secs = seenSeconds[node.endpoint_id] ?? 0;
              const seen = formatSeen(secs);
              const color = NODE_COLORS[getNodeColor(i)];
              const isActive = selectedNode === node.endpoint_id;

              return (
                <div
                  key={node.endpoint_id}
                  onClick={() => {
                    setSelectedNode(node.endpoint_id);
                  }}
                  style={{
                    ...s.nodeItem,
                    opacity: seen.stale ? 0.35 : 1,
                    background: isActive ? "#ffffff" : "transparent",
                  }}
                >
                  <div style={{ ...s.nodeAv, ...color }}>
                    {node.alias?.[0]?.toUpperCase() ??
                      node.endpoint_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={s.nodeInfo}>
                    <div style={s.nodeName}>
                      {node.alias ?? truncate(node.endpoint_id)}
                    </div>
                    <div
                      style={{
                        ...s.nodeSeen,
                        color: seen.fresh
                          ? "#059669"
                          : seen.stale
                            ? "#d1d5db"
                            : "#9ca3af",
                      }}
                    >
                      {seen.label}
                    </div>
                  </div>
                  {unread > 0 && <div style={s.badge}>{unread}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat pane */}
      <div style={s.chat}>
        {selectedNode ? (
          <>
            {/* Header */}
            <div style={s.chatHeader}>
              <div style={s.chatLeft}>
                {isMobile && (
                  <button
                    style={s.menuBtn}
                    onClick={handleBackToNodes}
                    title="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div style={{ ...s.chatAv, ...selectedColor }}>
                  {(
                    selectedNodeData?.alias?.[0] ?? selectedNode.slice(0, 2)
                  ).toUpperCase()}
                </div>
                <div>
                  <div style={s.chatName}>
                    {selectedNodeData?.alias ?? truncate(selectedNode)}
                  </div>
                  <div style={s.chatSub}>{truncate(selectedNode)}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {!isMobile && (
                  <>
                    <span style={s.latency}>~12ms</span>
                    <div style={s.connPill}>
                      <span style={s.greenDot} />
                      connected
                    </div>
                  </>
                )}
                {isMobile && (
                  <button
                    style={s.iconBtn}
                    onClick={() => setShowQR(true)}
                    title="Show QR"
                  >
                    <QrCode size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={s.messages}>
              {chatMessages.length === 0 && (
                <p style={s.noMessages}>No messages yet. Say hello!</p>
              )}
              {chatMessages.map((msg, i) => {
                const isOwn = msg.from === nodeId;
                return (
                  <div
                    key={i}
                    style={{
                      ...s.msgRow,
                      flexDirection: isOwn ? "row-reverse" : "row",
                    }}
                  >
                    <div
                      style={{
                        ...s.msgAv,
                        ...(isOwn ? NODE_COLORS.info : selectedColor),
                      }}
                    >
                      {isOwn
                        ? (identity?.alias?.[0]?.toUpperCase() ?? "M")
                        : (selectedNodeData?.alias?.[0]?.toUpperCase() ??
                          selectedNode.slice(0, 2).toUpperCase())}
                    </div>
                    <div style={{ maxWidth: isMobile ? "85%" : "70%" }}>
                      <div style={isOwn ? s.bubbleOwn : s.bubble}>
                        {msg.content}
                      </div>
                      <div
                        style={{
                          ...s.msgMeta,
                          justifyContent: isOwn ? "flex-end" : "flex-start",
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isOwn &&
                          (msg.read ? (
                            <CheckCheck size={11} />
                          ) : (
                            <Check size={11} />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={s.inputArea}>
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${selectedNodeData?.alias ?? truncate(selectedNode)}…`}
                style={s.msgInput}
              />
              <button onClick={handleSend} style={s.sendBtn}>
                <Send size={14} />
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={s.emptyState}>
            <div style={s.emptyGraphic}>
              <QrCode size={isMobile ? 40 : 32} color="#6b7280" />
            </div>
            <div style={s.emptyTitle}>No conversation selected</div>
            <div style={s.emptySub}>
              Pick a nearby node to start chatting, or share your QR code to let
              others connect.
            </div>
            <button style={s.copyBtn} onClick={() => setShowQR(true)}>
              <QrCode size={12} />
              Show my QR code
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu button when no chat selected */}
      {isMobile && !selectedNode && (
        <button style={s.mobileMenuBtn} onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  app: {
    height: "100vh",
    display: "flex",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#ffffff",
    position: "relative",
  },

  // Mobile overlay
  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 998,
  },

  mobileSidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 300,
    background: "#f9fafb",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 0 20px rgba(0,0,0,0.15)",
  },

  mobileMenuBtn: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    background: "#111827",
    color: "#ffffff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    zIndex: 100,
  },

  menuBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    padding: 4,
    marginRight: 4,
  },

  // Sidebar
  sidebar: {
    width: 280,
    minWidth: 280,
    borderRight: "0.5px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb",
  },
  sidebarTop: {
    padding: "16px",
    borderBottom: "0.5px solid #e5e7eb",
  },
  meRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  meName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.2,
  },
  meId: {
    fontSize: 11,
    color: "#9ca3af",
    fontFamily: "monospace",
  },
  iconBtn: {
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
  },
  searchWrap: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "8px 10px 8px 34px",
    fontSize: 13,
    background: "#ffffff",
    border: "0.5px solid #e5e7eb",
    borderRadius: 8,
    color: "#111827",
    outline: "none",
  },
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px 8px",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  networkPill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    color: "#059669",
    background: "#d1fae5",
    padding: "2px 8px",
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "currentColor",
    display: "inline-block",
    flexShrink: 0,
  },
  nodeList: {
    flex: 1,
    overflowY: "auto",
    padding: "0 8px 12px",
  },
  nodeItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 8px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.1s",
  },
  nodeAv: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  nodeInfo: {
    flex: 1,
    minWidth: 0,
  },
  nodeName: {
    fontSize: 13,
    fontWeight: 500,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  nodeSeen: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    background: "#111827",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 10,
    flexShrink: 0,
  },

  // Chat pane
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    background: "#ffffff",
  },
  chatHeader: {
    padding: "0 16px",
    height: 60,
    borderBottom: "0.5px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  chatLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  chatAv: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  chatName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },
  chatSub: {
    fontSize: 11,
    color: "#9ca3af",
    fontFamily: "monospace",
  },
  latency: {
    fontSize: 11,
    color: "#9ca3af",
    background: "#f9fafb",
    border: "0.5px solid #e5e7eb",
    padding: "3px 8px",
    borderRadius: 6,
    fontFamily: "monospace",
  },
  connPill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    color: "#059669",
    background: "#d1fae5",
    padding: "4px 10px",
    borderRadius: 20,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  noMessages: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 32,
  },
  msgRow: {
    display: "flex",
    gap: 8,
    marginBottom: 2,
  },
  msgAv: {
    width: 28,
    height: 28,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#111827",
    background: "#f3f4f6",
    border: "0.5px solid #e5e7eb",
    display: "inline-block",
    width: "100%",
  },
  bubbleOwn: {
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#ffffff",
    background: "#111827",
    display: "inline-block",
    width: "100%",
  },
  msgMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    fontSize: 10,
    color: "#9ca3af",
  },
  inputArea: {
    padding: "12px 16px",
    borderTop: "0.5px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  msgInput: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 13,
    background: "#f9fafb",
    border: "0.5px solid #e5e7eb",
    borderRadius: 10,
    color: "#111827",
    outline: "none",
  },
  sendBtn: {
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
  },

  // Empty state
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyGraphic: {
    width: 96,
    height: 96,
    borderRadius: 24,
    border: "0.5px solid #e5e7eb",
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 28,
    maxWidth: 260,
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "#6b7280",
    background: "#ffffff",
    border: "0.5px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    justifyContent: "center",
  },
};
