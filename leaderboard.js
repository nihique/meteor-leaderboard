// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

var App = {};

App.initSession = function () {
  return Session.get("sort") || Session.set("sort", "score");
};

App.initPlayers = function () {
  if (Players.find().count() === 0) {
    var names = ["Ada Lovelace",
                 "Grace Hopper",
                 "Marie Curie",
                 "Carl Friedrich Gauss",
                 "Nikola Tesla",
                 "Claude Shannon"];
    for (var i = 0; i < names.length; i++)
      Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
  }
};

if (Meteor.is_client) {
  App.initSession();

  Template.leaderboard.players = function () {
    var sort = Session.get("sort") === "score"
      ? {score: -1, name: 1}
      : {name: 1, score: -1};

    return Players.find({}, {sort: sort});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leaderboard.sort = function () {
    return Session.get("sort");
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events = {
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click .sort': function () {
      var new_sort = Session.get("sort") !== 'name' ? 'name' : 'score';
      Session.set("sort", new_sort);
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
  Meteor.startup(function () {
    App.initPlayers();
  });
}
