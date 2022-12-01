// const axios = require('axios') ;
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');


// async function download(url,name){
//     if(!fs.existsSync( name )){
//         await axios({
//             method: "get",
//             url: url,
//             responseType: "stream"
//         }).then(function (response) {
//             response.data.pipe(fs.createWriteStream(name));
//             return name
//         });
//     }
// }

async function filesList(dir){
    const files = await fs.promises.readdir(dir);
    return files;
}

function filesListSync(dir){
    const files = fs.readdirSync(dir);
    return files;
}

function dirClean(dir){
    for (const file of fs.readdirSync(dir)) {
        const f = path.join(dir, file)
        if(fs.lstatSync(f).isDirectory()){
            dirClean(f)
        }else{
            fs.unlinkSync(f);
        } 
    }
}

/**
const fse = require('fs-extra');

const srcDir = `path/to/file`;
const destDir = `path/to/destination/directory`;
                                 
// To copy a folder or file, select overwrite accordingly
try {
  fs.copySync(srcDir, destDir, { overwrite: true|false })
  console.log('success!')
} catch (err) {
  console.error(err)
}
 */
function fileCopyWithPath(from,to){
    fse.copySync(from, to, { overwrite: true, filter : (f)=>{
        return !f.endsWith(".html") || !path.basename(f).startsWith("_")
    }})
}


function fileMoveSync(from,to){
    fs.cpSync(from,to,{force:true});
    fs.unlinkSync(from);
}

async function getJSON(file){
    let f = await fs.promises.readFile(file,{encoding:'utf8', flag:'r'})
    return JSON.parse(f.toString('utf8'))
}

function cat(file){
    let f = fs.readFileSync(file)
    return f.toString('utf8')
}

function getJSONSync(file){
    let f = fs.readFileSync(file)
    return JSON.parse(f.toString('utf8'))
}

async function saveJSON(file, jsonObject){
    await fs.promises.writeFile(file, JSON.stringify(jsonObject))
}

function saveStringToFile(file,str){
    // xxx/yyy/ccc.html => xxx/yyy/ccc/index.html
    // xxx/yyy/index.html => xxx/yyy/index.html
    // let file = "xxx/yyy/ccc.html"
    const file_index = file.lastIndexOf("/")
    const ex_file = file.substring(file_index + 1)

    if(ex_file === 'index.html'){
         
    }else{
        const index = file.lastIndexOf(".")
        file = file.substring(0,index) + "/index" + file.substring(index)
    }

    try{
        fse.outputFileSync(file, str)
    }catch(e){
        debugger
    }

    return file
}

function output(file,str){
    fse.outputFileSync(file, str)
}

const replaceLast = function(str, find, replace) {
    var index = str.lastIndexOf(find);
    if (index >= 0) {
        return str.substring(0, index) + replace + str.substring(index + find.length);
    }
    return str.toString();
};

var walk = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else { 
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}


/**
 * Produces a function which uses template strings to do simple interpolation from objects.
 * 
 * Usage:
 *    var makeMeKing = generateTemplateString('${name} is now the king of ${country}!');
 * 
 *    console.log(makeMeKing({ name: 'Bryan', country: 'Scotland'}));
 *    // Logs 'Bryan is now the king of Scotland!'
 */
 var generateTemplateString = (function(){
    var cache = {};
    function generateTemplate(template){
        var fn = cache[template];
        if (!fn){
            // Replace ${expressions} (etc) with ${map.expressions}.
            var sanitized = template
                .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, function(_, match){
                    return `\$\{map.${match.trim()}\}`;
                })
                // Afterwards, replace anything that's not ${map.expressions}' (etc) with a blank string.
                .replace(/(\$\{(?!map\.)[^}]+\})/g, '');
            fn = Function('map', `return \`${sanitized}\``);
        }
        return fn;
    }
    return generateTemplate;
})();

function parseStringTemplate(str, obj) {
    let parts = str.split(/\$\{(?!\d)[\wæøåÆØÅ]*\}/);
    let args = str.match(/[^{\}]+(?=})/g) || [];
    let parameters = args.map(argument =>{ 
        return obj[argument] || (obj[argument] === undefined ? "" : obj[argument])
    });
    return String.raw({ raw: parts }, ...parameters);
}

function parsePath(template,data){
    const templateFn = generateTemplateString(template)
    return templateFn(data)
}
function removeExt(str){
    const e = "."
    const t=str.lastIndexOf(e);
    const result =  t<0?[str]:[str.substring(0,t),str.substring(t)] 
    return result[0]
}

function getScriptStr(content){
    let regex_start = /<script[^<>]*>/g;
    let regex_end = /<[^<>]+script>/g;
    let start_index = content.search(regex_start);
    let end_index = content.search(regex_end);
    if(start_index==-1 || end_index==-1){
        return {
            script: "",
            update_content: content,
        }
    }
    let start_length = content.match(regex_start)[0].length;
    let end_length = content.match(regex_end)[0].length;
    return {
        script: content.substring(start_index + start_length , end_index),
        update_content: content.substring(0 , start_index) + content.substring(end_index + end_length, content.length),
    }
}

function pathChange(filePath,basePath,baseOutPath){
    const result = path.join(baseOutPath, filePath.substring(basePath.length))
    return result 
}

const isPage = f=> {
    return f.endsWith(".html") && !path.basename(f).startsWith("_")
}

const require_json = function(json_path){
    return getJSONSync(json_path)
}


const Template = (literal,data,fn) => {
    return new Function('data', 'fn', `return \`${literal}\``) // eslint-disable-line no-new-func
}

// const Template_by_url = async (url,data,fn) => {
//     const literal = await axios({method: "get",url: url})
//     return (new Function('data', 'fn', `return \`${literal}\``))(data,fn) // eslint-disable-line no-new-func
// }

const Template_by_file = (file,data,fn) => {
    const literal = fse.readFileSync(file)
    return (new Function('data', 'fn', `return \`${literal}\``))(data,fn) // eslint-disable-line no-new-func
}

/*
 * Binary search in JavaScript.
 * Returns the index of of the element in a sorted array or (-n-1) where n is the insertion point for the new element.
 * Parameters:
 *     ar - A sorted array
 *     el - An element to search for
 *     compare_fn - A comparator function. The function takes two arguments: (a, b) and returns:
 *        a negative number  if a is less than b;
 *        0 if a is equal to b;
 *        a positive number of a is greater than b.
 * The array may contain duplicate elements. If there are more than one equal elements in the array, 
 * the returned value can be the index of any one of the equal elements.
 */
function binarySearch(ar, el, compare_fn) {
    var m = 0;
    var n = ar.length - 1;
    while (m <= n) {
        var k = (n + m) >> 1;
        var cmp = compare_fn(el, ar[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return k;
        }
    }
    return -m - 1;
}

function compare_number(a, b) {
  return a - b;
}

function us_time(date){
    return new Date(date).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"})
}



module.exports = {
    binarySearch,
    filesList,
    filesListSync,
    getJSON,
    getJSONSync,
    fileMoveSync,
    saveJSON,
    saveStringToFile,
    dirClean,
    walk,
    parsePath,
    removeExt,
    getScriptStr,
    pathChange,
    fileCopyWithPath,
    isPage,
    require_json,
    cat,output
};


if (process.argv.length===2 && process.argv[1] === __filename) {
    // console.log(parsePath("${slug}.html",{slug:12}) === "12.html")
    // console.log(parsePath("${slug}${a}.html",{slug:12,a:22}) === "1222.html")
    // console.log(removeExt("xxxxxx/dsfdsf.dd"))
    // const content = 'Aenean lacinia bibendum <a href="/life">life</a> sed consectetur. <a href="/work">Work</a> quis risus eget urna mollis ornare <a href="/about">about</a> leo. <script >a=1</script>dfdfdf'
    // console.log(getScriptStr(content))
    // function t(){
    //     return `
    //         /* <![CDATA[ */
    //         var zeenJS = {"root":"https:\/\/livingat300main.ca\/wp-json\/codetipi-zeen\/v1\/","nonce":"e4099b1e7f","qry":{"posts_per_page":"10","page":"3546","paged":1},"args":{"sDelay":5000,"subL":false,"lazy":true,"iconSorter":"<i class='tipi-i-chevron-down'><\/i>","iplComs":false,"heroFade":0.075,"iplMob":true,"fbComs":false,"lightbox":true,"disqus":false,"subCookie":true,"pluginsUrl":"https:\/\/livingat300main.ca\/wp-content\/plugins","frontpage":true,"ipl":["lets-review\/frontend\/js\/lets-review-scripts.min.js"]},"i18n":{"embedError":"There was a problem with your embed code. Please refer to the documentation for help.","loadMore":"Load More","noMore":"No More Content"}};
    //         /* ]]> */
    //     `
    // }
    // console.log(t())

    


}