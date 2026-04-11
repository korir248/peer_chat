import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { Message, Node, Identity } from "../types";

export function useP2P() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load identity on mount
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await invoke<Identity | null>("load_identity");
        if (saved) {
          setIdentity(saved);
        }
      } catch (e) {
        console.error("Failed to load identity:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Setup listeners when identity exists
  useEffect(() => {
    if (!identity) return;
    console.log("Identity loaded:", identity);

    listen("message_received", (event) => {
      console.log(
        "🔔 MESSAGE RECEIVED EVENT FIRED:",
        event.event,
        event.payload,
      );
    });

    // Listen for messages
    const unlistenMsg = listen<Message>("message_received", (e) => {
      setMessages((prev) => {
        const updated = [...prev, { ...e.payload }];
        return updated;
      });
    });

    // Listen for deep links
    const setupDeepLink = async () => {
      return await onOpenUrl(async (url) => {
        await connectToNode(url as any as string);

        // if (url.startsWith("medic://connect/")) {
        //   const nodeId = url.replace("medic-p2p://connect/", "");
        //
        // }
      });
    };
    const deepLinkPromise = setupDeepLink();

    // Refresh nodes periodically
    refreshNodes();
    const interval = setInterval(refreshNodes, 5000);

    return () => {
      unlistenMsg.then((f) => f());
      deepLinkPromise.then((f) => f?.());
      clearInterval(interval);
    };
  }, [identity]);

  const createIdentity = async (alias: string): Promise<Identity> => {
    const newIdentity = await invoke<Identity>("save_identity", { alias });
    setIdentity(newIdentity);
    return newIdentity;
  };

  const refreshNodes = async () => {
    try {
      const discovered = await invoke<Node[]>("get_nodes");
      setNodes(discovered);
    } catch (e) {
      console.error("Failed to get nodes:", e);
    }
  };

  const connectToNode = async (nodeId: string) => {
    await invoke("send_hello", { nodeId });
  };

  const sendMessage = async (content: string, to: string, from: string) => {
    try {
      await invoke<Message>("send_message", { content, to, from });
    } catch (error) {}
  };

  const getNodeId = (): string => {
    return identity?.public_key || "";
  };

  return {
    identity,
    isLoading,
    nodes,
    messages,
    createIdentity,
    refreshNodes,
    connectToNode,
    sendMessage,
    getNodeId,
  };
}
