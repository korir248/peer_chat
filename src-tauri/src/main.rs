// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let node = p2p_node::P2PNode::new().await?;
    peerchat_lib::run(node);
    Ok(())
}
