import dotenv from "dotenv";
import chalk from "chalk";
import http from "http";

import { createSocket, shouldReconnect } from "./baileys.js";
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

// Some hosts (Render, Railway, etc.) expect web services to bind
// to a port and will kill the deploy otherwise, even though this
// bot only makes outbound connections. This tiny server satisfies
// that check and doubles as a simple health/uptime endpoint.
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        status: "online",
        service: "Kenya-Ultra Client",
        version: VERSION
    }));
}).listen(PORT, () => {
    console.log(
        chalk.blue(`🌐 Health check server listening on port ${PORT}`)
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

// Reconnect backoff state
let retryDelay = 3000;
const MAX_RETRY_DELAY = 60000;


async function start() {

    try {

        console.log(
            chalk.blue("🔐 Preparing session...")
        );


        const authState = await bootstrapAuthState(SESSION_ID);


        console.log(
            chalk.green("✅ Session ready")
        );


        await connect(authState);


    } catch(error) {

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


    const sock = await createSocket(authState.state);


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
        async(update)=>{


            const {
                connection,
                lastDisconnect
            } = update;



            if(connection === "open") {

                console.log(
                    chalk.green(
                        "🟢 WhatsApp Connected"
                    )
                );

                // Reset backoff on successful connection
                retryDelay = 3000;

                const heartbeat =
                    await core.heartbeat();


                if(heartbeat){

                    console.log(
                        chalk.green(
                            "🟢 Core Online"
                        )
                    );

                }


            }



            if(connection === "close") {


                const reconnect =
                    shouldReconnect(lastDisconnect);



                console.log(
                    chalk.yellow(
                        "⚠ Connection closed"
                    )
                );



                if(reconnect){

                    console.log(
                        chalk.blue(
                            `🔄 Reconnecting in ${retryDelay / 1000}s...`
                        )
                    );


                    setTimeout(
                        ()=>connect(authState),
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
        async({messages})=>{


            const msg = messages[0];


            if(!msg.message)
                return;


            if(
                msg.key.fromMe
            )
                return;



            const jid =
                msg.key.remoteJid;



            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                "";



            if(!text)
                return;


            console.log(
                chalk.cyan(`📩 Message from ${jid}: "${text}"`)
            );


            try {


                const response =
                    await core.execute(
                        SESSION_ID,
                        {
                            text,

                            sender:
                            msg.key.participant ||
                            jid,

                            chat: jid,

                            pushName:
                            msg.pushName || "",

                            isGroup:
                            jid.endsWith("@g.us")
                        }
                    );


                console.log(
                    chalk.cyan(
                        `📤 Core response: ${JSON.stringify(response)}`
                    )
                );


                if(
                    response?.reply
                ){


                    await sock.sendMessage(
                        jid,
                        {
                            text:
                            response.reply.text ||
                            String(response.reply)
                        }
                    );

                    console.log(
                        chalk.green("✅ Reply sent")
                    );


                } else {

                    console.log(
                        chalk.yellow(
                            "⚠ Core returned no reply (ignored, unknown command, or invalid session?)"
                        )
                    );

                }


            } catch(error){


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
            
