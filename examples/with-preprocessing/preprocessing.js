class KeyboardExtensionPreprocessor {
  run(args) {
    args.completionFunction({
      title: document.title,
    });
  }
}

var ExtensionPreprocessingJS = new KeyboardExtensionPreprocessor();
