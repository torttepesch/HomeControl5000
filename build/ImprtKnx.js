var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Jsonix = require('jsonix');
//console.log(Jsonix.Jsonix)
//use this cmd to create PO
/*
java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d mappings -p PO knxExport.xsd
*/
var PO = require('../mappings/PO').PO;
var context = new Jsonix.Jsonix.Context([PO]);
var unmarshaller = context.createUnmarshaller();
const { exec } = require("child_process");
function updateKnxStructure(xmlFile, xsdFile) {
    return __awaiter(this, void 0, void 0, function* () {
        var knxStructure = yield getExportetContentFromETS(xmlFile, xsdFile);
        return knxStructure;
    });
}
function getExportetContentFromETS(xmlFile, xsdFile) {
    return __awaiter(this, void 0, void 0, function* () {
        var EtsExportObject;
        yield createContextForXmlParsing(xsdFile);
        EtsExportObject = yield parseXml(xmlFile);
        return (EtsExportObject.value);
    });
}
function createContextForXmlParsing(xsdFile) {
    return new Promise((resolve, reject) => {
        exec('java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d mappings -p PO ' + xsdFile, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve('xsd parsed successfully');
        });
    });
}
function parseXml(xmlFile) {
    return new Promise((resolve, reject) => {
        unmarshaller.unmarshalFile(xmlFile, 
        // This callback function will be provided
        // with the result of the unmarshalling
        function (unmarshalled) {
            resolve(unmarshalled);
            //console.log(JSON.stringify(unmarshalled.value))
        });
    });
}
module.exports = { updateKnxStructure };
//# sourceMappingURL=ImprtKnx.js.map