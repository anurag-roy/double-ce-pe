require("dotenv").config();
const path = require("path");
const cors = require("cors");
const express = require("express");
const app = express();
const mapperRouter = require("./mapper");
const KiteConnect = require("kiteconnect").KiteConnect;
const KiteTicker = require("kiteconnect").KiteTicker;

const apiKey = process.env.API_KEY;
const accessToken = process.env.ACCESS_TOKEN;

const kc = new KiteConnect({
  api_key: apiKey,
});
kc.setAccessToken(accessToken);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

app.use("/mapper", mapperRouter);

// Order function
const order = async (stock, price) => {
  const timestamp = new Date();
  console.log(
    `Placing order for ${stock.exchange}:${stock.tradingsymbol}, Transaction: ${stock.transactionType}, product: ${stock.product}, quantity: ${stock.quantity}, price: ${price}`,
  );
  console.log(`Time of order: ${timestamp.toUTCString()}`);

  // return kc.placeOrder("regular", {
  //   exchange: stock.exchange,
  //   tradingsymbol: stock.tradingsymbol,
  //   transaction_type: stock.transactionType,
  //   quantity: stock.quantity,
  //   product: "MIS",
  //   price: price,
  //   order_type: "LIMIT",
  // });

  return `Order placed for ${stock.exchange}:${stock.tradingsymbol}, Transaction: ${stock.transactionType}, product: ${stock.product}, quantity: ${stock.quantity}`;
};

const placeOrder = async (stockArray, priceArray) => {
  const promiseArray = [];

  for (let i = 0; i < stockArray.length; i++) {
    promiseArray.push(order(stockArray[i], priceArray[i]));
  }

  await Promise.all(promiseArray);

  const positions = await kc.getPositions();
  console.log(positions);
};

app.post("/doubleCEPE", ({ body }, response) => {
  doubleCEPE(body.stockA, body.stockB, body.entryPrice);
  response.send("Check console.");
});

// Double CE/PE Strategy
const doubleCEPE = (stockA, stockB, entryPrice) => {
  // Extract instruments tokens for each stock
  const aToken = parseInt(stockA.instrument_token);
  const bToken = parseInt(stockB.instrument_token);

  // Extract instruments tokens for each stock
  const aQty = parseInt(stockA.quantity);
  const bQty = parseInt(stockB.quantity);

  // Declare variables which will be updated on each tick
  let aBuyersBid, bSellersBid;

  // Flag to determine if order is already placed or not
  let placedOrder = false;

  // Entry Condition for Butterfly strategy
  const lookForEntry = () => {
    const net = (aBuyersBid * aQty - bSellersBid * bQty) / 75;

    if (net > entryPrice) {
      console.log(`Net: ${net}, Entry Price: ${entryPrice}. Condition satisfied.`);
      return true;
    }

    console.log(`Net: ${net}, Entry Price: ${entryPrice}. Condition not satisfied.`);
    return false;
  };

  const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken,
  });

  ticker.connect();

  ticker.on("connect", () => {
    console.log("Subscribing to stocks...");
    const items = [aToken, bToken];
    ticker.subscribe(items);
    ticker.setMode(ticker.modeFull, items);
  });

  ticker.on("ticks", (ticks) => {
    if (!placedOrder) {
      // Check tick and update corresponding stock bid price
      // 2nd Seller's Bid for stock to BUY
      // 2nd Buyer's Bid for stock to SELL
      ticks.forEach((t) => {
        if (t.instrument_token == aToken) {
          aBuyersBid = t.depth?.buy?.[1].price;
        } else if (t.instrument_token == bToken) {
          bSellersBid = t.depth?.sell?.[1].price;
        }
      });

      // Look for Entry
      if (lookForEntry()) {
        placedOrder = true;
        placeOrder([stockA, stockB], [aBuyersBid, bSellersBid]);
      }
    } else if (placedOrder) {
      ticker.disconnect();
    }
  });
};

app.listen(4999, () => {
  console.log("Double CE/PE Entry started on http://localhost:4999");
});
