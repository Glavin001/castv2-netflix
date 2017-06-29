var util = require('util');
var castv2Cli = require('castv2-client');
var Application = castv2Cli.Application;
var MediaController = castv2Cli.MediaController;
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

Plex.prototype.getStatus = function (callback) {
  this.setNamespace("urn:x-cast:com.google.cast.media");
  this.media.getStatus.apply(this.media, arguments);
};

Plex.prototype.load = function (videoId) {
  console.log('load', this.plex, this.plex.channel);
  this.setNamespace("urn:x-cast:com.google.cast.media");
  this.plex.load.apply(this.plex, arguments);
};

Plex.prototype.send = function () {
  this.plex.send.apply(this.plex, arguments);
};

Plex.prototype.play = function (callback) {
  // this.setNamespace("urn:x-cast:com.google.cast.media");
  this.setNamespace("urn:x-cast:plex");
  this.media.play.apply(this.media, arguments);
};

Plex.prototype.pause = function (callback) {
  this.setNamespace("urn:x-cast:plex");
  this.media.pause.apply(this.media, arguments);
};

Plex.prototype.stop = function (callback) {
  this.setNamespace("urn:x-cast:plex");
  this.media.stop.apply(this.media, arguments);
};

Plex.prototype.seek = function (currentTime, callback) {
  this.setNamespace("urn:x-cast:plex");
  this.media.seek.apply(this.media, arguments);
};

Plex.prototype.showDetails = function (videoId, callback) {
  const contentId = `/library/metadata/${videoId}`;
  const machineIdentifier = "31b6dd0bf85db1d0086a68c3c0e1722b3556766d";
  const address = "192-168-1-12.2f6e0979e5df45f9b2db6f4492ffe0f7.plex.direct";
  const accessToken = "transient-974d1090-45b9-40a0-a5f7-b8f1f5a6e048";
  const containerKey = "/playQueues/124?own=1&window=200";

  const payload = {
    "type": "SHOWDETAILS",
    "media": {
      contentId,
      "streamType": "BUFFERED",
      "contentType": "video",
      "metadata": null,
      "duration": null,
      "tracks": null,
      "textTrackStyle": null,
      "customData": {
        "server": {
          machineIdentifier,
          "transcoderVideo": true,
          "transcoderVideoRemuxOnly": false,
          "transcoderAudio": true,
          "version": "0.9.12.4",
          "myPlexSubscription": false,
          "isVerifiedHostname": true,
          "protocol": "https",
          address,
          "port": "32400",
          accessToken,
        },
        "user": {
          "username": "Glavin001"
        }
      }
    }
  };
  this.plex.send.apply(this.plex, [payload, callback]);
}

Plex.prototype.setNamespace = function (namespace) {
  console.log('Namespace', namespace);
  this.plex.channel.namespace = namespace;
}

module.exports = Plex;
