import { Navigate, Outlet } from "react-router-dom";

import { isSignedIn, mustChangePassword } from "./session";

// Guards the app shell: without a valid session, go to the sign-in page; someone who must
// choose their own password goes to that screen first.
function RequireAuth() {
    if (!isSignedIn()) return <Navigate to="/" replace />;
    if (mustChangePassword()) return <Navigate to="/change-password" replace />;
    return <Outlet />;
}

export default RequireAuth;
