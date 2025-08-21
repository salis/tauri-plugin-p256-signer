
import Foundation

#if canImport(Tauri)
import Tauri
import SwiftRs

@available(iOS 17, *)
public class P256SignerPlugin: Plugin {
    private let bridge = P256SignerPluginBridge()

    @objc public func create_credential(_ invoke: Any) -> Void {
        // Host should call the bridge.createCredential with JSON string and expect callback
    }

    @objc public func get_credential(_ invoke: Any) -> Void {
    }

    @objc public func sign(_ invoke: Any) -> Void {
    }
}

@_cdecl("init_plugin_p256_signer")
@available(iOS 17, *)
func initPlugin() -> Plugin {
  return P256SignerPlugin()
}
#else
@_cdecl("init_plugin_p256_signer")
public func initPluginP256Signer() -> UnsafeMutableRawPointer? {
    return nil
}
#endif
