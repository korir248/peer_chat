import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Node } from "../types";
import { NodeItem } from "./NodeItem";

interface Props {
  mode: "nearby" | "global";
  nodes: Node[];
  globalNodes: Node[];
  selectedNode: Node | null;
  seenSeconds: Record<string, number>;
  unreadCount: (id: string) => number;
  onSelect: (node: Node) => void;
}

export function NodeList({
  mode,
  nodes,
  globalNodes,
  selectedNode,
  seenSeconds,
  unreadCount,
  onSelect,
}: Props) {
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnectByKey = async () => {
    if (!publicKeyInput.trim()) return;
    setConnecting(true);
    try {
      await invoke("connect_by_public_key", { key: publicKeyInput.trim() });
      setPublicKeyInput("");
    } catch (e) {
      console.error("Failed to connect:", e);
    } finally {
      setConnecting(false);
    }
  };

  const displayNodes = mode === "nearby" ? nodes : globalNodes;

  return (
    <>
      {mode === "global" && (
        <div style={addPeerWrap}>
          <input
            placeholder="Paste public key..."
            value={publicKeyInput}
            onChange={(e) => setPublicKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnectByKey()}
            style={addPeerInput}
          />
          <button
            onClick={handleConnectByKey}
            disabled={connecting}
            style={addPeerBtn}
          >
            {connecting ? "..." : "+"}
          </button>
        </div>
      )}
      <div style={list}>
        {displayNodes.map((node) => (
          <NodeItem
            key={node.endpoint_id}
            node={node}
            isActive={selectedNode?.endpoint_id === node.endpoint_id}
            unread={unreadCount(node.endpoint_id)}
            seenSeconds={seenSeconds[node.endpoint_id] ?? 0}
            onClick={() => onSelect(node)}
          />
        ))}
      </div>
    </>
  );
}

const list: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "0 8px 12px",
};

const addPeerWrap: React.CSSProperties = {
  display: "flex",
  gap: 6,
  padding: "8px 16px",
};

const addPeerInput: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  fontSize: 12,
  background: "#ffffff",
  border: "0.5px solid #e5e7eb",
  borderRadius: 8,
  color: "#111827",
  outline: "none",
  fontFamily: "monospace",
};

const addPeerBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
