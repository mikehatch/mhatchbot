var request = require('request');
var EventEmitter = require('events');

 
//require('request-debug')(request);
//class MyEmitter extends EventEmitter{};
//const myEmitter = new MyEmitter(); 

class MyEmitter extends EventEmitter{};
const myEmitter = new MyEmitter(); 


var basicAuthOptions = {
    //url: 'https://mhatchdp7c.azurewebsites.net/node.json',
    //url: 'http://hatch.dev.groupanizer.com/node.json?type=event',
    url: 'http://hatch.dev.groupanizer.com/node.json?type=event&field_event_type=51&sort=field_event_date&direction=ASC&limit=2',
    json: true,
    //jar:true,
    // auth: {
    //     //'user': 'restws_bot',
    //     'user': 'mike.hatch',
    //     'pass': process.env.DRUPAL_RESTUSER_PW,
    //     'sendImmediately': true
    // }
}

//request(basicAuthOptions, callback);

function callback(error, response, body) {
    if(!error && response.statusCode == 200) {
        //var data = JSON.parse(body);
        console.log(body);
        //body.list.forEach(itemFunc);
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