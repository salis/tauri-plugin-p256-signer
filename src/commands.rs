use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::P256SignerExt;

#[command]
pub(crate) async fn create_credential<R: Runtime>(
    app: AppHandle<R>,
    payload: CreateCredentialRequest,
) -> Result<PubKeyResponse> {
    app.p256_signer().create_credential(payload)
}

#[command]
pub(crate) async fn get_credential<R: Runtime>(
    app: AppHandle<R>,
    payload: GetCredentialRequest,
) -> Result<PubKeyResponse> {
    app.p256_signer().get_credential(payload)
}