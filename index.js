import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

console.clear();

console.log(chalk.green(`
██╗  ██╗███████╗███╗   ██╗██╗   ██╗ █████╗
██║ ██╔╝██╔════╝████╗  ██║╚██╗ ██╔╝██╔══██╗
█████╔╝ █████╗  ██╔██╗ ██║ ╚████╔╝ ███████║
██╔═██╗ ██╔══╝  ██║╚██╗██║  ╚██╔╝  ██╔══██║
██║  ██╗███████╗██║ ╚████║   ██║   ██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
`));

console.log(chalk.green("Kenya-Ultra Client v1.0.0"));

const SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.log(chalk.red("\nSESSION_ID not found."));
    console.log(chalk.yellow("Open the website and generate one first."));
    process.exit(1);
}

console.log(chalk.green("\nSESSION_ID Loaded Successfully."));
console.log(chalk.cyan("Connecting to Kenya-Ultra Core...\n"));
