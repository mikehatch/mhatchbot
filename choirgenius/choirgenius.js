var builder = require('botbuilder');
var request = require('request');
var moment = require('moment'); //For deailing with UNIX timestamps returned from drupal
var drupal = require('./drupal.js')



//=========================================================
// Library creation
//=========================================================

var lib = new builder.Library('choirgenius');

exports.create = function (bot, options) {
    // Add Library to bot
    bot.library(lib);

    //Add LUIS event recognizer
    // var model = 'https://api.projectoxford.ai/luis/v1/application?id=3720cc29-00de-4796-9bd9-8a713802286e&subscription-key=21b9f3214c2743c2b7f803bbbda93750';
    // var recognizer = new builder.LuisRecognizer(model);
    // var intents = new builder.IntentDialog({ recognizers: [recognizer] });

    // Install optional middleware
    // if (options && options.languageDetectionKey) {
    //     bot.use(languageDetection(options.languageDetectionKey));
    // }
}


//=========================================================
// Event Dialog
//=========================================================

exports.getevents = function (session, options) {
    // Start dialog in libraries namespace
    session.beginDialog('choirgenius:getevents', options || {});
}

lib.dialog('getevents', [
    //waterfall for dialog about events
	function (session, args, next) {
        if(args) {
            var eventtype = builder.EntityRecognizer.findEntity(args.entities, 'Event Type::Performance');
            if(!eventtype) { eventtype = builder.EntityRecognizer.findEntity(args.entities, 'Event Type::Rehearsal');}
            if(!eventtype) { eventtype = builder.EntityRecognizer.findEntity(args.entities, 'Event Type::Meeting');}
        }
		if (!eventtype) {
			builder.Prompts.choice(session, "What type of event are you looking for?", ["Rehearsal", "Performance", "Meeting"]);
		} else {
			next({ response: eventtype });
		}
    },
    function(session, results, next) {
		drupal.GetEvents(results.response, next);	
	},
	function (session, results) {
			//console.log(pages[results.response.entity].url);
            if(results.cgevents[0]) {
                cgevent = results.cgevents[0];
                var msg = new builder.Message(session)
                    .textFormat(builder.TextFormat.xml)
                    .attachments([
                        new builder.HeroCard(session)
                            .title(cgevent.title)
                            //.subtitle("Click to open")
                            .text("The next " + cgevent.eventtype.toLowerCase() 
                                + " is " + moment(cgevent.startdate).fromNow() 
                                + ", on " + moment(cgevent.startdate).format('ddd MMM Do hh:mma') 
                                + " call time is " + cgevent.calltime)
                            .tap(builder.CardAction.openUrl(session, cgevent.url))
                    ])				
                    .sourceEvent({
                        webchat: { 
                            "text": "[" + cgevent.title + "](" + cgevent.url + ")"
                        },
                        // slack: { 
                        // 	"text": "<" + cgevent.title + "|" + cgevent.url + ">",
                        // 	"replace_original": true
                        // }
                    });
            } else {
                msg = "No events found.";
            }
			//console.log(msg);
			session.endDialog(msg);
	}
]);


// Code below if from custom prompt sample
// exports.beginDialog = function(session, options) {
//     //session.beginDialog('/ephemeral', options || {}); 
//     session.beginDialog('/meaning', options || {});
// }

// exports.create = function(bot) {
//     var prompt = new builder.IntentDialog()
//         .onBegin(function(session, args) {
//             //save args passed 
//             session.dialogData.retryPrompt = args.retryPrompt || "Sorry that's incorrect. Guess again. Or do you give up?";
        
//             //send initial prompt//no woaterfall, so don't call built-in Prompts'
//             session.send(args.prompt || "What's the meaning of life?");
//         })
//         .matches(/(give up|quit|skip|yes)/i, function(session) {
//             //return false to indicate gave up
//             session.endDialogWithResult({response: false});
//         })
//         .onDefault(function(session) {
//             //validate reply
//             if(session.message.text == '42') {
//                 //return true to indicate success
//                 session.endDialogWithResult({response: true});
//             } else {
//                 //re-prompt
//                 session.send(session.dialogData.retryPrompt);
//             }
//         });
//     bot.dialog('/meaning', prompt);

    // var askephemeral = new builder.IntentDialog()
    // .onBegin(function(session, args) {
    //     session.dialogData.retryPrompt = args.retryPrompt || "I didn't understand.";
    //     session.send(args.prompt || "Want me to respond ephemerally?");
    // })
    // .matches(/(no|quit|skup)/i, function(session) {
    //     session.endDialogWithResult({response: false});
    // })
    // .onDefault(function(session) {
    //     if(session.message.text == 'y') {
    //         session.endDialogWithResult({response: true});
    //     } else {
    //         session.send(session.dialogData.retryPrompt);
    //     }
    // })
    // bot.dialog('/ephemeral', prompt);
