use std::sync::Arc;

mod commands;

use commands::connection::{
    connect_by_public_key, generate_connection_url, get_global_nodes, get_local_nodes,
    get_local_nodes1, get_node_id, load_identity, save_identity,
};
use commands::message::{send_message, start_media_stream};

pub use p2p_node::models::{Message, Node};
use tauri::Emitter;
use tokio::sync::mpsc;

pub struct State {
    pub node: Arc<p2p_node::P2PNode>,
}

pub fn handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        get_node_id,
        send_message,
        get_local_nodes,
        get_local_nodes1,
        get_global_nodes,
        generate_connection_url,
        load_identity,
        save_identity,
        connect_by_public_key,
        start_media_stream
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let rt = tokio::runtime::Runtime::new().expect("Failed to create runtime");

    let (send, mut recv) = mpsc::unbounded_channel();

    let node = rt.block_on(async {
        p2p_node::P2PNode::new(send)
            .await
            .expect("Failed to create node")
    });
    let node_a = Arc::clone(&node);
    tauri::Builder::default()
        .manage(State { node })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(handlers())
        .setup(move |app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                node_a.init_alias().await;
            });

            tauri::async_runtime::spawn(async move {
                while let Some(event) = recv.recv().await {
                    match event {
                        p2p_node::models::PeerEvent::MessageReceived {
                            from,
                            to,
                            content,
                            timestamp,
                        } => {
                            let _ = app_handle
                                .emit(
                                    "message_received",
                                    serde_json::json!({
                                        "from": from,
                                        "to": to,
                                        "content": content,
                                        "timestamp": timestamp,
                                    }),
                                )
                                .ok();
                        }
                        p2p_node::models::PeerEvent::FileChunkReceived {
                            from,
                            file_offset,
                            last,
                        } => {
                            let _ = app_handle.emit(
                                "file_chunk",
                                serde_json::json!({
                                    "from": from,
                                    "file_offset":file_offset,
                                    "last": last
                                }),
                            );
                        }
                        p2p_node::models::PeerEvent::MediaChunkReceived { data } => {
                            let _ = app_handle.emit(
                                "media_chunk",
                                serde_json::json!({
                                    "data": data
                                }),
                            );
                        }
                        p2p_node::models::PeerEvent::PeerConnected(peer_id) => {
                            let _ = app_handle.emit(
                                "peer_connected",
                                serde_json::json!({
                                    "peer_id": peer_id
                                }),
                            );
                        }
                        p2p_node::models::PeerEvent::PeerDisconnected(peer_id) => {
                            let _ = app_handle.emit(
                                "peer_disconnected",
                                serde_json::json!({
                                    "peer_id": peer_id
                                }),
                            );
                        }
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
