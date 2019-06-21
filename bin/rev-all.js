#!/usr/bin/env node
'use strict'

const vfs = require('vinyl-fs')
const RevAll = require('gulp-rev-all')
const args = require('commander')
const path = require('path')
const pkg = require('../package');

args
  .version(pkg.version)
  .usage('[options] <input dir> <output dir>')
  .arguments('<input> <output>')
  .option('-m --manifest [path]',
          'If specified, outputs a JSON manifest at the given path')
  .option('-x --dont-rename [regex]',
          'A regex of files to not rename with a hash')
  .option('-u --dont-update-reference [regex]',
          'Do not update references matching these rules')
  .option('-s --dont-search [regex]',
          'A regex of files to not search for references')
  .option('--blacklist [regex]',
          'A regex of files to neither rename, search or update')
  .option('--prefix [url]',
          'Prefixes absolute references with a string')
  .option('-v --verbose',
          'Enable verbose logging')
  .action((input, output, options) => {
    run(input, output, options)
  })

if (process.argv.length <= 2) {
  args.help()
} else {
  args.parse(process.argv)
}

function run (input, output, options) {
  const inputFiles = path.resolve(input, '**')

  const revAll = RevAll({
    dontRenameFile: options.dontRename ? options.dontRename.split(',') : [],
    dontUpdateReference: options.dontUpdateReference ? options.dontUpdateReference.split(',') : [],
    dontSearchFile: options.dontSearch ? options.dontSearch.split(',') : [],
    fileNameManifest: options.manifest && path.basename(options.manifest),
    prefix: options.prefix,
    debug: options.verbose
  })

  let stream = vfs.src(inputFiles)
    .pipe(revAll.revision())
    .pipe(vfs.dest(output))

  if (options.manifest) {
    const dir = path.dirname(options.manifest)

    stream = stream
      .pipe(revAll.manifestFile())
      .pipe(vfs.dest(dir))
  }
}
