import { useState } from "react";
import { User, ArrowRight } from "lucide-react";
import { Identity } from "../types";

interface Props {
  onSubmit: (alias: string) => Promise<Identity>;
}

export function Onboarding({ onSubmit }: Props) {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!alias.trim()) {
      setError("Please enter a name");
      return;
    }
    if (alias.length < 2) {
      setError("Name too short");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(alias.trim());
    } catch (e) {
      setError("Failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 32,
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#111827",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            P2P
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#111827",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Welcome
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Choose a name to get started with secure P2P messaging
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "2px",
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  color: "#9ca3af",
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                <User size={18} />
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Display name (e.g., mike)"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  border: "none",
                  background: "transparent",
                  fontSize: 15,
                  color: "#111827",
                  outline: "none",
                }}
                autoFocus
                disabled={loading}
              />
            </div>
            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: 13,
                  margin: "8px 0 0",
                }}
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "14px",
              fontSize: 15,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
          >
            {loading ? (
              "Setting up..."
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p
          style={{
            fontSize: 13,
            color: "#9ca3af",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Your identity is stored locally
        </p>
      </div>
    </div>
  );
}
