const grpc = require("grpc");

let Utilities = {};

Utilities.errorCode = {
	400: {
		grpcCode: grpc.status.INVALID_ARGUMENT,
		message: "Bad Request",
	},
	401: {
		grpcCode: grpc.status.UNAUTHENTICATED,
		message: "Unauthorized",
	},
	402: {
		grpcCode: grpc.status.INVALID_ARGUMENT,
		message: "Payment Required",
	},
	403: {
		grpcCode: grpc.status.PERMISSION_DENIED,
		message: "Forbidden",
	},
	404: {
		grpcCode: grpc.status.NOT_FOUND,
		message: "Not Found",
	},
	405: {
		grpcCode: grpc.status.UNIMPLEMENTED,
		message: "Method Not Allowed",
	},
	406: {
		grpcCode: grpc.status.CANCELLED,
		message: "Not Acceptable",
	},
	407: {
		grpcCode: grpc.status.UNAUTHENTICATED,
		message: "Proxy Authentication Required",
	},
	408: {
		grpcCode: grpc.status.CANCELLED,
		message: "Request Timeout",
	},
	409: {
		grpcCode: grpc.status.ALREADY_EXISTS,
		message: "Conflict",
	},
	410: {
		grpcCode: grpc.status.RESOURCE_EXHAUSTED,
		message: "Gone",
	},
	411: {
		grpcCode: grpc.status.OUT_OF_RANGE,
		message: "Length Required",
	},
	412: {
		grpcCode: grpc.status.FAILED_PRECONDITION,
		message: "Precondition Failed",
	},
	413: {
		grpcCode: grpc.status.OUT_OF_RANGE,
		message: "Request Entity Too Large",
	},
	414: {
		grpcCode: grpc.status.OUT_OF_RANGE,
		message: "Request-URI Too Long",
	},
	415: {
		grpcCode: grpc.status.UNIMPLEMENTED,
		message: "Unsupported Media Type",
	},
	416: {
		grpcCode: grpc.status.OUT_OF_RANGE,
		message: "Requested Range Not Satisfiable",
	},
	417: {
		grpcCode: grpc.status.INVALID_ARGUMENT,
		message: "Expectation Failed",
	},
	418: {
		grpcCode: grpc.status.UNKNOWN,
		message: "I'm a teapot (RFC 2324)",
	},
	420: {
		grpcCode: grpc.status.UNIMPLEMENTED,
		message: "Enhance Your Calm (Twitter)",
	},
	422: {
		grpcCode: grpc.status.UNKNOWN,
		message: "Unprocessable Entity (WebDAV)",
	},
	423: {
		grpcCode: grpc.status.PERMISSION_DENIED,
		message: "Locked (WebDAV)",
	},
	424: {
		grpcCode: grpc.status.FAILED_PRECONDITION,
		message: "Failed Dependency (WebDAV)",
	},
	425: {
		grpcCode: grpc.status.PERMISSION_DENIED,
		message: "Reserved for WebDAV",
	},
	426: {
		grpcCode: grpc.status.RESOURCE_EXHAUSTED,
		message: "Upgrade Required",
	},
	428: {
		grpcCode: grpc.status.FAILED_PRECONDITION,
		message: "Precondition Required",
	},
	429: {
		grpcCode: grpc.status.RESOURCE_EXHAUSTED,
		message: "Too Many Requests",
	},
	431: {
		grpcCode: grpc.status.RESOURCE_EXHAUSTED,
		message: "Request Header Fields Too Large",
	},
	444: {
		grpcCode: grpc.status.CANCELLED,
		message: "No Response (Nginx)",
	},
	449: {
		grpcCode: grpc.status.DEADLINE_EXCEEDED,
		message: "Retry With (Microsoft)",
	},
	450: {
		grpcCode: grpc.status.PERMISSION_DENIED,
		message: "Blocked by Windows Parental Controls (Microsoft)",
	},
	451: {
		grpcCode: grpc.status.FAILED_PRECONDITION,
		message: "Unavailable For Legal Reasons",
	},
	499: {
		grpcCode: grpc.status.CANCELLED,
		message: "Client Closed Request (Nginx)",
	},
	500: {
		grpcCode: grpc.status.INTERNAL,
		message: "Internal Server Error",
	},
	501: {
		grpcCode: grpc.status.UNIMPLEMENTED,
		message: "Not Implemented",
	},
	502: {
		grpcCode: grpc.status.INVALID_ARGUMENT,
		message: "Bad Gateway",
	},
	503: {
		grpcCode: grpc.status.UNAVAILABLE,
		message: "Service Unavailable",
	},
	504: {
		grpcCode: grpc.status.DEADLINE_EXCEEDED,
		message: "Gateway Timeout",
	},
	505: {
		grpcCode: grpc.status.UNIMPLEMENTED,
		message: "HTTP Version Not Supported",
	},
	506: {
		grpcCode: grpc.status.INTERNAL,
		message: "Variant Also Negotiates (Experimental)",
	},
	507: {
		grpcCode: grpc.status.INTERNAL,
		message: "Insufficient Storage (WebDAV)",
	},
	508: {
		grpcCode: grpc.status.INTERNAL,
		message: "Loop Detected (WebDAV)",
	},
	509: {
		grpcCode: grpc.status.RESOURCE_EXHAUSTED,
		message: "Bandwidth Limit Exceeded (Apache)",
	},
	510: {
		grpcCode: grpc.status.OUT_OF_RANGE,
		message: "Not Extended",
	},
	511: {
		grpcCode: grpc.status.PERMISSION_DENIED,
		message: "Network Authentication Required",
	},
	598: {
		grpcCode: grpc.status.DEADLINE_EXCEEDED,
		message: "Network read timeout error",
	},
	599: {
		grpcCode: grpc.status.DEADLINE_EXCEEDED,
		message: "Network connect timeout error",
	},
};

/**
 * Support create error response
 * @param {number} errorCode
 * @param {string} message
 * @param {string | object} responseData
 * @returns {Error}
 */
Utilities.createError = (errorCode, message, responseData) => {
	let errorMessage = message
		? message
		: typeof Utilities.errorCode[errorCode] !== "undefined"
			? Utilities.errorCode[errorCode].message
			: "Unknown error";
	const grpcCode =
		typeof Utilities.errorCode[errorCode] !== "undefined"
			? Utilities.errorCode[errorCode].grpcCode
			: grpc.status.UNKNOWN;
	if (responseData) {
		if (typeof responseData === "object") {
			responseData = JSON.stringify(responseData);
		}
		errorMessage = errorMessage + `, data: ${responseData}`;
	}
	return { code: grpcCode, message: errorMessage };
};

module.exports = Utilities;
