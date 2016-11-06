var builder = require('botbuilder');

exports.beginDialog = function(session, options) {
    //session.beginDialog('/ephemeral', options || {}); 
    session.beginDialog('/meaning', options || {});
}

exports.create = function(bot) {
    var prompt = new builder.IntentDialog()
        .onBegin(function(session, args) {
            //save args passed 
            session.dialogData.retryPrompt = args.retryPrompt || "Sorry that's incorrect. Guess again. Or do you give up?";
        
            //send initial prompt//no woaterfall, so don't call built-in Prompts'
            session.send(args.prompt || "What's the meaning of life?");
        })
        .matches(/(give up|quit|skip|yes)/i, function(session) {
            //return false to indicate gave up
            session.endDialogWithResult({response: false});
        })
        .onDefault(function(session) {
            //validate reply
            if(session.message.text == '42') {
                //return true to indicate success
                session.endDialogWithResult({response: true});
            } else {
                //re-prompt
                session.send(session.dialogData.retryPrompt);
            }
        });
    bot.dialog('/meaning', prompt);

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
}