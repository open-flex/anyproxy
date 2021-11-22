const AnyProxy = require('@anyproxy/core');
const exec = require('child_process').exec;

const AnyProxyRecorder = require('@anyproxy/core/lib/recorder');
const WebInterfaceLite = require('@anyproxy/core/lib/webInterface');

/*
-------------------------------
| ProxyServerA | ProxyServerB |
-------------------------------                         ----------------------------
|       Common Recorder       | -------(by events)------|     WebInterfaceLite     |
-------------------------------                         ----------------------------
*/

const commonRecorder = new AnyProxyRecorder();

// web interface依赖recorder
// eslint-disable-next-line no-new
new WebInterfaceLite(
  {
    // common web interface
    webPort: 8002,
  },
  commonRecorder
);

// proxy core只依赖recorder，与webServer无关
const optionsA = {
  port: 8001,
  recorder: commonRecorder, // use common recorder
};

const optionsB = {
  port: 8005,
  recorder: commonRecorder, // use common recorder
};

const proxyServerA = new AnyProxy.ProxyCore(optionsA);
const proxyServerB = new AnyProxy.ProxyCore(optionsB);

proxyServerA.start();
proxyServerB.start();

// after both ready
setTimeout(() => {
  exec('curl http://www.qq.com --proxy http://127.0.0.1:8001');
  exec('curl http://www.sina.com.cn --proxy http://127.0.0.1:8005');
}, 1000);

// visit http://127.0.0.1 , there should be two records
