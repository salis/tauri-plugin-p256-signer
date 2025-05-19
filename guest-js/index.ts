import {invoke} from "@tauri-apps/api/core";
import {toWebAuthnAccount, WebAuthnAccount} from "viem/account-abstraction";
import {parseCredentialPublicKey} from "ox/_types/core/internal/webauthn";

// Define the types
export interface WebAuthnCredentialJSON {
    id: string;
    rawId: string; // Base64URL encoded
    response: {
        publicKey: string;
        clientDataJSON: string; // Base64URL encoded
        attestationObject?: string; // Base64URL encoded
        authenticatorData?: string; // Base64URL encoded
        signature?: string; // Base64URL encoded
        userHandle?: string | null; // Base64URL encoded
    };
    type: 'public-key';
    authenticatorAttachment?: 'platform' | 'cross-platform';
}

export interface WebAuthnCredential {
    id: string;
    rawId: ArrayBuffer;
    response: {
        clientDataJSON: ArrayBuffer;
        attestationObject?: ArrayBuffer;
        authenticatorData?: ArrayBuffer;
        signature?: ArrayBuffer;
        userHandle?: ArrayBuffer | null;
        publicKey: ArrayBuffer;
    };
    type: 'public-key';
    authenticatorAttachment?: 'platform' | 'cross-platform';
}


// Serialize WebAuthn credential for JSON transmission
// Convert ArrayBuffer properties to base64Url-encoded strings
export interface SerializedPublicKeyCredentialCreationOptions {
    challenge: string; // Base64URL encoded
    rp: {
        id?: string;
        name: string;
    };
    user: {
        id: string; // Base64URL encoded
        name: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{
        type: string;
        alg: number;
    }>;
    timeout?: number;
    excludeCredentials?: Array<{
        id: string; // Base64URL encoded
        type: string;
        transports?: string[];
    }>;
    authenticatorSelection?: {
        authenticatorAttachment?: string;
        requireResidentKey?: boolean;
        residentKey?: string;
        userVerification?: string;
    };
    attestation?: string;
    extensions?: Record<string, any>;
}

export interface SerializedPublicKeyCredentialRequestOptions {
    allowCredentials?: Array<{
        id: string; // Base64URL encoded
        type: string;
        transports?: string[];
    }>;
    challenge: string; // Base64URL encoded
    extensions?: Record<string, any>;
    rpId?: string;
    timeout?: number;
    userVerification?: string;
}

export interface SerializedCredentialRequestOptions {
    mediation?: string;
    publicKey?: SerializedPublicKeyCredentialRequestOptions;
    // signal is not serializable, so we don't include it
}

export function serializeWebAuthnCredential(credentialRequest: PublicKeyCredentialCreationOptions): PublicKeyCredentialCreationOptionsJSON {
    // Create a deep copy to avoid modifying the original object
    const serialized: PublicKeyCredentialCreationOptionsJSON = {
        challenge: bufferToBase64Url(credentialRequest.challenge as ArrayBuffer),
        rp: {
            ...credentialRequest.rp
        },
        user: {
            id: bufferToBase64Url(credentialRequest.user.id as ArrayBuffer),
            name: credentialRequest.user.name,
            displayName: credentialRequest.user.displayName
        },
        pubKeyCredParams: credentialRequest.pubKeyCredParams.map((param: { type: any; alg: any; }) => ({
            type: param.type,
            alg: param.alg
        }))
    };

    // Add optional properties if they exist
    if (credentialRequest.timeout !== undefined) {
        serialized.timeout = credentialRequest.timeout;
    }

    if (credentialRequest.authenticatorSelection) {
        serialized.authenticatorSelection = {
            ...credentialRequest.authenticatorSelection
        };
    }

    if (credentialRequest.attestation) {
        serialized.attestation = credentialRequest.attestation;
    }

    if (credentialRequest.extensions) {
        serialized.extensions = credentialRequest.extensions;
    }

    return serialized;
}

export function serializeCredentialRequestOptions(options: CredentialRequestOptions): SerializedCredentialRequestOptions {
    const serialized: SerializedCredentialRequestOptions = {};

    if (options.mediation) {
        serialized.mediation = options.mediation;
    }

    if (options.publicKey) {
        const publicKey = options.publicKey;
        const serializedPublicKey: SerializedPublicKeyCredentialRequestOptions = {
            challenge: bufferToBase64Url(publicKey.challenge as ArrayBuffer)
        };

        // Add optional properties if they exist
        if (publicKey.allowCredentials) {
            serializedPublicKey.allowCredentials = publicKey.allowCredentials.map(cred => ({
                id: bufferToBase64Url(cred.id as ArrayBuffer),
                type: cred.type,
                transports: cred.transports
            }));
        }

        if (publicKey.extensions) {
            serializedPublicKey.extensions = publicKey.extensions;
        }

        if (publicKey.rpId) {
            serializedPublicKey.rpId = publicKey.rpId;
        }

        if (publicKey.timeout !== undefined) {
            serializedPublicKey.timeout = publicKey.timeout;
        }

        if (publicKey.userVerification) {
            serializedPublicKey.userVerification = publicKey.userVerification;
        }

        serialized.publicKey = serializedPublicKey;
    }

    return serialized;
}

// Parse function
function parseWebAuthnCredential(credentialJson: WebAuthnCredentialJSON): WebAuthnCredential {

  const clientData = base64UrlToBuffer(credentialJson.response.clientDataJSON);

  return {
    id: credentialJson.id,
    rawId: base64UrlToBuffer(credentialJson.rawId),
    response: {
      publicKey: base64UrlToBuffer(credentialJson.response.publicKey),
      clientDataJSON: new Uint8Array(clientData),
      attestationObject: credentialJson.response.attestationObject
          ? base64UrlToBuffer(credentialJson.response.attestationObject)
          : undefined,
      authenticatorData: credentialJson.response.authenticatorData
          ? base64UrlToBuffer(credentialJson.response.authenticatorData)
          : undefined,
      signature: credentialJson.response.signature
          ? base64UrlToBuffer(credentialJson.response.signature)
          : undefined,
      userHandle: credentialJson.response.userHandle
          ? base64UrlToBuffer(credentialJson.response.userHandle)
          : null,
    },
    type: credentialJson.type,
    authenticatorAttachment: credentialJson.authenticatorAttachment,
  };
}

// Helper functions
function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createCredential(cred: PublicKeyCredentialCreationOptions) {

    console.log("before: ", JSON.stringify(cred));
    const webSafeRequest = serializeWebAuthnCredential(cred);
    console.log("after: ", JSON.stringify(webSafeRequest));

    return await invoke<{ pubKeyJson?: string }>("plugin:p256-signer|create_credential", {
        payload: {
            creationParams: JSON.stringify(webSafeRequest)
        }
    }).then(({pubKeyJson}) => {
        const pubKey: PublicKeyCredentialJSON = parseWebAuthnCredential(JSON.parse(pubKeyJson!));
        console.log("returned:", JSON.stringify(pubKey));
        return {
            id: pubKey,
            rawId: pubKey,
            response: {
                clientDataJSON: pubKey.response.clientDataJSON,
                getPublicKey: () => {
                    return pubKey.response.publicKey
                }
                // Add other necessary properties based on the response type
            },
            type: pubKey.type,
            authenticatorAttachment: pubKey.authenticatorAttachment,
            getClientExtensionResults: (): AuthenticationExtensionsClientOutputs => {
                return {
                    appid: undefined,
                    prf: undefined,
                    credProps: undefined,
                    hmacCreateSecret: undefined
                }
            }
        };
    });
}

export async function getCredential(getParams: CredentialRequestOptions): Promise<PublicKeyCredential> {

    console.log("before mod:", JSON.stringify(getParams));
    const serializedParams = serializeCredentialRequestOptions(getParams);
    console.log("after serial:", JSON.stringify(serializedParams))

    return await invoke<{ pubKeyJson?: string }>("plugin:p256-signer|get_credential", {
        payload: {
            getParams: JSON.stringify(serializedParams)
        }
    }).then(({pubKeyJson}) => {
        const pubKey = parseWebAuthnCredential(JSON.parse(pubKeyJson!));

        const cred: PublicKeyCredential = {
            ...pubKey,
            response: {
                ...pubKey.response,
                getPublicKey: () => {
                    return pubKey.response.publicKey
                }
            },
            getClientExtensionResults(): AuthenticationExtensionsClientOutputs {
                return {};
            }
        }
        return cred;
    });
}

export async function getWebAuthn(credential: any): Promise<{ account: WebAuthnAccount }> {
    return {
        account: toWebAuthnAccount({
            rpId: "alpha.metasig.app",
            credential,
            getFn: (creds) => getCredential(creds!)
        })
    };
}
