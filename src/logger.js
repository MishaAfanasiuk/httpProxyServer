const log = require('loglevel');
// log.setLevel(process.env.NODE_ENV === 'production' ? 'silent' : 'trace');
log.setLevel('trace');

module.exports = log;
