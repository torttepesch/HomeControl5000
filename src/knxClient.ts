const { KNXTunnelSocket} = require("knx-ip");// Create tunnel socket with source knx address 1.1.100
var knxClient = new KNXTunnelSocket("1.1.5");

require('dotenv').config()

knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.error, function (err: string) {
    if (err) {
        console.log(err);
    }
});

function discoverAndConnectKnxClient() {

    return new Promise((resolve, reject) => {

        console.log('IP address = ' + process.env.IPADDRESS)

        knxClient.startDiscovery(process.env.IPADDRESS);
        setTimeout(() => { reject('no gateway detected') }, 5000)

        // export the module when a gateway was discovered
        knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.discover, async function (info: string) {
            console.log(info)
            const [ip, port] = info.split(":");
            await knxClient.connectAsync(ip, port)
            resolve(knxClient);
        });
    })
}

export {knxClient, discoverAndConnectKnxClient }