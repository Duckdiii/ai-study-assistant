import { attachFilesToProblem, getFileMetadata } from "../services/file.service.js";
import path from "path";
import fs from "fs";

export async function uploadFilesHandler(req, res) {
    try {
        const problemId = req.params.id;
        const user = req.user;
        const files = req.files || [];

        if (!files.length) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const records = await attachFilesToProblem({ problemId, user, files });

        res.status(201).json({
            message: "Files uploaded successfully",
            files: records,
        });
    } catch (err) {
        console.error("uploadFiles error:", err);
        if (err.message === "PROBLEM_NOT_FOUND") {
            return res.status(404).json({ message: "Problem not found" });
        }
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFileHandler(req, res) {
    try {
        const file = await getFileMetadata(req.params.id, req.user);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.json({
            id: file.id,
            filename: file.filename,
            mimeType: file.mimeType,
            size: file.size,
            problemId: file.problemId,
            uploadedAt: file.uploadedAt,
        });
    } catch (err) {
        console.error("getFile error:", err);
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function downloadFileHandler(req, res) {
    try {
        const file = await getFileMetadata(req.params.id, req.user);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const filePath = file.path;

        if (!fs.existsSync(filePath)) {
            return res.status(410).json({ message: "File no longer exists on server" });
        }

        res.download(filePath, file.filename);
    } catch (err) {
        console.error("downloadFile error:", err);
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
