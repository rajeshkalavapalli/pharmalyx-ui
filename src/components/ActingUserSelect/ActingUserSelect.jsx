// Former dev-only "Acting as" picker. Identity now comes from the signed-in
// session and the server ignores client-supplied user ids, so it renders nothing.
// Kept as a no-op so the pages that still include it need no changes.
function ActingUserSelect() {
    return null;
}

export default ActingUserSelect;
