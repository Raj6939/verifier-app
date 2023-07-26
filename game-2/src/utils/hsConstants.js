export const BUSINESS_SCHEMA="sch:hid:testnet:zDt4ZZwoA5vBV3t7tn8Y4KNKjH4fBDkwYxLfQK1nJC8BR:1.0"
export const HIDNODE_RPC = "https://rpc.jagrat.hypersign.id/"
export const HIDNODE_REST = "https://api.jagrat.hypersign.id/"
export const HIDNODE_NAMESPACE = 'testnet'
export const GAME1_SCORE_CRED = 'sch:hid:testnet:z5kpU2xtHhAqSXDCNFMY4T8VDeUdgGfJZHYqKw4sa2Bkk:1.0'
export const GAME2_SCORE_CRED = 'sch:hid:testnet:z3GnmWyHiZjKoFaU8Af44mN1h9FNMZbrDzYvTHbD3KbdJ:1.0'
export const GAME1_PROFILE_CRED = 'sch:hid:testnet:zAviYWdCrZxjQtu3gRZcxdC61gho68Wwq617QqJA4RxH3:1.0'
export const GAME2_PROFILE_CRED = 'sch:hid:testnet:zH66qSb6auViT25AZfzCP6qD8suwYTx5ZEDAyRPVU9Aax:1.0'
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