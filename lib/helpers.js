const {pathChange,cat} = require('./utils.js')
const path = require('path');
const fse = require('fs-extra')
const Engine = require('./engine.js');

module.exports = (basePath,baseOutPath)=>{
    const include_once_cache = {}
    return {
        include_js : (node_js_file, isInline)=>{
            const node_js_file_path = path.join(basePath, node_js_file)
            if(isInline){
                return `<script type='text/javascript'> ${cat(node_js_file_path)} </script>`
            }else{
                const new_js_file = pathChange(node_js_file_path,basePath,baseOutPath)
                if(!fse.existsSync(new_js_file)){
                    fse.copySync(node_js_file_path, new_js_file)
                }
                return `<script type='text/javascript' src='${node_js_file}'></script>`
            }
        },
        include_rendered_template: (temp,data)=>{
            const engine = new Engine({root: '.',extension: 'html', helpers: {}})
            if(!include_once_cache.hasOwnProperty(temp)){
                include_once_cache[temp] = engine.render(temp,data)
            }
            return include_once_cache[temp]
        }

    }
}