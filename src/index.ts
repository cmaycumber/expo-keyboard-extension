import ExpoKeyboardExtensionModule from "./ExpoKeyboardExtensionModule";

export function close(): void {
  return ExpoKeyboardExtensionModule.close();
}

export function addText(text: string): void {
  return ExpoKeyboardExtensionModule.addText(text);
}

export interface IExtensionPreprocessingJS {
  run: (args: { completionFunction: (data: unknown) => void }) => void;
  finalize: (args: unknown) => void;
}
