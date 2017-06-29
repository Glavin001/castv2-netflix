var Client = require('castv2-client').Client;
var Plex = require('./Plex');
var mdns = require('mdns');

// var browser = mdns.createBrowser(mdns.tcp('googlecast'));

// browser.on('serviceUp', function(service) {
//   console.log('found device "%s" at %s:%d', service.name, service.addresses[
//     0], service.port);
//   // ondeviceup(service.addresses[0]);
//   browser.stop();
// });

// browser.start();

ondeviceup("192.168.1.23");

function ondeviceup(host) {

  var client = new Client();
  client.connect(host, function() {
    console.log('connected, launching app ...');
    client.launch(Plex, function(err, player) {
      console.log('launched', err);
      const contentId = "/library/metadata/11172";
      const machineIdentifier = "31b6dd0bf85db1d0086a68c3c0e1722b3556766d";
      const address = "192-168-1-12.2f6e0979e5df45f9b2db6f4492ffe0f7.plex.direct";
      const accessToken = "transient-974d1090-45b9-40a0-a5f7-b8f1f5a6e048";
      const containerKey = "/playQueues/124?own=1&window=200";

      var data = {
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

      // player.send(data, function() {
      // });
      // console.log('sent', arguments);
      // console.log(player.connection);
      // console.log(player.connection.channel);
      // console.log(player.plex);
      // console.log(player.plex.channel);

      var data2 = {
        "type": "LOAD",
        // "requestId": null,
        // "sessionId": null,
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
            },
            containerKey
          }
        },
        "activeTrackIds": null,
        "autoplay": true,
        "currentTime": 0.0,
        "customData": null
      };
      // player.send(data2, function() {
      //   console.log('loaded');
      // });
      player.load('', function() {
        console.log('loaded', arguments);
      });

    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
  });

}

/*
var printArgs = function() {
  console.log(arguments);
};
// chrome.cast.media.MediaInfo = printArgs;
// chrome.cast.media.LoadRequest = printArgs;
var temp = {};
temp.requestSession = chrome.cast.requestSession;
var session = null;
chrome.cast.requestSession = function(onSuccess, onError) {
  temp.requestSession(function(e) {
    session = e;
    console.log('new session');
    temp.loadMedia = session.loadMedia;
    temp.sendMessage = session.sendMessage;
    var tempFn = function(name, fn) {
      return function() {
        console.log(name, arguments);
        console.log(JSON.stringify(arguments));
        fn.apply(this, arguments);
      };
    }
    session.loadMedia = tempFn('loadMedia', temp.loadMedia);
    session.queueLoad = tempFn('queueLoad', temp.queueLoad);
    session.sendMessage = tempFn('sendMessage', temp.sendMessage);

    return onSuccess(e);
  }, onError);
};
*/

/*
body: "action=session
 version=1.0
 fromurl=cast://0.0.0.0:9080
 fromuuid=NFCDCH-MC-C90XCP1TJ9655QGCDGTPT6QD54UGP3
 fromuserid=a80c05f3a7308538e5ee491895d05c24
 touuid=uuid%3A1lAeAXfNHog0vjd9m_JQjI2WcHg.
 touserid=a80c05f3a7308538e5ee491895d05c24
 nonce=1452314586000
 ciphertext=AhCe28mUvlwYAnY+MIRkqfQScKZTNVSjGFAY1fJHxpsNBHAutH47fAtFCtKfqWEt6OVy/I/9jiWQVAaaSTzqN57+vN3rA0TsAj5mTCytYAPs5KuSV2WO9YKU7zb1JPPx1pSeRSzoLMidnpJmkFK+Ir+rSdpLll9zgpsKCogcAfai+s8=
 hmac=bY1NOeDPNphnVChUGnm0BmF9g6qeyQCT+yL5zUvb/DQ=
 "
*/