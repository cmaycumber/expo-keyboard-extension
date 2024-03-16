import ExpoModulesCore

public class ExpoKeyboardExtensionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoKeyboardExtension")

    Function("close") { () in
      NotificationCenter.default.post(name: NSNotification.Name("close"), object: nil)
    }
  }
}
