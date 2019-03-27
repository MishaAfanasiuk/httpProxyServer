const http = require('http');
const request = require('request');
const queryString = require('query-string');
const Logger = require('./logger');

const METHODS_WITH_BODY = ['POST', 'PUT', 'DELETE'];
const MAX_POST_LENGTH = 1e6;

class HttpProxyServer {
  constructor(){
    this.requestHandler = this.requestHandler.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.createRequest = this.createRequest.bind(this);
  }

  start(port){
    const server = http.createServer(this.requestHandler);
    server.listen(port);
    return server;
  }

  async requestHandler(userReq, userRes){
    const options = await this.getOptions(userReq);
    Logger.log(Object.assign(options, {headers: 'hidden'}));
    const requestStream = this.createRequest(userReq, userRes, options);
    requestStream.pipe(userRes);
  }

  createRequest(userReq, userRes, options){
    return request(options, this.createErrorHandler(userRes));
  }

  createErrorHandler(userRes){
    return (err) => {
      if(!err) return;
      Logger.error(err);
      userRes.end(JSON.stringify(err));
    }
  }

  async getOptions(userReq){
    const options = {
      method: userReq.method,
      url: userReq.url,
      headers: {...userReq.headers}
    };
    if (METHODS_WITH_BODY.includes(userReq.method)) {
      options.form = await this.parseBody(userReq);
    }
    return options;
  }

  parseBody(userReq) {
    return new Promise((resolve, reject) => {
      let postData = '';
      userReq.on('data', chunk => {
        postData += chunk;
        if (postData.length > MAX_POST_LENGTH) reject(new Error('Post data is too long'));
      });
      userReq.on('end', () => {
        const parsedData = queryString.parse(postData);
        resolve(parsedData);
      });
    });
  }
}

module.exports = HttpProxyServer;
