var request = require('request');
var EventEmitter = require('events');
class MyEmitter extends EventEmitter{};
const myEmitter = new MyEmitter(); 

var basicAuthOptions = {
    url: 'https://mhatchdp7c.azurewebsites.net/node.json',
    json: true,
    //jar:true,
    auth: {
        'user': 'restws_bot',
        'pass': env.DRUPAL_RESTUSER_PW,
        'sendImmediately': true
    }
}

//request(basicAuthOptions, callback);

function callback(error, response, body) {
    if(!error && response.statusCode == 200) {
        //var data = JSON.parse(body);
        console.log(body);
        body.list.forEach(itemFunc);
    } else {
        console.log(error);
        console.log(response.statusCode);
    }
}

var data;
function GetPages(cb) { 
    request(basicAuthOptions, cb);
}


var pages = [];
function itemFunc(item, index) {
    //console.log("index[" + index + "]: " + item.body.value);
    pages[index] = item.title;
}

module.exports.GetPages = GetPages;