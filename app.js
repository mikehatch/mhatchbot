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


//===============
// Bot Dialogs
//===============
bot.dialog('/', intents);

intents.matches('ManageProfile', [
	function(session) {
		session.send('It sounds like you want to update your profile.');
		session.beginDialog('/profile');
	},
	function(session, results) {
		session.send('Ok... Changed your name to %s', session.userData.name);
	}
]);

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
		function (session, results) {
				session.send('Hello %s!', session.userData.name);
		}
]);

bot.dialog('/goodbye', [
	function(session) {
		session.send('So long %s. <sniff>', session.userData.name);
		session.userData.name = null;
		session.endDialog();
	}
])

bot.dialog('/profile', [
	function(session) {
		builder.Prompts.text(session, "What is your name?");
	},
	function(session, results) {
		session.userData.name = results.response;  //
		session.endDialog();
	}
])
