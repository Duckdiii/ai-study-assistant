import { Link } from "react-router-dom";

export default function MainLayout({ children }) {
  return (
    <div>
      <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
        <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to="/problems">Problems</Link>
      </header>

      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}
