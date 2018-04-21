const fs = require('fs');
const decompress = require('decompress');
const inquirer = require('inquirer');
const path = require('path');
const request = require('request');
const requestProgress = require('request-progress');

let serverUrl;
let serverName;
let serverLocation;

function promptServerInfo() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'serverUrl',
      message: 'Server URL:'
    },
    {
      type: 'input',
      name: 'serverName',
      message: 'Server name:',
      default: 'server'
    },
    {
      type: 'input',
      name: 'serverLocation',
      message: 'Server location:',
      default: __dirname
    }
  ]).then(answers => {
    serverUrl = answers.serverUrl;
    serverName = answers.serverName;
    serverLocation = answers.serverLocation;
  });
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
  .then(() => download(serverUrl, serverLocation, 'server.zip'))
  .then(() => unzip(path.join(serverLocation, 'server.zip'), serverLocation, serverName));
