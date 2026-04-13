import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { Message, Node, Identity } from "../types";

export function useP2P() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [globalNodes, setGlobalNodes] = useState<Node[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const saved = await invoke<Identity | null>("load_identity");
        if (saved) setIdentity(saved);
      } catch (e) {
        console.error("Failed to load identity:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!identity) return;

    const unlistenMsg = listen<Message>("message_received", (e) => {
      setMessages((prev) => [...prev, e.payload]);
    });

    const setupDeepLink = async () => {
      return await onOpenUrl(async (url) => {
        await connectToNode(url as any as string);
      });
    };
    const deepLinkPromise = setupDeepLink();

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
      const discovered = await invoke<Node[]>("get_local_nodes");
      console.log("nodes:", discovered);

      const global = await invoke<Node[]>("get_global_nodes");
      console.log("global nodes:", global);
      setGlobalNodes(global);

      setNodes(discovered);
    } catch (e) {
      console.error("Failed to get nodes:", e);
    }
  };

  const connectToNode = async (key: string) => {
    await invoke("connect_by_public_key", { key });
  };

  const sendMessage = async (content: string, to: string, from: string) => {
    try {
      await invoke<Message>("send_message", { content, to, from });
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  const getNodeId = (): string => {
    return identity?.public_key || "";
  };

  return {
    identity,
    isLoading,
    nodes,
    globalNodes,
    messages,
    createIdentity,
    refreshNodes,
    connectToNode,
    sendMessage,
    getNodeId,
  };
}
