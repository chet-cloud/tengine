const generator = require("../index.js")

const helpers_functions = {
    max:(a,b)=>a>b?a:b
}

const pages = "test/pages"

const output = "test/out"

const public = "test/public"

generator(pages, output, public, helpers_functions)