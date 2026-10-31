import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

/* ============================================================
   AUTHGUARD — client-side permission gate
   Wraps administrative modules (Oversight console, moderation
   actions) so they never render for insufficient clearance.
   Ranking: guest(0) < user(1) < administrator(2) < super(3).
   This is presentation-layer defence only — there is no server
   here, and the wiki says so out loud.
   ============================================================ */

const RANK = {
  guest: 0,
  user: 1,
  administrator: 2,
  "super-administrator": 3,
};

const LABEL = {
  guest: "Guest",
  user: "User",
  administrator: "Administrator",
  "super-administrator": "Super Administrator",
};

export function hasClearance(role, minRole = "user") {
  return (RANK[role] ?? 0) >= (RANK[minRole] ?? 1);
}

export default function AuthGuard({ minRole = "user", fallback = null, children }) {
  const { signedIn, role } = useAuth();
  const allowed = signedIn && hasClearance(role, minRole);

  if (allowed) return children;
  if (fallback) return fallback;

  return (
    <div className="page auth-page">
      <div className="auth-denied-panel" role="alert">
        <span className="auth-legend">CLEARANCE CHECK</span>
        <h1 className="page-title">Access denied</h1>
        <p className="card-text">
          This area requires {LABEL[minRole] || minRole} clearance. You are currently
          browsing as {signedIn ? LABEL[role] || role : "a visitor without a badge"}.
        </p>
        <div className="auth-actions">
          <Link to="/login" className="btn btn-danger">
            Open the staff terminal →
          </Link>
          <Link to="/" className="btn">
            Back to the wiki
          </Link>
        </div>
      </div>
    </div>
  );
}
