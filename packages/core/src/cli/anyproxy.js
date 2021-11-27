'use strict';

const program = require('commander');
const color = require('colorful');
const co = require('co');
const packageInfo = require('../../package.json');
const util = require('../util');
const rootCACheck = require('../rootCACheck');
const startServer = require('../startServer');
const logUtil = require('../log');

module.exports.run = function () {
  program
    .version(packageInfo.version)
    .option('-p, --port [value]', 'proxy port, 8001 for default')
    .option('-w, --web [value]', 'web GUI port, 8002 for default')
    .option('-r, --rule [value]', 'path for rule file,')
    .option('-l, --throttle [value]', 'throttle speed in kb/s (kbyte / sec)')
    .option('-i, --intercept', 'intercept(decrypt) https requests when root CA exists')
    .option('-s, --silent', 'do not print anything into terminal')
    .option('-c, --clear', 'clear all the certificates and temp files')
    .option('--ws-intercept', 'intercept websocket')
    .option('--ignore-unauthorized-ssl', 'ignore all ssl error')
    .parse(process.argv);

  if (program.clear) {
    require('../certMgr').clearCerts(() => {
      util.deleteFolderContentsRecursive(util.getAnyProxyTmpPath());
      console.log(color.green('done !'));
      process.exit(0);
    });
  } else if (program.root) {
    require('../certMgr').generateRootCA(() => {
      process.exit(0);
    });
  } else {
    co(function* () {
      if (program.silent) {
        logUtil.setPrintStatus(false);
      }

      if (program.intercept) {
        try {
          yield rootCACheck();
        } catch (e) {
          console.error(e);
        }
      }

      return startServer(program);
    });
  }
};
