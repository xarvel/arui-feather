/* eslint import/no-extraneous-dependencies: 0 */

const aruiConfig = require('arui-presets/postcss');
const argbColors = require('alfa-ui-primitives/colors');
const hexToRgba = require('hex-to-rgba');

const mq = require('./src/mq/mq.json');
const colors = Object.entries(argbColors).reduce((result, item) => {
    let value = item[1].split('');

    // Colors from primitives comes in HEX/ARGB format, so we need to turn it into RGBA for web
    if (value.length === 9) {
        let aa = value.splice(1, 2);
        value = value.concat(aa);
    }

    result[item[0]] = hexToRgba(value.join(''));

    return result;
}, {});

module.exports = aruiConfig(mq, colors);
