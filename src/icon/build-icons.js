/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint import/no-extraneous-dependencies: [2, {"devDependencies": true}] */
const del = require('del');
const fs = require('fs');
const handlebars = require('handlebars');
const mkdirp = require('mkdirp');
const path = require('path');
const uppercamelcase = require('uppercamelcase');

const REGEXP = new RegExp(/([a-z]*)(_)(.*?)(_)(.*?)(_)([a-z]*)/, 'i');

const COPYRIGHT =
`/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */\n`;


const isDirectory = source => fs.lstatSync(source).isDirectory();

const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

// Pseudo glob
const getFiles = (source, extension) => {
    let results = [];
    if (!fs.existsSync(source)) return false;
    const files = fs.readdirSync(source);
    files.forEach((file) => {
        const filename = path.join(source, file);
        if (isDirectory(filename)) {
            results = results.concat(getFiles(filename, extension));
        } else if (filename.indexOf(extension) >= 0) {
            results.push(filename);
        }
    });
    return results;
};

// Delete folders
const clean = new Promise((resolve) => {
    const files = getDirectories('./src/icon');
    files.map(file => del.sync(file));
    resolve();
});

// Get Handlebars template
const getTemplate = (str, data) => {
    let template = handlebars.compile(fs.readFileSync(`./src/icon/icon.${str}.hbs`, 'utf8'));
    return template(data);
};


class Icon {
    constructor(iconPath) {
        this.path = iconPath;
        this.fileName = path.basename(iconPath, 'icon');
        this.categoryPath = `./src/icon/${this.getCategory()}/${this.getName()}/`;
        this.indexFile = `${this.categoryPath}index.js`;
        this.cssFile = `${this.categoryPath}${this.getName()}.css`;
        this.jsxFile = `${this.categoryPath}${this.getName()}.jsx`;
        this.handlebarsData = {
            name: this.getName(),
            size: this.getSize(),
            color: this.getColor(),
            aruiColor: this.getAruiColor(),
            // Rename some-thing -> IconSomeThing
            componentName: `Icon${uppercamelcase(this.getName())}`,
            classes: this.getClasses()
        };
    }

    getClasses() {
        let classes = `.icon_size_${this.getSize()}.icon_name_${this.getName()}`;
        if (!this.getAruiColor()) {
            classes += '.icon_colored';
        } else {
            classes += `.icon_theme_${this.getAruiColor()}`;
        }
        return classes;
    }

    // Category
    getCategory() {
        return path.basename(path.dirname(this.path));
    }

    // Name
    getName() {
        return this.fileName.match(REGEXP)[3];
    }

    // Size
    getSize() {
        return this.fileName.match(REGEXP)[5];
    }

    // Color
    getColor() {
        return this.fileName.match(REGEXP)[7];
    }

    getAruiColor() {
        let color = this.getColor();
        if (color === 'white') return 'alfa-on-color';
        if (color === 'black') return 'alfa-on-white';
        return false;
    }

    // Create folder structure
    createFolder() {
        return new Promise((resolve) => {
            mkdirp.sync(this.categoryPath);
            resolve();
        });
    }

    // Copy svg files
    copySVG() {
        fs.copyFile(
            this.path, `${this.categoryPath}${this.fileName}`,
            (err) => { if (err) throw err; }
        );
    }

    // Create index.js
    createIndex() {
        fs.writeFile(
            this.indexFile, getTemplate('js', this.handlebarsData),
            (err) => { if (err) throw err; }
        );
    }

    // Create jsx files
    createJSX() {
        fs.writeFile(
            this.jsxFile, getTemplate('jsx', this.handlebarsData),
            (err) => { if (err) throw err; }
        );
    }

    // Create css file if needed and add background image rule
    addCSS() {
        if (!fs.exists(this.cssFile)) {
            fs.writeFile(
                this.cssFile, COPYRIGHT,
                (err) => { if (err) throw err; }
            );
        }
        fs.appendFile(
            this.cssFile, getTemplate('css', this.handlebarsData), 'utf8',
            (err) => { if (err) throw err; }
        );
    }
}

// Folders to add
const folders = [
    'action',
    'banking',
    'brand',
    'category',
    'currency',
    'entity',
    'file',
    'ui',
    'user'
];

let files = [];

// Get icons
folders.forEach((folder) => {
    files.push(...getFiles(`./node_modules/alfa-ui-primitives/icons/${folder}`, '.svg'));
});

clean.then(() => {
    console.log('⏳ Creating icons'); // eslint-disable-line no-console
    files.forEach((iconPath) => {
        const currentIcon = new Icon(iconPath);
        currentIcon.createFolder()
            .then(() => {
                currentIcon.copySVG();
                currentIcon.createIndex();
                currentIcon.createJSX();
                currentIcon.addCSS();
            }).catch((err) => { if (err) throw err; });
    });
}).then(() => {
    console.log(`👌 ${files.length} icons created`); // eslint-disable-line no-console
}).catch((err) => { if (err) throw err; });
