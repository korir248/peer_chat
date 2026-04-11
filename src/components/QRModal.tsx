import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Copy, Download } from "lucide-react";

interface QRProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  alias?: string;
}

export function QRModal({ isOpen, onClose, nodeId, alias }: QRProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const connectionUrl = `medic-p2p://connect/${nodeId}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(connectionUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#111827", light: "#ffffff" },
      }).then(setQrDataUrl);
    }
  }, [isOpen, connectionUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(connectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `medip2p-${alias || "connection"}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Your QR Code</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.qrContainer}>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR Code" style={styles.qrImage} />
          )}
        </div>

        <div style={styles.info}>
          <div style={styles.alias}>{alias || "Anonymous"}</div>
          <div style={styles.nodeId}>
            {nodeId.slice(0, 12)}...{nodeId.slice(-8)}
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={handleCopy} style={styles.secondaryButton}>
            <Copy size={16} />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload} style={styles.primaryButton}>
            <Download size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: "90%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qrContainer: {
    background: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
  },
  qrImage: {
    maxWidth: "100%",
    borderRadius: 8,
  },
  info: {
    background: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  alias: {
    fontWeight: 600,
    marginBottom: 4,
  },
  nodeId: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    background: "#f3f4f6",
    color: "#111827",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
};
