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
exports.discoverAndConnectKnxClient = exports.knxClient = void 0;
const { KNXTunnelSocket } = require("knx-ip"); // Create tunnel socket with source knx address 1.1.100
var knxClient = new KNXTunnelSocket("1.1.5");
exports.knxClient = knxClient;
require('dotenv').config();
knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.error, function (err) {
    if (err) {
        console.log(err);
    }
});
function discoverAndConnectKnxClient() {
    return new Promise((resolve, reject) => {
        console.log('IP address = ' + process.env.IPADDRESS);
        knxClient.startDiscovery(process.env.IPADDRESS);
        setTimeout(() => { reject('no gateway detected'); }, 5000);
        // export the module when a gateway was discovered
        knxClient.on(KNXTunnelSocket.KNXTunnelSocketEvents.discover, function (info) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(info);
                const [ip, port] = info.split(":");
                yield knxClient.connectAsync(ip, port);
                resolve(knxClient);
            });
        });
    });
}
exports.discoverAndConnectKnxClient = discoverAndConnectKnxClient;
//# sourceMappingURL=knxClient.js.map