# viewport-tools

The viewport-tools contain command-line tools for 
[Scroll Viewport](https://www.k15t.com/software/scroll-viewport) theme 
developers.


## Installation

Being command-line the viewport-tools should be installed globally.

```bash
$ npm install -g viewport-tools
```

If that doesn't work try to ``sudo`` the above command.


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



## Development

1. Checkout project
1. Do `npm link`

### Resources

* Tim Pettersen: __Building command line tools with Node.js__, URL: https://developer.atlassian.com/blog/2015/11/scripting-with-node/
* The npm Blog: __Building a simple command line tool with npm__, URL: http://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm

# License 

MIT