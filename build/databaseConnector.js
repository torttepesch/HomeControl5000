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
exports.initializeDb = exports.homeControlDb = void 0;
const typeorm_1 = require("typeorm");
const currentTemperature_1 = require("./entity/currentTemperature");
const heatingActuatorValue_1 = require("./entity/heatingActuatorValue");
const targetTemperature_1 = require("./entity/targetTemperature");
require('dotenv').config();
const homeControlDb = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.MYSQLIPADDRESS,
    port: 3306,
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPW,
    database: process.env.MYSQLNAME,
    synchronize: true,
    entities: [currentTemperature_1.CurrentTemperature, heatingActuatorValue_1.HeatingActuatorValue, targetTemperature_1.TargetTemperature]
});
exports.homeControlDb = homeControlDb;
// const homeControlDb = new DataSource({
//     type: "mysql",
//     host: process.env.MYSQLIPADDRESS,
//     port: 3306,
//     username: `process.env.MYSQLUSER`,
//     password: process.env.MYSQLPW,
//     database: process.env.MYSQLNAME,
//     synchronize: true,
//     entities: [CurrentTemperature, HeatingActuatorValue, TargetTemperature]
// })
function initializeDb() {
    return __awaiter(this, void 0, void 0, function* () {
        homeControlDb
            .initialize()
            .then(() => {
            console.log("Data Source has been initialized!");
        })
            .catch((err) => {
            console.error("Error during Data Source initialization:", err);
        });
    });
}
exports.initializeDb = initializeDb;
//# sourceMappingURL=databaseConnector.js.map