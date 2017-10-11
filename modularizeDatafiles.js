const fs = require('fs');
const bbPromise = require('bluebird');

/**
* Function: Modularize Files
* The goal is to read the first comma seperate section of the chunk.  If month value changes, then save the beginning and ending index values for all chunks sharing a common month.
* After all the beginning and ending index values are found in step 1, then another iteration will commence, which will write only each month to a single file.
* @param: {string} - "fileName": The name of the file to read.
*
* @return: na
*/
function modularizeFiles(fileName) {
  bbPromise
  .fromCallback(cb => fs.readFile(fileName, 'utf8', cb))
  .then((data) => {
    let cachedMonth = '00';
    let iStart = 0;
    let iFinish = 0;
    // let modules = [];

    const results = data
    .split('GBPJPY,')
    .reduce((acc, chunk, i, array) => {
      // chunk = 20010102,230200,171.86,171.87,171.86,171.87,4

      // increments as each chunk shares a common month value.
      iFinish = i;

      if (chunk.length) {
        // locate the date and month.
        const date = chunk.split(',')[0];
        const month = date.slice(4, 6);
        const arrLength = array.length - 1;

        const lastChunk = (i === arrLength);
        const differentMonth = (month !== cachedMonth);

        // verify the currently cached month is different than the current month.
        if (lastChunk) {
          acc.push({
            iStart,
            iFinish: arrLength,
          });
          return acc;
        }

        if (differentMonth) {
          cachedMonth = month;

          if (cachedMonth === '00') {
            iStart = i;
            return acc;
          }

          const module = {
            iStart,
            iFinish,
          };

          iStart = iFinish + 1;
          acc.push(module);

          return acc;
        }
      }
      return acc;
    }, [])
    .forEach((section, i) => {
      console.log('section: ', section);
      let fileName = `../Trading/moduleRawData/GBP-JPY-1M-2002-${i <= 9 ? 0 : 1}-${i + 1}.js`;

      bbPromise
      .fromCallback(cb => fs.writeFile(fileName, 'utf8', cb))
      .then((data) => {
        console.log(`Saved month "${i + 1}".`);
      })
      .catch(console.error);
    });
  })
  .catch(console.error);
}

modularizeFiles('../Trading/rawData/GBPJPY-1M-2002.js');
