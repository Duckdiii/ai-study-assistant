import morgan from "morgan";

// Format: "GET /auth/login 200 - 10.123 ms"
export const requestLogger = morgan(
    ":method :url :status - :response-time ms"
);
