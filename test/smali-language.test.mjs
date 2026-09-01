import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import * as languageModule from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { highlightTree, tags } from '@lezer/highlight';

import { createSmaliLanguage } from '../src/smali-language.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const compatibilityFixture = fs.readFileSync(
  path.join(testDirectory, 'fixtures/SmaliCompatibilitySample.smali'),
  'utf8',
);

const highlightStyle = languageModule.HighlightStyle.define([
  { tag: tags.keyword, class: 'keyword' },
  { tag: tags.modifier, class: 'modifier' },
  { tag: tags.typeName, class: 'type' },
  { tag: tags.special(tags.variableName), class: 'register' },
  { tag: tags.function(tags.variableName), class: 'method' },
  { tag: tags.propertyName, class: 'property' },
  { tag: tags.labelName, class: 'label' },
  { tag: tags.number, class: 'number' },
  { tag: tags.string, class: 'string' },
  { tag: tags.escape, class: 'escape' },
  { tag: tags.atom, class: 'atom' },
  { tag: tags.operator, class: 'operator' },
  { tag: tags.punctuation, class: 'punctuation' },
  { tag: tags.comment, class: 'comment' },
]);

test('CodeMirror highlights representative Smali syntax', () => {
  const source = [
    '.class public final Lcom/example/Example;',
    '.super Ljava/lang/Object;',
    '.source "Example.smali"',
    '.field private static count:I = 0x2',
    '.annotation runtime Ldalvik/annotation/Signature;',
    '  value = {"Lcom/example/Example;"}',
    '.end annotation',
    '.method public static main([Ljava/lang/String;)V',
    '.method public ID(ILjava/lang/String;[I[[Ljava/lang/Object;)Ljava/lang/String;',
    '  .locals 2',
    '  const-string v0, "hello\\nworld" # greeting',
    '  :loop',
    '  iget v1, p0, Lcom/example/Example;->count:I',
    '  invoke-static {v0}, Ljava/lang/System;->println(Ljava/lang/String;)V',
    '  if-eqz v1, :done',
    '  goto :loop',
    '  :done',
    '  return-void',
    '.end method',
  ].join('\n');
  const tokens = collectTokens(source);

  assertToken(tokens, '.class', 'keyword');
  assertToken(tokens, 'public', 'modifier');
  assertToken(tokens, 'Lcom/example/Example;', 'type');
  assertToken(tokens, 'count', 'property');
  assertToken(tokens, '0x2', 'number');
  assertToken(tokens, 'main', 'method');
  assertToken(tokens, '[Ljava/lang/String;', 'type');
  assertToken(tokens, 'ID', 'method');
  assertToken(
    tokens,
    'ILjava/lang/String;[I[[Ljava/lang/Object;',
    'type',
  );
  assertToken(tokens, 'v0', 'register');
  assertToken(tokens, 'p0', 'register');
  assertToken(tokens, '\\n', 'escape');
  assertToken(tokens, '# greeting', 'comment');
  assertToken(tokens, ':loop', 'label');
  assertToken(tokens, 'iget', 'keyword');
  assertToken(tokens, '->', 'operator');
  assertToken(tokens, 'println', 'method');
  assertToken(tokens, 'return-void', 'keyword');
});

test('CodeMirror recognizes every major Smali opcode family', () => {
  const opcodes = [
    'nop',
    'move-object/from16',
    'move-result-object',
    'return-object',
    'const-wide/high16',
    'monitor-enter',
    'check-cast',
    'instance-of',
    'new-array',
    'filled-new-array/range',
    'throw-verification-error',
    'goto/16',
    'packed-switch',
    'cmp-long',
    'if-nez',
    'aget-object',
    'iput-wide',
    'iget-object-quick',
    'sget-boolean',
    'sget-object-volatile',
    'invoke-interface/range',
    'execute-inline/range',
    'neg-int',
    'int-to-long',
    'add-int/lit8',
    'rsub-int/lit8',
  ];
  const source = opcodes.map((opcode) => `  ${opcode} v0, v1`).join('\n');
  const tokens = collectTokens(source);

  for (const opcode of opcodes) assertToken(tokens, opcode, 'keyword');
});

test('CodeMirror preserves strings, comments, atoms, and malformed input', () => {
  const source = [
    '  const-string v0, "# not a comment"',
    '  const-string v1, "quote: \\"" # real comment',
    '  value = true',
    '  other = null',
    '  ??? malformed input',
  ].join('\n');
  const tokens = collectTokens(source);

  assert.equal(tokens.some(({ text, style }) => (
    text.includes('# not a comment') && style === 'string'
  )), true);
  assertToken(tokens, '\\"', 'escape');
  assertToken(tokens, '# real comment', 'comment');
  assertToken(tokens, 'true', 'atom');
  assertToken(tokens, 'null', 'atom');
  assert.doesNotThrow(() => createState(source));
});

test('CodeMirror folds complete method blocks only', () => {
  const source = [
    '.class public LExample;',
    '.method public run()V',
    '  .locals 0',
    '  return-void',
    '.end method',
    '.method public unfinished()V',
  ].join('\n');
  const state = createState(source);
  const complete = state.doc.line(2);
  const unfinished = state.doc.line(6);

  const range = languageModule.foldable(state, complete.from, complete.to);
  assert.deepEqual(range, {
    from: complete.to,
    to: state.doc.line(5).from - 1,
  });
  assert.equal(
    languageModule.foldable(state, unfinished.from, unfinished.to),
    null,
  );
});

test('CodeMirror highlights and folds the 500-line compatibility sample', () => {
  assert.equal(compatibilityFixture.trimEnd().split('\n').length, 500);

  const state = createState(compatibilityFixture);
  const tree = languageModule.ensureSyntaxTree(state, state.doc.length, 5000);
  const tokens = collectTokens(compatibilityFixture);
  assert.ok(tree);
  assert.equal(tree.length, state.doc.length);

  assertToken(tokens, '.class', 'keyword');
  assertToken(tokens, 'process08', 'method');
  assertToken(tokens, 'packed-switch', 'keyword');
  assertToken(tokens, 'aput', 'keyword');
  assertToken(tokens, 'II', 'type');
  assertToken(tokens, 'DD', 'type');
  assertToken(tokens, '[[I', 'type');
  assertToken(tokens, '# End-to-end compatibility checkpoint 14', 'comment');

  for (const method of ['process01', 'process08', 'updateCount']) {
    const line = findLine(state, `.method private ${method}`) ||
      findLine(state, `.method public synchronized ${method}`);
    assert.ok(line, method);
    assert.ok(languageModule.foldable(state, line.from, line.to), method);
  }
});

function createState(doc) {
  return EditorState.create({
    doc,
    extensions: [createSmaliLanguage(languageModule)],
  });
}

function collectTokens(source) {
  const state = createState(source);
  const tree = languageModule.ensureSyntaxTree(state, state.doc.length, 5000);
  assert.ok(tree);
  const tokens = [];
  highlightTree(
    tree,
    highlightStyle,
    (from, to, style) => tokens.push({
      from,
      style,
      text: source.slice(from, to),
      to,
    }),
  );
  return tokens;
}

function findLine(state, prefix) {
  for (let lineNumber = 1; lineNumber <= state.doc.lines; lineNumber += 1) {
    const line = state.doc.line(lineNumber);
    if (line.text.startsWith(prefix)) return line;
  }
  return null;
}

function assertToken(tokens, text, style) {
  assert.equal(
    tokens.some((token) => token.text === text && token.style.includes(style)),
    true,
    `Expected ${JSON.stringify(text)} to be highlighted as ${style}.`,
  );
}
