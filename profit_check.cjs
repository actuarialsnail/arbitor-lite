const fs = require('fs');

const fee = {
    Kraken: 0.0016,
    OKX: 0.001,
    Binance: 0.00075
}

const profit_check = (msg) => {
    // console.time('arb checking')
    let { price_obj, routes } = msg
    // console.log(price_obj)
    // console.log(routes)

    const tmstmp_system = Date.now()
    const tmstmp_limit = 5000; // milliseconds

    let invalid = 0
    let stale = 0

    for (let route of routes) {
        // console.log(route)
        let nav = 1
        let price_arr = {}
        for (let hop of route) {
            // console.log(hop)
            // load price
            const [p1, p2, exchange] = hop.split('-')
            const pair = p1 + '-' + p2

            // console.log(price_obj)

            if (price_obj[exchange][pair]) {
                hop_price = price_obj[exchange][pair].price
                hop_price_time = price_obj[exchange][pair].time
                // console.log(hop, hop_price)
                price_arr[hop] = hop_price
                const time_delta = Math.abs(hop_price_time - tmstmp_system);

                if (time_delta < tmstmp_limit) {
                    nav = nav * hop_price * (1 - fee[exchange])
                } else {
                    // if price is too stale or no price, skip loop, continue to next route
                    // console.log('staled data', time_delta)
                    stale++
                    break
                }
            } else {
                invalid++
                break // if any price_obj is not defined
            }
        }
        // console.log(nav)
        if (nav > 1) {
            // calculate minimum size

            const tmstmp_current = new Date();
            const tmstmp_current_date = tmstmp_current.toJSON().slice(0, 10);
            console.log(tmstmp_current, nav, route, price_arr)
            fs.appendFile('./log/opportunity-' + tmstmp_current_date + '.json', JSON.stringify({ tmstmp_current, nav, route, price_arr }) + '\n', (err) => {
                if (err) { console.log('Error occured when writing to opportunity log', { tmstmp_current_date, err }); }
            });
        }
    } //route
    // console.log('undefined: ', invalid, 'stale: ', stale, 'out of', routes.length)

    // console.timeEnd('arb checking');
}

module.exports = profit_check;