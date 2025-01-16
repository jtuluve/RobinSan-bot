const axios = require("axios");
const https = require("axios");

async function api(url, callback) {
  let res = await axios.get(url);
  await callback(res.data);
}
exports.api = api;
