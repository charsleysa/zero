#!/usr/bin/env coffee
require 'shelljs/make'
fs = require 'fs'
os = require 'os'

version   = '1.1.25'
zero_js  = 'dist/zero.js'
zero_min = 'dist/zero.min.js'
zero_gz  = 'dist/zero.min.gz'

port = 3999
root = __dirname + '/'

target.all = ->
  target[zero_js]()
  target.test()

## TASKS ##

target.test = ->
  test_app = require './test/server'
  server = test_app.listen port
  command = if os.platform() == "win32" then "start .\\node_modules\\.bin\\" else "./node_modules/.bin/"
  exec command + "phantomjs test/runner.coffee 'http://localhost:#{port}/'", (code) ->
    server.close -> exit(code)

target[zero_js] = ->
  target.build() unless test('-e', zero_js)

target[zero_min] = ->
  target.minify() if stale(zero_min, zero_js)

target[zero_gz] = ->
  target.compress() if stale(zero_gz, zero_min)

target.dist = ->
  target.build()
  target.minify()
  target.compress()

target.build = ->
  cd __dirname
  mkdir '-p', 'dist'
  modules = (env['MODULES'] || 'zero detect event ajax form fx callbacks deferred').split(' ')
  module_files = ( "src/#{module}.js" for module in modules )
  intro = "/* Zero #{describe_version()} - #{modules.join(' ')} */\n"
  dist = intro + cat(module_files).replace(/^\/[\/*].*$/mg, '').replace(/\n{3,}/g, "\n\n")
  dist.to(zero_js)
  report_size(zero_js)

target.minify = ->
  target.build() unless test('-e', zero_js)
  zero_code = cat(zero_js)
  intro = zero_code.slice(0, zero_code.indexOf("\n") + 1)
  (intro + minify(zero_code)).to(zero_min)
  report_size(zero_min)

target.compress = ->
  gzip = require('zlib').createGzip()
  inp = fs.createReadStream(zero_min)
  out = fs.createWriteStream(zero_gz)
  inp.pipe(gzip).pipe(out)
  out.on 'close', ->
    report_size(zero_gz)
    factor = fsize(zero_js) / fsize(zero_gz)
    echo "compression factor: #{format_number(factor)}"

## HELPERS ##

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
  ast = uglify.parser.parse(source_code)
  ast = uglify.uglify.ast_mangle(ast)
  ast = uglify.uglify.ast_squeeze(ast)
  uglify.uglify.gen_code(ast)
