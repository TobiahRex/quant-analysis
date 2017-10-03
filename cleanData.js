const fs = require('fs');
const m = require('moment');

const inputFiles = [
  'GBPJPY-1M-2001-01',
  'GBPJPY-1M-2001-02',
  'GBPJPY-1M-2001-03',
  'GBPJPY-1M-2001-04',
  'GBPJPY-1M-2001-05',
  'GBPJPY-1M-2001-06',
  'GBPJPY-1M-2001-07',
  'GBPJPY-1M-2001-08',
  'GBPJPY-1M-2001-09',
  'GBPJPY-1M-2001-10',
  'GBPJPY-1M-2001-11',
  'GBPJPY-1M-2001-12',
];
``
const timeFrames = [
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
];

inputFiles.forEach((file) => {
  fs.readFile(`../Trading/rawData/${file}.js`, 'utf8', (err, data) => {
    const candle = generateCandle(data, 'GBPJPY,', '5m');

    let newFile = file.replace(/1M/g, '5M');

    fs.writeFile(
      `../Trading/parsedData/${newFile}-parsed.js`,
      (`const gpyJpy1m = ${JSON.stringify(candle)}`),
      ((err, data) => {
        if (err) throw Error(err);
        console.log('Write Successful.');
      }));
    });
});

function generateCandle(data, ticker, tf) {
  switch (tf) {
    case '5m': return generateTFCandle(data, ticker, 5);
    case '10m': return generateTFCandle(data, ticker, 10);
    case '15m': return generateTFCandle(data, ticker, 15);
    case '30m': return generateTFCandle(data, ticker, 30);
    case '1h': return generateTFCandle(data, ticker, 60);
    case '4h': return generateTFCandle(data, ticker, 240);
    default: throw Error('Must specify a time frame.');
  }
}
function generateTFCandle(data, ticker, tf) {
  const dataArr = data.split(ticker);
  const results = [];
  let iStart = 0;
  let iFinish = tf;
  let iCandle = 1;
  let candleSplice = dataArr.splice(iStart, iFinish);

  while(candleSplice.length) {
    const candleData = candleSplice.reduce((a, n, i) => {
        let candle = n.split(',');

        if (!n) return a;
        if (candle.length <= 1) return a;

        const open = Number(candle[2]);
        const high = Number(candle[3]);
        const low = Number(candle[4]);
        const close = Number(candle[5]);

        if (i === 0) { // first iteration
          a['#'] = iCandle;
          a.open = open;
          a.high = high;
          a.low = low;
        }

        if (0 > i < tf) { // if it's a middle iteration
          if (high > a.high) {
            a.high = high;
          }

          if (low < a.low) {
            a.low = low;
          }
        }

        if (i === (tf - 1)) { // last iteration
          if (high > a.high) {
            a.high = high;
          }

          if (low < a.low) {
            a.low = low;
          }

          a.close = close;

          if (a.open > a.close) bias = -1;
          if (a.open < a.close) bias = 1;
          if (a.open === a.close) bias = 0;


          a.date = {
            chart: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').format('l'),
            journal: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').format('LLLL'),
            unix: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').unix(),
          };
          a.time = `${candle[1].slice(0,2)}:${candle[1].slice(2,4)}:${candle[1].slice(4,6)}`;
        }
        return a;
      }, {});

    candleData.pips = Number(((candleData.high - candleData.low) * 100).toFixed(2));

    console.log('\n', candleData, '\n');
    results.push(candleData);

    iStart += tf;
    iFinish += tf;
    iCandle += 1;
    candleSplice = dataArr.splice(0, tf)
  }
  return results;
}
