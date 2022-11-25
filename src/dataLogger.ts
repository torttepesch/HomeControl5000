var fs = require('fs')
import { homeControlDb } from "./databaseConnector"
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
        Raumtemperatur: 'CurrentTemperature',
        Solltemperatur: 'TargetTemperature',
        Stellgröße: 'HeatingActuatorValue'
    }
    var date = new Date
    const currentTemperature = new CurrentTemperature()
    const heatingActuatorValue = new HeatingActuatorValue()
    const targetTemperature = new TargetTemperature()

    if (mapping[typeofValue] == 'CurrentTemperature') {
        writeHeatingValueInDb(currentTemperature, room, value, date)
    }
    if (mapping[typeofValue] == 'HeatingActuatorValue') {
        writeHeatingValueInDb(heatingActuatorValue, room, value, date)
    }
    if (mapping[typeofValue] == 'TargetTemperature') {
        writeHeatingValueInDb(targetTemperature, room, value, date)
    }
}

async function writeHeatingValueInDb(entity, room, value, date) {

    entity.value = value
    entity.room = room
    entity.timeStamp = date
    await homeControlDb.manager.save(entity)
}

module.exports = {
    logError: logError,
    logValue: logValue
}