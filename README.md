# snapshot-url

A node.js library for rendering HTML from URLs
after loading assets on the page (images, javascript).

Lightweight wrappers around:

* [puppeteer](https://github.com/puppeteer/puppeteer)
* [jsdom](https://github.com/jsdom/jsdom)
* [js-beautify](https://github.com/beautify-web/js-beautify)

Example usage:

```js
const { Snapshot } = require('snapshot-url');

const url = 'file:///tmp/build/index.html';
const snapshot = new Snapshot(url);
const dom = await snapshot.renderDOM();
  
const document = dom.window.document;
const finalHtml = snapshot.getHtml({ prettyPrint: true });
```

### License

MIT
