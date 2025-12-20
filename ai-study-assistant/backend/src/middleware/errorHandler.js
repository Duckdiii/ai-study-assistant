export function errorHandler(err, req, res, next) { //middleware xử lý lỗi chung
    console.error("Error:", err);

    const status = err.statusCode || 500;

    const message =
        status === 500
            ? "Internal server error"
            : err.message || "Something went wrong";

    res.status(status).json({
        message,
        code: status,
    });
}
