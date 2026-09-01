import assert from 'node:assert/strict';
import { parse } from 'acorn';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

import * as languageModule from '@codemirror/language';

import { createSmaliLanguage } from '../src/smali-language.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '..');
const productionBundle = fs.readFileSync(
  path.join(projectRoot, 'dist/main.js'),
  'utf8',
);

test('production bundle supports the factory API 24 WebView contract', async () => {
  const archive = await JSZip.loadAsync(
    fs.readFileSync(path.join(projectRoot, 'dist.zip')),
  );
  const packagedBundle = await archive.file('main.js').async('string');

  for (const source of [productionBundle, packagedBundle]) {
    assert.doesNotThrow(() => parse(source, {
      ecmaVersion: 5,
      sourceType: 'script',
    }));

    const unsupportedRuntimeApis = [
      '.at(',
      '.finally(',
      '.flat(',
      '.flatMap(',
      '.replaceAll(',
      'AbortController',
      'globalThis',
      'Object.entries',
      'Object.fromEntries',
      'Object.hasOwn(',
      'Object.values',
      'Promise.allSettled',
      'Promise.any',
      'queueMicrotask(',
      'structuredClone',
      'WeakRef',
    ];
    for (const api of unsupportedRuntimeApis) {
      assert.equal(source.includes(api), false, api);
    }
  }

  assert.equal(packagedBundle, productionBundle);
  assert.equal(
    archive.file('test/fixtures/SmaliCompatibilitySample.smali'),
    null,
  );
});

test('CodeMirror registers Smali, refreshes eligible files, and cleans up', async () => {
  const modules = createLanguageRegistry();
  const activeFile = createCodeMirrorFile('Example.smali', 'text', modules);
  const manualFile = createCodeMirrorFile('Manual.smali', 'javascript', modules);
  const otherFile = createCodeMirrorFile('notes.txt', 'text', modules);
  const runtime = createRuntime({
    files: [activeFile, manualFile, otherFile],
    isCodeMirror: true,
    modules,
  });
  runtime.editorManager.activeFile = activeFile;

  await runtime.init({ firstInit: false });

  assert.equal(runtime.legacyModuleLoads, 0);
  assert.equal(modules.registerCalls.length, 1);
  const registration = modules.registerCalls[0];
  assert.equal(Array.from(registration.extensions).join(','), 'smali');
  assert.equal(registration.name, 'smali');
  assert.equal(registration.caption, 'Smali');
  assert.ok(registration.loader() instanceof languageModule.LanguageSupport);
  assert.equal(activeFile.currentMode, 'smali');
  assert.equal(activeFile.modeCalls.length, 1);
  assert.equal(activeFile.modeCalls[0].options.recommend, false);
  assert.equal(manualFile.modeCalls.length, 0);
  assert.equal(otherFile.modeCalls.length, 0);
  assert.equal(runtime.editorManager.reapplyCalls, 1);
  assert.equal(runtime.styles.length, 1);
  assert.match(runtime.styles[0].textContent, /file_type_smali/);
  assert.match(runtime.styles[0].textContent, /plugin-smali-icon\.svg/);

  await runtime.unmount();

  assert.deepEqual(modules.unregisterCalls, ['smali']);
  assert.equal(activeFile.currentMode, 'text');
  assert.equal(activeFile.modeCalls.length, 2);
  assert.equal(runtime.editorManager.reapplyCalls, 2);
  assert.equal(runtime.styles[0].removed, true);

  await runtime.init({ firstInit: false });
  assert.equal(modules.registerCalls.length, 2);
  assert.equal(runtime.styles.length, 2);
  assert.equal(runtime.styles.filter(({ removed }) => !removed).length, 1);
  await runtime.unmount();
});

test('CodeMirror preserves a core Smali language and manual associations', async () => {
  const modules = createLanguageRegistry({ coreSmali: true });
  const inferred = createCodeMirrorFile('Example.smali', 'plain_text', modules);
  const manual = createCodeMirrorFile('Manual.smali', 'xml', modules);
  const runtime = createRuntime({
    files: [inferred, manual],
    isCodeMirror: true,
    modules,
  });

  await runtime.init({ firstInit: false });
  assert.equal(modules.registerCalls.length, 0);
  assert.equal(inferred.currentMode, 'smali');
  assert.equal(manual.modeCalls.length, 0);

  await runtime.unmount();
  assert.deepEqual(modules.unregisterCalls, []);
  assert.equal(inferred.currentMode, 'smali');
});

test('CodeMirror degrades safely when language registration is unavailable', async () => {
  const warnings = [];
  const runtime = createRuntime({
    files: [],
    isCodeMirror: true,
    modules: {},
    warnings,
  });

  await runtime.init({ firstInit: false });
  assert.equal(runtime.legacyModuleLoads, 0);
  assert.equal(runtime.styles.length, 1);
  assert.equal(warnings.length, 1);
  await runtime.unmount();
  assert.equal(runtime.styles[0].removed, true);
});

test('the packaged bundle loads the unchanged Ace adapter without modern APIs', async () => {
  const modeCalls = [];
  const session = { setMode: (mode) => modeCalls.push(mode) };
  const ignoredSession = { setMode: (mode) => modeCalls.push(`ignored:${mode}`) };
  const modules = createAceModes();
  const harness = createAceHarness();
  const runtime = createRuntime({
    ace: harness.ace,
    bundled: true,
    disableModernBuiltins: true,
    files: [
      { name: 'Example.smali', session },
      { name: 'notes.txt', session: ignoredSession },
    ],
    isCodeMirror: false,
    modules,
  });

  await runtime.init({ firstInit: true });
  assert.deepEqual(modules.addCalls, [['smali', 'smali', 'Smali']]);
  assert.deepEqual(modeCalls, ['ace/mode/smali']);
  assert.equal(runtime.requiredModules.includes('editorLanguages'), false);
  const { Mode } = harness.require('ace/mode/smali');
  const mode = new Mode();
  const rules = new mode.HighlightRules();
  assert.equal(mode.$id, 'ace/mode/smali');
  assert.equal(rules.$rules.start.some(({ include }) => include === '#field'), true);
  assert.equal(
    rules.$rules.start.some(({ regex }) => regex?.test?.('.class public LTest;')),
    true,
  );
  assert.match(mode.HighlightRules.metaData.foldingStartMarker, /method/);

  await runtime.unmount();
  assert.deepEqual(modules.removeCalls, ['smali']);
  assert.deepEqual(modeCalls, ['ace/mode/smali', 'ace/mode/text']);
  assert.equal(runtime.styles[0].removed, true);
});

function createRuntime({
  ace,
  bundled = false,
  disableModernBuiltins = false,
  files,
  isCodeMirror,
  modules,
  warnings = [],
}) {
  const source = fs.readFileSync(path.join(projectRoot, 'src/main.js'), 'utf8')
    .replace(
      "import smaliIcon from './icon.svg';",
      "const smaliIcon = 'plugin-smali-icon.svg';",
    )
    .replace(
      "import plugin from '../plugin.json';",
      "const plugin = { id: 'acode.plugin.smali' };",
    )
    .replace(
      "import { createSmaliLanguage } from './smali-language.mjs';",
      'const createSmaliLanguage = injectedCreateSmaliLanguage;',
    );
  const styles = [];
  let initPlugin;
  let unmountPlugin;
  let legacyModuleLoads = 0;
  const requiredModules = [];
  const editorManager = {
    activeFile: files[0] || null,
    files,
    isCodeMirror,
    reapplyCalls: 0,
    reapplyActiveFile() {
      this.reapplyCalls += 1;
    },
  };
  const acode = {
    require(name) {
      requiredModules.push(name);
      if (name === 'editorLanguages') {
        if (!modules.register) throw new Error('missing editorLanguages');
        return modules;
      }
      if (name === '@codemirror/language') return languageModule;
      if (name === 'aceModes') return modules;
      throw new Error(`Unexpected Acode module: ${name}`);
    },
    setPluginInit(id, callback) {
      assert.equal(id, 'acode.plugin.smali');
      initPlugin = callback;
    },
    setPluginUnmount(id, callback) {
      assert.equal(id, 'acode.plugin.smali');
      unmountPlugin = callback;
    },
  };
  const document = {
    createElement(tagName) {
      assert.equal(tagName, 'style');
      return {
        removed: false,
        textContent: '',
        remove() {
          this.removed = true;
        },
      };
    },
    head: {
      appendChild(style) {
        styles.push(style);
      },
    },
  };
  const context = vm.createContext({
    acode,
    ace,
    console: {
      error: console.error,
      log: console.log,
      warn: (...values) => warnings.push(values),
    },
    document,
    editorManager,
    injectedCreateSmaliLanguage: createSmaliLanguage,
    require(name) {
      assert.equal(name, './mode-smali');
      legacyModuleLoads += 1;
      return {};
    },
    window: { acode },
  });
  if (disableModernBuiltins) {
    vm.runInContext(
      'Object.entries = undefined;' +
      'Object.values = undefined;' +
      'Promise.prototype.finally = undefined;' +
      'globalThis.globalThis = undefined;',
      context,
    );
  }
  vm.runInContext(bundled ? productionBundle : source, context);

  return {
    editorManager,
    get legacyModuleLoads() {
      return legacyModuleLoads;
    },
    init: (options) => initPlugin('/plugin/', null, options),
    requiredModules,
    styles,
    unmount: () => unmountPlugin(),
  };
}

function createLanguageRegistry({ coreSmali = false } = {}) {
  const languages = new Map();
  if (coreSmali) languages.set('smali', { name: 'smali', source: 'core' });
  return {
    get: (name) => languages.get(name),
    registerCalls: [],
    unregisterCalls: [],
    register(name, extensions, caption, loader) {
      this.registerCalls.push({ caption, extensions, loader, name });
      languages.set(name, { caption, extensions, loader, name });
    },
    unregister(name) {
      this.unregisterCalls.push(name);
      languages.delete(name);
    },
  };
}

function createCodeMirrorFile(filename, currentMode, registry) {
  return {
    currentMode,
    filename,
    modeCalls: [],
    type: 'editor',
    setMode(mode, options) {
      this.modeCalls.push({ mode, options });
      this.currentMode = registry.get('smali') ? 'smali' : 'text';
    },
  };
}

function createAceModes() {
  return {
    addCalls: [],
    removeCalls: [],
    addMode(...values) {
      this.addCalls.push(values);
    },
    removeMode(name) {
      this.removeCalls.push(name);
    },
  };
}

function createAceHarness() {
  const definitions = new Map();
  const modules = new Map();
  const oop = {
    inherits(child, parent) {
      child.prototype = Object.create(parent.prototype);
      child.prototype.constructor = child;
    },
  };
  function TextHighlightRules() {}
  TextHighlightRules.prototype.normalizeRules = function normalizeRules() {};
  function TextMode() {}
  function BaseFoldMode() {}
  BaseFoldMode.prototype.getFoldWidget = () => '';
  BaseFoldMode.prototype.openingBracketBlock = () => null;
  BaseFoldMode.prototype.closingBracketBlock = () => null;
  function Range(startRow, startColumn, endRow, endColumn) {
    Object.assign(this, { endColumn, endRow, startColumn, startRow });
  }
  modules.set('ace/lib/oop', oop);
  modules.set('ace/mode/text_highlight_rules', { TextHighlightRules });
  modules.set('ace/mode/text', { Mode: TextMode });
  modules.set('ace/mode/folding/fold_mode', { FoldMode: BaseFoldMode });
  modules.set('ace/range', { Range });

  const aceRequire = (id) => {
    if (modules.has(id)) return modules.get(id);
    const definition = definitions.get(id);
    if (!definition) throw new Error(`Missing Ace module: ${id}`);
    const module = { exports: {} };
    definition.factory(aceRequire, module.exports, module);
    modules.set(id, module.exports);
    return module.exports;
  };
  const ace = {
    define(id, dependencies, factory) {
      definitions.set(id, { dependencies, factory });
    },
    require: aceRequire,
  };
  return { ace, require: aceRequire };
}
