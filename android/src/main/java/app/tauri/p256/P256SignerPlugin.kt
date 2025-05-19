package app.tauri.p256

import android.app.Activity
import android.os.Build
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import app.tauri.Logger
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers.IO
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@InvokeArg
class CreateCredentialRequestParams {
    lateinit var creationParams: String
}

@InvokeArg
class GetCredentialRequestParams {
    lateinit var getParams: String
}

data class PubKeyResponse(val pubKeyJson: String)

@TauriPlugin
class P256SignerPlugin(private val activity: Activity): Plugin(activity) {

    private val credentialManager = CredentialManager.create(activity)
    private val scope = CoroutineScope(IO + SupervisorJob())
    private var isRequesting = false;

    companion object {
        const val ANDROID_KEYSTORE = "AndroidKeyStore"
    }

    @Command
    fun create_credential(invoke: Invoke) {
        val invokeParams = invoke.parseArgs(CreateCredentialRequestParams::class.java)
        if (isRequesting) return
        isRequesting = true
        scope.launch {
            val request = CreatePublicKeyCredentialRequest(invokeParams.creationParams)
            val response = credentialManager.createCredential(activity, request)
            val pubkeyResponse = response as? CreatePublicKeyCredentialResponse
            Logger.debug("response type: ${response.type}")
            Logger.debug("pubkeyResponse: ${pubkeyResponse?.registrationResponseJson}")
            // todo: error handling and try catch
            invoke.resolveObject(PubKeyResponse(pubkeyResponse!!.registrationResponseJson))
            isRequesting = false
        }
    }

    @Command
    fun get_credential(invoke: Invoke) {
        if (isRequesting) return
        isRequesting = true
        scope.launch {
            val invokeParams = invoke.parseArgs(GetCredentialRequestParams::class.java)
            Logger.debug("credentialReqJSON: ${invokeParams.getParams}")
            val credentialRequest = GetPublicKeyCredentialOption(invokeParams.getParams)
            Logger.debug("credentialRequest: ${credentialRequest.requestJson}")
            val request = GetCredentialRequest(listOf(credentialRequest))
            val response = credentialManager.getCredential(activity, request)
            Logger.debug("response cred: ${response.credential}")
            val pubKeyCred = response.credential as PublicKeyCredential
            invoke.resolveObject(PubKeyResponse(pubKeyCred.authenticationResponseJson))
            isRequesting = false
        }
    }

}
