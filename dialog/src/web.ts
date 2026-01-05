import { WebPlugin } from '@capacitor/core';

import type {
  DialogPlugin,
  AlertOptions,
  PromptOptions,
  PromptResult,
  ConfirmOptions,
  ConfirmResult,
  ButtonStyle,
} from './definitions';

export class DialogWeb extends WebPlugin implements DialogPlugin {
  private createDialogStyles(): HTMLStyleElement {
    const style = document.createElement('style');
    style.textContent = `
      .capacitor-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      .capacitor-dialog {
        background: white;
        border-radius: 14px;
        min-width: 270px;
        max-width: 90%;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }
      .capacitor-dialog-content {
        padding: 20px 16px 16px;
        text-align: center;
      }
      .capacitor-dialog-title {
        font-size: 17px;
        font-weight: 600;
        margin: 0 0 4px;
        color: #000;
      }
      .capacitor-dialog-message {
        font-size: 13px;
        color: #000;
        margin: 0;
        line-height: 1.4;
      }
      .capacitor-dialog-input {
        width: calc(100% - 16px);
        margin-top: 12px;
        padding: 8px;
        font-size: 14px;
        border: 1px solid #c7c7cc;
        border-radius: 6px;
        outline: none;
      }
      .capacitor-dialog-input:focus {
        border-color: #007aff;
      }
      .capacitor-dialog-buttons {
        display: flex;
        border-top: 1px solid #c7c7cc;
      }
      .capacitor-dialog-button {
        flex: 1;
        padding: 12px 8px;
        font-size: 17px;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #007aff;
      }
      .capacitor-dialog-button:not(:last-child) {
        border-right: 1px solid #c7c7cc;
      }
      .capacitor-dialog-button:hover {
        background: rgba(0, 0, 0, 0.05);
      }
      .capacitor-dialog-button.destructive {
        color: #ff3b30;
      }
      .capacitor-dialog-button.cancel {
        color: #007aff;
      }
      .capacitor-dialog-button.default {
        color: #007aff;
      }
      .capacitor-dialog-button.preferred {
        color: #007aff;
        font-weight: 700;
      }
      .capacitor-dialog-buttons.single .capacitor-dialog-button {
        font-weight: 600;
      }
      @media (prefers-color-scheme: dark) {
        .capacitor-dialog {
          background: #2c2c2e;
        }
        .capacitor-dialog-title,
        .capacitor-dialog-message {
          color: #fff;
        }
        .capacitor-dialog-buttons {
          border-top-color: #3d3d40;
        }
        .capacitor-dialog-button:not(:last-child) {
          border-right-color: #3d3d40;
        }
        .capacitor-dialog-button:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .capacitor-dialog-input {
          background: #1c1c1e;
          border-color: #3d3d40;
          color: #fff;
        }
      }
    `;
    return style;
  }

  private getButtonClass(style?: ButtonStyle): string {
    switch (style) {
      case 'destructive':
        return 'destructive';
      case 'cancel':
        return 'cancel';
      case 'preferred':
        return 'preferred';
      default:
        return 'default';
    }
  }

  async alert(options: AlertOptions): Promise<void> {
    return new Promise((resolve) => {
      const style = this.createDialogStyles();
      document.head.appendChild(style);

      const overlay = document.createElement('div');
      overlay.className = 'capacitor-dialog-overlay';

      const buttonClass = this.getButtonClass(options.buttonStyle);

      overlay.innerHTML = `
        <div class="capacitor-dialog">
          <div class="capacitor-dialog-content">
            ${options.title ? `<h2 class="capacitor-dialog-title">${this.escapeHtml(options.title)}</h2>` : ''}
            <p class="capacitor-dialog-message">${this.parseMarkdown(options.message)}</p>
          </div>
          <div class="capacitor-dialog-buttons single">
            <button class="capacitor-dialog-button ${buttonClass}" data-action="ok">${this.escapeHtml(options.buttonTitle || 'OK')}</button>
          </div>
        </div>
      `;

      const cleanup = () => {
        overlay.remove();
        style.remove();
      };

      overlay.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
        cleanup();
        resolve();
      });

      document.body.appendChild(overlay);
    });
  }

  async prompt(options: PromptOptions): Promise<PromptResult> {
    return new Promise((resolve) => {
      const style = this.createDialogStyles();
      document.head.appendChild(style);

      const overlay = document.createElement('div');
      overlay.className = 'capacitor-dialog-overlay';

      const okButtonClass = this.getButtonClass(options.okButtonStyle);
      const cancelButtonClass = this.getButtonClass(options.cancelButtonStyle || 'cancel');

      overlay.innerHTML = `
        <div class="capacitor-dialog">
          <div class="capacitor-dialog-content">
            ${options.title ? `<h2 class="capacitor-dialog-title">${this.escapeHtml(options.title)}</h2>` : ''}
            <p class="capacitor-dialog-message">${this.parseMarkdown(options.message)}</p>
            <input type="text" class="capacitor-dialog-input" placeholder="${this.escapeHtml(options.inputPlaceholder || '')}" value="${this.escapeHtml(options.inputText || '')}">
          </div>
          <div class="capacitor-dialog-buttons">
            <button class="capacitor-dialog-button ${cancelButtonClass}" data-action="cancel">${this.escapeHtml(options.cancelButtonTitle || 'Cancel')}</button>
            <button class="capacitor-dialog-button ${okButtonClass}" data-action="ok">${this.escapeHtml(options.okButtonTitle || 'OK')}</button>
          </div>
        </div>
      `;

      const cleanup = () => {
        overlay.remove();
        style.remove();
      };

      const input = overlay.querySelector('.capacitor-dialog-input') as HTMLInputElement;

      overlay.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
        cleanup();
        resolve({ value: '', cancelled: true });
      });

      overlay.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
        cleanup();
        resolve({ value: input.value, cancelled: false });
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          cleanup();
          resolve({ value: input.value, cancelled: false });
        }
      });

      document.body.appendChild(overlay);
      input.focus();
    });
  }

  async confirm(options: ConfirmOptions): Promise<ConfirmResult> {
    return new Promise((resolve) => {
      const style = this.createDialogStyles();
      document.head.appendChild(style);

      const overlay = document.createElement('div');
      overlay.className = 'capacitor-dialog-overlay';

      const okButtonClass = this.getButtonClass(options.okButtonStyle);
      const cancelButtonClass = this.getButtonClass(options.cancelButtonStyle || 'cancel');

      overlay.innerHTML = `
        <div class="capacitor-dialog">
          <div class="capacitor-dialog-content">
            ${options.title ? `<h2 class="capacitor-dialog-title">${this.escapeHtml(options.title)}</h2>` : ''}
            <p class="capacitor-dialog-message">${this.parseMarkdown(options.message)}</p>
          </div>
          <div class="capacitor-dialog-buttons">
            <button class="capacitor-dialog-button ${cancelButtonClass}" data-action="cancel">${this.escapeHtml(options.cancelButtonTitle || 'Cancel')}</button>
            <button class="capacitor-dialog-button ${okButtonClass}" data-action="ok">${this.escapeHtml(options.okButtonTitle || 'OK')}</button>
          </div>
        </div>
      `;

      const cleanup = () => {
        overlay.remove();
        style.remove();
      };

      overlay.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
        cleanup();
        resolve({ value: false });
      });

      overlay.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
        cleanup();
        resolve({ value: true });
      });

      document.body.appendChild(overlay);
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Parses **bold** markdown syntax and returns HTML with <strong> tags
   */
  private parseMarkdown(text: string): string {
    // First escape HTML, then convert **bold** to <strong>
    const escaped = this.escapeHtml(text);
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
}
