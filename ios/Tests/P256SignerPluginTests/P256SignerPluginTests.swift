
import XCTest
@testable import P256SignerPlugin

final class P256SignerPluginTests: XCTestCase {
    func testBase64URLRoundtrip() throws {
        let bytes = Data([0,1,2,3,250,251,252,253,254,255])
        let s = Base64URL.encode(bytes)
        let decoded = try Base64URL.decode(s)
        XCTAssertEqual(decoded, bytes)
        XCTAssertFalse(s.contains("+"))
        XCTAssertFalse(s.contains("/"))
        XCTAssertFalse(s.contains("="))
    }

    func testBridgeEncodesErrors() {
        let bridge = P256SignerPluginBridge()
        // Missing fields -> decode error -> ok:false JSON
        let expectation = XCTestExpectation(description: "error json")
        bridge.createCredential(json: "{}") { json in
            XCTAssertTrue(json.contains("\"ok\":false"))
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 1.0)
    }
}
