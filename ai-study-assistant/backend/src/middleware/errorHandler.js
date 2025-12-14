// Lưu ý: phải dùng 4 tham số (err, req, res, next) để Express nhận là error middleware
export function errorHandler(err, req, res, next) {
    console.error("🔥 Error:", err);

    // Nếu controller đã set statusCode thì dùng, không thì mặc định 500
    const status = err.statusCode || 500;

    // Message cho client (tránh lộ chi tiết nội bộ)
    const message =
        status === 500
            ? "Internal server error"
            : err.message || "Something went wrong";

    res.status(status).json({
        message,
        code: status,
    });
}
