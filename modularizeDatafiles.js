const fs = require('fs');

fs.readFile('../Trading/rawData/GBPJPY-1M-2002.js', 'utf8', (err, data) => {
  if (err) throw new Error(err);

  const months = [];
  let cachedMonth = '01';
  let iStart = 0;
  let iFinish = 0;

  data
  .split('GBPJPY,');
  .forEach((chunk, i) => {
    iFinish = i;
    if (chunk.length) {
      const date = chunk.split(',')[0];
      const month = date.slice(4, 6);
      if (month !== cachedMonth) {
        cachedMonth = month;
        months.push({
          iStart,
          iFinish,
        });
      }
    }
  });
});
