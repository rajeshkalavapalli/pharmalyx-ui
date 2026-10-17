import { Navigate, Outlet } from "react-router-dom";

import { isSignedIn } from "./session";

// Guards the app shell: without a valid session, go to the sign-in page.
function RequireAuth() {
    return isSignedIn() ? <Outlet /> : <Navigate to="/" replace />;
}

export default RequireAuth;
