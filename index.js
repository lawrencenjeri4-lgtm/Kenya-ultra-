import dotenv from "dotenv";
import chalk from "chalk";

import { createSocket, shouldReconnect } from "./baileys.js";
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


async function start() {

    try {

        console.log(
            chalk.blue("🔐 Validating SESSION_ID...")
        );


        const validation =
            await core.validate(SESSION_ID);


        if (!validation.success) {

            throw new Error(
                "Invalid SESSION_ID."
            );

        }


        console.log(
            chalk.green("✅ SESSION_ID verified")
        );


        await connect(validation.auth);


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


    const sock = await createSocket(authState);



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
                            "🔄 Reconnecting..."
                        )
                    );


                    setTimeout(
                        ()=>connect(authState),
                        3000
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
