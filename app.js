var restify = require('restify');
var builder = require('botbuilder');

//====================
// Bot Setup
//====================

//Setup Restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
	console.log('%s listening to %s', server.name, server.url);
});

//Create chat bot
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
//var intents = new builder.IntentDialog();
server.post('/api/messages', connector.listen());

// LUIS model
var model = 'https://api.projectoxford.ai/luis/v1/application?id=2ac782de-b92c-4068-a8d3-ffe8fe85de25&subscription-key=21b9f3214c2743c2b7f803bbbda93750';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({recognizers: [recognizer]});

bot.dialog('/', intents);
bot.dialog('/prefs2', [
	function(session) {
		session.send('In dialog prefs2');
		session.endDialog();
	}
]);

intents.matches('ManageProfile', [
	function(session, args, next) {
		var attribute = builder.EntityRecognizer.findEntity(args.entities, 'Attribute');
		if(!attribute) {
			builder.Prompts.choice(session, "Which attribute would you like to change?", ["Name", "Tool Preference"]);
		} else {
			next({response: attribute});
		}
	},
	function(session, results) {
		switch(results.response.entity) {
			case "name":
			case "Name":
				session.replaceDialog('/profile');
				break;
			case "tool":
			case "tool preference":
			case "Tool Preference":
			case "preference":
				session.replaceDialog('/prefs');
				break;
			default:
				session.send("Sorry I didn't recognize what you wanted to manage.");
		}
		// if(results.response.entity='Name') {
		// 	session.beginDialog('/profile');
		// 	//next();
		// }
		// if(results.response.entity='Tool Preference') {
		// 	session.beginDialog('/prefs2');
		// 	//next();
		// }
	},
	function (session, results) {
			session.send('Hello %s! Your current tool preference is %s.', session.userData.name, session.userData.toolPref);
	}

])


intents.matches(/^goodbye/i, [
	function(session) {
		session.beginDialog('/goodbye');
	}
])

intents.onDefault([
		function(session, args, next) {
			if(!session.userData.name) {
				session.beginDialog('/profile');
			} else {
				next();
			}
		},
		function(session, args, next) {
			if(!session.userData.toolPref) {
				session.beginDialog('/prefs');
			} else {
				next();
			}
		},
		function (session, results) {
				session.send('Hello %s! Your current tool preference is %s.', session.userData.name, session.userData.toolPref);
		}
]);

bot.dialog('/prefs', [
		function(session) {
    	 //builder.Prompts.choice(session, "What messaging tool do you prefer?", ["Skype", "Slack", "Facebook", "TXT", "Email" ]);
			 builder.Prompts.text(session, "What messaging tool do you prefer?");
  	},
   	function (session, results) {
		//session.send('Testing, results.reponse=' + results.response);
       	session.userData.toolPref = results.response;
		//session.send('Testing, session.userData.toolPref=' + session.userData.toolPref);
   		session.send("Got it " + session.userData.name +
                      	", you prefer to use " + session.userData.toolPref + ".");
		session.endDialog();
    }

]);



bot.dialog('/goodbye', [
	function(session) {
		session.send('So long %s. <sniff>', session.userData.name);
		session.userData.name = null;
		session.endDialog();
	}
]);

bot.dialog('/profile', [
	function(session) {
		builder.Prompts.text(session, "What is your name?");
	},
	function(session, results) {
		session.userData.name = results.response;
		session.send('Ok... Changed your name to %s', session.userData.name);
		session.endDialog();
	}
]);
