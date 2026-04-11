use std::sync::Arc;

mod commands;

use commands::connection::{
    generate_connection_url, get_node_id, get_nodes, load_identity, save_identity,
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
        get_nodes,
        generate_connection_url,
        load_identity,
        save_identity
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
