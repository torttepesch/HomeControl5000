"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
const databaseConnector_1 = require("./databaseConnector");
const currentTemperature_1 = require("./entity/currentTemperature");
const heatingActuatorValue_1 = require("./entity/heatingActuatorValue");
const targetTemperature_1 = require("./entity/targetTemperature");
var errorLog = fs.createWriteStream("errorLog.txt", { flags: 'a' });
var temperatureLog = fs.createWriteStream("temperatureLog.txt", { flags: 'a' });
function logError(errorMessage) {
    var date = new Date;
    errorLog.write(date.toISOString() + ',' + errorMessage + '\n');
}
// function logValue(room: string, typeofValue: string, value: number){
//     var date = new Date
//     temperatureLog.write(date.toISOString() + ',' + room + ',' + typeofValue + ',' + value + '\n')
// }
function logValue(room, typeofValue, value) {
    return __awaiter(this, void 0, void 0, function* () {
        var mapping = {
            Raumtemperatur: 'CurrentTemperature',
            Solltemperatur: 'TargetTemperature',
            Stellgröße: 'HeatingActuatorValue'
        };
        var date = new Date;
        const currentTemperature = new currentTemperature_1.CurrentTemperature();
        const heatingActuatorValue = new heatingActuatorValue_1.HeatingActuatorValue();
        const targetTemperature = new targetTemperature_1.TargetTemperature();
        if (mapping[typeofValue] == 'CurrentTemperature') {
            writeHeatingValueInDb(currentTemperature, room, value, date);
        }
        if (mapping[typeofValue] == 'HeatingActuatorValue') {
            writeHeatingValueInDb(heatingActuatorValue, room, value, date);
        }
        if (mapping[typeofValue] == 'TargetTemperature') {
            writeHeatingValueInDb(targetTemperature, room, value, date);
        }
    });
}
function writeHeatingValueInDb(entity, room, value, date) {
    return __awaiter(this, void 0, void 0, function* () {
        entity.value = value;
        entity.room = room;
        entity.timeStamp = date;
        yield databaseConnector_1.homeControlDb.manager.save(entity);
    });
}
module.exports = {
    logError: logError,
    logValue: logValue
};
//# sourceMappingURL=dataLogger.js.map