const util = require('util');
const castv2Cli = require('castv2-client');
const PlexAPI = require("plex-api");
const RequestResponseController = castv2Cli.RequestResponseController;
const url = require("url");

function PlexController(client, sourceId, destinationId) {
  RequestResponseController.call(this, client, sourceId, destinationId,
    'urn:x-cast:plex');
  this.once('close', onclose);
  const self = this;
  function onclose() {
    self.stop();
  }
}

util.inherits(PlexController, RequestResponseController);

PlexController.prototype.load = function (videoId, callback) {
  const plexDevice = this.server;

  const machineIdentifier = plexDevice.attributes.clientIdentifier;
  const globalPlexConnection = plexDevice.Connection.filter(connection => connection.attributes.local === "0")[0];
  const uri = globalPlexConnection && globalPlexConnection.attributes.uri && url.parse(globalPlexConnection.attributes.uri)
  const address = uri.hostname;
  const port = uri.port;
  console.log('address', address);
  const { username } = this.api;

  const requestId = (new Date()).getTime();
  const sessionId = "castv2-plex";
  const contentId = `/library/metadata/${videoId}`;
  const version = "1.3.3.3148";

  return Promise.all([
    this.accessToken(),
    // this.createPlayQueue(),
  ])
    .then(([accessToken]) => {
      console.log("load", videoId, accessToken, playQueueId);
      const playQueueId = "127";
      const containerKey = `/playQueues/${playQueueId}?own=1&window=200`;

      const data = {
        "type": "LOAD",
        mediaSessionId: 1,
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
              port,
              accessToken,
            },
            "user": {
              username
            },
            containerKey
          }
        },
        "activeTrackIds": null,
        "autoplay": true,
        "currentTime": 0.0,
        "customData": null
      };
      return payload;
    })
    .then(payload => {
      console.log("Payload", JSON.stringify(payload, null, 2));
      return new Promise((resolve, reject) => {
        this.request(payload, (error, result) => {
          callback && callback(error, result);
          if (error) return reject(error);
          return resolve(result);
        });
      });
    })
    ;
};

PlexController.prototype.showDetails = function (videoId, callback) {
  this.setNamespace("urn:x-cast:com.google.cast.media");
  const requestId = (new Date()).getTime();
  const sessionId = "castv2-plex";

  const plexDevice = this.server;
  const machineIdentifier = plexDevice.attributes.clientIdentifier;
  const globalPlexConnection = plexDevice.Connection.filter(connection => connection.attributes.local === "1")[0];
  const address = globalPlexConnection && globalPlexConnection.attributes.uri && url.parse(globalPlexConnection.attributes.uri).hostname;
  const port = globalPlexConnection && globalPlexConnection.attributes.port;
  const { username } = this.api;

  const contentId = `/library/metadata/${videoId}`;
  // const machineIdentifier = "31b6dd0bf85db1d0086a68c3c0e1722b3556766d";
  // const address = "192-168-1-12.2f6e0979e5df45f9b2db6f4492ffe0f7.plex.direct";

  return Promise.all([
    this.accessToken(),
    // this.createPlayQueue(),
  ])
    .then(([accessToken, playQueueId]) => {
      console.log("showDetails", accessToken, playQueueId);
      // const accessToken = "transient-974d1090-45b9-40a0-a5f7-b8f1f5a6e048";
      // const containerKey = "/playQueues/124?own=1&window=200";
      // const containerKey = `/playQueues/${playQueueId}?own=1&window=200`;

      const payload = {
        "type": "SHOWDETAILS",
        requestId,
        sessionId,
        mediaSessionId: 1,
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
              port,
              accessToken,
            },
            "user": {
              username
            }
          }
        }
      };
      return payload;
    })
    .then(payload => {
      console.log("Payload", JSON.stringify(payload, null, 2));
      return new Promise((resolve, reject) => {
        this.request(payload, (error, result) => {
          callback && callback(error, result);
          if (error) return reject(error);
          return resolve(result);
        });
      });
    })
    ;
}

PlexController.prototype.login = function (options) {
  const {
    hostname = 'plex.tv', port = 443,
    username, password
  } = options;
  const plexApiClient = new PlexAPI({
    hostname, port,
    username, password
  });
  this.api = plexApiClient;
};

PlexController.prototype.selectServer = function (server) {
  this.server = server;
};

PlexController.prototype.servers = function () {
  return this.api.query('/api/resources?includeHttps=1')
    .then(result => {
      // console.log(JSON.stringify(result, null, 2));
      const devices = result.MediaContainer.Device;
      const servers = devices.filter(server => server.attributes.provides.indexOf('server') !== -1);
      return servers;
    });
}

PlexController.prototype.accessToken = function () {
  return this.api.query('/security/token?type=delegation&scope=all')
    .then(result => {
      console.log('accessToken', result);
      return result.MediaContainer.attributes.token; // "transient-974d1090-45b9-40a0-a5f7-b8f1f5a6e048";
    });
};

PlexController.prototype.createPlayQueue = function () {
  return this.api.postQuery('/plexQueues')
    .then(result => console.log(result))
};

PlexController.prototype.setNamespace = function (namespace) {
  console.log('Namespace', namespace);
  this.channel.namespace = namespace;
}

module.exports = PlexController;