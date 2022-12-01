const {walk,saveStringToFile,parsePath,removeExt, pathChange,fileCopyWithPath,isPage,cat} = require('./utils.js')
const path = require('path');
const Engine = require('./engine.js');
const helpers = require('./helpers.js')


const engine = new Engine({root: '.',extension: 'html',
    helpers: { 
        capitalize : str => string[0].toUpperCase() + string.slice(1),
        print: o=>JSON.stringify(o)
    }
})

const generator = async function(relatedBasePath, relatedBaseOutPath, staticPath, helpers_funs){
    const cwd = process.cwd()
    const basePath = path.join(cwd,relatedBasePath)
    const baseOutPath = path.join(cwd,relatedBaseOutPath)

    engine.helpers = {...helpers_funs,...engine.helpers,...helpers(basePath,baseOutPath)}

    fileCopyWithPath(staticPath,baseOutPath)
    const pages = walk(basePath).filter(f=>isPage(f));
    const newFiles = []

    pages.map(async function(template_path){
        engine.render(removeExt(template_path), {}, async function (path, template, data, templateData, helpers){
            if(!isPage(path)){
                return
            }
            const json = templateData
            if(json instanceof Array){ //multifiles [{},{},{},{},{}]
                json.map(async function(d){
                    const begin = new Date()
                    const renderStr = await template(data, d, helpers)
                    const filePath = parsePath(template_path, {...data, ...d})
                    const file = saveStringToFile(pathChange(filePath,basePath,baseOutPath),renderStr)
                    newFiles.push(file)
                    console.log('['+((new Date().getTime() - begin)/1000) + "s]" + file)
                })
            }else{ //single file {}
                    const begin = new Date()
                    const renderStr = await template(data, json, helpers)
                    const filePath = parsePath(template_path, json)
                    const file = saveStringToFile(pathChange(filePath,basePath,baseOutPath),renderStr)
                    newFiles.push(file)
                    console.log(file + ':['+((new Date().getTime() - begin)/1000) + "s]")
            }
            return "-_-"
        })
    })
    //console.log(newFiles); 
}

module.exports = generator

if (process.argv.length===2 && process.argv[1] === __filename) {
    generator("test/in","test/out","test/public",{})
}