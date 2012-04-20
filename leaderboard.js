// Client and server 
var App = { 
  Models: {},
  Helpers: {}
};

// Model::Developers
App.Models.Developers = new Meteor.Collection("Developers");

App.Models.Developers.init = function () {
  if (App.Models.Developers.find().count() > 0) return;
  var names = ["Martin", "Mirek", "Rasta", "Karel", "David", "Tomas"];
  _(names).each(function (name) {
    App.Models.Developers.insert({
      name: name, 
      score: App.Models.Developers.getRandomScore()
    });
  });
};

App.Models.Developers.resetScore = function () {
  App.Models.Developers.find().forEach(function (developer) {
    App.Models.Developers.update(
      {_id: developer._id}, 
      {$set: {score: App.Models.Developers.getRandomScore()}}
    );
  });
};

App.Models.Developers.getRandomScore = function () {
  return Math.floor(Math.random()*50);
};

App.Models.Developers.addPointsToSelectedDeveloper = function (points) {
  App.Models.Developers.update(
    App.Models.Developers.getSelectedId(), 
    {$inc: {score: points}}
  );
};

App.Models.Developers.getSelectedId = function () {
  return Session.get("selected_developer");
};

App.Models.Developers.setSelectedId = function (id) {
  return Session.set("selected_developer", id);
};

// Helpers
App.Helpers.initSession = function () {
  Session.get("sort") || Session.set("sort", "score");
};


// Client only
if (Meteor.is_client) {
  App.Helpers.initSession();

  // Template's data
  Template.leaderboard.developers = function () {
    var sort = Session.get("sort") === "score"
      ? {score: -1, name: 1}
      : {name: 1, score: -1};
    return App.Models.Developers.find({}, {sort: sort});
  };

  Template.leaderboard.selected_name = function () {
    var developer = App.Models.Developers.findOne(App.Models.Developers.getSelectedId());
    return developer && developer.name;
  };

  Template.leaderboard.sort = function () {
    return Session.get("sort");
  };

  Template.developer.selected = function () {
    return App.Models.Developers.getSelectedId() === this._id ? "selected" : '';
  };

  // Template's events
  Template.leaderboard.events = {
    'click #add1point': function () {
      App.Models.Developers.addPointsToSelectedDeveloper(1);
    },
    'click #add5points': function () {
      App.Models.Developers.addPointsToSelectedDeveloper(5);
    },
    'click #add10points': function () {
      App.Models.Developers.addPointsToSelectedDeveloper(10);
    },
    'click #sort': function () {
      var new_sort = Session.get("sort") !== 'name' ? 'name' : 'score';
      Session.set("sort", new_sort);
    },
    'click #reset': function() {
      App.Models.Developers.resetScore();
    }
  };

  Template.developer.events = {
    'click': function () {
      Session.set("selected_developer", this._id);
    }
  };
}


// Server only
if (Meteor.is_server) {
  Meteor.startup(function () {
    App.Models.Developers.init();
  });
}