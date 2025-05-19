use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_p256_signer);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<P256Signer<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("app.tauri.p256", "P256SignerPlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_p256_signer)?;
  Ok(P256Signer(handle))
}

/// Access to the p256-signer APIs.
pub struct P256Signer<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> P256Signer<R> {
  pub fn create_credential(&self, payload: CreateCredentialRequest) -> crate::Result<PubKeyResponse> {
    self.0
        .run_mobile_plugin("create_credential", payload)
        .map_err(Into::into)
  }

  pub fn get_credential(&self, payload: GetCredentialRequest) -> crate::Result<PubKeyResponse> {
    self.0
        .run_mobile_plugin("get_credential", payload)
        .map_err(Into::into)
  }
}
