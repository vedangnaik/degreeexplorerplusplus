# Degree Explorer++
University of Toronto's Degree Explorer, but better. Written completely from scratch to give you control, speed, and flexibility.

## Build
DE++ is written completely in vanilla HTML, CSS, and JavaScript and has zero dependencies, so simply run `git clone --recurse-submodules https://github.com/vedangnaik/degreeexplorerplusplus.git` to get started! The course, program, and other data are housed in another repository and added as a submodule to this one to keep the histories separate.

## Run
DE++ uses relatively modern JavaScript features such as `import`, `ES6 classes`, private fields, etc. Thus, you will need a modern browser: for Chrome, at least v91+, for Firefox, at least v90+ (Firefox only recently added support for private fields), and for Edge, at least v92+. Modules loaded via `import` are subject to the same-origin policy unfortunately, so a development server is required to load the site locally. Visual Studio Code's [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension works well for this. Alternatively, Python's built-in http server should do as well.
