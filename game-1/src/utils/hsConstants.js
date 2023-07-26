export const BUSINESS_SCHEMA="sch:hid:testnet:zDt4ZZwoA5vBV3t7tn8Y4KNKjH4fBDkwYxLfQK1nJC8BR:1.0"
export const HIDNODE_RPC = "https://rpc.jagrat.hypersign.id/"
export const HIDNODE_REST = "https://api.jagrat.hypersign.id/"
export const HIDNODE_NAMESPACE = 'testnet'
export function truncate(str, limit) {
    if (!str) {
        return
    }

    if (!limit) {
        return
    }

    // if less than limit then do nothing
    if (str.length <= limit) {
        return str;
    }

    const eachLen = Math.floor(limit / 3); //  we need to 3 parts
    const firstPart = str.substr(0, eachLen);
    const lastPart = str.slice(-eachLen);
    return firstPart + " ... " + lastPart;
}