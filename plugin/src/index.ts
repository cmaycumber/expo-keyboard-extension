import { type ExpoConfig } from "@expo/config-types";
import { ConfigPlugin, IOSConfig, withPlugins } from "expo/config-plugins";
import { z } from "zod";

import { withAppEntitlements } from "./withAppEntitlements";
import { withExpoConfig } from "./withExpoConfig";
import { withPodfile } from "./withPodfile";
import { withKeyboardExtensionEntitlements } from "./withKeyboardExtensionEntitlements";
import { withKeyboardExtensionInfoPlist } from "./withKeyboardExtensionInfoPlist";
import { withKeyboardExtensionTarget } from "./withKeyboardExtensionTarget";

export const getAppGroups = (identifier: string) => [`group.${identifier}`];

export const getAppBundleIdentifier = (config: ExpoConfig) => {
  if (!config.ios?.bundleIdentifier) {
    throw new Error("No bundle identifier");
  }
  return config.ios?.bundleIdentifier;
};

export const getKeyboardExtensionBundleIdentifier = (config: ExpoConfig) => {
  return `${getAppBundleIdentifier(config)}.KeyboardExtension`;
};

export const getKeyboardExtensionName = (config: ExpoConfig) => {
  return `${IOSConfig.XcodeUtils.sanitizedName(config.name)}KeyboardExtension`;
};

export const getKeyboardExtensionEntitlementsFileName = (config: ExpoConfig) => {
  const name = getKeyboardExtensionName(config);
  return `${name}.entitlements`;
};

const rgbaSchema = z.object({
  red: z.number().min(0).max(255),
  green: z.number().min(0).max(255),
  blue: z.number().min(0).max(255),
  alpha: z.number().min(0).max(1),
});

export type BackgroundColor = z.infer<typeof rgbaSchema>;

const heightSchema = z.number().int().min(50).max(1000);

export type Height = z.infer<typeof heightSchema>;

const withKeyboardExtension: ConfigPlugin<{
  backgroundColor?: BackgroundColor;
  height?: Height;
  excludedPackages?: string[];
  googleServicesFile?: string;
  preprocessingFile?: string;
}> = (config, props) => {
  if (props?.backgroundColor) {
    rgbaSchema.parse(props.backgroundColor);
  }

  const expoFontPlugin = config.plugins?.find(
    (p) => Array.isArray(p) && p.length && p.at(0) === "expo-font"
  );

  const fonts = expoFontPlugin?.at(1).fonts ?? [];

  return withPlugins(config, [
    withExpoConfig,
    withAppEntitlements,
    [withPodfile, { excludedPackages: props?.excludedPackages ?? [] }],
    [
      withKeyboardExtensionInfoPlist,
      {
        fonts,
        backgroundColor: props?.backgroundColor,
        height: props?.height,
        preprocessingFile: props.preprocessingFile,
      },
    ],
    withKeyboardExtensionEntitlements,
    [
      withKeyboardExtensionTarget,
      {
        fonts,
        googleServicesFile: props?.googleServicesFile,
        preprocessingFile: props.preprocessingFile,
      },
    ],
  ]);
};

export default withKeyboardExtension;
