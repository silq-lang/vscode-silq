# vscode-silq README

Provides (limited) Silq support in visual studio code.

## Features

Type checks all open Silq source files whenever a Silq source file is opened or saved.
Also attempts to simulate the source file that triggered the type checking and prints the result.

## Requirements

Requires a working `silq` executable. (https://github.com/eth-sri/silq)
Change the `silq.binaryPath` setting to point to the `silq` executable.

For unicode input, we recommend:
```
ext install freebroccolo.input-assist
```
Then in settings.json, add:
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
