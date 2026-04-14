import { QrCode, X } from "lucide-react";
import { Node, Identity } from "../types";
import { NodeList } from "./NodeList";

function truncate(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

interface Props {
  identity: Identity | null;
  nodeId: string;
  mode: "nearby" | "global";
  onModeChange: (mode: "nearby" | "global") => void;
  nodes: Node[];
  globalNodes: Node[];
  selectedNode: Node | null;
  unreadCount: (id: string) => number;
  onSelect: (node: Node) => void;
  onShowQR: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({
  identity,
  nodeId,
  mode,
  onModeChange,
  nodes,
  globalNodes,
  selectedNode,
  unreadCount,
  onSelect,
  onShowQR,
  onClose,
  isMobile,
}: Props) {
  const displayNodes = mode === "nearby" ? nodes : globalNodes;

  return (
    <div style={isMobile ? mobileSidebar : sidebar}>
      {/* Header */}
      <div style={sidebarTop}>
        <div style={meRow}>
          <div style={avatar}>{identity?.alias?.[0]?.toUpperCase() ?? "?"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={meName}>{identity?.alias ?? "my node"}</div>
            <div style={meId}>{truncate(nodeId)}</div>
          </div>
          <button style={iconBtn} onClick={onShowQR} title="Show QR">
            <QrCode size={isMobile ? 16 : 14} />
          </button>
          {isMobile && onClose && (
            <button style={iconBtn} onClick={onClose} title="Close">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Mode toggle */}
        <div style={modeToggle}>
          <button
            style={{
              ...modeBtn,
              background: mode === "nearby" ? "#111827" : "transparent",
              color: mode === "nearby" ? "#ffffff" : "#6b7280",
            }}
            onClick={() => onModeChange("nearby")}
          >
            Nearby
          </button>
          <button
            style={{
              ...modeBtn,
              background: mode === "global" ? "#111827" : "transparent",
              color: mode === "global" ? "#ffffff" : "#6b7280",
            }}
            onClick={() => onModeChange("global")}
          >
            Global
          </button>
        </div>
      </div>

      {/* Section label */}
      <div style={sectionRow}>
        <span style={sectionLabel}>
          {mode === "nearby" ? "Nearby" : "Global"}
        </span>
        <span style={networkPill}>
          <span style={greenDot} />
          {displayNodes.length} node{displayNodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Node list */}
      <NodeList
        mode={mode}
        nodes={nodes}
        globalNodes={globalNodes}
        selectedNode={selectedNode}
        unreadCount={unreadCount}
        onSelect={onSelect}
      />
    </div>
  );
}

const sidebar: React.CSSProperties = {
  width: 280,
  minWidth: 280,
  borderRight: "0.5px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  background: "#f9fafb",
};

const mobileSidebar: React.CSSProperties = {
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
};

const sidebarTop: React.CSSProperties = {
  padding: "16px",
  borderBottom: "0.5px solid #e5e7eb",
};

const meRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
};

const avatar: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 600,
  flexShrink: 0,
  background: "#f3f4f6",
  color: "#111827",
};

const meName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
  lineHeight: 1.2,
};

const meId: React.CSSProperties = {
  fontSize: 11,
  color: "#9ca3af",
  fontFamily: "monospace",
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

const modeToggle: React.CSSProperties = {
  display: "flex",
  background: "#f3f4f6",
  borderRadius: 8,
  padding: 2,
};

const modeBtn: React.CSSProperties = {
  flex: 1,
  padding: "6px 0",
  fontSize: 12,
  fontWeight: 600,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  transition: "all 0.15s",
};

const sectionRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px 8px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const networkPill: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  fontWeight: 500,
  color: "#059669",
  background: "#d1fae5",
  padding: "2px 8px",
  borderRadius: 12,
};

const greenDot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "currentColor",
  display: "inline-block",
  flexShrink: 0,
};
