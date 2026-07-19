import dotenv from "dotenv";
import chalk from "chalk";
import http from "http";

import { createSocket, shouldReconnect, joinCommunity } from "./baileys.js";
import { bootstrapAuthState } from "./sessionBootstrap.js";
import core from "./core.js";

dotenv.config();

const VERSION = "1.0.0";

const SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.log(
        chalk.red("❌ SESSION_ID missing from .env")
    );
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        status: "online",
        service: "Kenya-Ultra Client",
        version: VERSION
    }));

}).listen(PORT, () => {

    console.log(
        chalk.blue(
            `🌐 Health check server listening on port ${PORT}`
        )
    );

});

console.clear();

console.log(chalk.green(`
██╗  ██╗███████╗███╗   ██╗██╗   ██╗ █████╗
██║ ██╔╝██╔════╝████╗  ██║╚██╗ ██╔╝██╔══██╗
█████╔╝ █████╗  ██╔██╗ ██║ ╚████╔╝ ███████║
██╔═██╗ ██╔══╝  ██║╚██╗██║  ╚██╔╝  ██╔══██║
██║  ██╗███████╗██║ ╚████║   ██║   ██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
`));

console.log(
    chalk.green(`Kenya-Ultra Public Bot v${VERSION}\n`)
);

let retryDelay = 3000;
const MAX_RETRY_DELAY = 60000;

let hasAttemptedAutoJoin = false;

const PREFIX = ".";

async function start() {

    try {

        console.log(
            chalk.blue("🔐 Preparing session...")
        );

        const authState =
            await bootstrapAuthState(SESSION_ID);

        console.log(
            chalk.green("✅ Session ready")
        );

        await connect(authState);

    } catch (error) {

        console.log(
            chalk.red(
                `❌ Startup failed: ${error.message}`
            )
        );

        process.exit(1);

    }

}

async function connect(authState) {

    console.log(
        chalk.blue("📡 Connecting to WhatsApp...")
    );

    const sock =
        await createSocket(authState.state);

    sock.ev.on(
        "creds.update",
        async () => {

            try {

                await authState.saveCreds();

            } catch (error) {

                console.log(
                    chalk.red(
                        `❌ Failed to save credentials: ${error.message}`
                    )
                );

            }

        }
    );

    sock.ev.on(
        "connection.update",
        async (update) => {

            const {
                connection,
                lastDisconnect
            } = update;

            if (connection === "open") {

                console.log(
                    chalk.green(
                        "🟢 WhatsApp Connected"
                    )
                );

                retryDelay = 3000;

                if (!hasAttemptedAutoJoin) {

                    hasAttemptedAutoJoin = true;

                    await joinCommunity(sock);

                }

                const heartbeat =
                    await core.heartbeat();

                if (heartbeat) {

                    console.log(
                        chalk.green(
                            "🟢 Core Online"
                        )
                    );

                }

            }

            if (connection === "close") {

                const reconnect =
                    shouldReconnect(lastDisconnect);

                console.log(
                    chalk.yellow(
                        "⚠ Connection closed"
                    )
                );

                if (reconnect) {

                    console.log(
                        chalk.blue(
                            `🔄 Reconnecting in ${retryDelay / 1000}s...`
                        )
                    );

                    setTimeout(
                        () => connect(authState),
                        retryDelay
                    );

                    retryDelay = Math.min(
                        retryDelay * 2,
                        MAX_RETRY_DELAY
                    );

                } else {

                    console.log(
                        chalk.red(
                            "❌ Logged out"
                        )
                    );

                }

            }

        }
    );

        sock.ev.on(
        "messages.upsert",
        async ({ messages }) => {

            const msg = messages[0];

            if (!msg.message) return;

            const jid = msg.key.remoteJid;

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                "";

            if (msg.key.fromMe && !text.startsWith(PREFIX)) {
                return;
            }

            if (!text) return;

            console.log(
                chalk.cyan(`📩 Message from ${jid}: "${text}"`)
            );

            try {

                let groupMetadata = null;
                let isAdmin = false;
                let isBotAdmin = false;

                if (jid.endsWith("@g.us")) {

                    groupMetadata = await sock.groupMetadata(jid);
                    console.log("First participant:");
console.dir(groupMetadata.participants[0], { depth: null });

                    const sender =
    msg.key.participant || msg.key.remoteJid;

const botIds = [
    sock.user.id.split(":")[0] + "@s.whatsapp.net",
    sock.user.lid.split(":")[0] + "@lid"
];

isAdmin = groupMetadata.participants.some(
    p => p.id === sender && p.admin
);

isBotAdmin = groupMetadata.participants.some(
    p => botIds.includes(p.id) && p.admin
);

                }

               const response = await core.execute(
    SESSION_ID,
    {
        text,

        sender:
            msg.key.participant || jid,

        chat: jid,

        pushName:
            msg.pushName || "",

        isGroup:
            jid.endsWith("@g.us"),

        isAdmin,
        isBotAdmin,
        groupMetadata,

        message: msg.message
    }
); 

                console.log(
    chalk.cyan("📤 Core response:")
);

console.dir(response, { depth: null });

                if (!response) return;

                const replyData =
    response.reply?.reply ??
    response.reply ??
    null;

const replyText =
    typeof response === "string"
        ? response
        : replyData?.text ??
          response.text ??
          response.message ??
          null;

const replyMentions =
    replyData?.mentions || [];

                if (response.action === "kick") {

    try {

        await sock.groupParticipantsUpdate(
            jid,
            [response.target],
            "remove"
        );

        console.log(
            chalk.green(
                `👢 Removed ${response.target}`
            )
        );

    } catch (error) {

        console.log(
            chalk.red(
                "❌ Failed to kick:",
                error.message
            )
        );

        await sock.sendMessage(
            jid,
            {
                text: "❌ Failed to remove that user."
            }
        );

        return;

    }

}

if (response.action === "add") {

    try {

        await sock.groupParticipantsUpdate(
            jid,
            [response.target],
            "add"
        );

        console.log(
            chalk.green(
                `➕ Added ${response.target}`
            )
        );

    } catch (error) {

        console.log(
            chalk.red(
                "❌ Failed to add:",
                error.message
            )
        );

        await sock.sendMessage(
            jid,
            {
                text: "❌ Failed to add that user."
            }
        );

        return;

    }

}

if (response.action === "promote") {

    try {

        await sock.groupParticipantsUpdate(
            jid,
            [response.target],
            "promote"
        );

        console.log(
            chalk.green(
                `👑 Promoted ${response.target}`
            )
        );

    } catch (error) {

        console.log(
            chalk.red(
                "❌ Failed to promote:",
                error.message
            )
        );

        await sock.sendMessage(
            jid,
            {
                text: "❌ Failed to promote that user."
            }
        );

        return;

    }

}

if (response.action === "demote") {

    try {

        await sock.groupParticipantsUpdate(
            jid,
            [response.target],
            "demote"
        );

        console.log(
            chalk.green(
                `⬇️ Demoted ${response.target}`
            )
        );

    } catch (error) {

        console.log(
            chalk.red(error.message)
        );

    }

}
                
                if (replyText) {

    await sock.sendMessage(
        jid,
        {
            text: replyText,
            mentions: replyMentions
        }
    );

    console.log(
        chalk.green("✅ Reply sent")
    );

                }

            } catch (error) {

                console.log(
                    chalk.red(
                        "COMMAND ERROR:",
                        error.message
                    )
                );

            }

        }
    );

}

start();
