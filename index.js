const beautifyCSS = require('js-beautify').css
const stylelint = require('stylelint')
const globby = require('globby')
const fs = require('fs-extra')
const explorer = require('cosmiconfig')('stylelint')
const chalk = require('chalk')
const path = require('path')

let stylelintConfigOptions
const exploreConfig = () => {
  explorer.search().then(({
    isEmpty,
    filepath,
    config
  }) => {
    if (isEmpty) {
      console.log(chalk.default.red('Please apply the config of stylelint'))
      process.exit(1)
    } else {
      return config
    }
  }).catch(() => {
    console.log(chalk.default.red('Please report this bug'))
  })
}

const styleValidExt = ['css', 'scss', 'less']

const readFile = (path, ext) => {
  return fs.readFile(path, 'utf-8')
    .then(async data => {
      let beautiData = data
      let result
      if (styleValidExt.includes(ext)) {
        let beautiData = data
        beautiData = beautifyCSS(data)
        result = await stylelint.lint({
          code: beautiData,
          config: stylelintConfigOptions,
          syntax: ext,
          fix: true
        })
      } else if (ext === 'vue') {
        result = await stylelint.lint({
          code: beautiData,
          config: stylelintConfigOptions,
          customSyntax: 'postcss-html',
          fix: true
        })
      } else {
        console.log(chalk.default.red('.' + ext + '文件不被支持'))
        process.exit(1)
      }

      if (data === result.output) {
        console.log(chalk.default.cyan(`path: ${path} 无需改写`))
      } else {
        fs.outputFile(path, result.output)
          .then(res => {
            console.log(chalk.default.green(`path: ${path} 写入成功`))
          })
          .catch(() => {
            console.log(chalk.default.red(`path: ${path} 写入失败`))
          })
      }
    })
}

module.exports = async filePattern => {
  stylelintConfigOptions = await exploreConfig()
  globby([filePattern]).then(async paths => {
    const length = paths.length
    console.log(chalk.default.cyan(`扫描有${length}条记录`))
    const Files = paths.map(src => {
      const absolutePath = path.resolve(process.cwd(), src)
      const ext = path.extname(absolutePath).slice(1).toLowerCase()
      return readFile(absolutePath, ext)
    })
    await Promise.all(Files)
  })
}
