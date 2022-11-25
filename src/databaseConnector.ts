import { DataSource } from "typeorm"
import { CurrentTemperature } from "./entity/currentTemperature"
import { HeatingActuatorValue } from "./entity/heatingActuatorValue"
import { TargetTemperature } from "./entity/targetTemperature"

require('dotenv').config()

const homeControlDb = new DataSource({
    type: "mysql",
    host: process.env.MYSQLIPADDRESS,
    port: 3306,
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPW,
    database: process.env.MYSQLNAME,
    synchronize: true,
    entities: [CurrentTemperature, HeatingActuatorValue, TargetTemperature]
})

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

async function initializeDb() {

    homeControlDb
        .initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
        })
}

export { homeControlDb, initializeDb }
