// Signed-in session kept in localStorage. `userId` stays for existing pages that
// compare "is this me?"; the server only trusts the token.
const TOKEN_KEY = "authToken";
const EXPIRES_KEY = "authExpiresAt";
const USER_KEY = "userId";
// Set when someone else chose the password: only the change-password screen is open until it changes.
const MUST_CHANGE_KEY = "authMustChangePassword";

export const ACTING_USER_EVENT = "pharmalyx:acting-user";

const read = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

export const getToken = () => {
    const token = read(TOKEN_KEY);
    const expiresAt = Date.parse(read(EXPIRES_KEY) || "");

    if (!token || (expiresAt && expiresAt <= Date.now())) return null;

    return token;
};

export const isSignedIn = () => Boolean(getToken());

export const mustChangePassword = () => read(MUST_CHANGE_KEY) === "1";

export const setMustChangePassword = (value) => {
    try {
        if (value) localStorage.setItem(MUST_CHANGE_KEY, "1");
        else localStorage.removeItem(MUST_CHANGE_KEY);
    } catch {
        // Storage unavailable; the server still enforces it.
    }
};

// userId is optional when replacing the token of the same person (after a password change).
export const saveSession = ({ token, expiresAt, userId, mustChangePassword: mustChange = false }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
    if (userId) localStorage.setItem(USER_KEY, userId);
    setMustChangePassword(mustChange);
    window.dispatchEvent(new Event(ACTING_USER_EVENT));
};

export const clearSession = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EXPIRES_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(MUST_CHANGE_KEY);
    } catch {
        // Nothing stored.
    }
    window.dispatchEvent(new Event(ACTING_USER_EVENT));
};
