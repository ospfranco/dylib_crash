import OpacityCoreSwift
import UIKit

class ViewController: UIViewController, UITextFieldDelegate {

  var buttons: [(String, () async throws -> Void)]!

  override func viewDidLoad() {
    super.viewDidLoad()

    do {
      try OpacitySwiftWrapper.initialize()
      let successLabel = UILabel()
      successLabel.text = "✅ SDK initialized successfully"
      successLabel.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(successLabel)
      NSLayoutConstraint.activate([
        successLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        successLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 50),
        successLabel.widthAnchor.constraint(equalTo: view.widthAnchor, constant: -20),
      ])
      successLabel.numberOfLines = 0
      successLabel.lineBreakMode = .byWordWrapping
    } catch {
      let errorLabel = UILabel()
      errorLabel.text =
        "🔺 SDK init error: \(error)"
      errorLabel.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(errorLabel)
      NSLayoutConstraint.activate([
        errorLabel.centerXAnchor.constraint(
          equalTo: view.centerXAnchor),
        errorLabel.topAnchor.constraint(
          equalTo: view.topAnchor, constant: 50),
        errorLabel.widthAnchor.constraint(
          equalTo: view.widthAnchor, constant: -20),
      ])
      errorLabel.numberOfLines = 0
      errorLabel.lineBreakMode = .byWordWrapping
      view.addSubview(errorLabel)
      return
    }

  }

  func showGreenToast(message: String) {
    let toastLabel = UILabel()
    toastLabel.accessibilityIdentifier = "greenToast"
    toastLabel.backgroundColor = UIColor.green.withAlphaComponent(0.6)
    toastLabel.textColor = UIColor.white
    toastLabel.textAlignment = .center
    toastLabel.font = UIFont(name: "Montserrat-Light", size: 12.0)
    toastLabel.text = message
    toastLabel.alpha = 1.0
    toastLabel.layer.cornerRadius = 10
    toastLabel.clipsToBounds = true
    toastLabel.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(toastLabel)

    NSLayoutConstraint.activate([
      toastLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      toastLabel.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -100),
      toastLabel.widthAnchor.constraint(equalTo: view.widthAnchor, constant: -40),
      toastLabel.heightAnchor.constraint(equalToConstant: 35),
    ])

    DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
      toastLabel.removeFromSuperview()
    }
  }

  func showRedToast(message: String) {
    print(message)
    let toastLabel = UILabel()
    toastLabel.accessibilityIdentifier = "redToast"
    toastLabel.backgroundColor = UIColor.red.withAlphaComponent(0.6)
    toastLabel.textColor = UIColor.white
    toastLabel.textAlignment = .center
    toastLabel.font = UIFont(name: "Montserrat-Light", size: 12.0)
    toastLabel.text = message
    toastLabel.alpha = 1.0
    toastLabel.layer.cornerRadius = 10
    toastLabel.clipsToBounds = true
    toastLabel.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(toastLabel)

    NSLayoutConstraint.activate([
      toastLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      toastLabel.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -100),
      toastLabel.widthAnchor.constraint(equalTo: view.widthAnchor, constant: -40),
      toastLabel.heightAnchor.constraint(equalToConstant: 35),
    ])

    DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
      toastLabel.removeFromSuperview()
    }
  }
}
