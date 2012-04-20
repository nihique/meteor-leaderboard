// Client and server 
var App = { db: {} };

App.db.players = new Meteor.Collection("players");

App.initSession = function () {
  Session.get("sort") || Session.set("sort", "score");
};

App.initPlayers = function () {
  if (App.db.players.find().count() > 0) return;
  var names = ["Martin", "Mirek", "Rasta", "Karel", "David", "Tomas"];
  _(names).each(function (name) {
    App.db.players.insert({
      name: name, 
      score: App.getRandomScore()
    });
  });
};

App.resetScoreForAllPlayers = function () {
  App.db.players.find().forEach(function (player) {
    App.db.players.update(
      {_id: player._id}, 
      {$set: {score: App.getRandomScore()}}
    );
  });
}

App.getRandomScore = function () {
  return Math.floor(Math.random()*10)*10;
}


// Client only
if (Meteor.is_client) {
  App.initSession();

  // Template's data
  Template.leaderboard.players = function () {
    var sort = Session.get("sort") === "score"
      ? {score: -1, name: 1}
      : {name: 1, score: -1};
    return App.db.players.find({}, {sort: sort});
  };

  Template.leaderboard.selected_name = function () {
    var player = App.db.players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leaderboard.sort = function () {
    return Session.get("sort");
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  // Template's events
  Template.leaderboard.events = {
    'click #add5points': function () {
      App.db.players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click #sort': function () {
      var new_sort = Session.get("sort") !== 'name' ? 'name' : 'score';
      Session.set("sort", new_sort);
    },
    'click #reset': function() {
      App.resetScoreForAllPlayers();
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };
}


// Server only
if (Meteor.is_server) {
  Meteor.startup(function () {
    App.initPlayers();
  });
}