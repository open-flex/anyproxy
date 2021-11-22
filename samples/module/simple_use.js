const AnyProxy = require('@anyproxy/core');

const options = {
  port: 8001,
  webInterface: {
    enable: true,
  },
};
const proxyServer = new AnyProxy.ProxyServer(options);
proxyServer.start();
