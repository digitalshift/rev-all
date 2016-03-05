#!/usr/bin/env node
'use strict'

const gulp = require('gulp')
const RevAll = require('gulp-rev-all')
const args = require('commander')
const path = require('path')

args
  .version('0.0.0')
  .usage('[options] <input dir> <output dir>')
  .arguments('<input> <output>')
  .option('-m --manifest [path]',
          'If specified, outputs a JSON manifest at the given path')
  .option('-x --dont-rename [regex]',
          'A regex of files to not rename with a hash')
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
    fileNameManifest: options.manifest && path.basename(options.manifest)
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
