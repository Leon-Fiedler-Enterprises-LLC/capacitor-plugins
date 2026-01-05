/**
 * The style of a button in a dialog.
 *
 * - `'default'`: Standard action button (normal text)
 * - `'destructive'`: Dangerous action button (red on all platforms) - use for delete, remove, etc.
 * - `'cancel'`: Cancel/dismiss button
 * - `'preferred'`: Emphasized primary action button (bold blue on iOS) - the prominent "fat" button
 *
 * @since 6.0.0
 */
export type ButtonStyle = 'default' | 'destructive' | 'cancel' | 'preferred';

export interface AlertOptions {
  /**
   * Title of the dialog.
   *
   * @since 1.0.0
   */
  title?: string;

  /**
   * Message to show on the dialog.
   * Supports **bold** text using double asterisks.
   *
   * @example "Are you sure you want to delete **this item**?"
   * @since 1.0.0
   */
  message: string;

  /**
   * Text to use on the action button.
   *
   * @default "OK"
   * @since 1.0.0
   */
  buttonTitle?: string;

  /**
   * Style of the action button.
   *
   * - `'default'`: Standard text
   * - `'destructive'`: Red text (for dangerous actions like delete)
   * - `'cancel'`: Cancel style
   * - `'preferred'`: Emphasized bold blue button (the prominent primary action)
   *
   * @default "default"
   * @since 6.0.0
   */
  buttonStyle?: ButtonStyle;
}

export interface PromptOptions {
  /**
   * Title of the dialog.
   *
   * @since 1.0.0
   */
  title?: string;

  /**
   * Message to show on the dialog.
   * Supports **bold** text using double asterisks.
   *
   * @example "Enter the name for **your new file**:"
   * @since 1.0.0
   */
  message: string;

  /**
   * Text to use on the positive action button.
   *
   * @default "OK"
   * @since 1.0.0
   */
  okButtonTitle?: string;

  /**
   * Style of the positive action button.
   *
   * @default "default"
   * @since 6.0.0
   */
  okButtonStyle?: ButtonStyle;

  /**
   * Text to use on the negative action button.
   *
   * @default "Cancel"
   * @since 1.0.0
   */
  cancelButtonTitle?: string;

  /**
   * Style of the negative action button.
   *
   * @default "cancel"
   * @since 6.0.0
   */
  cancelButtonStyle?: ButtonStyle;

  /**
   * Placeholder text for hints.
   *
   * @since 1.0.0
   */
  inputPlaceholder?: string;

  /**
   * Prepopulated text.
   *
   * @since 1.0.0
   */
  inputText?: string;
}

export interface ConfirmOptions {
  /**
   * Title of the dialog.
   *
   * @since 1.0.0
   */
  title?: string;

  /**
   * Message to show on the dialog.
   * Supports **bold** text using double asterisks.
   *
   * @example "Are you sure you want to delete **this item**?"
   * @since 1.0.0
   */
  message: string;

  /**
   * Text to use on the positive action button.
   *
   * @default "OK"
   * @since 1.0.0
   */
  okButtonTitle?: string;

  /**
   * Style of the positive action button.
   *
   * @default "default"
   * @since 6.0.0
   */
  okButtonStyle?: ButtonStyle;

  /**
   * Text to use on the negative action button.
   *
   * @default "Cancel"
   * @since 1.0.0
   */
  cancelButtonTitle?: string;

  /**
   * Style of the negative action button.
   *
   * @default "cancel"
   * @since 6.0.0
   */
  cancelButtonStyle?: ButtonStyle;
}

export interface PromptResult {
  /**
   * Text entered on the prompt.
   *
   * @since 1.0.0
   */
  value: string;

  /**
   * Whether if the prompt was canceled or accepted.
   *
   * @since 1.0.0
   */
  cancelled: boolean;
}

export interface ConfirmResult {
  /**
   * true if the positive button was clicked, false otherwise.
   *
   * @since 1.0.0
   */
  value: boolean;
}

export interface DialogPlugin {
  /**
   * Show an alert dialog
   *
   * @since 1.0.0
   */
  alert(options: AlertOptions): Promise<void>;

  /**
   * Show a prompt dialog
   *
   * @since 1.0.0
   */
  prompt(options: PromptOptions): Promise<PromptResult>;

  /**
   * Show a confirmation dialog
   *
   * @since 1.0.0
   */
  confirm(options: ConfirmOptions): Promise<ConfirmResult>;
}
