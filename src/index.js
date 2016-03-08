var APP_ID = "amzn1.echo-sdk-ams.app.aab15ddb-1a64-4250-962d-6a8d8c038e64";
var POSITION_KEY = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "last"];
var MONTH_KEY = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var TEAMS = {
    'arsenal': 57,
    'aston villa': 58,
    'villa': 58,
    'chelsea': 60,
    'everton': 62,
    'liverpool': 64,
    'manchester city': 65,
    'man city': 65,
    'manchester united': 66,
    'man united': 66,
    'newcastle': 67,
    'norwich': 68,
    'stoke': 70,
    'stoke city': 70,
    'sunderland': 71,
    'swansea': 72,
    'tottenham hotspur': 73,
    'tottenham': 73,
    'spurs': 73,
    'west bromwich albion': 74,
    'west brom': 74,
    'bournemouth': 1044,
    'watford': 346,
    'leicester': 338,
    'crystal palace': 354,
    'southampton': 340,
    'west ham united': 563,
    'west ham': 563
};

var AlexaSkill = require('./AlexaSkill');
var http = require('http');
var alexaDateUtil = require('./alexaDateUtil');
var Fergie = function() {
    AlexaSkill.call(this, APP_ID);
};
var urlPrefix = 'http://api.football-data.org/v1/';
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

    "GetNextMatch": function(intent, session, response) {
        handleGetNextMatchRequest(intent, session, response);
    },

    "GetMatchResult": function(intent, session, response) {
        handleGetMatchResultRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function(intent, session, response) {
        var speechText = "<p>Fergie can provide you with all kinds of information on the English Premier League. You can ask me what is the league table, when is the next man united match, what was the result of the last man united match. Of course you can substitute man united for any Premier League Club. WHich will it be?</p>"
        var repromptText = "<p>Fergie can provide you with all kinds of information on the English Premier League. You can ask me what is the league table, when is the next man united match, what was the result of the last man united match. Of course you can substitute man united for any Premier League Club. WHich will it be? You can look in your Alexa app for more information.</p>"
        var cardTitle = "Fergie Premier League Info";
        var cardContent = "Fergie can provide you with all kinds of information on the English Premier League. You can ask me what is the league table, when is the next man united match, what was the result of the last man united match. Of course you can substitute man united for any Premier League Club. WHich will it be?";

        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
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
    var speechText = "<p>Welcome to Fergie. You can ask me what is the league table, when is the next man united match, what was the result of the last man united match. Of course you can substitute man united for any Premier League club. Which will it be?</p>"
    var repromptText = "Welcome to Fergie. You can ask me what is the league table, when is the next man united match, what was the result of the last man united match. Of course you can substitute man united for any Premier League club. Which will it be?";
    var cardOutput = "elcome to Fergie. You can ask me what is the league table, when is the next man united match, what was the result of the last man united match. Of course you can substitute man united for any Premier League club. Which will it be?";

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
    var repromptText = "Do you want to hear the next four teams in the Premier League table? Say yes or no.";
    var sessionAttributes = {};
    sessionAttributes.index = paginationSize;
    sessionAttributes.sessionId = session.sessionId;

    var prefixContent = "The top four of the Premier League Table are: ";
    var cardContent = "";
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
                cardContent = cardContent + table[i].teamName + ' (' + table[i].points + ') ';
                speechText = speechText + "In " + POSITION_KEY[i] + " place is " +  cleanTeamName(table[i].teamName) + " with " + table[i].points + " points. ";
            }
            speechText = speechText + " Want to hear more?";
            var speechOutput = {
                speech: "<speak><p>" + prefixContent + speechText + "</p></speak>",
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
    if (session.attributes.sessionId === session.sessionId) {
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
                speechText = "<p>" + speechText + "In " + POSITION_KEY[i] + " place is " + cleanTeamName(sessionAttributes.table[i].teamName) + " with " + session.attributes.table[i].points + " points.</p>";
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
    } else {
        // in a different session
        session.attributes = {};
        response.tell("Sorry, but your session expired. Please try again.");
    }
}

function handleGetNextMatchRequest(intent, session, response) {
    // Determine team name
    var teamObj = getTeamFromIntent(intent, true),
        repromptText,
        speechOutput;

    if (teamObj.error) {
        // invalid team, move to dialog
        var speechText = "<p>I don't have information for " + intent.slots.Team.value + ". I currently only support Premier League clubs.</p>";
        var cardTitle = "Invalid Team Name";
        var cardContent = 'I dont\'t have information for ' + intent.slots.Team.value + ". I currently only support Premier League clubs.";


        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

        response.tellWithCard(speechOutput, cardTitle, cardContent);
    }

    getMatchFromAPI(teamObj.teamID, function(fixtures) {
        var matchDate = new Date(fixtures[0].date);
        var homeTeam = cleanTeamName(fixtures[0].homeTeamName);
        var awayTeam = cleanTeamName(fixtures[0].awayTeamName);
        var speechText;

        if (fixtures.length > 0) {
            if (teamObj.team == homeTeam) {
                speechText = homeTeam + "'s next match is at home against " + awayTeam + " on " + alexaDateUtil.getFormattedDate(matchDate) + " at " + alexaDateUtil.getFormattedTime(matchDate) + " Greenwich Mean Time";
            } else {
                speechText = awayTeam + " is playing at " + homeTeam + " on " + alexaDateUtil.getFormattedDate(matchDate) + " at " + alexaDateUtil.getFormattedTime(matchDate) + " Greenwich Mean Time";
            }
        } else {
            speechText = homeTeam + " has no matches in the next two weeks.";
        }


        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput, repromptOutput);

    })
}

function handleGetMatchResultRequest(intent, session, response) {
    // Determine team name
    var teamObj = getTeamFromIntent(intent, true),
        repromptText,
        speechOutput;

    if (teamObj.error) {
        // invalid team name, move to dialog
        var speechText = "<p>I don't have information for " + intent.slots.Team.value + ". I currently only support Premier League clubs.</p>";
        var cardTitle = "Invalid Team Name";
        var cardContent = "I don't have information for " + intent.slots.Team.value + ". I currently only support Premier League clubs.";

        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

        response.tellWithCard(speechOutput, cardTitle, cardContent);
    }

    getMatchResultFromAPI(teamObj.teamID, function(fixtures) {
        var speechText;

        if (fixtures.length > 0) {
            var matchDate = new Date(fixtures[fixtures.length - 1].date);
            var homeTeam = fixtures[fixtures.length - 1].homeTeamName;
            var awayTeam = fixtures[fixtures.length - 1].awayTeamName;
            var homeTeamGoals = fixtures[fixtures.length - 1].result.goalsHomeTeam;
            var awayTeamGoals = fixtures[fixtures.length - 1].result.goalsAwayTeam;

            if (homeTeamGoals > awayTeamGoals) {
                speechText = cleanTeamName(homeTeam) + " beat " + cleanTeamName(awayTeam) + " by " + homeTeamGoals + " goals to " + awayTeamGoals + " on " + alexaDateUtil.getFormattedDate(matchDate) + ".";
            } else if (homeTeamGoals < awayTeamGoals) {
                speechText = cleanTeamName(awayTeam) + " triumphed over " + cleanTeamName(homeTeam) + " " + awayTeamGoals + " to " + homeTeamGoals + " on " + alexaDateUtil.getFormattedDate(matchDate) + ".";
            } else {
                speechText = cleanTeamName(homeTeam) + " drew to " + cleanTeamName(awayTeam) + ", " + homeTeamGoals + " a piece on " +  alexaDateUtil.getFormattedDate(matchDate) + ".";
            }
        } else {
            speechText = "No matches in the last fortnight.";
        }

        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput, repromptOutput);


        if (fixtures.length > 0) {
            if (teamObj.team == homeTeam) {
                // speechText = homeTeam + "'s next match is at home against " + awayTeam + " on " + alexaDateUtil.getFormattedDate(matchDate) + " at " + alexaDateUtil.getFormattedTime(matchDate) + " Greenwich Time";
            } else {
                speechText = awayTeam + " is playing at " + homeTeam + " on " + alexaDateUtil.getFormattedDate(matchDate) + " at " + alexaDateUtil.getFormattedTime(matchDate) + " Greenwich Time";
            }
        } else {
            speechText = homeTeam + " has no matches in the next two weeks.";
        }
    })
}

// Gets team from intent or returns an error
function getTeamFromIntent(intent, assignDefault) {
    var teamSlot = intent.slots.Team;

    // slots can be missing or provided with an empty value. must test for both
    if (!teamSlot || !teamSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            return {
                team: 'manchester united',
                teamID: TEAMS['manchester united']
            }
        }
    } else {
        // lookup the team.
        var teamName = teamSlot.value;
        if (TEAMS[teamName.toLowerCase()]) {
            return {
                team: teamName.toLowerCase(),
                teamID: TEAMS[teamName.toLowerCase()]
            }
        } else {
            return {
                error: true,
                team: teamName
            }
        }
    }
}

function getTableFromAPI(eventCallback) {
    var urlSuffix = 'soccerseasons/398/leagueTable';
    http.get(urlPrefix + urlSuffix, function(res) {
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

function getMatchFromAPI(teamID, eventCallback) {
    http.get(urlPrefix + 'teams/' + teamID + '/fixtures?timeFrame=n14' , function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var json = JSON.parse(body);
            eventCallback(json['fixtures']);
        });
    }).on('error', function(e) {
        console.log('Got error ', e);
    });
};

function getMatchResultFromAPI(teamID, eventCallback) {
    http.get(urlPrefix + 'teams/' + teamID + '/fixtures?timeFrame=p14', function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var json = JSON.parse(body);
            eventCallback(json['fixtures']);
        });
    }).on('error', function(e) {
        console.log('Got error ', e);
    });
}

function cleanTeamName(teamString) {
    return teamString.replace(/(fc|afc)/gi, '').trim().toLowerCase();
}

// Create the handler that responds to the Alexa Request
exports.handler = function(event, context) {
    var fergie = new Fergie();
    fergie.execute(event, context);
}
