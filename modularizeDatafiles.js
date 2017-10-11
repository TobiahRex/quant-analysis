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
  let fileContent = '';

  bbPromise
  .fromCallback(cb => fs.readFile(fileName, 'utf8', cb))
  .then((data) => {
    fileContent = data;
    let cachedMonth = '00';
    let iStart = 0;
    let iFinish = 0;

    fileContent = data.replace(/GBPJPY/g, '<<<>>>').split('<<<');
    const splitData = data.split('GBPJPY,');

    splitData
    .reduce((acc, chunk, i, array) => {
      // increments as each chunk shares a common month value.
      iFinish = i;

      if (chunk.length) {
        // locate the date and month.
        const date = chunk.split(',')[0];
        const month = date.slice(4, 6);
        const arrLength = array.length - 1;

        // verify the currently cached month is different than the current month.
        if (i === arrLength) {
          acc.push({
            iStart,
            iFinish: arrLength,
          });
          return acc;
        }

        if (month !== cachedMonth) {
          if (cachedMonth === '00') {
            cachedMonth = month;
            iStart = i;
            return acc;
          }

          cachedMonth = month;
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
    .forEach(({ iStart, iFinish }, i) => {
      let fileName = `../Trading/moduleRawData/GBP-JPY-1M-2002-${i < 9 ? 0 : ''}${i + 1}.js`;

      let chunk = fileContent.slice(iStart, iFinish);
      let newContent = `const x = \`${chunk}\`;`;

      bbPromise
      .fromCallback(cb => fs.writeFile(fileName, newContent, 'utf8', cb))
      .then((data) => {
        console.log(`Saved month "${i + 1}".`);
      })
      .catch(console.error);
    });
  })
  .catch(console.error);
}

[
  '../Trading/rawData/GBPJPY-1M-2002.js',
  // '../Trading/rawData/GBPJPY-1M-2003.js',
  // '../Trading/rawData/GBPJPY-1M-2004.js',
  // '../Trading/rawData/GBPJPY-1M-2005.js',
  // '../Trading/rawData/GBPJPY-1M-2006.js',
  // '../Trading/rawData/GBPJPY-1M-2007.js',
  // '../Trading/rawData/GBPJPY-1M-2008.js',
  // '../Trading/rawData/GBPJPY-1M-2009.js',
  // '../Trading/rawData/GBPJPY-1M-2010.js',
  // '../Trading/rawData/GBPJPY-1M-2011.js',
  // '../Trading/rawData/GBPJPY-1M-2012.js',
  // '../Trading/rawData/GBPJPY-1M-2013.js',
  // '../Trading/rawData/GBPJPY-1M-2014.js',
  // '../Trading/rawData/GBPJPY-1M-2015.js',
].forEach((file => {
  modularizeFiles(file);
}));
