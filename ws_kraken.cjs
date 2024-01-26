const WebSocket = require('ws');

class kraken_ws_class {

    constructor() {
        this.price_obj = {};
    }

    stream = () => {
        let krakenTimeout;
        const kraken_ws = new WebSocket('wss://ws.kraken.com');

        const kraken_request = {
            "event": "subscribe",
            "pair": ["XBT/USDT", "XBT/USDC", "USDC/USDT"],
            "subscription": {
                "name": "spread",
            }
        }

        kraken_ws.on('open', () => {
            console.log('kraken websocket connected at:', new Date());
            kraken_ws.send(JSON.stringify(kraken_request));
            krakenTimeout = setTimeout(() => {
                console.log('scheduled reconnection of kraken websocket connection');
                kraken_ws.close();
            }, 1000 * 60 * 60);
        })

        kraken_ws.on('error', error => {
            console.log('kraken ws error:', error)
        })

        kraken_ws.on('message', msg_text => {
            // console.time('msg');
            let msg = JSON.parse(msg_text);
            // console.log(msg);
            if (msg[0] === 2261 || msg[0] === 2373 || msg[0] === 2341) {
                try {
                    let s1 = msg[3].split('/')[0].replace('XBT', 'BTC')
                    let s2 = msg[3].split('/')[1].replace('XBT', 'BTC')
                    this.price_obj[s1 + '-' + s2] = {
                        price: Number(msg[1][0]),
                        size: Number(msg[1][3]),
                        // ask_price: Number(msg[1][1]),
                        // ask_size: Number(msg[1][4]),
                        time: Number(msg[1][2]) * 1000 //covnert from seconds to milliseconds
                    }
                    this.price_obj[s2 + '-' + s1] = {
                        // bid_price: Number(msg[1][0]),
                        // bid_size: Number(msg[1][3],
                        price: 1 / Number(msg[1][1]),
                        size: Number(msg[1][1]) * Number(msg[1][4]),
                        time: Number(msg[1][2]) * 1000 //covnert from seconds to milliseconds
                    }
                    // console.log(this.price_obj);
                } catch (error) {
                    console.log(error);
                }
            }
            // console.timeEnd('msg');
        })

        kraken_ws.on('close', () => {
            console.log('kraken websocket connection closed, reconnecting in 5s...');
            clearTimeout(krakenTimeout);
            setTimeout(() => { this.stream() }, 5000);
        })
    }
}

module.exports = kraken_ws_class;

// const test_stream = new kraken_ws_class();
// test_stream.stream();


