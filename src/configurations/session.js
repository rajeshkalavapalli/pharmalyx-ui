// Signed-in session kept in localStorage. `userId` stays for existing pages that
// compare "is this me?"; the server only trusts the token.
const TOKEN_KEY = "authToken";
const EXPIRES_KEY = "authExpiresAt";
const USER_KEY = "userId";

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

export const saveSession = ({ token, expiresAt, userId }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
    localStorage.setItem(USER_KEY, userId);
    window.dispatchEvent(new Event(ACTING_USER_EVENT));
};

export const clearSession = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EXPIRES_KEY);
        localStorage.removeItem(USER_KEY);
    } catch {
        // Nothing stored.
    }
    window.dispatchEvent(new Event(ACTING_USER_EVENT));
};
