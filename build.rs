const COMMANDS: &[&str] = &["create_credential", "get_credential"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
