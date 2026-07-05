// For error handling and how the error should be thrown
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message)
        this.message = message,
            this.statusCode = statusCode,
            this.error = error,
            this.success = false,
            this.data = null,
            this.stack = stack

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError