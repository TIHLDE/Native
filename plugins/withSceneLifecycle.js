// The iOS 27 SDK refuses to launch apps that haven't adopted the UIScene life
// cycle. Expo SDK 57's prebuild template predates that, so this ports SDK 58's
// setup: a SceneDelegate built on `ExpoAppSceneDelegate` (already shipped by the
// `expo` package), the scene manifest in Info.plist, and an AppDelegate that
// leaves creating the window and starting React Native to the scene.
// Delete this plugin once the app is on Expo SDK 58.
const fs = require("fs");
const path = require("path");
const {
  IOSConfig,
  withAppDelegate,
  withInfoPlist,
  withXcodeProject,
} = require("expo/config-plugins");

const SCENE_DELEGATE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

const PROVIDER_CONFORMANCE = "ExpoAppDelegate, ExpoReactNativeFactoryProvider {";

const START_IN_APP_DELEGATE =
  /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([^)]*\)\n#endif\n\n?/;

const START_IN_SCENE = `    // The window is created and React Native is started by \`SceneDelegate\` under the
    // scene-based life cycle (required by the iOS 27 SDK).
`;

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });

const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes(PROVIDER_CONFORMANCE)) {
      return config;
    }
    // Fail the prebuild rather than generate an app that crashes at launch
    // if a template update changes what these patterns expect.
    if (
      !contents.includes("ExpoAppDelegate {") ||
      !START_IN_APP_DELEGATE.test(contents)
    ) {
      throw new Error(
        "withSceneLifecycle: AppDelegate.swift doesn't match the Expo SDK 57 template; update the plugin.",
      );
    }
    contents = contents
      .replace("ExpoAppDelegate {", PROVIDER_CONFORMANCE)
      .replace(START_IN_APP_DELEGATE, START_IN_SCENE);
    config.modResults.contents = contents;
    return config;
  });

const withSceneDelegateFile = (config) =>
  withXcodeProject(config, (config) => {
    const { projectRoot, platformProjectRoot } = config.modRequest;
    const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
    fs.writeFileSync(
      path.join(platformProjectRoot, projectName, "SceneDelegate.swift"),
      SCENE_DELEGATE,
    );
    // Skips the file if it's already in the project, so re-running prebuild is safe.
    config.modResults = IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${projectName}/SceneDelegate.swift`,
      groupName: projectName,
      project: config.modResults,
    });
    return config;
  });

module.exports = (config) =>
  withSceneDelegateFile(withSceneAppDelegate(withSceneManifest(config)));
