var fs = require('fs')
import { homeControlDb } from "./databaseConnector"
import { AirHumidity } from "./entity/airHumidity"
import { CurrentTemperature } from "./entity/currentTemperature"
import { HeatingActuatorValue } from "./entity/heatingActuatorValue"
import { TargetTemperature } from "./entity/targetTemperature"

var errorLog = fs.createWriteStream("errorLog.txt", { flags: 'a' });
var temperatureLog = fs.createWriteStream("temperatureLog.txt", { flags: 'a' });

function logError(errorMessage: string) {
    var date = new Date
    errorLog.write(date.toISOString() + ',' + errorMessage + '\n')
}

// function logValue(room: string, typeofValue: string, value: number){
//     var date = new Date
//     temperatureLog.write(date.toISOString() + ',' + room + ',' + typeofValue + ',' + value + '\n')
// }

async function logValue(room: string, typeofValue: string, value: number) {
    var mapping = {
        "Raumtemperatur": 'CurrentTemperature',
        "Solltemperatur": 'TargetTemperature',
        "Stellgröße": 'HeatingActuatorValue',
        "Relative Luftfeuchtigkeit": 'AirHumidity'
    }
    var date = new Date
    const currentTemperature = new CurrentTemperature()
    const heatingActuatorValue = new HeatingActuatorValue()
    const targetTemperature = new TargetTemperature()
    const airHumidity = new AirHumidity

    if (mapping[typeofValue] == 'CurrentTemperature') {
        writeHeatingValueInDb(currentTemperature, room, value, date)
    }
    if (mapping[typeofValue] == 'HeatingActuatorValue') {
        writeHeatingValueInDb(heatingActuatorValue, room, value, date)
    }
    if (mapping[typeofValue] == 'TargetTemperature') {
        writeHeatingValueInDb(targetTemperature, room, value, date)
    }
    if (mapping[typeofValue] == 'AirHumidity') {
        writeHeatingValueInDb(airHumidity, room, value, date)
    }
}

async function writeHeatingValueInDb(entity, room, value, date) {

    entity.value = value
    entity.room = room
    entity.timeStamp = date
    await homeControlDb.manager.save(entity)
}

async function readFromDb(room) {

    var dateNow = new Date()
    var dateYesterday = getPreviousDay(dateNow)
    var dateNowString = formatDate(dateNow)
    var dateYesterdayString = formatDate(dateYesterday)

    console.log(dateNowString)
    console.log(dateYesterdayString)
    var data = await homeControlDb.manager.query(`SELECT id, timestamp, value FROM homecontrol5000database.current_temperature WHERE timeStamp BETWEEN '${dateYesterdayString}' AND '${dateNowString}' AND room = '${room}'`)
    return data
}

function getPreviousDay(date) {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 1);

    return previous;
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}

module.exports = {
    logError: logError,
    logValue: logValue,
    readFromDb: readFromDb
}