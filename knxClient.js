const { KNXTunnelSocket} = require("knx-ip");// Create tunnel socket with source knx address 1.1.100
var knxClient = new KNXTunnelSocket("1.1.5");

knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.error, function (err) {
    if (err) {
        console.log(err);
    }
});

var handleBusEvent = function (srcAddress, dstAddress, npdu) {
    console.log(srcAddress.toString() + " -> " + dstAddress.toString() + " :", npdu.dataValue);
};

function discoverAndConnectKnxClient() {

    return new Promise((resolve, reject) => {

        knxClient.startDiscovery("192.168.178.50");
        setTimeout(() => { reject('no gateway detected') }, 2000)

        // export the module when a gateway was discovered
        knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.discover, async function (info) {
            console.log(info)
            const [ip, port] = info.split(":");
            await knxClient.connectAsync(ip, port)
            resolve(knxClient);
        });
    })
}

module.exports = { discoverAndConnectKnxClient }