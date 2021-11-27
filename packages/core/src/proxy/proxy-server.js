const Recorder = require('../recorder');
const WebInterface = require('../webInterface');
const logUtil = require('../log');
const ProxyCore = require('./proxy-core');

/**
 * start proxy server as well as recorder and webInterface
 */
class ProxyServer extends ProxyCore {
  /**
   *
   * @param {object} config - config
   * @param {object} [config.webInterface] - config of the web interface
   * @param {boolean} [config.webInterface.enable=false] - if web interface is enabled
   * @param {number} [config.webInterface.webPort=8002] - http port of the web interface
   */
  constructor(config) {
    // prepare a recorder
    const recorder = new Recorder();
    const configForCore = Object.assign(
      {
        recorder,
      },
      config
    );

    super(configForCore);

    this.proxyWebinterfaceConfig = config.webInterface;
    this.recorder = recorder;
    this.webServerInstance = null;
  }

  start() {
    if (this.recorder) {
      this.recorder.setDbAutoCompact();
    }

    // start web interface if neeeded
    if (this.proxyWebinterfaceConfig && this.proxyWebinterfaceConfig.enable) {
      this.webServerInstance = new WebInterface(this.proxyWebinterfaceConfig, this.recorder);
      // start web server
      this.webServerInstance
        .start()
        // start proxy core
        .then(() => {
          super.start();
        })
        .catch((e) => {
          this.emit('error', e);
        });
    } else {
      super.start();
    }
  }

  close() {
    const self = this;
    // release recorder
    if (self.recorder) {
      self.recorder.stopDbAutoCompact();
      self.recorder.clear();
    }
    self.recorder = null;

    // close ProxyCore
    return (
      super
        .close()
        // release webInterface
        .then(() => {
          if (self.webServerInstance) {
            const tmpWebServer = self.webServerInstance;
            self.webServerInstance = null;
            logUtil.printLog('closing webInterface...');
            return tmpWebServer.close();
          }
        })
    );
  }
}

module.exports = ProxyServer;
