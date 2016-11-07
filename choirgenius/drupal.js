var request = require('request');
var moment = require('moment');
//var EventEmitter = require('events');
//require('request-debug')(request);

//class MyEmitter extends EventEmitter{};
//const myEmitter = new MyEmitter(); 

var basicAuthOptions = {
    //url: 'https://mhatchdp7c.azurewebsites.net/node.json',
    //url: 'http://hatch.dev.groupanizer.com/node.json?type=event',
    url: 'http://hatch.dev.groupanizer.com/node.json?type=event&sort=field_event_date&direction=ASC&limit=4',
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

// function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//         //var data = JSON.parse(body);
//         console.log(body);
//         //body.list.forEach(itemFunc);
//     } else {
//         console.log(error);
//         console.log(response.statusCode);
//     }
// }

//var events;
const eventtypes = {
    'Rehearsal': 51, 'rehearsal': 51, 'Event Type::Rehearsal': 51,
    'Performance': 52, 'performance': 52, 'Event Type::Performance': 52,
    'Meeting': 53, 'meeting': 53, 'Event Type::Meeting': 53,
    'Other': 54, 'other': 54
}

function GetEvents(args, next) {
    var options = {
        url: 'http://hatch.dev.groupanizer.com/node.json',
        qs: {
            'type': 'event',
            'sort': 'field_event_date',
            'field_event_type': eventtypes[args.type],
            'limit': 10 //have to request several items as the services return past events.  need to find out how to query for only future events

        }
    }
    request(options, function(error, response, body) {
				var cgevents = [];
                if(!error && response.statusCode == 200) {
					body = JSON.parse(body);
					//console.log(body);
					//session.dialogData.pages = [];
					body.list.forEach(function itemFunc(item, index) {
							//Check that the start date of the item is not before this moment
    				    	if(moment().isBefore(item.field_event_date[0].value * 1000)) {
								cgevents.push({
                                    'url': item.url, 
                                    "title": item.title,
                                    "eventtype": args.entity,
                                    'calltime': item.field_call_time,
                                    "startdate": moment.unix(item.field_event_date[0].value).toDate() 
                                });
							}
							//session.dialogData.pages[item.title] = item.url;
							//prompts[0] = item.title;
						});
					// console.log(pages);
				} else {
					console.log(error);
					console.log(response.statusCode);
				}
				if(cgevents) {
					next({ cgevents: cgevents}); //builder.Prompts.choice(session, "I found the following items", pages);
				} else {
					next("I didn't find anything.");
				}
			});

}


var pages = [];
function itemFunc(item, index) {
    //console.log("index[" + index + "]: " + item.body.value);
    pages[index] = item.title;
}

exports.GetEvents = GetEvents;