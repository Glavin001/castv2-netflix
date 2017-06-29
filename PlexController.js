var util = require('util');
var castv2Cli = require('castv2-client');
var RequestResponseController = castv2Cli.RequestResponseController;

function PlexController(client, sourceId, destinationId) {
  RequestResponseController.call(this, client, sourceId, destinationId,
    'urn:x-cast:plex');
  this.once('close', onclose);
  var self = this;

  function onclose() {
    self.stop();
  }
}

util.inherits(PlexController, RequestResponseController);

PlexController.prototype.load = function(videoId, callback) {
  const requestId = (new Date()).getTime();
  const sessionId = "castv2-plex";
  const contentId = `/library/metadata/${id}`;
  const machineIdentifier = "31b6dd0bf85db1d0086a68c3c0e1722b3556766d";
  const address = "192-168-1-12.2f6e0979e5df45f9b2db6f4492ffe0f7.plex.direct";
  const accessToken = "transient-974d1090-45b9-40a0-a5f7-b8f1f5a6e048";
  const containerKey = "/playQueues/124?own=1&window=200";
  const version = "1.3.3.3148";

  var data = {
    "type": "LOAD",
    requestId,
    sessionId,
    "media": {
      contentId,
      "streamType": "BUFFERED",
      "contentType": "video",
      "metadata": null,
      "duration": null,
      "tracks": null,
      "textTrackStyle": null,
      "customData": {
        "offset": 0.0,
        "directPlay": true,
        "directStream": true,
        "subtitleSize": 100,
        "audioBoost": 100,
        "server": {
          machineIdentifier,
          "transcoderVideo": true,
          "transcoderVideoRemuxOnly": false,
          "transcoderAudio": true,
          version,
          "myPlexSubscription": false,
          "isVerifiedHostname": true,
          "protocol": "https",
          address,
          "port": "32400",
          accessToken,
        },
        "user": {
          "username": "Glavin001"
        },
        containerKey
      }
    },
    "activeTrackIds": null,
    "autoplay": true,
    "currentTime": 0.0,
    "customData": null
  };

  this.request(data, callback);
};

module.exports = PlexController;