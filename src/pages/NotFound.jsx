import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";

export default function NotFound() {
  return (
    <div className="page">
      <PageMeta title="404 — Camera Not Found" description="This room doesn't exist." />
      <div className="empty-state">
        <span className="big">📹</span>
        <div style={{ fontSize: "1.4rem", color: "var(--danger)", letterSpacing: 4 }}>
          CAMERA NOT FOUND
        </div>
        <br />
        <div>ERROR 404 — THIS ROOM DOESN'T EXIST...</div>
        <div style={{ marginTop: "0.5rem", color: "#3a4152" }}>
          (or the animatronics moved it)
        </div>
        <br />
        <Link to="/" className="btn">Return to Office</Link>
      </div>
    </div>
  );
}
