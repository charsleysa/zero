#!/usr/bin/env coffee
require 'shelljs/make'
fs = require 'fs'
os = require 'os'

version    = '1.3.0'
_zero      = 'zero'
_zero_big  = 'zero.big'
_js        = 'dist/{name}.js'
_min       = 'dist/{name}.min.js'
_gz        = 'dist/{name}.min.gz'

port = 3999
root = __dirname + '/'

target.all = ->
  target.dist()
  target.test()

## TASKS ##

target.test = ->
  test_app = require './test/server'
  server = test_app.listen port
  command = if os.platform() == "win32" then "start .\\node_modules\\.bin\\" else "./node_modules/.bin/"
  exec command + "phantomjs test/runner.coffee 'http://localhost:#{port}/'", (code) ->
    server.close -> exit(code)

target.dist = ->
  name = filename(_zero)
  modules = env['MODULES'] || 'zero event ajax form fx'
  target.build(name, modules)
  target.minify(name)
  target.compress(name)
  name = filename(_zero_big)
  modules = 'zero event ajax assets callbacks data deferred detect form fx fx_methods selector stack touch'
  target.build(name, modules)
  target.minify(name)
  target.compress(name)

target.build = (name, modules) ->
  cd __dirname
  mkdir '-p', 'dist'
  modules = modules.split(' ')
  module_files = ( "src/#{module}.js" for module in modules )
  intro = "/* Zero #{describe_version()} - #{modules.join(' ')} */\n"
  dist = intro + cat(module_files).replace(/^\/[\/*].*$/mg, '').replace(/\n{3,}/g, "\n\n")
  dist.to(name.js)
  report_size(name.js)

target.minify = (name) ->
  zero_code = cat(name.js)
  intro = zero_code.slice(0, zero_code.indexOf("\n") + 1)
  (intro + minify(zero_code)).to(name.min)
  report_size(name.min)

target.compress = (name) ->
  gzip = require('zlib').createGzip()
  inp = fs.createReadStream(name.min)
  out = fs.createWriteStream(name.gz)
  inp.pipe(gzip).pipe(out)
  out.on 'close', ->
    report_size(name.gz)
    factor = fsize(name.js) / fsize(name.gz)
    echo "compression factor: #{format_number(factor)}"

## HELPERS ##

filename = (name) ->
  file =
    js: _js.replace(/\{name\}/g, name)
    min: _min.replace(/\{name\}/g, name)
    gz: _gz.replace(/\{name\}/g, name)
  return file

stale = (file, source) ->
  target[source]()
  !test('-e', file) || mtime(file) < mtime(source)

mtime = (file) ->
  fs.statSync(file).mtime.getTime()

fsize = (file) ->
  fs.statSync(file).size

format_number = (size, precision = 1) ->
  factor = Math.pow(10, precision)
  decimal = Math.round(size * factor) % factor
  parseInt(size) + "." + decimal

report_size = (file) ->
  echo "#{file}: #{format_number(fsize(file) / 1024)} KiB"

describe_version = ->
  desc = exec "git --git-dir='#{root + '.git'}' describe --tags HEAD", silent: true
  if desc.code is 0 then desc.output.replace(/\s+$/, '') else version

minify = (source_code) ->
  uglify = require('uglify-js')
  compressor = uglify.Compressor()
  ast = uglify.parse(source_code)
  ast.figure_out_scope()
  ast.compute_char_frequency();
  ast.mangle_names();
  ast = ast.transform(compressor)
  return ast.print_to_string()
