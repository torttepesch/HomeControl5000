
const {KNXTunnelSocket, DataPoints, KNXAddress} = require("knx-ip");

// Create tunnel socket with source knx address 1.1.100
const knxClient = new KNXTunnelSocket("15.15.0");

knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.error, err => {
    if (err) {
        console.log(err);
    }
});

// Call discoverCB when a knx gateway has been discovered.
knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.discover,  info => {
    const [ip,port] = info.split(":");
    discoverCB(ip,port);
});

// start auto discovery on interface with ip 192.168.1.99
knxClient.startDiscovery("169.254.73.1");

const wait = (t=3000) => {
    return new Promise(resolve => {
        setTimeout(() => { resolve(''); }, t);
    });
};

const handleBusEvent = function(srcAddress, dstAddress, npdu) {
    console.log(`${srcAddress.toString()} -> ${dstAddress.toString()} :`, npdu.dataValue);
};

// Actions to perform when a KNX gateway has been discovered.
const discoverCB = (ip, port) => {
        console.log("Connecting to ", ip, port);
        // Create a knx address for a lamp switch on knx bus address 1.1.15
        const lampSwitchAddress =  KNXAddress.createFromString("1.1.1", KNXAddress.TYPE_GROUP);
        // Create a Datapoint of type Switch to control the lamp
        const lampSwitch = DataPoints.createDataPoint(lampSwitchAddress, "Switch");
        // Create a Datapoint of type Switch to read the lamp status
        // This time using the createDataPoint function
        const lampStatus = new DataPoints.Switch(
            KNXAddress.createFromString("1.1.1", KNXAddress.TYPE_GROUP)
        );
        // Bind the datapoints with the socket
        lampSwitch.bind(knxClient);
        lampStatus.bind(knxClient);
        // Connect to the knx gateway on ip:port
        knxClient.connectAsync(ip, port)
            .then(() => console.log("Connected through channel id ", knxClient.channelID))
            .then(() => console.log("Reading lamp status"))
            .then(() => lampStatus.read())
            .then(val => console.log("Lamp status:", val))
            .then(() => console.log("Sending lamp ON"))
            .then(() => lampSwitch.setOn())
            .then(() => wait())
            .then(() => lampStatus.read())
            .then(val => console.log("Lamp status:", val))
            .then(() => lampSwitch.setOff())
            .then(() => wait(1000))
            .then(() => lampStatus.read())
            .then(val => console.log("Lamp status:", val))
            .then(() => {
                console.log("Starting bus monitoring");
                knxClient.on("indication", handleBusEvent);
                knxClient.monitorBus()
            })
            .then(() => wait(9000))
            .catch(err => {console.log(err);})
            .then(() => process.exit(0));
};