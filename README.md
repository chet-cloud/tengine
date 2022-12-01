# tengine

### start
```shell
# install
npm i @cchet/tengine
```

```js
// pages  - the directory containing templates
// out    - the directory containing the output files
// public - static files copy to out directory
// helpers_functions - helper functions can be invoked in templates
require("@cchet/tengine")("pages", "out", "public", {
    max:(a,b)=>{...} //helpers_functions
})

```

### how to use it.
- Template files
    1. All files in pages with extension '.html' and not start with '_' will be templates
    2. Except for templates, other files will be copied to the output directory.
- Root Template file

- Leaf Template file

- Nodejs script

- Helpers functions

- Template file with variable name


