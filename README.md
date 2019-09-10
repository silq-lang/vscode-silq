# vscode-silq README

Provides (limited) Silq support in visual studio code.

## Features

Syntax highlighting for comments, string literals and keywords.
Type checks all open Silq source files each time any Silq source file is opened or saved.
The currently active source file can be run with `f5`. `stdout` is forwarded to the `Silq` output channel.

## Requirements

For unicode input, we recommend (enter this command after hitting CTRL+P):
```
ext install freebroccolo.input-assist
```
Then in settings (CTRL+, and search for `input-assist.languages`) add:
```
"input-assist.languages": ["plaintext", "silq"]
```

On GNU/Linux, OSX and Windows, this extension is self-contained (it ships binary files compiled from a clean recent commit in the https://github.com/eth-sri/silq repository).

On other platforms, you may need to provide a working `silq` executable (build instructions: https://github.com/eth-sri/silq).

Change the `silq.binaryPath` setting to point to this `silq` executable.

## Extension Settings

This extension contributes the following settings:

* `silq.binaryPath`: Path to `silq` executable that is used for type checking and simulation (by default, will attempt to use a suitable binary file from the `bin` folder).
* `silq.autoRun`: If enabled, run Silq programs after opening and after saving.
* `silq.historyChannel`: If enabled, all output of running Silq programs is additionally written to the `Silq History` output channel.

## Known Issues

* If a program crashes at runtime in an imported file (other than the one run), the corresponding error message is not displayed.
