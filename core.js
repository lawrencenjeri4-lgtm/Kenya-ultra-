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

            return data;

        } catch (error) {

            throw new Error(
                error.response?.data?.message ||
                "Failed to validate SESSION_ID."
            );

        }

    }

    async execute(sessionId, text) {

        try {

            const { data } = await axios.post(
                `${CORE_URL}/execute`,
                {
                    sessionId,
                    text
                }
            );

            return data;

        } catch (error) {

            throw new Error(
                error.response?.data?.message ||
                "Command execution failed."
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

}

export default new KenyaUltraCore();
