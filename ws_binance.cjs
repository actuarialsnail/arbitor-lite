const WebSocket = require('ws');

class binance_ws_class {

    constructor() {
        this.price_obj = {};
    }

    stream = () => {
        let binanceTimeout;
        const binance_ws = new WebSocket('wss://stream.binance.com:9443/ws/@');

        const binance_request = {
            "method": "SUBSCRIBE",
            "params":
                [
                    'btcusdt@bookTicker',
                    'btcusdc@bookTicker',
                    'usdcusdt@bookTicker'
                ],
            "id": 1
        }

        binance_ws.on('open', () => {
            console.log('binance websocket connected at:', new Date());
            binance_ws.send(JSON.stringify(binance_request));
            binanceTimeout = setTimeout(() => {
                console.log('scheduled reconnection of binance websocket connection');
                binance_ws.close();
            }, 1000 * 60 * 60);
        })

        binance_ws.on('error', error => {
            console.log('binance ws error:', error)
        })

        binance_ws.on('message', msg_text => {
            // console.time('msg');
            let msg = JSON.parse(msg_text);
            // console.log(msg);
            try {
                if (msg.s) {
                    let s1 = msg.s.slice(0, msg.s.length - 4)
                    let s2 = msg.s.slice(msg.s.length - 4, msg.s.length)
                    this.price_obj[s1 + '-' + s2] = {
                        price: Number(msg.b),
                        size: Number(msg.B),
                        // ask_price: Number(msg.a),
                        // ask_size: Number(msg.A),
                        time: Date.now()//covnert from seconds to milliseconds
                    }
                    this.price_obj[s2 + '-' + s1] = {
                        // bid_price: Number(msg.b),
                        // bid_size: Number(msg.B),
                        price: 1 / Number(msg.a),
                        size: Number(msg.a) * Number(msg.A),
                        time: Date.now()//covnert from seconds to milliseconds
                    }
                    // console.log(this.price_obj);
                }
            } catch (error) {
                console.log(error);
            }
            // console.timeEnd('msg');
        })

        binance_ws.on('ping', e => {
            binance_ws.pong()
        })

        binance_ws.on('close', () => {
            console.log('binance websocket connection closed, reconnecting in 5s...');
            clearTimeout(binanceTimeout);
            setTimeout(() => { this.stream() }, 5000);
        })
    }
}

module.exports = binance_ws_class;

// const test_stream = new binance_ws_class();
// test_stream.stream();


