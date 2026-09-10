export const CURRENCY_MAP = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    LKR: "Rs",
};

export function getCurrencySymbol(code) {
    if (!code) return "$";
    // already a symbol?
    if (["$", "€", "£", "Rs"].includes(code)) return code;
    return CURRENCY_MAP[code] || "$";
}

export function readCurrencyFromStorage() {
    try {
        const saved = localStorage.getItem("user_settings");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.currency) return getCurrencySymbol(parsed.currency);
        }
    } catch (e) { }
    return "$";
}