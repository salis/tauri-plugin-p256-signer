use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::P256Signer;
#[cfg(mobile)]
use mobile::P256Signer;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the p256-signer APIs.
pub trait P256SignerExt<R: Runtime> {
    fn p256_signer(&self) -> &P256Signer<R>;
}

impl<R: Runtime, T: Manager<R>> crate::P256SignerExt<R> for T {
    fn p256_signer(&self) -> &P256Signer<R> {
        self.state::<P256Signer<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("p256-signer")
        .invoke_handler(tauri::generate_handler![
            commands::create_credential,
            commands::get_credential
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let p256_signer = mobile::init(app, api)?;
            #[cfg(desktop)]
            let p256_signer = desktop::init(app, api)?;
            app.manage(p256_signer);
            Ok(())
        })
        .build()
}
