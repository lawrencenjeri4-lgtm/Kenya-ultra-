import fs from "fs";
import path from "path";
import { useMultiFileAuthState } from "baileys";
import core from "./core.js";

const AUTH_FOLDER = path.join(process.cwd(), "auth_info");

/**
 * Core is stateless — the SESSION_ID *is* the credentials (compressed
 * + base64). There's nothing on Core to keep syncing to, so instead
 * we decode it once, seed a local auth_info/ folder with it, and let
 * Baileys' own useMultiFileAuthState take over from there for every
 * future run. If auth_info/ already has a session (e.g. this is a
 * restart, not a first boot), we skip Core entirely and just reuse it.
 */
export async function bootstrapAuthState(sessionId) {

    const credsPath = path.join(AUTH_FOLDER, "creds.json");
    const alreadyLinked = fs.existsSync(credsPath);

    fs.mkdirSync(AUTH_FOLDER, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    if (!alreadyLinked) {

        console.log("📥 No local session found — fetching from Core...");

        const validation = await core.validate(sessionId);

        if (!validation.success) {
            throw new Error(validation.message || "Invalid SESSION_ID.");
        }

        // Seed local state with what Core decoded from the SESSION_ID
        Object.assign(state.creds, validation.auth.creds);

        // Older SESSION_IDs may only contain creds — guard against
        // missing keys rather than throwing.
        if (validation.auth.keys) {
            await state.keys.set(validation.auth.keys);
        }

        await saveCreds();

        console.log("✅ Local session initialized from Core.");

    } else {

        console.log("📂 Using existing local session — Core not contacted.");

    }

    return { state, saveCreds };

}
