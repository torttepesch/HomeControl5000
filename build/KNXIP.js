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
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const path = require('path');
const io = require('socket.io')(server);
const logging = require('./dataLogger');
require('dotenv');
require("reflect-metadata");
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.json());
const knxStructureImporter = require('./ImprtKnx');
const xmlToKnxConverter = require('./XmlToKnxConverter');
const databaseConnector_1 = require("./databaseConnector");
var knxMasterStruct;
var knxStructureFromXml = {};
var knxMasterStructForClient = {};
io.on('connection', client => { });
startUp();
function startUp() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, databaseConnector_1.initializeDb)();
        // var knxClient: any = await discoverAndConnectKnxClient()
        // knxClient.on("indication", handleBusEvent);
        // knxClient.monitorBus()
        // knxStructureFromXml = await knxStructureImporter.updateKnxStructure('Grouppenaddressen.xml', 'knxExport.xsd')
        // knxMasterStruct = xmlToKnxConverter.convertXmlStructureToKnxClient(knxStructureFromXml, knxClient, true)
        // knxMasterStructForClient = xmlToKnxConverter.convertXmlStructureToKnxClient(knxStructureFromXml, knxClient, false)
        // server.listen(process.env.PORT, () => console.log(`Listening on 5000`))
    });
}
app.get('/getMasterStructure', function (req, res) {
    res.status(200).send(knxMasterStructForClient);
});
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../public', 'KNXHomePage.html'));
});
app.post('/groupAddressCall/button', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var requestedKnxGroupAddressCall = req.body;
        var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall);
        readStatusAndSetValueOnBus(groupRangeObject, res);
    });
});
app.post('/groupAddressCall/impulse', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var requestedKnxGroupAddressCall = req.body;
        var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall);
        try {
            groupRangeObject.knxFunction.setOn();
            res.status(200).send();
        }
        catch (_a) {
            res.status(500).send();
        }
    });
});
app.post('/groupAddressCall/setAbsoluteValue', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var requestedKnxGroupAddressCall = req.body;
        var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall);
        setAbsoluteValue(groupRangeObject, requestedKnxGroupAddressCall.value, res);
    });
});
app.post('/groupAddressCall/incrementDecrement', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var requestedKnxGroupAddressCall = req.body;
        var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall);
        sendIncrementDecrementOnBus(groupRangeObject, requestedKnxGroupAddressCall.changeDirection, res);
    });
});
app.post('/groupAddressValue', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var requestedKnxGroupAddressCall = req.body;
            var groupRangeObject = findKnxGroupAddress(requestedKnxGroupAddressCall);
            readStatusAndSendToClient(groupRangeObject, res);
        }
        catch (_a) { }
    });
});
function findKnxGroupAddress(requestedKnxGroupAddressCall) {
    var requestedMainGroup = knxMasterStruct.groupRange.find(obj => { return obj.name == requestedKnxGroupAddressCall.mainGroup; });
    var requestedMiddleGroup = requestedMainGroup.groupRange.find(obj => { return obj.name == requestedKnxGroupAddressCall.middleGroup; });
    var requestedGroupAddress = requestedMiddleGroup.groupAddress.find(obj => { return obj.name == requestedKnxGroupAddressCall.groupAddress; });
    return requestedGroupAddress;
}
function findKnxGroupAdressObjectByGroupAdress(groupAddressString) {
    var requestedGroupAddress;
    knxMasterStruct.groupRange.some(mainGroup => {
        mainGroup.groupRange.some(middleGroup => {
            middleGroup.groupAddress.some(groupAddressObject => {
                if (groupAddressObject.address == groupAddressString) {
                    requestedGroupAddress = groupAddressObject;
                    return true;
                }
            });
            if (requestedGroupAddress) {
                return true;
            }
        });
        if (requestedGroupAddress) {
            return true;
        }
    });
    return requestedGroupAddress;
}
const handleBusEvent = function (srcAddress, dstAddress, npdu) {
    return __awaiter(this, void 0, void 0, function* () {
        var groupAddressObject = findKnxGroupAdressObjectByGroupAdress(formatGroupAdress(dstAddress.toString()));
        console.log(groupAddressObject.name);
        console.log(groupAddressObject.middleGroupName);
        console.log(`${srcAddress.toString()} -> ${dstAddress}`);
        console.log(`is groupRead: ${npdu.isGroupRead}`);
        console.log(`is groupResponse: ${npdu.isGroupResponse}`);
        console.log(`is groupWrite: ${npdu.isGroupWrite}`);
        console.log('***************************************************');
        if (npdu.isGroupWrite) {
            var value = groupAddressObject.knxFunction.type.decode(npdu.dataValue);
            console.log(`value is: ${value}`);
            console.log(value);
            logging.logValue(groupAddressObject.middleGroupName, groupAddressObject.name, value);
            io.emit('updateGroupAddress', { groupAddress: formatGroupAdress(dstAddress.toString()), dataValue: value });
        }
    });
};
function readStatusAndSetValueOnBus(groupRangeObject, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var status = yield groupRangeObject.knxFunction.read();
        console.log(status);
        if (!status) {
            yield groupRangeObject.knxFunction.setOn();
        }
        else if (status) {
            yield groupRangeObject.knxFunction.setOff();
        }
        else {
            res.status(500).send('knx error');
        }
    });
}
function setAbsoluteValue(groupRangeObject, value, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(groupRangeObject.knxFunction.type);
        yield groupRangeObject.knxFunction.write(value);
        console.log('written');
        res.status(200).end();
    });
}
function sendIncrementDecrementOnBus(groupRangeObject, direction, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (groupRangeObject.mainDataPointType == '1') {
            yield groupRangeObject.knxFunction.write(direction);
        }
        if (groupRangeObject.mainDataPointType == '3') {
            var DPT3value = { stepCode: 4, isUP: direction, isIncrease: direction };
            console.log(DPT3value);
            yield groupRangeObject.knxFunction.write(DPT3value);
        }
        res.status(200).end();
    });
}
function readStatusAndSendToClient(groupRangeObject, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(groupRangeObject.address);
        try {
            var value = yield groupRangeObject.knxFunction.read();
        }
        catch (_a) {
            return res.status(200).send(`knx bus error or timeout on group address ${groupRangeObject.address}`);
        }
        res.status(200).send(value.toString());
    });
}
function formatGroupAdress(groupAddress) {
    var splitAddress = groupAddress.split('/');
    if (splitAddress.length == 2) {
        splitAddress.unshift(0);
    }
    return splitAddress.join('.');
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
//# sourceMappingURL=KNXIP.js.map