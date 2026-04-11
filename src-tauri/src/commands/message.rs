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
