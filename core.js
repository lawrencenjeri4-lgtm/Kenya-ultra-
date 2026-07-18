import axios from "axios";

// Default public Core endpoint — users only need to set SESSION_ID.
// Advanced users running their own Core instance can still override
// this by setting CORE_URL in their .env file.
const CORE_URL = process.env.CORE_URL || "https://kenya-ultra-s9ai.onrender.com";

class KenyaUltraCore {

    async validate(sessionId) {

        try {

            const { data } = await axios.post(
                `${CORE_URL}/validate`,
                {
                    sessionId
                }
            );

            return {
                success: data.success,
                client: data.client,
                auth: data.auth
            };

        } catch (error) {

            throw new Error(
                error.response?.data?.message ||
                "Failed to validate SESSION_ID."
            );

        }

    }

    async execute(sessionId, message) {

        try {

            const { data } = await axios.post(
                `${CORE_URL}/execute`,
                {
                    sessionId,
                    message
                }
            );

            return data;

        } catch (error) {

            throw new Error(
                error.response?.data?.message ||
                "Failed to execute command."
            );

        }

    }

    async heartbeat() {

        try {

            const { data } = await axios.get(CORE_URL);

            return data;

        } catch {

            return null;

        }

    }

    async getVersion() {

        try {

            const { data } = await axios.get(CORE_URL);

            return {
                success: true,
                version: data.version
            };

        } catch {

            return {
                success: false
            };

        }

    }

}

export default new KenyaUltraCore();
