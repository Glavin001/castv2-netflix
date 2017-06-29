var util              = require('util');
var castv2Cli         = require('castv2-client');
var Application       = castv2Cli.Application;
var MediaController   = castv2Cli.MediaController;
var PlexController = require('./PlexController');

function Plex(client, session) {
  Application.apply(this, arguments);

  this.media = this.createController(MediaController);
  this.plex = this.createController(PlexController);

  this.media.on('status', onstatus);

  var self = this;

  function onstatus(status) {
    self.emit('status', status);
  }

}

Plex.APP_ID = '9AC194DC';

util.inherits(Plex, Application);

Plex.prototype.getStatus = function(callback) {
  this.setNamespace("urn:x-cast:com.google.cast.media");
  this.media.getStatus.apply(this.media, arguments);
};

Plex.prototype.load = function(videoId) {
  console.log('load', this.plex, this.plex.channel);
  this.setNamespace("urn:x-cast:com.google.cast.media");
  this.plex.load.apply(this.plex, arguments);
};

Plex.prototype.send = function() {
  this.plex.send.apply(this.plex, arguments);
};

Plex.prototype.play = function(callback) {
  // this.setNamespace("urn:x-cast:com.google.cast.media");
  this.setNamespace("urn:x-cast:plex");
  this.media.play.apply(this.media, arguments);
};

Plex.prototype.pause = function(callback) {
  this.setNamespace("urn:x-cast:plex");
  this.media.pause.apply(this.media, arguments);
};

Plex.prototype.stop = function(callback) {
  this.setNamespace("urn:x-cast:plex");
  this.media.stop.apply(this.media, arguments);
};

Plex.prototype.seek = function(currentTime, callback) {
  this.setNamespace("urn:x-cast:plex");
  this.media.seek.apply(this.media, arguments);
};

Plex.prototype.setNamespace = function(namespace) {
  console.log('Namespace', namespace);
  this.plex.channel.namespace = namespace;
}

module.exports = Plex;
