// 🔒 SECURITY EVENT LOGGER (Step 2 - Attack Detection & Logging)


const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Security log file paths
const SECURITY_LOG_FILE = path.join(logsDir, 'security.log');
const FAILED_LOGIN_LOG = path.join(logsDir, 'failed-logins.log');
const SUSPICIOUS_ACTIVITY_LOG = path.join(logsDir, 'suspicious-activity.log');

/**
 * 📝 Write to log file with timestamp
 */
const writeLog = (logFile, message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error('Error writing to log:', err);
    });
};

/**
 * 🔒 LOG FAILED LOGIN ATTEMPT
 */
exports.logFailedLogin = (email, ip, reason = 'Invalid credentials') => {
    const message = `FAILED LOGIN | Email: ${email} | IP: ${ip} | Reason: ${reason}`;
    writeLog(FAILED_LOGIN_LOG, message);
    console.warn(`🚨 ${message}`);
};

/**
 * 🔒 LOG SUCCESSFUL LOGIN
 */
exports.logSuccessfulLogin = (email, ip) => {
    const message = `SUCCESSFUL LOGIN | Email: ${email} | IP: ${ip}`;
    writeLog(SECURITY_LOG_FILE, message);
    console.log(`✅ ${message}`);
};

/**
 * 🚨 LOG SUSPICIOUS ACTIVITY
 */
exports.logSuspiciousActivity = (type, details, ip) => {
    const message = `SUSPICIOUS ACTIVITY | Type: ${type} | IP: ${ip} | Details: ${JSON.stringify(details)}`;
    writeLog(SUSPICIOUS_ACTIVITY_LOG, message);
    console.warn(`🚨 ${message}`);
};

/**
 * 🔒 LOG ACCOUNT LOCKOUT
 */
exports.logAccountLockout = (email, ip, attempts) => {
    const message = `ACCOUNT LOCKED | Email: ${email} | IP: ${ip} | Failed Attempts: ${attempts}`;
    writeLog(SUSPICIOUS_ACTIVITY_LOG, message);
    console.error(`🔒 ${message}`);
};

/**
 * 🔒 LOG PASSWORD CHANGE
 */
exports.logPasswordChange = (email, ip, successful = true) => {
    const status = successful ? 'SUCCESS' : 'FAILED';
    const message = `PASSWORD CHANGE ${status} | Email: ${email} | IP: ${ip}`;
    writeLog(SECURITY_LOG_FILE, message);
    console.log(`🔑 ${message}`);
};

/**
 * 🔒 LOG RATE LIMIT VIOLATION
 */
exports.logRateLimitViolation = (endpoint, ip, attempts) => {
    const message = `RATE LIMIT EXCEEDED | Endpoint: ${endpoint} | IP: ${ip} | Attempts: ${attempts}`;
    writeLog(SUSPICIOUS_ACTIVITY_LOG, message);
    console.warn(`⚠️ ${message}`);
};

/**
 * 📊 ANALYZE SECURITY LOGS (Helper function for monitoring)
 * Returns statistics about recent security events
 */
exports.getSecurityStats = async () => {
    try {
        const failedLogins = fs.readFileSync(FAILED_LOGIN_LOG, 'utf8').split('\n').filter(Boolean);
        const suspiciousActivities = fs.readFileSync(SUSPICIOUS_ACTIVITY_LOG, 'utf8').split('\n').filter(Boolean);

        return {
            failedLoginCount: failedLogins.length,
            suspiciousActivityCount: suspiciousActivities.length,
            recentFailedLogins: failedLogins.slice(-10), // Last 10
            recentSuspiciousActivity: suspiciousActivities.slice(-10)
        };
    } catch (err) {
        return {
            error: 'Unable to read security logs',
            message: err.message
        };
    }
};

/**
 * 🔍 DETECT SUSPICIOUS PATTERNS
 * Call this middleware on sensitive routes
 */
exports.detectSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        // SQL Injection attempts
        /('|--|;|\/\*|\*\/|xp_|sp_)/i,

        // XSS attempts
        /(<script|javascript:|onerror=|onload=)/i,

        // Path traversal
        /(\.\.\/|\.\.\\)/,

        // Command injection
        /(\||&|;|\$\()/
    ];

    // Check all request parameters
    const checkString = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params
    });

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            this.logSuspiciousActivity(
                'Potential Attack Pattern Detected',
                {
                    pattern: pattern.toString(),
                    endpoint: req.path,
                    method: req.method
                },
                req.ip
            );

            return res.status(400).json({
                success: false,
                message: 'Invalid request detected'
            });
        }
    }

    next();
};

