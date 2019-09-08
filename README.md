# vscode-silq README

Provides (limited) Silq support in visual studio code.

## Features

Type checks all open Silq source files whenever a Silq source file is opened or saved.
Also attempts to simulate the source file that triggered the type checking and prints the result.

## Installation

Make sure you have Node.js (>=v12.10.0) installed, as well as:
```
npm install -g node-typescript vsce
```
To build the extension package, run:
```
vsce package
```
This will create the file `vscode-silq-0.0.1.vsix`.
To install the extension in visual studio code, run:
```
code --install-extension vscode-silq-0.0.1.vsix
```

## Requirements

Requires a working `silq` executable. (https://github.com/eth-sri/silq)

Change the `silq.binaryPath` setting to point to the `silq` executable.

For unicode input, we recommend (enter this command after hitting CTRL+P):
```
ext install freebroccolo.input-assist
```
Then in settings (CTRL+, and search for `input-assist.languages`) add:
```
"input-assist.languages": ["plaintext", "silq"]
```

## Extension Settings

This extension contributes the following settings:

* `silq.binaryPath`: Path to `silq` executable that is used for type checking and simulation.

## Known Issues

- Squiggly lines don't always match up with the locations of the errors if there are unicode characters.

## Release Notes

TODO
