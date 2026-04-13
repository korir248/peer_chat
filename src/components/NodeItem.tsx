import { Node } from "../types";

function truncate(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

interface Props {
  node: Node;
  isActive: boolean;
  unread: number;
  onClick: () => void;
}

export function NodeItem({ node, isActive, unread, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 8px",
        borderRadius: 10,
        cursor: "pointer",
        background: isActive ? "#f3f4f6" : "transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={av}>
        {node.alias?.[0]?.toUpperCase() ??
          node.endpoint_id.slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={name}>{node.alias ?? truncate(node.endpoint_id)}</div>
      </div>
      {unread > 0 && <div style={badge}>{unread}</div>}
    </div>
  );
}

const av: React.CSSProperties = {
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

const name: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#111827",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const badge: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 600,
  padding: "2px 6px",
  borderRadius: 10,
  flexShrink: 0,
};
