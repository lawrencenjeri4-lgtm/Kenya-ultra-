import axios from "axios";

const CORE_URL = process.env.CORE_URL;

if (!CORE_URL) {
    throw new Error("CORE_URL is not configured.");
}

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
                valid: data.valid,
                client: data.client,
                auth: data.runtime.auth
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
