import {
    makeWASocket,
    fetchLatestBaileysVersion,
    DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";

export async function createSocket(authState) {

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({

        version,

        auth: authState,

        logger: pino({
            level: "silent"
        }),

        printQRInTerminal: false,

        browser: [
            "Ubuntu",
            "Chrome",
            "22.04"
        ]

    });

    return sock;

}

export function shouldReconnect(lastDisconnect) {

    const statusCode =
        lastDisconnect?.error?.output?.statusCode;

    return statusCode !== DisconnectReason.loggedOut;

}
