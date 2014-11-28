# changelog

## 0.3.3

* Environment defaults to 'development' for `gobble`/`gobble watch`, 'production' for `gobble build`

## 0.3.2

* Fixes broken plugin auto-installation

## 0.3.1

* gobble-cli will attempt to print code that causes transformations to fail (e.g. syntax errors), and will trace back to the original file if sourcemaps are present (requires gobble 0.7.1 to be installed locally)

## 0.3.0

* **BREAKING - requires gobble 0.7.0 or higher.** Tasks should emit `info` events with message codes, rather than strings.
* `gobble watch <dir>` writes the project to `<dir>` and updates it on file change
* More readable console output

## 0.2.11

* Add `gobble --help` command
* Fix error handling in bad builds

## 0.2.10

* Started maintaining a changelog