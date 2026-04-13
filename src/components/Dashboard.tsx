import { useState, useEffect } from "react";
import { QrCode, Menu } from "lucide-react";
import { useP2P } from "../hooks/useP2P";
import { QRModal } from "./QRModal";
import { Sidebar } from "./Sidebar";
import { ChatPane } from "./ChatPane";
import { Node } from "../types";

export function Dashboard() {
  const { identity, nodes, globalNodes, messages, sendMessage, getNodeId } =
    useP2P();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [seenSeconds, setSeenSeconds] = useState<Record<string, number>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<"nearby" | "global">("nearby");

  const nodeId = getNodeId();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    await sendMessage(messageInput.trim(), selectedNode.endpoint_id, nodeId);
    setMessageInput("");
  };

  const handleSelect = (node: Node) => {
    setSelectedNode(node);
    if (isMobile) setSidebarOpen(false);
  };

  const handleBack = () => {
    setSelectedNode(null);
    if (isMobile) setSidebarOpen(true);
  };

  const unreadCount = (nid: string) =>
    messages.filter((m) => m.from === nid).length;

  const chatMessages = messages.filter(
    (m) =>
      (m.from === selectedNode?.endpoint_id && m.to === nodeId) ||
      (m.to === selectedNode?.endpoint_id && m.from === nodeId),
  );

  const selectedNodeData = [...nodes, ...globalNodes].find(
    (n) => n.endpoint_id === selectedNode?.endpoint_id,
  );

  return (
    <div style={app}>
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        nodeId={nodeId}
        alias={identity?.alias}
      />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div style={overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <Sidebar
          identity={identity}
          nodeId={nodeId}
          mode={mode}
          onModeChange={setMode}
          nodes={nodes}
          globalNodes={globalNodes}
          selectedNode={selectedNode}
          seenSeconds={seenSeconds}
          unreadCount={unreadCount}
          onSelect={handleSelect}
          onShowQR={() => setShowQR(true)}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
      )}

      {/* Chat pane */}
      <div style={chat}>
        {selectedNode ? (
          <ChatPane
            selectedNode={selectedNode}
            selectedNodeData={selectedNodeData}
            identity={identity}
            nodeId={nodeId}
            messages={chatMessages}
            messageInput={messageInput}
            isMobile={isMobile}
            onInputChange={setMessageInput}
            onSend={handleSend}
            onBack={handleBack}
            onShowQR={() => setShowQR(true)}
          />
        ) : (
          <div style={emptyState}>
            <div style={emptyGraphic}>
              <QrCode size={isMobile ? 40 : 32} color="#6b7280" />
            </div>
            <div style={emptyTitle}>No conversation selected</div>
            <div style={emptySub}>
              Pick a nearby node to start chatting, or share your QR code to let
              others connect.
            </div>
            <button style={copyBtn} onClick={() => setShowQR(true)}>
              <QrCode size={12} />
              Show my QR code
            </button>
          </div>
        )}
      </div>

      {isMobile && !selectedNode && (
        <button style={mobileMenuBtn} onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
      )}
    </div>
  );
}

const app: React.CSSProperties = {
  height: "100vh",
  display: "flex",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  background: "#ffffff",
  position: "relative",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 998,
};

const chat: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  background: "#ffffff",
};

const mobileMenuBtn: React.CSSProperties = {
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
};

const emptyState: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const emptyGraphic: React.CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: 24,
  border: "0.5px solid #e5e7eb",
  background: "#f9fafb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
};

const emptyTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 8,
  textAlign: "center",
};

const emptySub: React.CSSProperties = {
  fontSize: 13,
  color: "#9ca3af",
  textAlign: "center",
  lineHeight: 1.6,
  marginBottom: 28,
  maxWidth: 260,
};

const copyBtn: React.CSSProperties = {
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
};
