const serverless = require('serverless-http');
const app = require('../../server.cjs');

module.exports.handler = serverless(app);
