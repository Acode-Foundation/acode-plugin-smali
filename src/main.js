import smaliIcon from './icon.svg';
import plugin from '../plugin.json';
import { createSmaliLanguage } from './smali-language.mjs';

const SMALI_LANGUAGE = 'smali';

function isSmaliFile(file) {
  const filename = file?.filename || file?.name || '';
  return /\.smali$/i.test(filename);
}

class AceSmaliAdapter {
  #modes;

  async init(firstInit) {
    // Webpack bundles the existing Ace grammar, but it is only executed by the
    // legacy adapter and never touches CodeMirror installations.
    require('./mode-smali');
    this.#modes = acode.require('aceModes');
    this.#modes.addMode(SMALI_LANGUAGE, SMALI_LANGUAGE, 'Smali');

    if (!firstInit) return;
    for (const file of editorManager.files || []) {
      if (isSmaliFile(file)) file.session?.setMode?.('ace/mode/smali');
    }
  }

  async destroy() {
    this.#modes?.removeMode?.(SMALI_LANGUAGE);
    for (const file of editorManager.files || []) {
      if (isSmaliFile(file)) file.session?.setMode?.('ace/mode/text');
    }
    this.#modes = null;
  }
}

class CodeMirrorSmaliAdapter {
  #editorLanguages;
  #ownsLanguage = false;

  async init() {
    let languageModule;
    try {
      this.#editorLanguages = acode.require('editorLanguages');
      languageModule = acode.require('@codemirror/language');
    } catch (error) {
      console.warn('[Smali] CodeMirror language API is unavailable.', error);
      return;
    }

    if (
      !this.#editorLanguages?.register ||
      !this.#editorLanguages?.get ||
      !this.#editorLanguages?.unregister ||
      !languageModule?.StreamLanguage?.define
    ) {
      console.warn('[Smali] CodeMirror language API is unavailable.');
      return;
    }

    if (!this.#editorLanguages.get(SMALI_LANGUAGE)) {
      try {
        this.#editorLanguages.register(
          SMALI_LANGUAGE,
          [SMALI_LANGUAGE],
          'Smali',
          () => createSmaliLanguage(languageModule),
        );
        this.#ownsLanguage = true;
      } catch (error) {
        console.error('[Smali] Unable to register CodeMirror language.', error);
        return;
      }
    }
    this.#refreshOpenFiles(false);
  }

  async destroy() {
    if (!this.#ownsLanguage) {
      this.#editorLanguages = null;
      return;
    }

    try {
      this.#editorLanguages.unregister(SMALI_LANGUAGE);
      this.#refreshOpenFiles(true);
    } catch (error) {
      console.error('[Smali] Unable to unregister CodeMirror language.', error);
    } finally {
      this.#ownsLanguage = false;
      this.#editorLanguages = null;
    }
  }

  #refreshOpenFiles(unloading) {
    let refreshActiveFile = false;
    for (const file of editorManager.files || []) {
      if (
        file?.type !== 'editor' ||
        !isSmaliFile(file) ||
        typeof file.setMode !== 'function'
      ) {
        continue;
      }

      const mode = String(file.currentMode || '').toLowerCase();
      const shouldRefresh = unloading
        ? mode === SMALI_LANGUAGE
        : !mode || mode === 'text' || mode === 'plain_text' ||
          mode === SMALI_LANGUAGE;
      if (!shouldRefresh) continue;

      file.setMode(undefined, { recommend: false });
      refreshActiveFile ||= file === editorManager.activeFile;
    }
    if (refreshActiveFile) editorManager.reapplyActiveFile?.();
  }
}

class AcodePlugin {
  #adapter;
  #style;

  async init(firstInit) {
    await this.#adapter?.destroy();
    this.#registerFileIcon();
    this.#adapter = editorManager.isCodeMirror
      ? new CodeMirrorSmaliAdapter()
      : new AceSmaliAdapter();
    await this.#adapter.init(firstInit);
  }

  async destroy() {
    try {
      await this.#adapter?.destroy();
    } finally {
      this.#adapter = null;
      this.#style?.remove();
      this.#style = null;
    }
  }

  #registerFileIcon() {
    this.#style?.remove();
    this.#style = document.createElement('style');
    this.#style.textContent =
      '.file_type_smali::before {' +
      "content: '';" +
      'display: inline-block;' +
      `background: url("${smaliIcon}") no-repeat center / contain;` +
      'height: 1em;' +
      'width: 1em;' +
      '}';
    document.head.appendChild(this.#style);
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(plugin.id, (_baseUrl, _page, options = {}) => (
    acodePlugin.init(options.firstInit)
  ));
  acode.setPluginUnmount(plugin.id, () => acodePlugin.destroy());
}
