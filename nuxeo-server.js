const bytes = require('bytes');
const cliProgress = require('cli-progress');
const decompress = require('decompress');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const request = require('request');
const requestProgress = require('request-progress');

let serverInfo = {};

function promptServerInfo() {
  return inquirer.prompt([{
    type: 'input',
    name: 'url',
    message: 'Server URL:'
  }, {
    type: 'input',
    name: 'name',
    message: 'Server name:',
    default: 'server'
  }, {
    type: 'input',
    name: 'destination',
    message: 'Server destination:',
    default: __dirname
  }]).then(answers => Object.assign(serverInfo, answers));
}

function download(url, destination, fileName) {
  return new Promise((resolve, reject) => {
    const progressBar = new cliProgress.Bar({
      barsize: process.stdout.columns - 30,
      fps: 20,
      format: `[{bar}] {percentage}% ({speed})`,
      clearOnComplete: true,
      hideCursor: true
    });
    progressBar.start(1, 0, { speed: 'N/A' });
    requestProgress(request(url), {
      throttle: 50,
    }).on('progress', function (state) {
      progressBar.update(state.percent, { speed: state.speed ? `${bytes(state.speed)}/s` : 'N/A' });
    }).on('error', function (error) {
      progressBar.stop();
      reject(error);
    }).on('end', function () {
      progressBar.update(1);
      progressBar.stop();
      resolve();
    }).pipe(fs.createWriteStream(path.join(destination, fileName)));
  });
}

function unzip(zipPath, destination, folderName, strip) {
  return decompress(zipPath, path.join(destination, folderName), { strip });
}

function remove(targetPath) {
  return new Promise((resolve, reject) => fs.unlink(targetPath, error => error ? reject() : resolve()));
}

function makeExecutable(targetPath) {
  return new Promise((resolve, reject) => fs.chmod(targetPath, 0o777, error => error ? reject() : resolve()))
}

promptServerInfo()
  .then(() => download(serverInfo.url, serverInfo.destination, 'server.zip'))
  .then(() => unzip(path.join(serverInfo.destination, 'server.zip'), serverInfo.destination, serverInfo.name, 1))
  .then(() => remove(path.join(serverInfo.destination, 'server.zip')))
  .then(() => makeExecutable(path.join(serverInfo.destination, serverInfo.name, 'bin', 'nuxeoctl')));
