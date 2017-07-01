const Client = require('castv2-client').Client;
const mdns = require('mdns');
const inquirer = require('inquirer');
const Plex = require('./Plex');

inquirer.prompt([
  {
    type: 'input',
    name: 'username',
    message: 'What is your Plex username?',
  },
  {
    type: 'password',
    message: 'What is your Plex password',
    name: 'password',
    mask: '*',
  },
  {
    type: 'input',
    name: 'chromecast',
    message: 'Any specific Chromecast IP you wish to cast to? Default is all.',
  },
])
  .then(({ username, password, chromecast }) => {
    console.log('Plex', username, password);

    if (chromecast) {
      ondeviceup(chromecast);
    } else {
      const browser = mdns.createBrowser(mdns.tcp('googlecast'));
      browser.on('serviceUp', function (service) {
        console.log('Found device "%s" at %s:%d', service.name, service.addresses[
          0], service.port);
        ondeviceup(service.addresses[0]);
        browser.stop();
      });
      browser.start();
    }

    function ondeviceup(chromecastHost) {
      const client = new Client();
      client.connect(chromecastHost, function () {
        console.log('Connected, launching app ...');
        client.launch(Plex, function (err, player) {
          console.log('Launched', err);
          player.login({
            username, password
          });
          player.servers()
            .then(servers => {
              const serverChoices = servers.map(device => ({
                name: device.attributes.name,
                value: device,
              }));
              return inquirer.prompt([
                {
                  type: 'list',
                  name: 'server',
                  message: 'Which Plex server would you like to use?',
                  choices: serverChoices
                },
                {
                  type: 'input',
                  name: 'videoId',
                  message: 'What videoId would you like to cast?',
                },
                {
                  type: 'list',
                  name: 'operation',
                  message: 'What would you like to do?',
                  choices: [{
                    name: "Show Details",
                    value: "showDetails"
                  }, {
                    name: "Load & Play",
                    value: "load"
                  }]
                },
              ])
                .then(function ({ server, videoId, operation }) {
                  player.selectServer(server);

                  player[operation](videoId, function (error, results) {
                    console.log(`${operation} callback`, error, results);
                  })
                    .then(results => {
                      console.log(`${operation} then`, results);
                    })
                    .catch(error => {
                      console.error(`${operation} catch`, error);
                    });

                });
            })
            .catch(error => console.error(error));
        });
      });

      client.on('error', function (err) {
        console.log('Error: %s', err.message);
        client.close();
      });

    }
  })
  .catch(error => console.error(error));
