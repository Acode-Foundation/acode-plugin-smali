const ACCESS_MODIFIERS = new Set([
  'abstract',
  'annotation',
  'bridge',
  'build',
  'constructor',
  'declared-synchronized',
  'enum',
  'final',
  'interface',
  'native',
  'private',
  'protected',
  'public',
  'runtime',
  'static',
  'strictfp',
  'synchronized',
  'synthetic',
  'system',
  'transient',
  'varargs',
  'volatile',
]);

const ATOMS = new Set(['false', 'null', 'true']);

const OPCODE_SOURCE = String.raw`^(?:
  nop|
  move(?:-wide|-object)?(?:\/from16|\/16)?|move-result(?:-wide|-object)?|move-exception|
  return(?:-void|-wide|-object)?(?:-barrier)?|
  const(?:-wide|-string|-class|-method-handle|-method-type)?(?:\/4|\/16|\/high16|\/32|\/jumbo)?|
  monitor-(?:enter|exit)|
  check-cast|instance-of|array-length|new-instance|new-array|
  filled-new-array(?:\/range)?|fill-array-data|throw(?:-verification-error)?|
  goto(?:\/16|\/32)?|packed-switch|sparse-switch|
  cmp(?:l|g)-(?:float|double)|cmp-long|
  if-(?:eq|ne|lt|ge|gt|le)(?:z)?|
  a(?:get|put)(?:-wide|-object|-boolean|-byte|-char|-short)?|
  i(?:get|put)(?:-wide|-object|-boolean|-byte|-char|-short)?(?:-quick|-volatile)?|
  s(?:get|put)(?:-wide|-object|-boolean|-byte|-char|-short)?(?:-volatile)?|
  invoke-(?:virtual|super|direct|static|interface|polymorphic|custom)(?:-quick)?(?:\/range)?|
  execute-inline(?:\/range)?|invoke-direct-empty|
  neg-(?:int|long|float|double)|not-(?:int|long)|
  (?:int|long|float|double)-to-(?:byte|char|short|int|long|float|double)|
  (?:add|sub|mul|div|rem|and|or|xor|shl|shr|ushr)-(?:int|long|float|double)(?:\/2addr|\/lit8|\/lit16)?|
  rsub-int(?:\/lit8)?
)$`;

// JavaScript does not support the free-spacing flag. Keeping the families above
// readable and normalizing them once avoids duplicating a large opcode table.
const OPCODE_RE = new RegExp(
  OPCODE_SOURCE.replace(/\s+/g, ''),
  'i',
);

const DECLARATION_DIRECTIVES = Object.freeze({
  '.field': 'field',
  '.method': 'method',
});

const TYPE_DESCRIPTOR_RE =
  /^\[*(?:L[^;\s]+;|[VZBSCIJFD])(?=$|[\s,(){}:=]|->)/;
// Method parameters are encoded as adjacent descriptors with no delimiters.
const PARAMETER_DESCRIPTOR_RE = /^\[*(?:L[^;\s]+;|[VZBSCIJFD])/;

function resetLineState(stream, state) {
  if (!stream.sol()) return;
  state.afterArrow = false;
  state.declaration = null;
  state.firstToken = true;
  state.inParameterDescriptors = false;
  state.stringQuote = null;
}

function tokenString(stream, state) {
  if (!state.stringQuote) {
    const quote = stream.peek();
    if (quote !== '"' && quote !== "'") return null;
    state.stringQuote = stream.next();
    return 'string';
  }

  if (stream.eat('\\')) {
    stream.next();
    return 'escape';
  }

  while (!stream.eol()) {
    if (stream.peek() === '\\') break;
    if (stream.next() === state.stringQuote) {
      state.stringQuote = null;
      break;
    }
  }
  return 'string';
}

function tokenWord(stream, state) {
  if (!stream.match(/^(?:<init>|<clinit>|[A-Za-z_$][\w$/-]*)/)) return null;

  const word = stream.current();
  const normalized = word.toLowerCase();
  const wasFirstToken = state.firstToken;
  state.firstToken = false;

  if (state.afterArrow) {
    state.afterArrow = false;
    return stream.peek() === '(' ? 'variableName.function' : 'propertyName';
  }

  if (ACCESS_MODIFIERS.has(normalized)) return 'modifier';
  if (ATOMS.has(normalized)) return 'atom';

  if (state.declaration === 'method') {
    state.declaration = null;
    return 'variableName.definition.function';
  }
  if (state.declaration === 'field') {
    state.declaration = null;
    return 'propertyName.definition';
  }

  if (wasFirstToken && OPCODE_RE.test(normalized)) return 'keyword';
  return 'variableName';
}

export const smaliStreamParser = {
  name: 'smali',
  startState() {
    return {
      afterArrow: false,
      declaration: null,
      firstToken: true,
      inParameterDescriptors: false,
      stringQuote: null,
    };
  },
  copyState(state) {
    return { ...state };
  },
  token(stream, state) {
    resetLineState(stream, state);

    if (state.stringQuote) return tokenString(stream, state);
    if (stream.eatSpace()) return null;
    if (stream.match(/^#.*/)) return 'comment';

    const stringToken = tokenString(stream, state);
    if (stringToken) {
      state.firstToken = false;
      return stringToken;
    }

    if (stream.match(/^:[A-Za-z_$][\w$.-]*/)) {
      state.firstToken = false;
      return 'labelName';
    }

    if (stream.match(/^\.[A-Za-z][\w-]*/)) {
      const directive = stream.current().toLowerCase();
      state.declaration = DECLARATION_DIRECTIVES[directive] || null;
      state.firstToken = false;
      return 'keyword';
    }

    const descriptorPattern = state.inParameterDescriptors
      ? PARAMETER_DESCRIPTOR_RE
      : TYPE_DESCRIPTOR_RE;
    if (stream.match(descriptorPattern)) {
      state.firstToken = false;
      return 'typeName';
    }

    if (stream.match(/^[vp]\d+\b/i)) {
      state.firstToken = false;
      return 'variableName.special';
    }

    if (stream.match(/^[+-]?(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?:[lstfd])?\b/i)) {
      state.firstToken = false;
      return 'number';
    }

    if (stream.match(/^(?:NaN|Infinity)\b/)) {
      state.firstToken = false;
      return 'number';
    }

    if (stream.match('->')) {
      state.afterArrow = true;
      state.firstToken = false;
      return 'operator';
    }

    if (stream.match(/^(?:\.\.|[=+*/%&|^~<>!-]+)/)) {
      state.firstToken = false;
      return 'operator';
    }

    const wordToken = tokenWord(stream, state);
    if (wordToken) return wordToken;

    if (stream.match(/^[()[\]{},:;]/)) {
      const punctuation = stream.current();
      if (punctuation === '(') state.inParameterDescriptors = true;
      if (punctuation === ')') state.inParameterDescriptors = false;
      state.firstToken = false;
      return 'punctuation';
    }

    stream.next();
    state.firstToken = false;
    return null;
  },
  languageData: {
    closeBrackets: { brackets: ['(', '[', '{', "'", '"'] },
    commentTokens: { line: '#' },
  },
};

function createMethodFoldService(foldService) {
  if (!foldService?.of) return null;
  return foldService.of((state, lineStart) => {
    const openingLine = state.doc.lineAt(lineStart);
    if (!/^\s*\.method\b/i.test(openingLine.text)) return null;

    let depth = 1;
    for (let lineNumber = openingLine.number + 1;
      lineNumber <= state.doc.lines;
      lineNumber += 1) {
      const line = state.doc.line(lineNumber);
      if (/^\s*\.method\b/i.test(line.text)) depth += 1;
      if (!/^\s*\.end\s+method\b/i.test(line.text)) continue;
      depth -= 1;
      if (depth !== 0) continue;
      const to = Math.max(openingLine.to, line.from - 1);
      return to > openingLine.to ? { from: openingLine.to, to } : null;
    }
    return null;
  });
}

export function createSmaliLanguage(languageModule) {
  const { foldService, LanguageSupport, StreamLanguage } = languageModule || {};
  if (!LanguageSupport || !StreamLanguage?.define) {
    throw new Error('CodeMirror stream language API is unavailable.');
  }

  const language = StreamLanguage.define(smaliStreamParser);
  const methodFolding = createMethodFoldService(foldService);
  return new LanguageSupport(language, methodFolding ? [methodFolding] : []);
}
