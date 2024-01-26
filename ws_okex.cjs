const WebSocket = require('ws');

class okex_ws_class {

    constructor() {
        this.price_obj = {};
    }

    stream = () => {

        let okexTimeout;

        const okex_ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');

        const okex_request = {
            "op": "subscribe",
            "args": [
                {
                    "channel": "bbo-tbt",
                    "instId": "BTC-USDT"
                },
                {
                    "channel": "bbo-tbt",
                    "instId": "BTC-USDC"
                },
                {
                    "channel": "bbo-tbt",
                    "instId": "USDC-USDT"
                }
            ]
        }

        okex_ws.on('open', () => {
            console.log('okex websocket connected at:', new Date());
            okex_ws.send(JSON.stringify(okex_request));
            okexTimeout = setTimeout(() => {
                console.log('scheduled reconnection of okex websocket connection');
                okex_ws.close();
            }, 1000 * 60 * 60);
        })

        okex_ws.on('error', error => {
            console.log('okex ws error:', error)
        })

        okex_ws.on('message', msg_text => {
            // console.time('msg');
            let msg = JSON.parse(msg_text);
            // console.log(msg);

            if (msg.data) {
                try {
                    let s1 = msg.arg.instId.split('-')[0]
                    let s2 = msg.arg.instId.split('-')[1]
                    this.price_obj[s1 + '-' + s2] = {
                        price: Number(msg.data[0].bids[0][0]),
                        size: Number(msg.data[0].bids[0][1]),
                        // ask_price: Number(msg.data[0].asks[0][0]),
                        // ask_size: Number(msg.data[0].asks[0][1]),
                        time: Number(msg.data[0].ts)
                    }
                    this.price_obj[s2 + '-' + s1] = {
                        // bid_price: Number(msg.data[0].bids[0][0]),
                        // bid_size: Number(msg.data[0].bids[0][1]),
                        price: 1 / Number(msg.data[0].asks[0][0]),
                        size: Number(msg.data[0].asks[0][0]) * Number(msg.data[0].asks[0][1]),
                        time: Number(msg.data[0].ts)
                    }
                    // console.log(this.price_obj);
                } catch (error) {
                    console.log(error)
                }
            }
            // console.timeEnd('msg');
        })

        okex_ws.on('close', () => {
            console.log('okex websocket connection closed, reconnecting in 5s...');
            clearTimeout(okexTimeout);
            setTimeout(() => { this.stream() }, 5000);
        })

    }
}

module.exports = okex_ws_class;

// const test_stream = new okex_ws_class();
// test_stream.stream();


