const fs = require('fs');
const m = require('moment');

fs.readFile('./rawData/GBPJPY_1M_JAN2001.js', 'utf8', (err, data) => {
  const result = data
  .split('GBPJPY,');

  const candle = generateCandle(data, '5m');
  console.log('candle: ', candle);
  // .map((x, i) => {
  //   const candleNo = i + 1;
  //   let candle = x.split(',');
  //
  //   if (candle.length <= 1) return ({ [i + 1]: "empty" });
  //
  //   const pips = Number(Math.abs(candle[3] - candle[4]) * 100).toFixed(2);
  //   const open = Number(candle[2]);
  //   const close = Number(candle[3]);
  //   const high = Number(candle[4]);
  //   const low = Number(candle[5]);
  //   let bias;
  //
  //   if (open > close) bias = -1;
  //   if (open < close) bias = 1;
  //   if (open === close) bias = 0;
  //
  //
  //
  //   candle = ({
  //     [candleNo]: {
  //       date: {
  //         chart: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').format('l'),
  //         journal: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').format('LLLL'),
  //         unix: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').unix(),
  //       },
  //       time: `${candle[1].slice(0,2)}:${candle[1].slice(2,4)}:${candle[1].slice(4,6)}`,
  //       open,
  //       close,
  //       high,
  //       low,
  //       pips,
  //       bias,
  //     },
  //   });
  //   console.log('\ncandle: \n', candle);
  //   return candle;
  // });

  fs.writeFile(
    './parsedData/GBPJPY_1M_JAN2001_parsed.js',
    (`const gpyJpy1m = ${JSON.stringify(result)}`),
    ((err, data) => {
    if (err) throw Error(err);
    console.log('Write Successful.');
  }));
});

// fs.writeFile('./gpyjpy_1m.json', data, (err, data) => {
//   console.log('finished.');
// });

const generateCandle = (data, tf) => {
  switch (tf) {
    case '5m': return generateTFCandle(data, 5);
    case '10m': return generateTFCandle(data, 10);
    case '15m': return generateTFCandle(data, 15);
    case '30m': return generateTFCandle(data, 30);
    case '1h': return generateTFCandle(data, 60);
    case '4h': return generateTFCandle(data, 240);
    default: throw Error('Must specify a time frame.');
  }
}

const generateTFCandle = (data, tf) => {
  const dataArr = data;
  const results = [];
  let iStart = 0;
  let iFinish = tf;
  let iCandle = 1;

  while(dataArr.length) {
    results.push(
      dataArr
      splice(iStart, iFinish)
      .reduce((a, n, i) => {
        let candle = n.split(',');

        if (!n) return a;
        if (candle.length <= 1) return a;

        if (i === 0) { // first iteration
          a['#'] = iCandle;
          a.open = Number(candle[2]);
          a.high = Number(candle[3]);
          a.low = Number(candle[4]);
        }

        if (0 > i < tf) { // if it's a middle iteration
          if (candle[3] > a.high) {
            a.high = candle[3];
          }

          if (candle[4] < a.low) {
            a.low = candle[4];
          }
        }

        if (i === (interval - 1)) { // last iteration
          if (candle[3] > a.high) {
            a.high = candle[3];
          }

          if (candle[4] < a.low) {
            a.low = candle[4];
          }

          a.close = Number(candle[5]);
          a.pips = Number(Math.abs(candle[3] - candle[4]) * 100).toFixed(2);

          if (a.open > a.close) bias = -1;
          if (a.open < a.close) bias = 1;
          if (a.open === a.close) bias = 0;


          a.date = {
            chart: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').format('l'),
            journal: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').format('LLLL'),
            unix: m(`${candle[0]}${candle[1]}`, 'YYYYMMDDHHmmss').unix(),
          };
          a.time = `${candle[1].slice(0,2)}:${candle[1].slice(2,4)}:${candle[1].slice(4,6)}`,
        }
        console.log('\ncandle: \n', a);
        return a;
      }, {});
    );
    iStart += tf;
    iFinish += tf;
    iCandle += 1;
  }
}
