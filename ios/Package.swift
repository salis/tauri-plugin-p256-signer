// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "P256SignerPlugin",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "P256SignerPlugin", targets: ["P256SignerPlugin"])
    ],
    targets: [
        .target(
            name: "P256SignerPlugin",
            dependencies: [],
            path: "Sources/P256SignerPlugin"
        ),
        .testTarget(
            name: "P256SignerPluginTests",
            dependencies: ["P256SignerPlugin"],
            path: "Tests/P256SignerPluginTests"
        ),
    ]
)
