var fs = require('fs')

var errorLog = fs.createWriteStream("errorLog.txt", { flags: 'a' });
var temperatureLog = fs.createWriteStream("temperatureLog.txt", { flags: 'a' });

function logError(errorMessage) {
    var date = new Date
    errorLog.write(date.toISOString() + ',' + errorMessage + '\n')
}

function logValue(room, typeofValue, value){
    var date = new Date
    temperatureLog.write(date.toISOString() + ',' + room + ',' + typeofValue + ',' + value + '\n')
}

module.exports = {
    logError: logError,
    logValue : logValue
}