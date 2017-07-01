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
  const contentId = `/library/metadata/${videoId}`;
  const payload = {
    "type": "LOAD",
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
          "transcoderVideo": true,
          "transcoderVideoRemuxOnly": false,
          "transcoderAudio": true,
          "myPlexSubscription": false,
          "isVerifiedHostname": true,
        },
      }
    },
    "activeTrackIds": null,
    "autoplay": true,
    "currentTime": 0.0,
    "customData": null
  };
  return this.plexRequest(payload, callback);
};

PlexController.prototype.plexRequest = function (payload, callback) {
  const plexServer = this.server;
  const accessToken = plexServer.attributes.accessToken;
  const machineIdentifier = plexServer.attributes.clientIdentifier;
  const globalPlexConnection = plexServer.Connection.filter(connection => connection.attributes.local === "1")[0];
  const uri = globalPlexConnection && globalPlexConnection.attributes.uri && url.parse(globalPlexConnection.attributes.uri)
  const address = uri.hostname;
  const port = globalPlexConnection && globalPlexConnection.attributes.port;
  const protocol = globalPlexConnection && globalPlexConnection.attributes.protocol;
  const { username } = this.api;

  const requestId = (new Date()).getTime();
  const sessionId = "castv2-plex";
  const version = "1.3.3.3148";

  return Promise.resolve(payload)
    .then((payload) => {
      payload = Object.assign({}, payload, {
        requestId,
        sessionId,
      });
      payload.media.customData = Object.assign({}, payload.media.customData, {
        server: Object.assign({}, payload.media.customData.server, {
          machineIdentifier,
          version,
          address,
          port,
          accessToken,
          protocol,
        }),
        user: Object.assign({}, payload.media.customData.user || {}, {
          username,
        }),
      });
      return payload;
    })
    .then(payload => {
      // console.log("Payload", JSON.stringify(payload, null, 2));
      return new Promise((resolve, reject) => {
        this.request(payload, (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        });
      });
    })
    .then(result => {
      callback && callback(null, result);
      return result;
    })
    .catch(error => {
      callback && callback(error, null);
      throw error;
    })
    ;
};

PlexController.prototype.showDetails = function (videoId, callback) {
  this.setNamespace("urn:x-cast:plex");
  const contentId = `/library/metadata/${videoId}`;
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
        "offset": 0.0,
        "directPlay": true,
        "directStream": true,
        "subtitleSize": 100,
        "audioBoost": 100,
        "server": {
          "transcoderVideo": true,
          "transcoderVideoRemuxOnly": false,
          "transcoderAudio": true,
          "myPlexSubscription": false,
          "isVerifiedHostname": true,
        },
      }
    },
    "activeTrackIds": null,
    "autoplay": true,
    "currentTime": 0.0,
    "customData": null
  };
  return this.plexRequest(payload, callback);
};

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

PlexController.prototype.username = function () {
  return this.api.username;
};

PlexController.prototype.password = function () {
  return this.api.password;
};

PlexController.prototype.selectServer = function (server) {
  // console.log("Server", server);

  const globalPlexConnection = server.Connection.filter(connection => connection.attributes.local === "1")[0];
  const hostname = globalPlexConnection && globalPlexConnection.attributes.uri && url.parse(globalPlexConnection.attributes.uri).hostname;
  const port = globalPlexConnection && globalPlexConnection.attributes.uri && globalPlexConnection.attributes.port;

  this.server = server;
  this.serverApi = new PlexAPI({
    hostname, port,
    username: this.username(),
    password: this.password(),
  });
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

PlexController.prototype.setNamespace = function (namespace) {
  // console.log('Namespace', namespace);
  this.channel.namespace = namespace;
}

module.exports = PlexController;