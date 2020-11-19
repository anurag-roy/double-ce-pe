const KiteConnect = require("kiteconnect").KiteConnect;
const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

// API Credentials
const config = {
  apiKey: "2rtrb58mdwkhu7s7",
  apiSecret: "b5gxafr7w8tsu19h6vqa53jj5usk13fq",
};

let accessToken;

// Create new KiteConnect object
const kc = new KiteConnect({
  api_key: config.apiKey,
});

const server = app.listen(8000, () => {
  console.log(`Please click on this URL to log in: ${kc.getLoginURL()}`);
});

// Route "/login" handles request after logging into Zerodha
app.use("/login", async (req, res) => {
  const requestToken = req.query.request_token;

  try {
    // Generate and set the Access Token
    console.log("Generating session. Please wait.");
    const result = await kc.generateSession(requestToken, config.apiSecret);
    accessToken = result.access_token;
    kc.setAccessToken(accessToken);
    console.log("Access Token set. ", accessToken);

    // Populate .env file
    const contents = `API_KEY="${config.apiKey}"\nAPI_SECRET="${config.apiSecret}"\nACCESS_TOKEN="${accessToken}"`;
    fs.writeFileSync(".env", contents, (error) => {
      if (error) console.log("Error while writing access token", error);
    });

    // Populate list of instruments
    const instruments = await kc.getInstruments();
    const filteredInstruments = instruments.filter((i) => i.exchange === "NFO");
    fs.writeFileSync("instruments.json", JSON.stringify(filteredInstruments), (error) => {
      if (error) console.log("Error while writing instruments", error);
    });

    res.send("Login flow successful!");
  } catch (error) {
    console.log("Error: ", error);
    res.send("Some error occurred. Please try again.");
  }

  server.close();
});
