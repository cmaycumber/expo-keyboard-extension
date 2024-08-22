import UIKit
import React
import SwiftUI

class KeyboardViewController: UIInputViewController {
  
  private static var sharedBridge: RCTBridge?
  private weak var rootView: RCTRootView?
  private let loadingIndicator = UIActivityIndicatorView(style: .large)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    setupLoadingIndicator()
    initializeReactNativeBridgeIfNeeded()
    loadReactNativeContent()
    setupNotificationCenterObserver()
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    // we need to clean up when the view is closed via a swipe
    cleanupAfterClose()
  }
  
  func close() {
    self.dismissKeyboard()
    // we need to clean up when the view is closed via the close() method in react native
    cleanupAfterClose()
  }
  
  private func setupLoadingIndicator() {
    view.addSubview(loadingIndicator)
    loadingIndicator.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      loadingIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      loadingIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
    ])
    loadingIndicator.startAnimating()
  }
  
  private func initializeReactNativeBridgeIfNeeded() {
    if KeyboardViewController.sharedBridge == nil {
      let jsCodeLocation = self.jsCodeLocation()
      KeyboardViewController.sharedBridge = RCTBridge(bundleURL: jsCodeLocation, moduleProvider: nil, launchOptions: nil)
    }
  }
  
  private func loadReactNativeContent() {
    guard let bridge = KeyboardViewController.sharedBridge else { return }
    
    DispatchQueue.main.async {
      if self.rootView == nil {
        let rootView = RCTRootView(bridge: bridge, moduleName: "keyboardExtension", initialProperties: nil)
        let backgroundFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "KeyboardExtensionBackgroundColor") as? [String: CGFloat]
        let heightFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "KeyboardExtensionHeight") as? CGFloat
        self.configureRootView(rootView, withBackgroundColorDict: backgroundFromInfoPlist, withHeight: heightFromInfoPlist)
        self.rootView = rootView
      }
      self.loadingIndicator.stopAnimating()
      self.loadingIndicator.removeFromSuperview()
    }
  }
  
  private func setupNotificationCenterObserver() {
    NotificationCenter.default.addObserver(forName: NSNotification.Name("close"), object: nil, queue: nil) { [weak self] _ in
      DispatchQueue.main.async {
        self?.close()
      }
    }
    NotificationCenter.default.addObserver(forName: NSNotification.Name(rawValue: "addKey"), object: nil, queue: nil) { notification in
        if let text = notification.object as? String {
            self.textDocumentProxy.insertText(text)
        }
    }
  }
  
  private func cleanupAfterClose() {
    rootView?.removeFromSuperview()
    rootView = nil
    KeyboardViewController.sharedBridge?.invalidate()
    KeyboardViewController.sharedBridge = nil
    NotificationCenter.default.removeObserver(self)
  }
  
  private func configureRootView(_ rootView: RCTRootView, withBackgroundColorDict dict: [String: CGFloat]?, withHeight: CGFloat?) {
    rootView.backgroundColor = backgroundColor(from: dict)
    let y: CGFloat
    if let withHeight = withHeight {
      // If withHeight is set, calculate y so the view is at the bottom
      y = self.view.bounds.height - withHeight
    } else {
      // If withHeight is nil, use the full height (or adjust as needed)
      y = 0 // This would make the view cover the entire keyboard area
    }
    rootView.frame = CGRect(
      x: self.view.bounds.minX,
      y: y,
      width: self.view.bounds.width,
      height: withHeight ?? self.view.bounds.height
    )
    rootView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    view.addKeyboardSubview(rootView, withHeight: withHeight ?? self.view.bounds.height)
  }
  
  private func jsCodeLocation() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.keyboard")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
  private func backgroundColor(from dict: [String: CGFloat]?) -> UIColor {
    guard let dict = dict else { return .white }
    let red = dict["red"] ?? 255.0
    let green = dict["green"] ?? 255.0
    let blue = dict["blue"] ?? 255.0
    let alpha = dict["alpha"] ?? 1
    return UIColor(red: red / 255.0, green: green / 255.0, blue: blue / 255.0, alpha: alpha)
  }
}


extension UIView {
  func addKeyboardSubview(_ subview: UIView, withHeight: CGFloat) {
    subview.translatesAutoresizingMaskIntoConstraints = false
      
      subview.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      subview.backgroundColor = UIColor.systemBlue
             
   
    addSubview(subview)
    NSLayoutConstraint.activate([
      subview.leftAnchor.constraint(equalTo: leftAnchor),
      subview.rightAnchor.constraint(equalTo: rightAnchor),
      subview.topAnchor.constraint(equalTo: topAnchor),
      subview.bottomAnchor.constraint(equalTo: bottomAnchor),
      subview.heightAnchor.constraint(equalToConstant: withHeight) 
    ])
  }
}
