
import Foundation

#if canImport(Tauri)
import Tauri

@objc(P256SignerPlugin)
public class P256SignerPlugin: NSObject, TauriPlugin {
    private let bridge = P256SignerPluginBridge()

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
#else
// Lightweight shims so the package can compile outside Tauri builds.
@objc public protocol _ShimTauriPlugin {}

@objc public class P256SignerPlugin: NSObject {
    // No-op; host without Tauri should not try to register commands.
}
#endif
