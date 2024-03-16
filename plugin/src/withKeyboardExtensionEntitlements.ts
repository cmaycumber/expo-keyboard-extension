import plist from "@expo/plist";
import { ConfigPlugin, withEntitlementsPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  getAppBundleIdentifier,
  getAppGroups,
  getKeyboardExtensionName,
} from "./index";


export const withKeyboardExtensionEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    const targetName = getKeyboardExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );
    const filePath = path.join(targetPath, `${targetName}.entitlements`);

    const bundleIdentifier = getAppBundleIdentifier(config);

    let keyboardExtensionEntitlements: Record<string, string | string[]> = {
      "com.apple.security.application-groups": getAppGroups(bundleIdentifier),
    };

    if (config.ios?.usesAppleSignIn) {
      keyboardExtensionEntitlements = {
        ...keyboardExtensionEntitlements,
        "com.apple.developer.applesignin": ["Default"],
      };
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, plist.build(keyboardExtensionEntitlements));

    return config;
  });
};