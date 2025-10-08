class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;      // stores the HTTP status code (e.g., 200, 404, 500)
    this.data = data;                  // stores the actual response data (payload)
    this.message = message;            // default message is "Success", unless overridden
    this.success = statusCode < 400;   // true if status code is less than 400 (success), false otherwise
  }
}

export { ApiResponse }
