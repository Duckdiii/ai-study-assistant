import { getChatHistory } from "../services/chat.service.js";

export async function getChatHistoryHandler(req, res) {
    try {
        const { roomId, page, pageSize } = req.query;

        if (!roomId) {
            return res.status(400).json({ message: "roomId is required" });
        }

        const result = await getChatHistory({ roomId, page, pageSize });

        res.json(result);
    } catch (err) {
        console.error("getChatHistory error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}
    