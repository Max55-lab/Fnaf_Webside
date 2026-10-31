import { useMemo, useRef, useState } from "react";
import { timeAgo } from "../../lib/community.js";
import { sanitizeText } from "../../security/sanitize.js";
import {
  FORUM_CATEGORIES,
  THREAD_CATEGORIES,
  loadAuthor,
  loadThreads,
  newId,
  resetThreads,
  saveAuthor,
  saveThreads,
} from "../../lib/forum.js";
import CommunityPulse from "./CommunityPulse.jsx";

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/* Module-scope helper keeps render-time purity checks happy. */
const nowIso = () => new Date().toISOString();

export default function Forum() {
  const [threads, setThreads] = useState(loadThreads);
  const [activeId, setActiveId] = useState(() => loadThreads()[0]?.id ?? null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [author, setAuthor] = useState(loadAuthor);
  const [draft, setDraft] = useState({ title: "", category: "Lore", body: "" });
  const [replyBody, setReplyBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const detailRef = useRef(null);

  const active = useMemo(
    () => threads.find((thread) => thread.id === activeId) || null,
    [threads, activeId]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return threads.filter((thread) => {
      if (filter !== "All" && thread.category !== filter) return false;
      if (!needle) return true;
      return `${thread.title} ${thread.body} ${thread.author} ${thread.category} ${thread.replies
        .map((reply) => `${reply.author} ${reply.body}`)
        .join(" ")}`
        .toLowerCase()
        .includes(needle);
    });
  }, [threads, filter, query]);

  const counts = useMemo(() => {
    const next = { All: threads.length };
    for (const thread of threads) {
      next[thread.category] = (next[thread.category] || 0) + 1;
    }
    return next;
  }, [threads]);

  const commit = (next) => {
    setThreads(next);
    const saved = saveThreads(next);
    if (!saved) setError("This browser refused local storage, so the post only lasts this visit.");
  };

  const selectThread = (id, focusDetail = false) => {
    setActiveId(id);
    if (focusDetail) {
      requestAnimationFrame(() => detailRef.current?.focus());
    }
  };

  const createThread = (event) => {
    event.preventDefault();
    setError("");
    /* Sanitise UGC before it reaches state or storage. */
    const title = sanitizeText(draft.title, 160);
    const body = sanitizeText(draft.body, 4000);
    const name = sanitizeText(author, 40) || "Anonymous";
    if (title.length < 8) {
      setError("Give the thread a title of at least eight characters.");
      return;
    }
    if (body.length < 20) {
      setError("Add a little more context — at least twenty characters.");
      return;
    }

    const thread = {
      id: newId("thread"),
      title,
      category: draft.category,
      author: name,
      createdAt: nowIso(),
      body,
      replies: [],
    };
    commit([thread, ...threads]);
    saveAuthor(name);
    setDraft({ title: "", category: "Lore", body: "" });
    setComposing(false);
    setActiveId(thread.id);
    setNotice("Thread posted to this browser.");
    requestAnimationFrame(() => detailRef.current?.focus());
  };

  const postReply = (event) => {
    event.preventDefault();
    if (!active) return;
    setError("");
    const body = sanitizeText(replyBody, 2400);
    if (body.length < 4) {
      setError("Write a reply before posting.");
      return;
    }
    const name = sanitizeText(author, 40) || "Anonymous";
    const reply = {
      id: newId("reply"),
      author: name,
      createdAt: nowIso(),
      body,
    };
    commit(
      threads.map((thread) =>
        thread.id === active.id
          ? { ...thread, replies: [...thread.replies, reply] }
          : thread
      )
    );
    saveAuthor(name);
    setReplyBody("");
    setNotice(`Reply posted to “${active.title}”.`);
  };

  const resetForum = () => {
    if (!window.confirm("Reset every local thread and reply back to the starter conversations?")) {
      return;
    }
    const seeded = resetThreads();
    setThreads(seeded);
    setActiveId(seeded[0]?.id ?? null);
    setNotice("The local forum has been reset.");
    setError("");
  };

  return (
    <div className="forum">
      <div className="hub-section-head">
        <div>
          <span className="hub-kicker">Night shift discussion</span>
          <h2 className="hub-section-title">The break room</h2>
          <p className="hub-section-sub">
            A structured forum for theories, guides and first-playthrough stories. Posts live
            only in this browser — there is no account, server or moderation queue.
          </p>
        </div>
        <span className="local-badge">LOCAL ONLY</span>
      </div>

      <div className="forum-toolbar">
        <div className="filter-row forum-filters" role="group" aria-label="Filter threads">
          {FORUM_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              className={`pill ${filter === category ? "active" : ""}`}
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
            >
              {category}
              <span className="pill-count">{counts[category] || 0}</span>
            </button>
          ))}
        </div>
        <div className="forum-toolbar-actions">
          <label className="news-search">
            <span className="sr-only">Search threads</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search threads…"
            />
          </label>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setComposing((value) => !value);
              setError("");
            }}
            aria-expanded={composing}
          >
            {composing ? "Close form" : "+ New thread"}
          </button>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}

      {composing && (
        <form className="forum-compose card" onSubmit={createThread}>
          <div className="forum-compose-head">
            <div>
              <span className="hub-kicker">New transmission</span>
              <h3>Start a thread</h3>
            </div>
            <span className="local-badge">SAVED LOCALLY</span>
          </div>
          <div className="form-grid">
            <label className="field field-wide">
              <span>Title</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                maxLength={160}
                placeholder="What are you investigating?"
                required
              />
            </label>
            <label className="field">
              <span>Display name</span>
              <input
                type="text"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={40}
                placeholder="Anonymous"
              />
            </label>
            <label className="field">
              <span>Category</span>
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, category: event.target.value }))
                }
              >
                {THREAD_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="field field-wide">
              <span>Message</span>
              <textarea
                value={draft.body}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, body: event.target.value }))
                }
                rows={5}
                maxLength={4000}
                placeholder="Share the evidence, the game, the scene — and use spoiler warnings."
                required
              />
            </label>
          </div>
          <div className="forum-form-foot">
            <span>{draft.body.length}/4000</span>
            <button type="submit" className="btn btn-danger">
              Post thread
            </button>
          </div>
        </form>
      )}

      <div className="forum-layout">
        <section className="forum-list" aria-label="Threads">
          <div className="forum-list-head">
            <span>{visible.length} threads</span>
            <button type="button" className="forum-reset" onClick={resetForum}>
              Reset local forum
            </button>
          </div>
          {visible.length === 0 ? (
            <div className="empty-state forum-empty">
              <span className="big" aria-hidden="true">📭</span>
              No threads match. Clear the search or start a new one.
            </div>
          ) : (
            <div className="forum-threads">
              {visible.map((thread) => (
                <button
                  type="button"
                  key={thread.id}
                  className={`forum-thread ${thread.id === activeId ? "is-active" : ""}`}
                  onClick={() => selectThread(thread.id, true)}
                  aria-current={thread.id === activeId ? "true" : undefined}
                >
                  <span className="forum-thread-top">
                    <span className="forum-avatar" aria-hidden="true">
                      {initials(thread.author)}
                    </span>
                    <span className="forum-thread-meta">
                      <span className="forum-category">{thread.category}</span>
                      <span>{timeAgo(thread.createdAt)}</span>
                    </span>
                  </span>
                  <span className="forum-thread-title">{thread.title}</span>
                  <span className="forum-thread-excerpt">{thread.body}</span>
                  <span className="forum-thread-foot">
                    <span>by {thread.author}</span>
                    <span>
                      {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section
          className="forum-detail card"
          aria-label="Selected thread"
          ref={detailRef}
          tabIndex={-1}
        >
          {active ? (
            <>
              <div className="forum-detail-head">
                <span className="forum-category">{active.category}</span>
                <h3>{active.title}</h3>
                <div className="forum-detail-meta">
                  <span className="forum-avatar" aria-hidden="true">
                    {initials(active.author)}
                  </span>
                  <span>
                    <strong>{active.author}</strong>
                    <time dateTime={active.createdAt}>{timeAgo(active.createdAt)}</time>
                  </span>
                </div>
              </div>

              <p className="forum-body">{active.body}</p>

              <div className="forum-replies" aria-label="Replies">
                <div className="forum-replies-head">
                  <span>
                    {active.replies.length} {active.replies.length === 1 ? "reply" : "replies"}
                  </span>
                  <span>Oldest first</span>
                </div>
                {active.replies.length === 0 ? (
                  <p className="forum-no-replies">
                    No replies yet. Be the first voice in the office.
                  </p>
                ) : (
                  active.replies.map((reply) => (
                    <article className="forum-reply" key={reply.id}>
                      <span className="forum-avatar" aria-hidden="true">
                        {initials(reply.author)}
                      </span>
                      <div>
                        <div className="forum-reply-meta">
                          <strong>{reply.author}</strong>
                          <time dateTime={reply.createdAt}>{timeAgo(reply.createdAt)}</time>
                        </div>
                        <p>{reply.body}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <form className="forum-reply-form" onSubmit={postReply}>
                <label className="field field-wide">
                  <span>Reply as {author.trim() || "Anonymous"}</span>
                  <textarea
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    rows={3}
                    maxLength={2400}
                    placeholder="Add evidence, a source, or a spoiler-tagged thought…"
                    required
                  />
                </label>
                <div className="forum-form-foot">
                  <span>{replyBody.length}/2400</span>
                  <button type="submit" className="btn">Post reply</button>
                </div>
              </form>
            </>
          ) : (
            <div className="empty-state forum-empty">
              <span className="big" aria-hidden="true">🗨</span>
              Select a thread to read it.
            </div>
          )}
        </section>
      </div>

      <CommunityPulse />
    </div>
  );
}
