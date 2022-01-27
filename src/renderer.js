const fs = require('fs');

const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');
const beautify = require('js-beautify').html;
const axios = require('axios');

const CSS_NODES = 'link[rel=stylesheet]';

const getRenderedDomFromUrl = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 5000
    });
  } catch {
    console.error(`Error: url not available: ${url}`);
    await browser.close();
    return;
  }
  // get the html after running all JS and rendering the DOM
  const renderedHtml = `<!DOCTYPE html><html>
    ${await page.evaluate(() => document.documentElement.innerHTML)}
  </html>`;

 // exit the browser since we rendered the html already
  await browser.close();

  return new JSDOM(renderedHtml);
};

const getHtmlFromUrl = async (url) => {
  // get the rendered DOM and make modifications to it
  const dom = getRenderedDomFromUrl(url);

  /*
  // remove some html tags that we don't need
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
  */

  // read local CSS files and inline them in the DOM
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

  const finalHtml = beautify(dom.serialize(), {
    indent_size: 2
  });

  return finalHtml;
}

module.exports.getRenderedDomFromUrl = getRenderedDomFromUrl;
module.exports.getHtmlFromUrl = getHtmlFromUrl;
