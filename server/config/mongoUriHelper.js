/**
 * MongoDB URI Helper & Sanitizer
 * Handles mongodb:// and mongodb+srv:// protocols, strips accidental ports from SRV URIs,
 * URL-encodes credentials with special characters, strips template brackets (<username>),
 * and provides credential masking for safe logging.
 */

function sanitizeMongoUri(rawUri) {
    if (!rawUri || typeof rawUri !== "string") {
        return {
            isValid: false,
            error: "MONGO_URI is missing or not a string. Please define MONGO_URI in your .env file.",
            cleanUri: "",
            maskedUri: "",
        };
    }

    // 1. Strip unintended newlines, carriage returns, and leading/trailing whitespace
    let cleaned = rawUri.replace(/[\r\n\t]/g, "").trim();

    // 2. Validate URI scheme
    const schemeMatch = cleaned.match(/^(mongodb(\+srv)?:\/\/)(.*)$/i);
    if (!schemeMatch) {
        return {
            isValid: false,
            error: "Invalid MongoDB URI scheme. Connection string must begin with 'mongodb://' or 'mongodb+srv://'.",
            cleanUri: "",
            maskedUri: "",
        };
    }

    const scheme = schemeMatch[1].toLowerCase();
    const isSrv = Boolean(schemeMatch[2]);
    let rest = schemeMatch[3];

    // 3. Extract query parameters (?retryWrites=true&w=majority...)
    let query = "";
    const qIndex = rest.indexOf("?");
    if (qIndex !== -1) {
        query = rest.substring(qIndex);
        rest = rest.substring(0, qIndex);
    }

    // 4. Extract database name / path (/Balajicomputer)
    let dbPath = "";
    const slashIndex = rest.indexOf("/");
    if (slashIndex !== -1) {
        dbPath = rest.substring(slashIndex);
        rest = rest.substring(0, slashIndex);
    } else {
        // If no database name was specified, default to Balajicomputer
        dbPath = "/Balajicomputer";
    }

    // 5. Extract authentication credentials (username:password@)
    let auth = "";
    const atIndex = rest.lastIndexOf("@");
    let hostPart = rest;
    if (atIndex !== -1) {
        auth = rest.substring(0, atIndex);
        hostPart = rest.substring(atIndex + 1);
    }

    // 6. Sanitize and URL-encode credentials
    let cleanAuth = "";
    let maskedAuth = "";
    if (auth) {
        const colonIndex = auth.indexOf(":");
        let user = colonIndex !== -1 ? auth.substring(0, colonIndex) : auth;
        let pass = colonIndex !== -1 ? auth.substring(colonIndex + 1) : "";

        // Remove accidental angle brackets from Atlas connection templates: <username>:<password>
        user = user.replace(/^[<](.*?)[>]$/, "$1");
        pass = pass.replace(/^[<](.*?)[>]$/, "$1");

        // Safely decode in case user was already partially encoded, then encode
        try {
            user = decodeURIComponent(user);
        } catch (_) {}
        try {
            pass = decodeURIComponent(pass);
        } catch (_) {}

        const encodedUser = encodeURIComponent(user);
        const encodedPass = encodeURIComponent(pass);

        cleanAuth = encodedPass ? `${encodedUser}:${encodedPass}@` : `${encodedUser}@`;
        maskedAuth = encodedPass ? `${encodedUser}:*****@` : `${encodedUser}@`;
    }

    // 7. Validate and sanitize host(s)
    let hadPortRemoved = false;
    let originalHostWithPort = "";

    if (isSrv) {
        // Per MongoDB specification: mongodb+srv URIs must NOT specify port numbers
        const hosts = hostPart.split(",").map((host) => {
            if (/:\d+$/.test(host)) {
                hadPortRemoved = true;
                originalHostWithPort = host;
                return host.replace(/:\d+$/, "");
            }
            return host;
        });
        hostPart = hosts.join(",");
    }

    if (!hostPart) {
        return {
            isValid: false,
            error: "MongoDB connection URI has no hostname specified.",
            cleanUri: "",
            maskedUri: "",
        };
    }

    const cleanUri = `${scheme}${cleanAuth}${hostPart}${dbPath}${query}`;
    const maskedUri = `${scheme}${maskedAuth}${hostPart}${dbPath}${query}`;
    const dbName = dbPath.replace(/^\//, "").split("?")[0] || "Balajicomputer";

    return {
        isValid: true,
        cleanUri,
        maskedUri,
        isSrv,
        hadPortRemoved,
        originalHostWithPort,
        dbName,
    };
}

module.exports = {
    sanitizeMongoUri,
};

