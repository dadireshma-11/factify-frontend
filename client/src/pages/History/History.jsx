import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  Network,
  History,
  Search,
  Trash2,
  Bookmark,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Dashboard.css";
import { historyApi, bookmarksApi } from "../../api/client.js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Network, label: "Network Analysis", path: "/network-analysis" },
  { icon: History, label: "History", path: "/history" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
];

const HistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [bookmarksMap, setBookmarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setError("");
      const [historyResult, bookmarksResult] = await Promise.all([
        historyApi.list(),
        bookmarksApi.list(),
      ]);

      setHistoryData(historyResult);

      const map = {};
      (Array.isArray(bookmarksResult) ? bookmarksResult : []).forEach((bookmark) => {
        if (bookmark.historyId) {
          map[String(bookmark.historyId)] = bookmark;
        }
        if (bookmark.url) {
          map[bookmark.url] = bookmark;
        }
      });
      setBookmarksMap(map);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = historyData.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.url?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.result?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id) => {
    try {
      await historyApi.remove(id);
      setHistoryData((prev) => prev.filter((item) => item._id !== id));
      setBookmarksMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setError(err.message || "Failed to delete item");
    }
  };

  const handleToggleBookmark = async (item) => {
    try {
      setError("");
      const bookmarkKey = String(item._id);
      const existingBookmark =
        bookmarksMap[bookmarkKey] || bookmarksMap[item.url] || null;

      if (existingBookmark) {
        await bookmarksApi.remove(existingBookmark._id);
        setBookmarksMap((prev) => {
          const next = { ...prev };
          delete next[bookmarkKey];
          if (item.url) delete next[item.url];
          return next;
        });
        window.dispatchEvent(new Event("bookmark-updated"));
        return;
      }

      const payload = {
        url: item.url || "",
        title:
          item.url || item.content
            ? item.url.slice(0, 100) || item.content.slice(0, 100)
            : "Saved Fake News Report",
        content: item.content || "",
        inputType: item.inputType || "text",
        result: item.result,
        confidence: item.confidence,
        sourceLinks: item.sourceLinks || [],
        claimsExtracted: item.claimsExtracted || 0,
        historyId: item._id,
      };

      const savedBookmark = await bookmarksApi.create(payload);
      setBookmarksMap((prev) => ({
        ...prev,
        [bookmarkKey]: savedBookmark,
        [item.url]: savedBookmark,
      }));
      window.dispatchEvent(new Event("bookmark-updated"));
    } catch (err) {
      setError(err.message || "Failed to update bookmark");
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Clear all analysis history? This cannot be undone.")) {
      return;
    }

    try {
      await historyApi.clearAll();
      setHistoryData([]);
    } catch (err) {
      setError(err.message || "Failed to clear history");
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>FACTIFY</h2>
          <p>Fake news intelligence</p>
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
            <h1>HISTORY</h1>
            <p>Track all previously analyzed fake news reports.</p>
          </div>

          <button
            className="download-btn"
            type="button"
            onClick={clearAllHistory}
            disabled={historyData.length === 0}
          >
            <Trash2 size={16} />
            <span>CLEAR HISTORY</span>
          </button>
        </header>

        {error && <div className="settings-success">{error}</div>}

        <section className="table-card">
          <div className="table-card-header">
            <h3>Analysis History</h3>

            <div className="filter-group">
              <div className="filter-select-wrap">
                <input
                  type="text"
                  placeholder="Search history..."
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
                  <th>Content</th>
                  <th>Result</th>
                  <th>Confidence</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      Loading history...
                    </td>
                  </tr>
                ) : filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item._id}>
                      <td>{item.id || String(item._id).slice(-6)}</td>
                      <td>{item.url}</td>
                      <td>
                        <span className={`badge ${item.result.toLowerCase()}`}>
                          {item.result}
                        </span>
                      </td>
                      <td>{item.confidence}%</td>
                      <td>
                        {item.date ||
                          new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td>
                        <button
                          className={
                            bookmarksMap[String(item._id)] ||
                            (item.url && bookmarksMap[item.url])
                              ? "bookmark-saved-btn"
                              : "bookmark-btn"
                          }
                          type="button"
                          onClick={() => handleToggleBookmark(item)}
                        >
                          {bookmarksMap[String(item._id)] ||
                          (item.url && bookmarksMap[item.url])
                            ? "Saved"
                            : "Bookmark"}
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      No history found. Analyze content on the home page first.
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

export default HistoryPage;
