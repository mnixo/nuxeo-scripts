const fs = require('fs');
const inquirer = require('inquirer');
const request = require('request');
const requestProgress = require('request-progress');

function download(url, fileName) {
  return new Promise((resolve, reject) => {
    requestProgress(request(url), {
      throttle: 500,
    }).on('progress', function(state) {
      console.log(state.percent);
    }).on('error', function(error) {
      reject(error);
    }).on('end', function() {
      resolve();
    }).pipe(fs.createWriteStream(fileName));
  });
}

inquirer.prompt([{
  type: 'input',
  name: 'serverUrl',
  message: 'Server URL'
}]).then(answers => download(answers.serverUrl, 'server.zip'));
