use std::path::PathBuf;

use crate::{Message, State};

#[tauri::command]
pub async fn send_message(
    state: tauri::State<'_, State>,
    content: String,
    to: String,
) -> Result<(), String> {
    println!("Sending message to {}: {}", to, content);

    let node_id = &to.clone();

    let from = state.node.id();

    let message = Message::Text { content, to, from };

    state
        .node
        .send_message(node_id, message)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn start_media_stream(
    state: tauri::State<'_, State>,
    peer_id: String,
    file_path: String,
) -> Result<(), String> {
    state
        .node
        .stream_media(&peer_id, PathBuf::from(file_path))
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
