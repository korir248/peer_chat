use p2p_node::models::{Identity, Node};

use crate::State;

#[tauri::command]
pub fn get_node_id(state: tauri::State<'_, State>) -> String {
    state.node.id()
}

#[tauri::command]
pub fn generate_connection_url(state: tauri::State<'_, State>) -> String {
    let node_id = state.node.id();
    format!("peerchat://connect/{}", node_id)
}

#[allow(unused)]
#[tauri::command]
pub fn parse_connection_url(url: String) -> Result<String, String> {
    if url.starts_with("peerchat://connect/") {
        Ok(url.replace("peerchat://connect/", ""))
    } else {
        Err("Invalid deep link URL".to_string())
    }
}

#[tauri::command]
pub async fn load_identity(state: tauri::State<'_, State>) -> Result<Option<Identity>, String> {
    Ok(state.node.get_identity().await)
}

#[tauri::command]
pub async fn save_identity(
    state: tauri::State<'_, State>,
    alias: String,
) -> Result<Identity, String> {
    state
        .node
        .set_identity(alias)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_nodes(state: tauri::State<'_, State>) -> Result<Vec<Node>, String> {
    Ok(state.node.get_nodes().await)
}
