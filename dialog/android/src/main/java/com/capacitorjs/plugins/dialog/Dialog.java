package com.capacitorjs.plugins.dialog;

import android.app.AlertDialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.StyleSpan;
import android.widget.Button;
import android.widget.EditText;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Dialog {

    public static final String STYLE_DEFAULT = "default";
    public static final String STYLE_DESTRUCTIVE = "destructive";
    public static final String STYLE_CANCEL = "cancel";
    public static final String STYLE_PREFERRED = "preferred";

    public interface OnResultListener {
        void onResult(boolean value, boolean didCancel, String inputValue);
    }

    public interface OnCancelListener {
        void onCancel();
    }

    private static void applyButtonStyle(Button button, String style) {
        if (button == null) return;
        if (STYLE_DESTRUCTIVE.equals(style)) {
            button.setTextColor(Color.parseColor("#FF3B30")); // iOS red color
        } else if (STYLE_PREFERRED.equals(style)) {
            button.setTextColor(Color.parseColor("#007AFF")); // iOS blue color
            button.setTypeface(button.getTypeface(), Typeface.BOLD);
        }
        // default and cancel styles use system defaults
    }

    /**
     * Parses **bold** markdown syntax and returns a SpannableString
     */
    private static CharSequence parseMarkdownMessage(String message) {
        if (message == null) return "";
        
        Pattern pattern = Pattern.compile("\\*\\*(.+?)\\*\\*");
        Matcher matcher = pattern.matcher(message);
        
        // First, find all matches and calculate the final string
        StringBuilder plainText = new StringBuilder();
        java.util.List<int[]> boldRanges = new java.util.ArrayList<>();
        int lastEnd = 0;
        
        while (matcher.find()) {
            // Add text before this match
            plainText.append(message.substring(lastEnd, matcher.start()));
            
            // Record the start position for bold text
            int boldStart = plainText.length();
            String boldContent = matcher.group(1);
            plainText.append(boldContent);
            int boldEnd = plainText.length();
            
            boldRanges.add(new int[]{boldStart, boldEnd});
            lastEnd = matcher.end();
        }
        
        // Add remaining text
        plainText.append(message.substring(lastEnd));
        
        // If no bold markers found, return original message
        if (boldRanges.isEmpty()) {
            return message;
        }
        
        // Create SpannableString and apply bold spans
        SpannableString spannable = new SpannableString(plainText.toString());
        for (int[] range : boldRanges) {
            spannable.setSpan(
                new StyleSpan(Typeface.BOLD),
                range[0],
                range[1],
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            );
        }
        
        return spannable;
    }

    /**
     * Show a simple alert with a message and default values for
     * title and ok button
     * @param message the message to show
     */
    public static void alert(final Context context, final String message, final Dialog.OnResultListener listener) {
        alert(context, message, null, null, null, listener);
    }

    /**
     * Show an alert window
     * @param context the context
     * @param message the message for the alert
     * @param title the title for the alert
     * @param okButtonTitle the title for the OK button
     * @param okButtonStyle the style for the OK button (default, destructive, cancel)
     * @param listener the listener for returning data back
     */
    public static void alert(
        final Context context,
        final String message,
        final String title,
        final String okButtonTitle,
        final String okButtonStyle,
        final Dialog.OnResultListener listener
    ) {
        final String alertOkButtonTitle = okButtonTitle == null ? "OK" : okButtonTitle;
        final String alertOkButtonStyle = okButtonStyle == null ? STYLE_DEFAULT : okButtonStyle;

        new Handler(Looper.getMainLooper()).post(() -> {
            AlertDialog.Builder builder = new AlertDialog.Builder(context);

            if (title != null) {
                builder.setTitle(title);
            }
            builder
                .setMessage(parseMarkdownMessage(message))
                .setPositiveButton(alertOkButtonTitle, (dialog, buttonIndex) -> {
                    dialog.dismiss();
                    listener.onResult(true, false, null);
                })
                .setOnCancelListener((dialog) -> {
                    dialog.dismiss();
                    listener.onResult(false, true, null);
                });

            AlertDialog dialog = builder.create();
            dialog.show();

            // Apply button styling after show()
            applyButtonStyle(dialog.getButton(AlertDialog.BUTTON_POSITIVE), alertOkButtonStyle);
        });
    }

    public static void confirm(final Context context, final String message, final Dialog.OnResultListener listener) {
        confirm(context, message, null, null, null, null, null, listener);
    }

    public static void confirm(
        final Context context,
        final String message,
        final String title,
        final String okButtonTitle,
        final String cancelButtonTitle,
        final String okButtonStyle,
        final String cancelButtonStyle,
        final Dialog.OnResultListener listener
    ) {
        final String confirmOkButtonTitle = okButtonTitle == null ? "OK" : okButtonTitle;
        final String confirmCancelButtonTitle = cancelButtonTitle == null ? "Cancel" : cancelButtonTitle;
        final String confirmOkButtonStyle = okButtonStyle == null ? STYLE_DEFAULT : okButtonStyle;
        final String confirmCancelButtonStyle = cancelButtonStyle == null ? STYLE_CANCEL : cancelButtonStyle;

        new Handler(Looper.getMainLooper()).post(() -> {
            final AlertDialog.Builder builder = new AlertDialog.Builder(context);
            if (title != null) {
                builder.setTitle(title);
            }
            builder
                .setMessage(parseMarkdownMessage(message))
                .setPositiveButton(confirmOkButtonTitle, (dialog, buttonIndex) -> {
                    dialog.dismiss();
                    listener.onResult(true, false, null);
                })
                .setNegativeButton(confirmCancelButtonTitle, (dialog, buttonIndex) -> {
                    dialog.dismiss();
                    listener.onResult(false, false, null);
                })
                .setOnCancelListener((dialog) -> {
                    dialog.dismiss();
                    listener.onResult(false, true, null);
                });

            AlertDialog dialog = builder.create();
            dialog.show();

            // Apply button styling after show()
            applyButtonStyle(dialog.getButton(AlertDialog.BUTTON_POSITIVE), confirmOkButtonStyle);
            applyButtonStyle(dialog.getButton(AlertDialog.BUTTON_NEGATIVE), confirmCancelButtonStyle);
        });
    }

    public static void prompt(final Context context, final String message, final Dialog.OnResultListener listener) {
        prompt(context, message, null, null, null, null, null, null, null, listener);
    }

    public static void prompt(
        final Context context,
        final String message,
        final String title,
        final String okButtonTitle,
        final String cancelButtonTitle,
        final String inputPlaceholder,
        final String inputText,
        final String okButtonStyle,
        final String cancelButtonStyle,
        final Dialog.OnResultListener listener
    ) {
        final String promptOkButtonTitle = okButtonTitle == null ? "OK" : okButtonTitle;
        final String promptCancelButtonTitle = cancelButtonTitle == null ? "Cancel" : cancelButtonTitle;
        final String promptInputPlaceholder = inputPlaceholder == null ? "" : inputPlaceholder;
        final String promptInputText = inputText == null ? "" : inputText;
        final String promptOkButtonStyle = okButtonStyle == null ? STYLE_DEFAULT : okButtonStyle;
        final String promptCancelButtonStyle = cancelButtonStyle == null ? STYLE_CANCEL : cancelButtonStyle;

        new Handler(Looper.getMainLooper()).post(() -> {
            final AlertDialog.Builder builder = new AlertDialog.Builder(context);
            final EditText input = new EditText(context);

            input.setHint(promptInputPlaceholder);
            input.setText(promptInputText);
            if (title != null) {
                builder.setTitle(title);
            }
            builder
                .setMessage(parseMarkdownMessage(message))
                .setView(input)
                .setPositiveButton(promptOkButtonTitle, (dialog, buttonIndex) -> {
                    dialog.dismiss();

                    String inputText1 = input.getText().toString().trim();
                    listener.onResult(true, false, inputText1);
                })
                .setNegativeButton(promptCancelButtonTitle, (dialog, buttonIndex) -> {
                    dialog.dismiss();
                    listener.onResult(false, true, null);
                })
                .setOnCancelListener((dialog) -> {
                    dialog.dismiss();
                    listener.onResult(false, true, null);
                });

            AlertDialog dialog = builder.create();
            dialog.show();

            // Apply button styling after show()
            applyButtonStyle(dialog.getButton(AlertDialog.BUTTON_POSITIVE), promptOkButtonStyle);
            applyButtonStyle(dialog.getButton(AlertDialog.BUTTON_NEGATIVE), promptCancelButtonStyle);
        });
    }
}
