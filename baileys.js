import {
    makeWASocket,
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

// Auto-follows the Kenya-Ultra updates channel and auto-joins the
// support group on the deploying account, so every self-hosted bot
// stays reachable for updates/support. Configured via .env so the
// links aren't hardcoded:
//
//   CHANNEL_LINK=https://whatsapp.com/channel/XXXXXXXXXXXXXXXXXXXX
//   GROUP_INVITE_LINK=https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXX
//
// Safe to call on every "open" event — errors (already following,
// already a member, invite expired, method unsupported on this
// Baileys version) are caught and logged, never thrown, so this
// can never crash the connection flow.
export async function joinCommunity(sock) {

    const channelLink = process.env.CHANNEL_LINK;
    const groupInviteLink = process.env.GROUP_INVITE_LINK;

    if (channelLink) {

        try {

            const channelId = channelLink.split("/channel/")[1]?.split("?")[0];

            if (channelId) {

                const jid = `${channelId}@newsletter`;

                await sock.newsletterFollow(jid);

                console.log("✅ Followed Kenya-Ultra updates channel");

            }

        } catch (error) {

            console.log(`⚠ Could not follow updates channel: ${error.message}`);

        }

    }

    if (groupInviteLink) {

        try {

            const inviteCode = groupInviteLink.split("chat.whatsapp.com/")[1]?.split("?")[0];

            if (inviteCode) {

                await sock.groupAcceptInvite(inviteCode);

                console.log("✅ Joined Kenya-Ultra support group");

            }

        } catch (error) {

            console.log(`⚠ Could not join support group: ${error.message}`);

        }

    }

}
