const Client = require('castv2-client').Client;
const mdns = require('mdns');
const PlexAPI = require("plex-api");
const inquirer = require('inquirer');

const Plex = require('./Plex');

// const browser = mdns.createBrowser(mdns.tcp('googlecast'));
// browser.on('serviceUp', function(service) {
//   console.log('found device "%s" at %s:%d', service.name, service.addresses[
//     0], service.port);
//   // ondeviceup(service.addresses[0]);
//   browser.stop();
// });
// browser.start();

ondeviceup("192.168.1.23");

function ondeviceup(chromecastHost) {

  inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'What is your Plex username?'
    },
    {
      type: 'password',
      message: 'What is your Plex password',
      name: 'password',
      mask: '*',
    }
  ])
  .then(({ username, password }) => {
    console.log('Plex', username, password);

    const plexApiClient = new PlexAPI({
      hostname: 'plex.tv', port: 443,
      username, password
    });
    plexApiClient.query('/api/resources?includeHttps=1')
      .then(result => {
        console.log(JSON.stringify(result, null, 2));
        const devices = result.MediaContainer.Device.map(device => ({
          name: device.attributes.name,
          value: device,
        }));

        inquirer.prompt([
          {
            type: 'list',
            name: 'plex',
            message: 'Which Plex server would you like to use?',
            choices: devices
          },
        ])
          .then(function (answers) {
            console.log(JSON.stringify(answers, null, 2));
            const plexDevice = answers.plex;

            const client = new Client();
            client.connect(chromecastHost, function () {
              console.log('connected, launching app ...');
              client.launch(Plex, function (err, player) {
                console.log('launched', err);
                const machineIdentifier = plexDevice.attributes.clientIdentifier;
                const address = plexDevice.Connection[0].attributes.uri;
                const accessToken = "transient-974d1090-45b9-40a0-a5f7-b8f1f5a6e048";
                const containerKey = "/playQueues/124?own=1&window=200";

                player.showDetails('11172', function () {
                  console.log('showDetails', arguments);
                });

                player.load('11172', function () {
                  console.log('loaded', arguments);
                });

              });
            });

            client.on('error', function (err) {
              console.log('Error: %s', err.message);
              client.close();
            });

          });

      })
      .catch(error => console.error(error));
  });

}

/*
const printArgs = function() {
  console.log(arguments);
};
// chrome.cast.media.MediaInfo = printArgs;
// chrome.cast.media.LoadRequest = printArgs;
const temp = {};
temp.requestSession = chrome.cast.requestSession;
const session = null;
chrome.cast.requestSession = function(onSuccess, onError) {
  temp.requestSession(function(e) {
    session = e;
    console.log('new session');
    temp.loadMedia = session.loadMedia;
    temp.sendMessage = session.sendMessage;
    const tempFn = function(name, fn) {
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