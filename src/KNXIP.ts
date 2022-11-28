const express = require('express')
const http = require('http')
const app = express();
const server = http.createServer(app)
const path = require('path');
const io = require('socket.io')(server);
const logging = require('./dataLogger')
require('dotenv')

import { Request, Response, NextFunction } from 'express';
import "reflect-metadata"

app.use(express.static(path.resolve(__dirname, '../public')))
app.use(express.json());

import { discoverAndConnectKnxClient } from './knxClient'
const knxStructureImporter = require('./ImprtKnx')
const xmlToKnxConverter = require('./XmlToKnxConverter');

import { DataSource } from "typeorm"
import { CurrentTemperature } from "./entity/currentTemperature"
import { HeatingActuatorValue } from "./entity/heatingActuatorValue"
import { TargetTemperature } from "./entity/targetTemperature"
import { initializeDb } from "./databaseConnector"


var knxMasterStruct: any
var knxStructureFromXml = {}
var knxMasterStructForClient = {}

io.on('connection', client => { })


startUp()

async function startUp() {
  await initializeDb()
  var knxClient: any = await discoverAndConnectKnxClient()
  knxClient.on("indication", handleBusEvent);
  knxClient.monitorBus()
  knxStructureFromXml = await knxStructureImporter.updateKnxStructure('Grouppenaddressen.xml', 'knxExport.xsd')
  knxMasterStruct = xmlToKnxConverter.convertXmlStructureToKnxClient(knxStructureFromXml, knxClient, true)
  knxMasterStructForClient = xmlToKnxConverter.convertXmlStructureToKnxClient(knxStructureFromXml, knxClient, false)
  server.listen(process.env.PORT, () => console.log(`Listening on 5000`))
}

app.get('/getMasterStructure', function (req: Request, res: Response) {
  res.status(200).send(knxMasterStructForClient)
})

app.get('/', function (req: Request, res: Response) {
  res.sendFile(path.resolve(__dirname, '../public', 'KNXHomePage.html'));
});

app.post('/getTemperatures', async function (req: Request, res: Response) {
  var data = await logging.readFromDb(req.body.room)
  console.log(data)
  res.status(200).send(data)
})

app.post('/groupAddressCall/button', async function (req: Request, res: Response) {
  var requestedKnxGroupAddressCall = req.body
  var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall)
  readStatusAndSetValueOnBus(groupRangeObject, res)
})

app.post('/groupAddressCall/impulse', async function (req: Request, res: Response) {
  var requestedKnxGroupAddressCall = req.body
  var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall)
  try {
    groupRangeObject.knxFunction.setOn()
    res.status(200).send()
  }
  catch {
    res.status(500).send()
  }
})

app.post('/groupAddressCall/setAbsoluteValue', async function (req: Request, res: Response) {
  var requestedKnxGroupAddressCall = req.body
  var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall)
  setAbsoluteValue(groupRangeObject, requestedKnxGroupAddressCall.value, res)
})

app.post('/groupAddressCall/incrementDecrement', async function (req: Request, res: Response) {
  var requestedKnxGroupAddressCall = req.body
  var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall)
  sendIncrementDecrementOnBus(groupRangeObject, requestedKnxGroupAddressCall.changeDirection, res)
})

app.post('/groupAddressValue', async function (req: Request, res: Response) {
  try {
    var requestedKnxGroupAddressCall = req.body
    var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall)
    readStatusAndSendToClient(groupRangeObject, res)
  } catch { }
})

function findKnxGroupAddress(requestedKnxGroupAddressCall: any) {
  var requestedMainGroup = knxMasterStruct.groupRange.find(obj => { return obj.name == requestedKnxGroupAddressCall.mainGroup })
  var requestedMiddleGroup = requestedMainGroup.groupRange.find(obj => { return obj.name == requestedKnxGroupAddressCall.middleGroup })
  var requestedGroupAddress = requestedMiddleGroup.groupAddress.find(obj => { return obj.name == requestedKnxGroupAddressCall.groupAddress })
  return requestedGroupAddress
}

function findKnxGroupAdressObjectByGroupAdress(groupAddressString: any) {
  var requestedGroupAddress: any
  knxMasterStruct.groupRange.some(mainGroup => {
    mainGroup.groupRange.some(middleGroup => {
      middleGroup.groupAddress.some(groupAddressObject => {
        if (groupAddressObject.address == groupAddressString) {
          requestedGroupAddress = groupAddressObject
          return true
        }
      })
      if (requestedGroupAddress) { return true }
    })
    if (requestedGroupAddress) { return true }
  })
  return requestedGroupAddress
}

const handleBusEvent = async function (srcAddress, dstAddress, npdu) {
  var groupAddressObject = findKnxGroupAdressObjectByGroupAdress(formatGroupAdress(dstAddress.toString()))
  console.log('***************************************************')
  console.log(groupAddressObject.name)
  console.log(groupAddressObject.middleGroupName)
  console.log(`${srcAddress.toString()} -> ${dstAddress}`);
  console.log(`is groupRead: ${npdu.isGroupRead}`)
  console.log(`is groupResponse: ${npdu.isGroupResponse}`)
  console.log(`is groupWrite: ${npdu.isGroupWrite}`)
  if (npdu.isGroupWrite) {
    var value = groupAddressObject.knxFunction.type.decode(npdu.dataValue)
    console.log(`value is: ${value}`)
    console.log(value)
    if (process.env.ENVIRONMENT == 'prod') {
      logging.logValue(groupAddressObject.middleGroupName, groupAddressObject.name, value)
    }
    io.emit('updateGroupAddress', { groupAddress: formatGroupAdress(dstAddress.toString()), dataValue: value })
    console.log('***************************************************')
  }
};

async function readStatusAndSetValueOnBus(groupRangeObject: any, res: Response) {
  var status = await groupRangeObject.knxFunction.read()
  console.log(status)
  if (!status) {
    await groupRangeObject.knxFunction.setOn()
  }
  else if (status) {
    await groupRangeObject.knxFunction.setOff()
  }
  else {
    res.status(500).send('knx error')
  }
}

async function setAbsoluteValue(groupRangeObject: any, value: number, res: Response) {
  console.log(groupRangeObject.knxFunction.type)
  await groupRangeObject.knxFunction.write(value)
  console.log('written')
  res.status(200).end()
}

async function sendIncrementDecrementOnBus(groupRangeObject: any, direction: number, res: Response) {
  if (groupRangeObject.mainDataPointType == '1') {
    await groupRangeObject.knxFunction.write(direction)
  }
  if (groupRangeObject.mainDataPointType == '3') {
    var DPT3value = { stepCode: 4, isUP: direction, isIncrease: direction }
    console.log(DPT3value)
    await groupRangeObject.knxFunction.write(DPT3value)
  }
  res.status(200).end()
}

async function readStatusAndSendToClient(groupRangeObject: any, res: Response) {
  console.log(groupRangeObject.address)
  try {
    var value = await groupRangeObject.knxFunction.read()
  } catch {
    return res.status(200).send(`knx bus error or timeout on group address ${groupRangeObject.address}`)
  }
  res.status(200).send(value.toString())
}

function formatGroupAdress(groupAddress) {
  var splitAddress = groupAddress.split('/')
  if (splitAddress.length == 2) {
    splitAddress.unshift(0)
  }
  return splitAddress.join('.')
}

// process
//   .on('unhandledRejection', (reason, p) => {
//     logging.logError(reason)
//     process.exit(1);
//   })
//   .on('uncaughtException', err => {
//     logging.logError(err)
//     process.exit(1);
//   });