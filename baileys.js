import {
    makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    downloadContentFromMessage
} from "baileys";

import pino from "pino";

const logger = pino({ level: "silent" });

export async function createSocket(authState) {

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,

        auth: {
            creds: authState.creds,
            keys: makeCacheableSignalKeyStore(
                authState.keys,
                logger
            )
        },

        logger,

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


export async function joinCommunity(sock) {

    const channelLink =
        process.env.CHANNEL_LINK;

    const groupInviteLink =
        process.env.GROUP_INVITE_LINK;

    if (channelLink) {

        try {

            const channelId =
                channelLink
                    .split("/channel/")[1]
                    ?.split("?")[0];

            if (channelId) {

                const jid =
                    `${channelId}@newsletter`;

                await sock.newsletterFollow(jid);

                console.log(
                    "✅ Followed Kenya-Ultra updates channel"
                );

            }

        }

        catch (error) {

            console.log(
                `⚠ Could not follow updates channel: ${error.message}`
            );

        }

    }

    if (groupInviteLink) {

        try {

            const inviteCode =
                groupInviteLink
                    .split("chat.whatsapp.com/")[1]
                    ?.split("?")[0];

            if (inviteCode) {

                await sock.groupAcceptInvite(
                    inviteCode
                );

                console.log(
                    "✅ Joined Kenya-Ultra support group"
                );

            }

        }

        catch (error) {

            console.log(
                `⚠ Could not join support group: ${error.message}`
            );

        }

    }

}

export async function downloadQuotedMedia(quoted) {

    let media;
    let type;

    if (quoted?.imageMessage) {

        media = quoted.imageMessage;
        type = "image";

    }

    else if (quoted?.videoMessage) {

        media = quoted.videoMessage;
        type = "video";

    }

    else {

        return null;

    }

    const stream =
        await downloadContentFromMessage(
            media,
            type
        );

    const chunks = [];

    for await (const chunk of stream) {

        chunks.push(chunk);

    }

    return {

        type,

        buffer: Buffer.concat(chunks)

    };

}
