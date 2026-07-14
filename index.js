import dotenv from "dotenv";
import chalk from "chalk";
import axios from "axios";

dotenv.config();

const VERSION = "1.0.0";
const WEBSITE = "https://kenya-ultra.vercel.app";

// This will later become your private backend URL
const CORE_URL = "https://core.kenya-ultra.com";

console.clear();

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
    console.log(chalk.cyan(WEBSITE));
    process.exit(1);
}

async function start() {

    console.log(chalk.blue("🔄 Loading configuration..."));

    await wait(800);

    console.log(chalk.blue("🔐 Validating SESSION_ID..."));

    await wait(1200);

    console.log(chalk.green("✅ SESSION_ID Loaded"));

    console.log(chalk.blue("🌐 Connecting to Kenya-Ultra Core..."));

    await wait(1500);

    // Here we'll later contact your Core API
    /*
    const response = await axios.post(`${CORE_URL}/client/connect`, {
        sessionId: SESSION_ID
    });
    */

    console.log(chalk.green("✅ Connection Established"));

    console.log(chalk.green("✅ Authentication Successful"));

    console.log(chalk.green("✅ Runtime Ready"));

    console.log(chalk.green("\n🚀 Kenya-Ultra is Online!\n"));

}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

start();
