var APP_ID = "amzn1.echo-sdk-ams.app.aab15ddb-1a64-4250-962d-6a8d8c038e64";
var POSITION_KEY = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "last"];

var AlexaSkill = require('./AlexaSkill');
var http = require('http');
var Fergie = function() {
    AlexaSkill.call(this, APP_ID);
};
var urlPrefix = 'http://api.football-data.org/v1/soccerseasons/398/leagueTable';
var paginationSize = 4;

Fergie.prototype = Object.create(AlexaSkill.prototype);
Fergie.prototype.constructor = Fergie;

Fergie.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    // any initialization logic goes here
};

Fergie.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    // handleLeagueTableRequest(response);
    getWelcomeResponse(response);
};

Fergie.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
    // any cleanup logic goes here
};

Fergie.prototype.intentHandlers = {
    "GetLeagueTableIntent": function(intent, session, response) {
        handleLeagueTableRequest(intent, session, response);
    },

    "GetNextTableIntent": function(intent, session, response) {
        handleNextTableRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function(intent, session, response) {
        response.ask("Ask League Table to tell you the league table, or you can say exit.");
    },

    "AMAZON.StopIntent": function(intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function(intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function getWelcomeResponse(response) {
    var cardTitle = "Welcome to Fergie";
    var repromptText = "With Fergie, you can get all kinds of information on the English Premier League. Ask me about the current league table, what matches are on this week, when the next match for a particular team is, or what the score of the last match for a particular team was.";
    var speechText = "<p>Welcome to football season. How can I help you?<p>";
    var cardOutput = "Welcome to football season. How can I help you?";

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptText, cardTitle, cardOutput);
}

function handleLeagueTableRequest(intent, session, response) {
    var repromptText = "With Fergie, you can get all kinds of information on the English Premier League. Ask me about the current league table, what matches are on this week, when the next match for a particular team is, or what the score of the last match for a particular team was.";
    var sessionAttributes = {};
    sessionAttributes.index = paginationSize;

    var prefixContent = "<p>The top four of the Premier League Table are: </p>";
    var cardContent = "The top four of the Premier League Table are: ";
    var cardTitle = "Premier League Table: Top 4";

    getTableFromAPI(function(table) {
        var speechText = "";
        var i;
        sessionAttributes.table = table;
        session.attributes = sessionAttributes;
        if (table.length == 0) {
            speechText = "There is a problem connecting to the API. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            for (i = 0; i < paginationSize; i++) {
                cardContent = cardContent + table[i].teamName + ' ';
                speechText = "<p>" + speechText + "In " + POSITION_KEY[i] + " place is " +  table[i].teamName + " with " + table[i].points + " points.</p>";
            }
            speechText = speechText + " <p>Want to hear more?</p>";
            var speechOutput = {
                speech: "<speak>" + prefixContent + speechText + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
        }
    });
}

function handleNextTableRequest(intent, session, response) {
    var repromptText = "With Fergie, you can get all kinds of information on the English Premier League. Ask me about the current league table, what matches are on this week, when the next match for a particular team is, or what the score of the last match for a particular team was.";
    var sessionAttributes = {};
    sessionAttributes.start = session.attributes.index > 0 ? session.attributes.index : 0;
    sessionAttributes.index = session.attributes.index > 0 ? session.attributes.index + paginationSize : paginationSize;
    sessionAttributes.table = session.attributes.table;
    session.attributes = sessionAttributes;
    var prefixContent = sessionAttributes.index < 16 ? "<p>The next four of the Premier League Table are: </p>" : "<p>The bottom of the table are: </p>";
    var cardContent = "The next four of the Premier League Table are: ";
    var cardTitle = "Premier League Table: " + sessionAttributes.index + 1 + " - " + sessionAttributes.index + 5;
    var speechText = "";
    var i;

    if (sessionAttributes.table == 0) {
        speechText = "There is a problem connecting to the API. Please try again later.";
        cardContent = speechText;
        response.tell(speechText);
    } else {
        for (i = sessionAttributes.start; i < sessionAttributes.index; i++) {
            cardContent = cardContent + sessionAttributes.table[i].teamName + ' ';
            speechText = "<p>" + speechText + "In " + POSITION_KEY[i] + " place is " + sessionAttributes.table[i].teamName + " with " + session.attributes.table[i].points + " points.</p>";
        }
        if (sessionAttributes.index < 20) speechText = speechText + "<p>Want to hear more?</p>";
        var speechOutput = {
            speech: "<speak>" + prefixContent + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        if (sessionAttributes.start < 16) {
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
        } else {
            response.tell(speechOutput, repromptOutput, cardTitle, cardContent);
        }
    }
}

function getTableFromAPI(eventCallback) {
    http.get(urlPrefix, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var json = JSON.parse(body);
            eventCallback(json['standing']);
        });
    }).on('error', function(e) {
        console.log("Got error: ", e);
    });
};

// Create the handler that responds to the Alexa Request
exports.handler = function(event, context) {
    var fergie = new Fergie();
    fergie.execute(event, context);
}
