// The CMake 3.22.1 that Android builds use by default comes with a Ninja that
// can't handle paths over 260 characters on Windows, and the native paths in
// react-native-gesture-handler 3 are longer than that. Windows builds therefore
// use CMake 3.31.6. EAS and macOS don't need it, and EAS doesn't have it.
module.exports = ({ config }) => {
    if (process.platform !== "win32") {
        return config;
    }

    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            ["expo-build-properties", { android: { cmakeVersion: "3.31.6" } }],
        ],
    };
};
