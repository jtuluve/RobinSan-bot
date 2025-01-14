
const https = require("https")

function api(url, callback){
  
    const request = https.request(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });
      
        response.on('end', ()=>{
            callback(JSON.parse(data))
        });
    })
      
    request.on('error', (error) => {
        console.log('An error', error);
    });
      
    request.end();
}
exports.api = api;