
import Foundation
#if canImport(Tauri)
import Tauri
import SwiftRs
#endif

@objc public class P256SignerPlugin: NSObject {
    private let bridge = P256SignerPluginBridge()

    @objc public func create_credential(_ invoke: Any) -> Void {
        // Host should call the bridge.createCredential with JSON string and expect callback
    }

    @objc public func get_credential(_ invoke: Any) -> Void {
    }

    @objc public func sign(_ invoke: Any) -> Void {
    }
}

#if canImport(Tauri)
extension P256SignerPlugin: Plugin {
    public func register(with app: TauriApp) {
        app.register(command: "create_credential") { (json: String, completion: @escaping (String) -> Void) in
            self.bridge.createCredential(json: json, completion: completion)
        }
        app.register(command: "get_credential") { (json: String, completion: @escaping (String) -> Void) in
            self.bridge.getCredential(json: json, completion: completion)
        }
        app.register(command: "sign") { (json: String, completion: @escaping (String) -> Void) in
            self.bridge.sign(json: json, completion: completion)
        }
    }
}

@_cdecl("init_plugin_p256_signer")
func initPlugin() -> Plugin {
  return P256SignerPlugin()
}
#else
@_cdecl("init_plugin_p256_signer")
public func initPluginP256Signer() -> UnsafeMutableRawPointer? {
    return nil
}
#endif
