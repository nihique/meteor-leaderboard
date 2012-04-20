// Client and server 
var App = { 
  Models: {},
  Helpers: {}
};

// Model::Players
App.Models.Players = new Meteor.Collection("Players");

App.Models.Players.init = function () {
  if (App.Models.Players.find().count() > 0) return;
  var names = ["Martin", "Mirek", "Rasta", "Karel", "David", "Tomas"];
  _(names).each(function (name) {
    App.Models.Players.insert({
      name: name, 
      score: App.getRandomScore()
    });
  });
};

App.Models.Players.resetScore = function () {
  App.Models.Players.find().forEach(function (player) {
    App.Models.Players.update(
      {_id: player._id}, 
      {$set: {score: App.Models.Players.getRandomScore()}}
    );
  });
};

App.Models.Players.getRandomScore = function () {
  return Math.floor(Math.random()*50);
};

App.Models.Players.addPointsToSelectedPlayer = function (points) {
  App.Models.Players.update(
    App.Models.Players.getSelectedId(), 
    {$inc: {score: points}}
  );
};

App.Models.Players.getSelectedId = function () {
  return Session.get("selected_player");
};

App.Models.Players.setSelectedId = function (id) {
  return Session.set("selected_player", id);
};

// Helpers
App.Helpers.initSession = function () {
  Session.get("sort") || Session.set("sort", "score");
};


// Client only
if (Meteor.is_client) {
  App.Helpers.initSession();

  // Template's data
  Template.leaderboard.players = function () {
    var sort = Session.get("sort") === "score"
      ? {score: -1, name: 1}
      : {name: 1, score: -1};
    return App.Models.Players.find({}, {sort: sort});
  };

  Template.leaderboard.selected_name = function () {
    var player = App.Models.Players.findOne(App.Models.Players.getSelectedId());
    return player && player.name;
  };

  Template.leaderboard.sort = function () {
    return Session.get("sort");
  };

  Template.player.selected = function () {
    return App.Models.Players.getSelectedId() === this._id ? "selected" : '';
  };

  // Template's events
  Template.leaderboard.events = {
    'click #add1point': function () {
      App.Models.Players.addPointsToSelectedPlayer(1);
    },
    'click #add5points': function () {
      App.Models.Players.addPointsToSelectedPlayer(1);
    },
    'click #add10points': function () {
      App.Models.Players.addPointsToSelectedPlayer(10);
    },
    'click #sort': function () {
      var new_sort = Session.get("sort") !== 'name' ? 'name' : 'score';
      Session.set("sort", new_sort);
    },
    'click #reset': function() {
      App.Models.Players.resetScore();
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
    App.Models.Players.init();
  });
}