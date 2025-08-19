
import Foundation
import AuthenticationServices
import UIKit

final class DefaultPresentationContext: NSObject, ASAuthorizationControllerPresentationContextProviding {
    static let shared = DefaultPresentationContext()
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        let scenes = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
        let window = scenes.first?.windows.first { $0.isKeyWindow } ?? scenes.first?.windows.first
        return window ?? ASPresentationAnchor()
    }
}
