/* eslint-env node */

const Promise = require('bluebird');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const compression = require('compression');
const express = require('express');
const iconv = require('iconv-lite');
const morgan = require('morgan');
const natural = require('natural');
const path = require('path');
const rp = require('request-promise');
const schedule = require('node-schedule');
const throng = require('throng');
const winston = require('winston');

const heroku = process.env.HEROKU || false;
const port = process.env.PORT || 8080;
const test = process.env.NODE_ENV !== 'production';

const start = () => {
  let $;
  let classifier;
  let frontend;
  let listen = false;
  const app = express();
  const match = /^[1-9]{1}\d{3}[\s\t].+[^R]$/;
  const replace = /[\d\s\t]|-KY/g;
  const url = {
    上市: 'http://isin.twse.com.tw/isin/C_public.jsp?strMode=2',
    上櫃: 'http://isin.twse.com.tw/isin/C_public.jsp?strMode=4',
    興櫃: 'http://isin.twse.com.tw/isin/C_public.jsp?strMode=5',
  };

  app.use(bodyParser.json());
  app.use(compression());
  if (test) {
    winston.info('Running on test mode...');
    frontend = 'client';
    app.use(morgan('dev'));
  }
  if (!test) {
    winston.info('Running on production mode...');
    frontend = 'dist';
    app.use(morgan('tiny'));
  }
  app.use(express.static(path.join(__dirname, '..', frontend)));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', frontend, 'index.html'));
  });
  app.get('/tell', (req, res) => {
    let market;
    try {
      market = classifier.classify([req.query.id]);
    } catch (err) {
      winston.error(err);
      market = false;
    }
    return res.json({
      market,
    });
  });

  const twse = () => {
    winston.info('Starting to scrape TWSE...');
    classifier = new natural.BayesClassifier();
    return Promise.map(Object.keys(url), market =>
      rp({
        uri: url[market],
        encoding: null,
      })
      .then((htmlString) => {
        $ = cheerio.load(iconv.decode(htmlString, 'big5'));
        $('td').each((i, elem) => {
          const tdText = $(elem).text();
          if (tdText.match(match)) {
            classifier.addDocument([tdText.replace(replace, '')], market);
          }
        });
        return Promise.resolve();
      }))
    .then(() => {
      classifier.train();
      winston.info('Done training new data!');
      if (!listen) {
        app.listen(port, winston.info(`Listening on port ${port}...`));
        listen = true;
      }
      return Promise.resolve();
    })
    .catch(winston.error);
  };

  schedule.scheduleJob('0 3 * * *', twse);
  twse();
};

if (heroku) start();
if (!heroku) throng(start);
