// https://github.com/ahmadnassri/node-template-literals-engine

const { resolve } = require('path')
const matter = require('gray-matter')
var requireFromString = require('require-from-string');
const {getScriptStr} = require("./utils.js");



class Engine {
  constructor ({ root, extension, helpers = {}, matter } = {}) {
    this.cache = {}
    this.root = root || process.cwd()
    this.extension = extension || 'jstl'
    this.matter = matter | {}
    this.helpers = {
      ...helpers,
      include: async (name, data) => {
        const result = await this.render(name, data)
        return result
      },
      map: async (name, array) => { 
        return await Promise.all(array.map(async (item) => this.render(name, item))).join('\n')
      }
    }
  }

  compile (literal) {
    const AsyncFunction = (async function () {}).constructor;
    return new AsyncFunction('data', 'fn', `return \`${literal}\``) // eslint-disable-line no-new-func
  }

  load (name) {
    if (!this.cache[name]) {
      const path = resolve(this.root, `${name}.${this.extension}`)
      const { content, data } = matter.read(path, this.matter)
      const {script,update_content} = getScriptStr(content)
      this.cache[name] = {
        script,
        path,
        data,
        template: this.compile(update_content)
      }
    }

    return this.cache[name]
  }

  async render (name, templateData, callback) {
    const { data, template, script, path } = this.load(name)

    if((typeof script === 'string' || script instanceof String) && script.includes('module.exports')){
      const start = new Date().getTime()
      templateData = await requireFromString(script)(templateData)
      console.log("\t[" + (new Date().getTime() - start)/1000+"s]:"+ path)
    }

    let content = "";

    const render_fn = async (data, templateData, helpers)=>{
      content = await template({ ...data, ...templateData }, helpers)
      // apply layout first
      if (data.layout) {
        const layoutData = { ...data, ...templateData, content }
        // remove the processed layout
        delete layoutData.layout
        content = await this.render(data.layout, layoutData, callback)
      }
      return content
    }

    if(callback instanceof Function) {
      content = await callback(path, render_fn, data, templateData, this.helpers)
    }
    
    if (!(typeof content === 'string' || content instanceof String) || content.trim().length ===0){
      content = await render_fn(data, templateData, this.helpers)
    }

    return content
  }
}



module.exports = Engine