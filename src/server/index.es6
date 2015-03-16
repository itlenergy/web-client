import commander from 'commander';
import _ from 'lodash';
import fs from 'fs';
import express from 'express';
import compression from 'compression';
import winston from 'winston';
import moment from 'moment';
import path from 'path';
import hogan from 'hogan-express';

import {version} from '../../package.json';

/**
 * Starts the server.
 */
export function start() {
  let config = getConfig();
  let app = getApp(config);
  
  // start the app listening
  let port = parseInt(config.listen);
  
  if (!isNaN(port)) {
    app.listen(port);
    config.logger.info('Listening on port %d', port);
  } else {
    app.listen(listen);
    config.logger.info('Listening on socket file "%s"', config.listen);
  }
};


export function getApp(config) {
  // set up logger
  config.logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV == 'production' ? 'info' : 'silly',
        colorize: true,
        timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      })
    ]
  });
  
  config.logger.debug('debug logging enabled');
  
  // set up express app
  let app = express();
  app.use(compression());
  app.set('views', path.resolve(__dirname, './views'));
  app.set('view engine', 'html');
  app.engine('html', hogan);
  app.use(express.static(path.resolve(__dirname, '../../static'), {maxAge: 86400000}));
  app.set('config', config);
  
  config.logger.info('Using API URL %s', config.apiUrl);
  
  app.get('/app', function (request, response) {
    response.render('app', {apiUrl: config.apiUrl, version: version});
  });
  
  return app;
};


/**
 * Reads command line options and return them as an object.
 */
function getConfig() {
  // read command line options
  commander
    .version(version)
    .option('--config [file]', 'Reads these options from a config JSON file')
    .option('--listen [value]', 'Listen on port or socket [3001]', '3001')
    .option('--api-url [value]', 'The URL of the web API', 'http://localhost:3000')
    .parse(process.argv);
  
  // check if a config file was specified
  if (commander.config) {
    let config = JSON.parse(fs.readFileSync(commander.config));
    return _.extend(config, commander);
  } else {
    return commander;
  }
}
