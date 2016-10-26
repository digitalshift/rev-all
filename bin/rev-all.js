#!/usr/bin/env node
'use strict'

const gulp = require('gulp')
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
  .option('-s --dont-search [regex]',
          'A regex of files to not search for references')
  .option('--blacklist [regex]',
          'A regex of files to neither rename, search or update')
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
    dontSearchFile: options.dontSearch ? options.dontSearch.split(',') : [],
    fileNameManifest: options.manifest && path.basename(options.manifest),
    debug: options.verbose
  })

  let stream = gulp.src(inputFiles)
    .pipe(revAll.revision())
    .pipe(gulp.dest(output))

  if (options.manifest) {
    const dir = path.dirname(options.manifest)

    stream = stream
      .pipe(revAll.manifestFile())
      .pipe(gulp.dest(dir))
  }
}
