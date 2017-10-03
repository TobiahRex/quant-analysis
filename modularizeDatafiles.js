const fs = require('fs');

fs.readFile('../Trading/rawData/GBPJPY-1M-2002.js', 'utf8', (err, data) => {
  if (err) throw new Error(err);

  console.log('\nData: \n', data.split('GBPJPY,').slice(0, 500));
})
