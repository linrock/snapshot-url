const fs = require('fs');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');
const beautify = require('js-beautify').html;
const axios = require('axios');

const OUT_DIR = './dist';                    // output dir, relative to this file
const HTML_OUTFILE = './dist/index.html';    // output html file, pretty-printed + cleaned

// replace script nodes with inline scripts
const SCRIPT_NODES = 'script';
const CSS_NODES = 'link[rel=stylesheet]';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}

const url = 'http://localhost:8080';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 5000});
  } catch {
    console.error(`Error: url not available: ${url}`);
    await browser.close();
    return;
  }
  // get the html after rendering all JS templates
  let finalHtml = `<!DOCTYPE html><html>
    ${await page.evaluate(() => document.documentElement.innerHTML)}
  </html>`;
  // remove some html tags that we don't need
  const dom = new JSDOM(finalHtml);
  dom.window.document.
    querySelectorAll(SCRIPT_NODES).
    forEach((scriptEl) => {
      const scriptSrc = scriptEl.attributes.src.value;
      const data = fs.readFileSync(scriptSrc, {encoding:'utf8', flag:'r'});
      console.log(data);
      // scriptEl.parentNode.removeChild(scriptEl);
      scriptEl.removeAttribute('src');
      scriptEl.innerHTML = data;
    });
  dom.window.document.
    querySelectorAll(CSS_NODES).
    forEach(async (cssNodeEl) => {
      const cssSrc = cssNodeEl.attributes.href.value;
      let data;
      if (cssSrc.startsWith('https://')) {
        // TODO wait for this to finish running
        // const data2 = await axios.get(cssSrc);
        // data = data2.data;
        return;
      } else {
        data = fs.readFileSync(cssSrc, {encoding:'utf8', flag:'r'});
      }
      const styleNode = dom.window.document.createElement('style');
      styleNode.innerHTML = data;
      cssNodeEl.parentNode.appendChild(styleNode);
      cssNodeEl.parentNode.removeChild(cssNodeEl);
      return true;
    });

  finalHtml = dom.serialize();
  finalHtml = beautify(finalHtml, { indent_size: 2 });

  // write the final html to a file
  fs.open(HTML_OUTFILE, 'w', (err) => {
    if (err) {
      throw `Couldn't open file: ${HTML_OUTFILE}`;
    }
    fs.writeFile(HTML_OUTFILE, finalHtml, async (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Saved static html to dist/index.html (size: ${finalHtml.length})`);
      }
      // exit now that we're done
      await browser.close();
    });
  });
})();
