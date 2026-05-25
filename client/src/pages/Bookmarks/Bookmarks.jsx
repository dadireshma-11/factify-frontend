import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  Network,
  History,
  Search,
  Bookmark,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Dashboard.css";
import { bookmarksApi } from "../../api/client.js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
  { icon: History, label: "History", path: "/history" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
];

const BookmarksPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookmarks = useCallback(async () => {
    try {
      setError("");
      const data = await bookmarksApi.list();
      setBookmarks(data);
    } catch (err) {
      setError(err.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const filteredBookmarks = bookmarks.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.url?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.result?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id) => {
    try {
      await bookmarksApi.remove(id);
      setBookmarks((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete bookmark");
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>FACTIFY</h2>
          <p>Saved reports and bookmarked checks</p>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
                type="button"
              >
                <span className="nav-icon-wrap" aria-hidden="true">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1>BOOKMARKS</h1>
            <p>Saved credibility reports for quick reference.</p>
          </div>
        </header>

        {error && <div className="settings-success">{error}</div>}

        <section className="table-card">
          <div className="table-card-header">
            <h3>Saved Articles</h3>

            <div className="filter-group">
              <div className="filter-select-wrap">
                <input
                  type="text"
                  placeholder="Search saved items..."
                  className="filter-select"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={16} className="filter-icon" />
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Result</th>
                  <th>Confidence</th>
                  <th>Saved</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      Loading bookmarks...
                    </td>
                  </tr>
                ) : filteredBookmarks.length > 0 ? (
                  filteredBookmarks.map((item) => (
                    <tr key={item._id}>
                      <td>{item.id || String(item._id).slice(-6)}</td>
                      <td>
                        {(item.title || item.url || item.content || "").slice(0, 80) || "Untitled bookmark"}
                      </td>
                      <td>
                        <span className={`badge ${item.result.toLowerCase()}`}>
                          {item.result}
                        </span>
                      </td>
                      <td>{item.confidence}%</td>
                      <td>{item.date}</td>
                      <td>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDelete(item._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      No bookmarks yet. Save your first analysis from the home page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookmarksPage;
