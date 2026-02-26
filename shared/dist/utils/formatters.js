"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRelativeTime = formatRelativeTime;
exports.formatDate = formatDate;
exports.truncate = truncate;
/**
 * Date/time and string formatters. No locale dependency; caller can pass locale if needed.
 */
function formatRelativeTime(dateStr, now = new Date()) {
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffSec < 60)
        return 'Just now';
    if (diffMin < 60)
        return `${diffMin}m`;
    if (diffHour < 24)
        return `${diffHour}h`;
    if (diffDay < 7)
        return `${diffDay}d`;
    return date.toLocaleDateString();
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString();
}
function truncate(str, maxLength, suffix = '…') {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
}
