const fs = require('fs');
const decompress = require('decompress');
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
    requestProgress(request(url), {
      throttle: 500,
    }).on('progress', function (state) {
      console.log(state.percent);
    }).on('error', function (error) {
      reject(error);
    }).on('end', function () {
      resolve();
    }).pipe(fs.createWriteStream(path.join(destination, fileName)));
  });
}

function unzip(zipPath, destination, folderName) {
  return decompress(zipPath, path.join(destination, folderName), {
    strip: 1
  });
}

promptServerInfo()
  .then(() => download(serverInfo.url, serverInfo.destination, 'server.zip'))
  .then(() => unzip(path.join(serverInfo.destination, 'server.zip'), serverInfo.destination, serverInfo.name));
