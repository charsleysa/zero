# Zero.js – a minimalist JavaScript library

Zero is a minimalist JavaScript library for modern browsers with a largely jQuery-compatible API.
If you use jQuery or Zepto.js, you already know how to use Zero.

Zero began as a fork from Zepto.js but has had its internals restructured to be compatible with all modern browsers.

Zero also has performance improvements that surpass that of Zepto.js and in some cases even jQuery 2.

Zero.js is licensed under the terms of the MIT License.

## Building

[![Build Status](https://api.travis-ci.org/charsleysa/zero.png?branch=master)](http://travis-ci.org/charsleysa/zero)

Check out Zero's source code and use the build commands.

You will need Node.js installed on your system.

~~~ sh
$ npm install
$ npm run-script dist
~~~

The resulting files are:

1. `dist/zero.js`
2. `dist/zero.min.js`

If you install CoffeeScript globally, you can run `make` directly:

~~~ sh
$ coffee make dist
$ MODULES="zero event data ..." ./make dist
~~~

## Pre-compiled files

A pre-compiled version of Zero is available at [jsDelivr][jsdelivrzero].

This contains all the modules that are ticked in the Zero modules section below.

```html
<!-- Uncompressed -->
<script type="text/javascript" src="//cdn.jsdelivr.net/zero.js/1.1.0/zero.js"></script>

<!-- Minified -->
<script type="text/javascript" src="//cdn.jsdelivr.net/zero.js/1.1.0/zero.min.js"></script>
```

## Zero modules

Zero modules are individual files in the "src/" directory.

<table>
<thead><tr>
  <th>module</th> <th>default</th> <th>description</th>
</tr></thead>
<tbody>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/zero.js#files">zero</a></th>
    <td>✔</td>
    <td>Core module; contains most methods</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/event.js#files">event</a></th>
    <td>✔</td>
    <td>Event handling via <code>on()</code> &amp; <code>off()</code></td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/detect.js#files">detect</a></th>
    <td>✔</td>
    <td>Provides <code>$.os</code> and <code>$.browser</code> information</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/fx.js#files">fx</a></th>
    <td>✔</td>
    <td>The <code>animate()</code> method</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/fx_methods.js#files">fx_methods</a></th>
    <td></td>
    <td>
      Animated <code>show</code>, <code>hide</code>, <code>toggle</code>,
      and <code>fade*()</code> methods.
    </td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/ajax.js#files">ajax</a></th>
    <td>✔</td>
    <td>XMLHttpRequest Level 2 functionality</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/ajax-xhr1.js#files">ajax-xhr1</a></th>
    <td></td>
    <td>XMLHttpRequest Level 1 functionality (To support PhantomJS lower than version 2.0)</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/form.js#files">form</a></th>
    <td>✔</td>
    <td>Serialize &amp; submit web forms</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/callbacks.js#files">callbacks</a></th>
    <td>✔</td>
    <td>Zero equivalent of jQuery $.Callbacks (Thanks to @caitp https://github.com/caitp )</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/deferred.js#files">deferred</a></th>
    <td>✔</td>
    <td>Zero equivalent of jQuery $.Deferred (Thanks to @caitp https://github.com/caitp )</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/assets.js#files">assets</a></th>
    <td></td>
    <td>
      Experimental support for cleaning up iOS memory after removing
      image elements from the DOM.
    </td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/data.js#files">data</a></th>
    <td></td>
    <td>
      A full-blown <code>data()</code> method, capable of storing arbitrary
      objects in memory.
    </td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/selector.js#files">selector</a></th>
    <td></td>
    <td>
      Experimental <a href="http://api.jquery.com/category/selectors/jquery-selector-extensions/">jQuery
      CSS extensions</a> support for functionality such as <code>$('div:first')</code> and
      <code>el.is(':visible')</code>.
    </td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/touch.js#files">touch</a></th>
    <td></td>
    <td>Fires tap– and swipe–related events on touch devices. Works with both touch events and mspointer events.</td>
  </tr>
  <tr>
    <th><a href="https://github.com/charsleysa/zero/blob/master/src/stack.js#files">stack</a></th>
    <td></td>
    <td>Provides <code>andSelf</code> &amp; <code>end()</code> chaining methods</td>
  </tr>
</tbody>
</table>

## Contributing

Get in touch:

* @[charsleysa](http://twitter.com/charsleysa)

### Write documentation

Zero currently has no documentation available.
Since the API is based off Zepto.js you can use most of their documentation to learn how to use Zero.
Please note that most of the API's marked deprecated in the Zepto.js documentation are not available in Zero.

### Report a bug

1. Check if the bug is already fixed in the [master branch][master] since the
   last release.
2. Check [existing issues][issues]. Open a new one, including exact browser &
   platform information. For better formatting of your report, see
   [GitHub-flavored Markdown][mkd].

### Running tests

You will need to install [PhantomJS][phantomjs].

If you use Node.js it will automatically be installed as a dependancy when you run the `npm install` command.

To run the test suite, these are all equivalent:

~~~ sh
$ npm test
$ ./make test
$ script/test
~~~

To run manually run tests (all except for the ajax module) on a device,
you can serve the whole Zero folder on a web server and open
`test/index.html` in the device's browser.

  [master]: https://github.com/charsleysa/zero/commits/master
  [issues]: https://github.com/charsleysa/zero/issues
  [mkd]: http://github.github.com/github-flavored-markdown/
  [evidence.js]: https://github.com/tobie/Evidence
  [phantomjs]: http://code.google.com/p/phantomjs/wiki/Installation
  [jsdelivrzero]: http://www.jsdelivr.com/#!zero.js
