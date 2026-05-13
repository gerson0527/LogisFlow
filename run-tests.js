const karma = require('karma');
const path = require('path');

const karmaConfig = {
  configFile: path.join(__dirname, 'karma.conf.js'),
  singleRun: true,
  browsers: ['ChromeHeadless'],
  autoWatch: false,
  customLaunchers: {
    ChromeHeadless: {
      base: 'Chrome',
      flags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    }
  }
};

const server = new karma.Server(karmaConfig, (exitCode) => {
  process.exit(exitCode);
});

server.start();