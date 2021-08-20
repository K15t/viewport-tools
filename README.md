# viewport-tools


## Deprecation Notice

This module will be deprecated for its alternative [viewport-uploader](https://github.com/K15t/viewport-uploader). Copy and follow the instructions of the [basic example](https://github.com/K15t/viewport-uploader/tree/master/examples/basic) of this new module to get started with Viewport Theme Development. It uses webpack for bundling which allows you to use ES6 style javascript in your custom theme. `viewport-tools` won't receive any more updates in the future.

The viewport-tools contain command-line tools for
[Scroll Viewport](https://www.k15t.com/software/scroll-viewport) theme
developers.

***

## Installation

Being command-line the viewport-tools should be installed globally.

```bash
$ npm install -g viewport-tools
```

If that doesn't work, try ``$ sudo npm install -g viewport-tools``.


## Usage

### Initialize local development

Set up ``~/.viewportrc`` to develop locally with the gulp-viewport plugin:

```bash
$ viewport init
```


### Create a new Scroll Viewport Theme

Create a new Scroll Viewport theme project:

```bash
$ viewport create
```

NOTE: Make sure to follow the getting started steps provided when the theme has been created.


## Development

1. Checkout project
1. Do `npm link`

### Resources

* Tim Pettersen: __Building command line tools with Node.js__, URL: https://developer.atlassian.com/blog/2015/11/scripting-with-node/
* The npm Blog: __Building a simple command line tool with npm__, URL: http://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm

# License

MIT
