var APP_ID = "amzn1.echo-sdk-ams.app.aab15ddb-1a64-4250-962d-6a8d8c038e64";
var LEAGUE_TABLE = [
    "test line one",
    "test line two",
    "test line three",
    "test line four"
];

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
        session.index + 4;
        handleLeagueTableRequest(intent, session, response);
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
    var positionKey = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    var sessionAttributes = {};
    sessionAttributes.index = typeof (session.index === undefined) ? paginationSize : session.index;

    var prefixContent = "<p>The top four of the Premier League Table are</p>";
    var cardContent = "The top four of the Premier League Table are";
    var cardTitle = "Premier League Table: Top 4";

    getTableFromAPI(function(table) {
        var speechText = "";
        var i;
        sessionAttributes.text = table;
        session.attributes = sessionAttributes;
        if (table.length == 0) {
            speechText = "There is a problem connecting to the API. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            for (i = 0; i < paginationSize; i++) {
                cardContent = cardContent + table[i].teamName + ' ';
                speechText = "<p>" + speechText + "In " + positionKey[i] + " place is " +  table[i].teamName + " with " + table[i].points + " points." + "</p>";
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
