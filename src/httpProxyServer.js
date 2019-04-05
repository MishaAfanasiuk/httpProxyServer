const http = require('http');
const request = require('request');
const Logger = require('./logger');

class HttpProxyServer {
  constructor(){
    this.requestHandler = this.requestHandler.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.createRequest = this.createRequest.bind(this);
  }

  start(port){
    const server = http.createServer(this.requestHandler);
    server.listen(port);
    // server.listen();
    return server;
  }

  requestHandler(userReq, userRes){
    const options = this.getOptions(userReq);
    Logger.log(Object.assign(options, {headers: 'hidden'}));
    const proxyRequestStream = this.createRequest(userReq, userRes, options);
    proxyRequestStream.pipe(userRes);
  }

  createRequest(userReq, userRes, options){
    return userReq.pipe(request(options, this.createErrorHandler(userRes)));
  }

  createErrorHandler(userRes){
    return (err) => {
      if(!err) return;
      Logger.error(err);
      userRes.end(JSON.stringify(err));
    }
  }

  getOptions(userReq){
    const { method, url, headers } = userReq;
    return {
      method: method,
      url: this.getUrl(url),
      headers: headers
    }
  }

  getUrl(url){
    return url[0] === '/' && url.length > 1 ? url.replace('/', ''): url;
  }
}

module.exports = HttpProxyServer;
