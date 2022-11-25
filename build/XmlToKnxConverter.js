const { DataPoints, KNXAddress } = require("knx-ip");
function convertXmlStructureToKnxClient(xmlStructure, knxClient, addKnxFunction) {
    var xmlStructureTemp = JSON.parse(JSON.stringify(xmlStructure));
    xmlStructureTemp.groupRange.forEach(mainGroup => {
        mainGroup.groupRange.forEach(middleGroup => {
            //console.log(middleGroup)
            middleGroup.groupAddress.forEach(groupAddress => {
                //the netIp library wants points instead of the slashes, that come from the ETS...
                groupAddress.address = replaceThemAll(groupAddress.address, '/', '.');
                //now we need to separate the dataPointType from ETS in main type and subtype
                var separatedDataPointTypeArray = groupAddress.dpTs.split('-');
                //set main type and subtype as new attributes for comfort
                groupAddress['mainDataPointType'] = separatedDataPointTypeArray[1];
                groupAddress['subDataPointType'] = separatedDataPointTypeArray[2];
                groupAddress['middleGroupName'] = middleGroup.name;
                setDisplayProperties(groupAddress);
                if (addKnxFunction) {
                    groupAddress['knxFunction'] = createKnxBinding(knxClient, groupAddress);
                }
            });
        });
    });
    return xmlStructureTemp;
}
function createKnxBinding(knxClient, groupAddress) {
    //create a new KNX address
    var KnxAddressObject = KNXAddress.createFromString(groupAddress.address, KNXAddress.TYPE_GROUP);
    //from ETS we only get the abstract description of a datapoint. Now we look it up in a list and set the dataPointType
    //then we create the datapoint with the correct address and dataPointType
    var dataPointTypeName = DataPoints.getDataPointType(groupAddress.mainDataPointType, groupAddress.subDataPointType);
    var knxFunction = DataPoints.createDataPoint(KnxAddressObject, dataPointTypeName);
    // Bind the datapoints with the socket
    knxFunction.bind(knxClient);
    return knxFunction;
}
function replaceThemAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function setDisplayProperties(groupAddress) {
    try {
        console.log(groupAddress.description);
        var displayProperties = groupAddress.description.split('_');
        //if (displayProperties.length < 2) { throw new Error(`no display properties set for group address ${groupAddress.address}`) }
        if (displayProperties.length < 2) {
            groupAddress['displayAttributesSet'] = false;
            return false;
        }
        groupAddress['displayElement'] = displayProperties[0];
        groupAddress['functionGroup'] = displayProperties[1];
        groupAddress['displayAttributesSet'] = true;
        return true;
    }
    catch (_a) {
        groupAddress['displayAttributesSet'] = false;
        return false;
    }
}
module.exports = { convertXmlStructureToKnxClient };
//# sourceMappingURL=XmlToKnxConverter.js.map