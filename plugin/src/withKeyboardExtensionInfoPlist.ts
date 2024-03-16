import plist from "@expo/plist";
import { ConfigPlugin, InfoPlist, withInfoPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  type BackgroundColor,
  type Height,
  getKeyboardExtensionName,
} from "./index";


export const withKeyboardExtensionInfoPlist: ConfigPlugin<{
  fonts: string[];
  backgroundColor?: BackgroundColor;
  height?: Height;
  preprocessingFile?: string;
}> = (config, { fonts = [], backgroundColor, height, preprocessingFile }) => {
  return withInfoPlist(config, (config) => {
    const targetName = getKeyboardExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );

    const filePath = path.join(targetPath, "Info.plist");

    let infoPlist: InfoPlist = {
      CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
      CFBundleDisplayName: "$(PRODUCT_NAME) Keyboard Extension",
      CFBundleExecutable: "$(EXECUTABLE_NAME)",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleInfoDictionaryVersion: "6.0",
      CFBundleName: "$(PRODUCT_NAME)",
      CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
      CFBundleShortVersionString: "$(MARKETING_VERSION)",
      CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
      LSRequiresIPhoneOS: true,
      NSAppTransportSecurity: {
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: true,
          },
        },
      },
      UIRequiredDeviceCapabilities: ["armv7"],
      UIStatusBarStyle: "UIStatusBarStyleDefault",
      UISupportedInterfaceOrientations: [
        "UIInterfaceOrientationPortrait",
        "UIInterfaceOrientationPortraitUpsideDown",
      ],
      UIUserInterfaceStyle: "Light",
      UIViewControllerBasedStatusBarAppearance: false,
      UIApplicationSceneManifest: {
        UIApplicationSupportsMultipleScenes: true,
        UISceneConfigurations: {},
      },
      UIAppFonts: fonts.map((font) => path.basename(font)) ?? [],
      NSExtension: {
        NSExtensionAttributes: {
          IsASCIICapable: false,
          PrefersRightToLeft: false,
          PrimaryLanguage: "en-US",
          RequestsOpenAccess: false,
        },
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).KeyboardViewController",
        NSExtensionPointIdentifier: "com.apple.keyboard-service",
      },
      KeyboardExtensionBackgroundColor: backgroundColor,
      KeyboardExtensionHeight: height,
    };

    if (config.ios?.usesAppleSignIn) {
      infoPlist = {
        ...infoPlist,
        CFBundleAllowedMixedLocalizations:
          config.modResults.CFBundleAllowMixedLocalizations ?? true,
      };
    }

    fs.mkdirSync(path.dirname(filePath), {
      recursive: true,
    });
    fs.writeFileSync(filePath, plist.build(infoPlist));

    return config;
  });
};