'use strict';

const certMgr = require('./certMgr');
const Recorder = require('./recorder');
const WebInterface = require('./webInterface');
const ProxyCore = require('./proxy/proxy-core');
const ProxyServer = require('./proxy/proxy-server');

module.exports.ProxyCore = ProxyCore;
module.exports.ProxyServer = ProxyServer;
module.exports.ProxyRecorder = Recorder;
module.exports.ProxyWebServer = WebInterface;
module.exports.utils = {
  systemProxyMgr: require('./systemProxyMgr'),
  certMgr,
};
