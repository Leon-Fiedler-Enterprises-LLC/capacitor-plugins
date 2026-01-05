import Foundation
import Capacitor

/**
 * Implement three common dialog types: alert, confirm, and prompt
 */
@objc(DialogPlugin)
public class DialogPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DialogPlugin"
    public let jsName = "Dialog"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "alert", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "prompt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "confirm", returnType: CAPPluginReturnPromise)
    ]

    private func getAlertActionStyle(from styleString: String?) -> UIAlertAction.Style {
        switch styleString {
        case "destructive":
            return .destructive
        case "cancel":
            return .cancel
        default:
            // "default" and "preferred" both use .default style
            // "preferred" is handled separately via preferredAction
            return .default
        }
    }

    private func isPreferredStyle(_ styleString: String?) -> Bool {
        return styleString == "preferred"
    }

    /// Checks if message contains **bold** markdown
    private func containsBoldMarkdown(_ message: String) -> Bool {
        return message.contains("**")
    }

    /// Parses **bold** markdown syntax and returns an NSAttributedString
    /// Uses the same font as UIAlertController's default message font (13pt regular)
    private func parseMarkdownMessage(_ message: String) -> NSAttributedString {
        let result = NSMutableAttributedString()
        let pattern = "\\*\\*(.+?)\\*\\*"
        
        // UIAlertController uses 13pt font for message
        let fontSize: CGFloat = 13
        let regularFont = UIFont.systemFont(ofSize: fontSize)
        let boldFont = UIFont.boldSystemFont(ofSize: fontSize)
        
        guard let regex = try? NSRegularExpression(pattern: pattern, options: []) else {
            return NSAttributedString(string: message, attributes: [.font: regularFont])
        }
        
        let nsMessage = message as NSString
        var lastEnd = 0
        
        let matches = regex.matches(in: message, options: [], range: NSRange(location: 0, length: nsMessage.length))
        
        for match in matches {
            // Add text before this match (normal)
            if match.range.location > lastEnd {
                let normalRange = NSRange(location: lastEnd, length: match.range.location - lastEnd)
                let normalText = nsMessage.substring(with: normalRange)
                result.append(NSAttributedString(string: normalText, attributes: [.font: regularFont]))
            }
            
            // Add the bold text (captured group 1)
            if match.numberOfRanges > 1 {
                let boldText = nsMessage.substring(with: match.range(at: 1))
                result.append(NSAttributedString(string: boldText, attributes: [.font: boldFont]))
            }
            
            lastEnd = match.range.location + match.range.length
        }
        
        // Add remaining text after last match
        if lastEnd < nsMessage.length {
            let remainingText = nsMessage.substring(from: lastEnd)
            result.append(NSAttributedString(string: remainingText, attributes: [.font: regularFont]))
        }
        
        return result
    }

    /// Sets the attributed message on a UIAlertController using KVC
    private func setAttributedMessage(_ attributedMessage: NSAttributedString, on alert: UIAlertController) {
        alert.setValue(attributedMessage, forKey: "attributedMessage")
    }

    @objc public func alert(_ call: CAPPluginCall) {
        let title = call.options["title"] as? String
        guard let message = call.options["message"] as? String else {
            call.reject("Please provide a message for the dialog")
            return
        }
        let buttonTitle = call.options["buttonTitle"] as? String ?? "OK"
        let buttonStyle = call.options["buttonStyle"] as? String

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Only use attributed string if message contains bold markdown, otherwise use native message
            let useAttributed = self.containsBoldMarkdown(message)
            let alert = UIAlertController(title: title, message: useAttributed ? nil : message, preferredStyle: UIAlertController.Style.alert)
            
            if useAttributed {
                let attributedMessage = self.parseMarkdownMessage(message)
                self.setAttributedMessage(attributedMessage, on: alert)
            }
            
            let action = UIAlertAction(title: buttonTitle, style: self.getAlertActionStyle(from: buttonStyle), handler: { (_) in
                call.resolve()
            })
            alert.addAction(action)
            
            // Set as preferred action for emphasized bold blue button
            if self.isPreferredStyle(buttonStyle) {
                alert.preferredAction = action
            }
            
            self.bridge?.viewController?.present(alert, animated: true, completion: nil)
        }
    }

    @objc public func confirm(_ call: CAPPluginCall) {
        let title = call.options["title"] as? String
        guard let message = call.options["message"] as? String else {
            call.reject("Please provide a message for the dialog")
            return
        }
        let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
        let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
        let okButtonStyle = call.options["okButtonStyle"] as? String
        let cancelButtonStyle = call.options["cancelButtonStyle"] as? String ?? "cancel"

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Only use attributed string if message contains bold markdown, otherwise use native message
            let useAttributed = self.containsBoldMarkdown(message)
            let alert = UIAlertController(title: title, message: useAttributed ? nil : message, preferredStyle: UIAlertController.Style.alert)
            
            if useAttributed {
                let attributedMessage = self.parseMarkdownMessage(message)
                self.setAttributedMessage(attributedMessage, on: alert)
            }
            
            let cancelAction = UIAlertAction(title: cancelButtonTitle, style: self.getAlertActionStyle(from: cancelButtonStyle), handler: { (_) in
                call.resolve([
                    "value": false
                ])
            })
            alert.addAction(cancelAction)
            
            let okAction = UIAlertAction(title: okButtonTitle, style: self.getAlertActionStyle(from: okButtonStyle), handler: { (_) in
                call.resolve([
                    "value": true
                ])
            })
            alert.addAction(okAction)
            
            // Set preferred action for emphasized bold blue button
            if self.isPreferredStyle(okButtonStyle) {
                alert.preferredAction = okAction
            } else if self.isPreferredStyle(cancelButtonStyle) {
                alert.preferredAction = cancelAction
            }
            
            self.bridge?.viewController?.present(alert, animated: true, completion: nil)
        }
    }

    @objc public func prompt (_ call: CAPPluginCall) {
        let title = call.options["title"] as? String
        guard let message = call.options["message"] as? String else {
            call.reject("Please provide a message for the dialog")
            return
        }
        let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
        let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
        let inputPlaceholder = call.options["inputPlaceholder"] as? String ?? ""
        let inputText = call.options["inputText"] as? String ?? ""
        let okButtonStyle = call.options["okButtonStyle"] as? String
        let cancelButtonStyle = call.options["cancelButtonStyle"] as? String ?? "cancel"

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Only use attributed string if message contains bold markdown, otherwise use native message
            let useAttributed = self.containsBoldMarkdown(message)
            let alert = UIAlertController(title: title, message: useAttributed ? nil : message, preferredStyle: UIAlertController.Style.alert)
            
            if useAttributed {
                let attributedMessage = self.parseMarkdownMessage(message)
                self.setAttributedMessage(attributedMessage, on: alert)
            }

            alert.addTextField { (textField) in
                textField.placeholder = inputPlaceholder
                textField.text = inputText
            }

            let cancelAction = UIAlertAction(title: cancelButtonTitle, style: self.getAlertActionStyle(from: cancelButtonStyle), handler: { (_) in
                call.resolve([
                    "value": "",
                    "cancelled": true
                ])
            })
            alert.addAction(cancelAction)
            
            let okAction = UIAlertAction(title: okButtonTitle, style: self.getAlertActionStyle(from: okButtonStyle), handler: { (_) in
                let textField = alert.textFields?[0]
                call.resolve([
                    "value": textField?.text ?? "",
                    "cancelled": false
                ])
            })
            alert.addAction(okAction)

            // Set preferred action for emphasized bold blue button
            if self.isPreferredStyle(okButtonStyle) {
                alert.preferredAction = okAction
            } else if self.isPreferredStyle(cancelButtonStyle) {
                alert.preferredAction = cancelAction
            }

            self.bridge?.viewController?.present(alert, animated: true, completion: nil)
        }
    }
}
