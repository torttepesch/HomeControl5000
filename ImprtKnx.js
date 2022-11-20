var Jsonix = require('jsonix')

//console.log(Jsonix.Jsonix)
//use this cmd to create PO
/*
java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d mappings -p PO knxExport.xsd
*/

var PO = require('./mappings/PO').PO;
var context = new Jsonix.Jsonix.Context([PO])
var unmarshaller = context.createUnmarshaller()

const { exec } = require("child_process");

async function updateKnxStructure(xmlFile, xsdFile) {
    var knxStructure = await getExportetContentFromETS(xmlFile, xsdFile)
    return knxStructure
}

async function getExportetContentFromETS(xmlFile, xsdFile) {
    await createContextForXmlParsing(xsdFile)
    var EtsExportObject = await parseXml(xmlFile)
    return (EtsExportObject.value)
}

function createContextForXmlParsing(xsdFile) {
    return new Promise((resolve, reject) => {
        exec('java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d mappings -p PO ' + xsdFile, (error, stdout, stderr) => {
            if (error) {
                reject(error)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            resolve('xsd parsed successfully')
        })
    })
}

function parseXml(xmlFile) {
    return new Promise((resolve, reject) => {
        unmarshaller.unmarshalFile(xmlFile,
            // This callback function will be provided
            // with the result of the unmarshalling
            function (unmarshalled) {
                resolve(unmarshalled)
                //console.log(JSON.stringify(unmarshalled.value))
            });
    })
}

module.exports = { updateKnxStructure }
