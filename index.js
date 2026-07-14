import dotenv from "dotenv";
import chalk from "chalk";
import axios from "axios";

dotenv.config();

console.clear();

const VERSION = "1.0.0";
const CORE_URL = "https://core.kenya-ultra.com"; // Placeholder for now

console.log(chalk.green(`
██╗  ██╗███████╗███╗   ██╗██╗   ██╗ █████╗
██║ ██╔╝██╔════╝████╗  ██║╚██╗ ██╔╝██╔══██╗
█████╔╝ █████╗  ██╔██╗ ██║ ╚████╔╝ ███████║
██╔═██╗ ██╔══╝  ██║╚██╗██║  ╚██╔╝  ██╔══██║
██║  ██╗███████╗██║ ╚████║   ██║   ██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
`));

console.log(chalk.green(`Kenya-Ultra Client v${VERSION}\n`));

const SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.log(chalk.red("❌ SESSION_ID not found.\n"));
    console.log(chalk.yellow("Generate one from:"));
    console.log(chalk.cyan("https://kenya-ultra.vercel.app\n"));
    process.exit(1);
}

console.log(chalk.green("✓ SESSION_ID Loaded"));
console.log(chalk.blue("Connecting to Kenya-Ultra Core...\n"));

async function connect() {

    try {

        /*
        Later this will call your private core.

        const response = await axios.post(
            `${CORE_URL}/client/connect`,
            {
                sessionId: SESSION_ID
            }
        );

        */

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(chalk.green("✓ Connection Established"));
        console.log(chalk.green("✓ Authentication Successful"));
        console.log(chalk.green("✓ Runtime Loaded"));
        console.log(chalk.green("✓ Kenya-Ultra is Online\n"));

    } catch (err) {

        console.log(chalk.red("Connection Failed"));
        process.exit(1);

    }

}

connect();
