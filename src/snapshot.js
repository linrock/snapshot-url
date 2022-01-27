const beautify = require('js-beautify').html;
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');

class Snapshot {
  url;
  dom;

  constructor(url) {
    this.url = url;
  }

  /** Use a headless browser to render the DOM */
  async renderDOM() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
      await page.goto(this.url, {
        waitUntil: 'networkidle2',
        timeout: 5000
      });
    } catch {
      console.error(`Error: failed to visit url: ${this.url}`);
      await browser.close();
      return;
    }

    // get the html after running all JS and rendering the DOM
    const renderedHtml = `<!DOCTYPE html><html>
      ${await page.evaluate(() => document.documentElement.innerHTML)}
    </html>`;

   // exit the browser since we rendered the html already
    await browser.close();

    this.dom = new JSDOM(renderedHtml);
    return this.dom;
  }

  /** Get rendered html with an option to pretty print it */
  getHtml(options = {}) {
    if (!this.dom) {
      console.error('DOM not rendered yet');
      return;
    }
    if (options.prettyPrint) {
      return beautify(this.dom.serialize(), {
        indent_size: 2,
      });
    }
    return this.dom.serialize();
  }
}

module.exports.Snapshot = Snapshot;
