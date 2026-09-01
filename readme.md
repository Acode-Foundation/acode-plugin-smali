# Smali syntax highlighting

![version](https://img.shields.io/badge/Latest%20version-V2.0.0-green)

Smali language support for the Ace and CodeMirror editors in Acode.

> This plugin requires Acode version 292 or newer.

## Using the plugin

Install the plugin and open any file ending in `.smali`. Acode automatically
selects the **Smali** language mode and shows the Smali file icon. The language
can also be selected manually from Acode's language menu.

CodeMirror highlights directives, modifiers, opcodes, registers, labels, type
descriptors, method and field references, literals, strings, escapes,
operators, and comments. Complete `.method` blocks can be folded.

Ace continues using the plugin's original native mode and detailed highlighting
rules unchanged.

## Compatibility

The plugin bundle is compatible with the Chrome 51-era WebView shipped with
Android 7/API 24. Legacy Acode releases use the Ace mode, while CodeMirror
support activates only when the installed Acode version exposes its CodeMirror
language modules.
