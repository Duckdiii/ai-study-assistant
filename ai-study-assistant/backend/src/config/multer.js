import multer from "multer";
import path from "path";
import fs from "fs";

// Thư mục lưu file => xác định thư mục lưu file
const uploadDir = path.join(process.cwd(), "uploads");

// Tạo folder nếu chưa có
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // thêm timestamp cho đỡ trùng
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "_")}`);
    },
});

export const upload = multer({ storage });
