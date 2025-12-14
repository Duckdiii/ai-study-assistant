import {
    getOverviewAnalytics,
    getUserAnalytics,
} from "../services/analytics.service.js";

export async function getOverviewAnalyticsHandler(req, res) {
    try {
        const data = await getOverviewAnalytics();
        res.json(data);
    } catch (err) {
        console.error("getOverviewAnalytics error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyAnalyticsHandler(req, res) {
    try {
        const userId = req.user.id;
        const data = await getUserAnalytics(userId);
        res.json(data);
    } catch (err) {
        console.error("getMyAnalytics error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}
