use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<P256Signer<R>> {
  Ok(P256Signer(app.clone()))
}

/// Access to the p256-signer APIs.
pub struct P256Signer<R: Runtime>(AppHandle<R>);

impl<R: Runtime> P256Signer<R> {

  pub fn create_credential(&self, payload: CreateCredentialRequest) -> crate::Result<PubKeyResponse> {
    todo!()
  }

  pub fn get_credential(&self, payload: GetCredentialRequest) -> crate::Result<PubKeyResponse> {
    todo!()
  }

}
