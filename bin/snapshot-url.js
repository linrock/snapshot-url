const path = require("path");
const { getHtmlFromUrl } = require('../src/renderer');
const { writeFile } = require("../src/file_utils");

const url = process.argv[2];
const outFile = process.argv[3];

let finalUrl;
if (!url.startsWith('http')) {
  finalUrl = `file://${path.resolve(url)}`;
} else {
  finalUrl = url;
}

getHtmlFromUrl(finalUrl).then(finalHtml => {
  writeFile(finalHtml, outFile).then(() => process.exit());
});
