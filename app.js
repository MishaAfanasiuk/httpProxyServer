require('dotenv').config();

const HttpProxyServer = require('./src/httpProxyServer');
const port = 3000;

const proxyServer = new HttpProxyServer();
proxyServer.start(port);
