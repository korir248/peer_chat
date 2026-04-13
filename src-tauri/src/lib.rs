use std::sync::Arc;

mod commands;

use commands::connection::{
    connect_by_public_key, generate_connection_url, get_global_nodes, get_local_nodes, get_node_id,
    load_identity, save_identity,
};
use commands::message::send_message;

pub use p2p_node::models::{Message, Node};

pub struct State {
    pub node: Arc<p2p_node::P2PNode>,
}

pub fn handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        get_node_id,
        send_message,
        get_local_nodes,
        get_global_nodes,
        generate_connection_url,
        load_identity,
        save_identity,
        connect_by_public_key
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(node: Arc<p2p_node::P2PNode>) {
    let node_a = Arc::clone(&node);
    tauri::Builder::default()
        .manage(State { node })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(handlers())
        .setup(move |app| {
            let handle = app.handle();
            node_a.set_handle(handle.clone());

            tauri::async_runtime::spawn(async move {
                node_a.init_alias().await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
