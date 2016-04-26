# gobble-cli

The command line interface for [Gobble](https://github.com/gobblejs/gobble), used for serving and building a project with a [gobblefile](https://github.com/gobblejs/gobble/wiki/How-to-write-a-gobblefile).


## Installation

```bash
npm i -g gobble-cli
```


## Usage

### Serving a project

This will start a server and watch for changes, using the `gobblefile.js` in the current folder (or one of its ancestors).

```bash
# you could also do `gobble serve` - it's the same thing
gobble
```

To use a specific port:

```bash
gobble --port 1337
gobble -p 1337
```

### Building a project

To build the project to the `out` folder:

```bash
gobble build out
```

Set the `--force` flag to clear out the target folder if it exists and is not empty:

```bash
gobble build out --force
gobble build out -f
```

### Build to a specific folder, and watch for changes

Like `gobble build`, except that the build will be updated whenever the source files change.

```bash
gobble watch out
```


## License

MIT.
