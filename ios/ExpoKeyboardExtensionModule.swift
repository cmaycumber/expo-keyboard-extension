import ExpoModulesCore

public class ExpoKeyboardExtensionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoKeyboardExtension")

    Function("close") { () in
      NotificationCenter.default.post(name: NSNotification.Name("close"), object: nil)
    }

    Function("addText") { (text: String) -> Void in
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: "addKey"), object: text)
    }
  }
}
