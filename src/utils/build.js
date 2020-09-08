const fs = require("fs-extra")
const path = require("path")

const hasChildHash = {
  ECharts: 1,
  Material: 1,
  Table: 1,
  Target: 1,
}

function buildUmd(params) {
  let skipFiles = []
  const outUmdFolderName = "umd-dist"
  const distPath = path.resolve(__dirname, `../${outUmdFolderName}`)
  if (fs.existsSync(distPath)) {
    skipFiles = fs.readdirSync(distPath)
  }

  const filePath = path.resolve(__dirname, "../src/libs")
  const files = fs.readdirSync(filePath).filter((v) => {
    if (v.includes("js") || v.includes(".DS_Store")) {
      return false
    }
    return true
  })

  const pushPath = (pre, next, filePath) => {
    let arr = pre
    const libPath = `${filePath}/${next}/lib`
    const configPath = `${filePath}/${next}/config`
    const dataPath = `${filePath}/${next}/data.js`
    if (!skipFiles.includes(next)) {
      if (fs.existsSync(dataPath)) {
        arr = [
          ...arr,
          {
            input: dataPath,
            output: {
              file: `${outUmdFolderName}/${next}/data.js`,
              name: `${next}Data`,
            },
            modalKey: next,
          },
        ]
      }

      if (fs.existsSync(libPath)) {
        arr = [
          ...arr,
          {
            input: libPath,
            output: {
              file: `${outUmdFolderName}/${next}/lib.js`,
              name: `${next}Lib`,
            },
            modalKey: next,
          },
        ]
      }

      if (fs.existsSync(configPath)) {
        arr = [
          ...arr,
          {
            input: configPath,
            output: {
              file: `${outUmdFolderName}/${next}/config.js`,
              name: `${next}Config`,
            },
            modalKey: next,
          },
        ]
      }
    }
    return arr
  }

  const inputAndOutputList = files.reduce((pre, next) => {
    if (hasChildHash[next]) {
      const baseFilePath = `${filePath}/${next}`
      const childFileNames = fs.readdirSync(baseFilePath).filter((v) => {
        if (v.includes("js") || v.includes(".DS_Store")) {
          return false
        }
        return true
      })
      return childFileNames.reduce((pre, next) => {
        return pushPath(pre, next, baseFilePath)
      }, pre)
    }

    return pushPath(pre, next, filePath)
  }, [])

  return inputAndOutputList
}

module.exports = buildUmd
