const fs = require('fs');

const fee1 = 0.001;
const fee2 = 0.0016;

const temp1 = {
    pair: "BTC-USDT",
    bid_price: 100.95356,
    bid_size: 10.97756455,
    ask_price: 110.3458,
    ask_size: 5.54322456,
    time: 1677161999
}

const temp2 = {
    pair: "BTC-USDT",
    bid_price: 102.974,
    bid_size: 10.2235890,
    ask_price: 103.98754,
    ask_size: 5.1306546,
    time: 1677161999
}

const profit_check = (price_obj) => {
    // console.time('arb checking')
    const kraken = price_obj.kraken;
    const okex = price_obj.okex;

    const time_delta = Math.abs(kraken.time - okex.time);

    if (time_delta < 1000) {

        // buy kraken at ask, sell okex at bid
        size1 = Math.min(kraken.ask_size, okex.bid_size);
        profit1 = (size1 * kraken.ask_price * (1 - fee1) / okex.bid_price * (1 - fee2)) / size1;
        // console.log(profit1);
        // profit1 > 1 ? console.log(`buy kraken ${size1} at ask price ${kraken.ask_price}, sell ${size1} okex at bid price ${okex.bid_price}`) : console.log(`${profit1}`);

        // buy okex at ask, sell kraken at bid
        size2 = Math.min(okex.ask_size, kraken.bid_size);
        profit2 = (size2 * okex.ask_price * (1 - fee1) / kraken.bid_price * (1 - fee2)) / size2;
        // console.log(profit2);
        // profit2 > 1 ? console.log(`buy okex ${size2} at ask price ${okex.ask_price}, sell ${size2} kraken at bid price ${kraken.bid_price}`) : console.log(`${profit2}`);

        if (profit1 > 1 || profit2 > 1) {
            const tmstmp_currentSys = new Date();
            const tmstmp_currentSysDate = tmstmp_currentSys.toJSON().slice(0, 10);
            fs.appendFile('./log/opportunity-' + tmstmp_currentSysDate + '.json', JSON.stringify(price_obj) + '\n', (err) => {
                if (err) { console.log('Error occured when writing to opportunity log', { tmstmp_currentSys, err }); }
            });
        }

    } else {
        console.log(`price object timestamps not in sync with a difference of ${time_delta}ms`);
    }
    // console.timeEnd('arb checking');
}

module.exports = profit_check;

// profit_check({ kraken: temp1, okex: temp2 })