#!/usr/bin/env node

'use strict';

// exist-false, trusted-false : create CA
// exist-true,  trusted-false : trust CA
// exist-true,  trusted-true  : all things done
const program = require('commander');
const color = require('colorful');
const certMgr = require('../certMgr');
const AnyProxy = require('../proxy');
const exec = require('child_process').exec;
const co = require('co');
const path = require('path');
const inquirer = require('inquirer');

module.exports.run = function () {
  program
    .option('-c, --clear', 'clear all the tmp certificates and root CA')
    .option('-g, --generate', 'generate a new rootCA')
    .parse(process.argv);

  function openFolderOfFile(filePath) {
    const platform = process.platform;
    if (/^win/.test(platform)) {
      exec('start .', { cwd: path.dirname(filePath) });
    } else if (/darwin/.test(platform)) {
      exec(`open -R ${filePath}`);
    }
  }

  function guideToGenrateCA() {
    AnyProxy.utils.certMgr.generateRootCA((error, keyPath, crtPath) => {
      if (!error) {
        const certDir = path.dirname(keyPath);
        console.log(`The cert is generated at ${certDir}. Please trust the ${color.bold('rootCA.crt')}.`);
        openFolderOfFile(crtPath);
      } else {
        console.error('failed to generate rootCA', error);
      }
    });
  }

  function guideToTrustCA() {
    const certPath = AnyProxy.utils.certMgr.getRootCAFilePath();
    if (certPath) {
      openFolderOfFile(certPath);
    } else {
      console.error('failed to get cert path');
    }
  }

  if (program.clear) {
    AnyProxy.utils.certMgr.clearCerts(() => {
      console.log(color.green('done !'));
    });
  } else if (program.generate) {
    guideToGenrateCA();
  } else {
    console.log('detecting CA status...');
    co(certMgr.getCAStatus)
      .then((status) => {
        if (!status.exist) {
          console.log('AnyProxy CA does not exist.');
          const questions = [
            {
              type: 'confirm',
              name: 'ifCreate',
              message: 'Would you like to generate one ?',
              default: true,
            },
          ];
          inquirer.prompt(questions).then((answers) => {
            if (answers.ifCreate) {
              guideToGenrateCA();
            }
          });
        } else if (!status.trusted) {
          if (/^win/.test(process.platform)) {
            console.log('AnyProxy CA exists, make sure it has been trusted');
          } else {
            console.log('AnyProxy CA exists, but not be trusted');
            const questions = [
              {
                type: 'confirm',
                name: 'ifGotoTrust',
                message: 'Would you like to open the folder and trust it ?',
                default: true,
              },
            ];
            inquirer.prompt(questions).then((answers) => {
              if (answers.ifGotoTrust) {
                guideToTrustCA();
              }
            });
          }
          // AnyProxy.utils.certMgr.clearCerts()
        } else {
          console.log(color.green('AnyProxy CA has already been trusted'));
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
};
