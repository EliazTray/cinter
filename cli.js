#!/usr/bin/env node
const chalk = require('chalk')
const cli = require('cac')()
const {
  dump
} = require('dumper.js')
const main = require('.')

cli.command('fix', {
  desc: 'cinter combines `js-beautify` & `stylelint`, First call `js-beautify` fix function output string as input to `stylelint`'
}, (input, flags) => {
  if (!input.length) {
    console.log(chalk.default.red('Please input the files you want to fix'))
    process.exit(1)
  } else {
    main(input[0])
  }

})
// 异常退出
cli.on('error', err => {
  console.log(chalk.default.red('command failed', err))
  process.exit(1)
})

cli.parse()

