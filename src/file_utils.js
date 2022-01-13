const fs = require('fs');

const writeFile = (data, outFile) => {
  return new Promise((resolve, reject) => {
    // write the final html to a file
    fs.open(outFile, 'w', (err) => {
      if (err) {
        reject(`Couldn't open file: ${outFile}`);
      }
      fs.writeFile(outFile, data, async (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Wrote static html to ${outFile} (size: ${data.length})`);
          resolve(true);
        }
      });
    });
  });
}

module.exports.writeFile = writeFile;
