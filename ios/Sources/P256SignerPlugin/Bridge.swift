
import Foundation

public final class P256SignerPluginBridge {
    private let core = P256SignerPluginCore()

    public init() {}

    public func createCredential(json: String, completion: @escaping (String) -> Void) {
        do {
            let params = try JSONDecoder().decode(CreateCredentialParams.self, from: Data(json.utf8))
            core.createCredential(params: params) { result in
                completion(Self.encode(result: result))
            }
        } catch {
            completion(Self.errorJSON(error))
        }
    }

    public func getCredential(json: String, completion: @escaping (String) -> Void) {
        do {
            let params = try JSONDecoder().decode(GetCredentialParams.self, from: Data(json.utf8))
            core.getCredential(params: params) { result in
                completion(Self.encode(result: result))
            }
        } catch {
            completion(Self.errorJSON(error))
        }
    }

    public func sign(json: String, completion: @escaping (String) -> Void) {
        do {
            let params = try JSONDecoder().decode(SignParams.self, from: Data(json.utf8))
            core.sign(params: params) { result in
                completion(Self.encode(result: result))
            }
        } catch {
            completion(Self.errorJSON(error))
        }
    }

    private static func encode<T: Codable>(result: Result<T, Error>) -> String {
        switch result {
        case .success(let value):
            let enc = JSONEncoder()
            let data = (try? enc.encode(value)) ?? Data("{}".utf8)
            let payload: [String: Any] = ["ok": true, "data": String(data: data, encoding: .utf8) ?? "{}"]
            return toJSONString(payload)
        case .failure(let error):
            return errorJSON(error)
        }
    }

    private static func errorJSON(_ error: Error) -> String {
        let payload: [String: Any] = [
            "ok": false,
            "error": (error as NSError).localizedDescription
        ]
        return toJSONString(payload)
    }

    private static func toJSONString(_ obj: Any) -> String {
        if let data = try? JSONSerialization.data(withJSONObject: obj, options: []) {
            return String(data: data, encoding: .utf8) ?? "{}"
        }
        return "{}"
    }
}
