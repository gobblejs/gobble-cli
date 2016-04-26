# changelog

## 0.7.0

* Switch to pathwatcher
* Show port number on each build completion, if serving
* Update dependencies

## 0.6.0

* Gracefulify `fs`, to avoid issues on Windows ([#15](https://github.com/gobblejs/gobble-cli/pull/15))
* Update dependencies

## 0.5.0

* Update to latest chokidar

## 0.4.4

* Don't mind me...

## 0.4.3

* More reliable error logging on Windows ([#17](https://github.com/gobblejs/gobble-cli/pull/17)))

## 0.4.2

* Handle sourcemap events (from gobble 0.10.0 and later)

## 0.4.1

* Fix logging bug with small terminals ([#13](https://github.com/gobblejs/gobble-cli/issues/13)))

## 0.4.0

* Expect locally-installed gobble version to be 0.9.0 or greater
* Squelch duplicate messages
* Respect terminal width better when printing messages
* `gobble --help` now includes `gobble watch`
* Very long messages are truncated
* Display `inputdir` and `outputdir` for easier debugging, if these are provided in error messages
* Prevent builds from hanging (regression with gobble 0.9.0)

## 0.3.5

* Helpful error on missing build definition
* Neater terminal messages
* If `gobble build` fails, it does so with a non-zero error code
* Current command (i.e. `serve`, `build` or `watch`) is added to environment as `GOBBLE_COMMAND`

Thanks to [evs-chris](https://github.com/evs-chris) for these additions

## 0.3.4

* Include `sorcery` as a dependency in package.json

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
