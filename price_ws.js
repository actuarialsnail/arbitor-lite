import { KrakenClient } from "ccxws";
const kraken = new KrakenClient();

// market could be from CCXT or genearted by the user
const market = {
    id: "XBTUSDT", // remote_id used by the exchange
    base: "XBT", // standardized base symbol for Bitcoin
    quote: "USDT", // standardized quote symbol for Tether
};

kraken.on("ticker", ticker => console.log(ticker));
kraken.on("error", err => console.error(err));

kraken.subscribeTicker(market);