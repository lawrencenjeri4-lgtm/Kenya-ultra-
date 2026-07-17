import makeWASocket, {
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason
} from "baileys";

import pino from "pino";

const logger = pino({ level: "silent" });

export async function createSocket(authState) {

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,

        auth: {
            creds: authState.creds,
            keys: makeCacheableSignalKeyStore(authState.keys, logger)
        },

        logger,

        printQRInTerminal: false,

        browser: ["Ubuntu", "Chrome", "22.04"]
    });

    return sock;
}

export function shouldReconnect(lastDisconnect) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    return statusCode !== DisconnectReason.loggedOut;
}
