import { useState, useEffect, useRef } from "react";
import { getCachedSummary, setCachedSummary } from "./storage";
import "./App.css";

function App() {
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("idle");
  const [copied, setCopied] = useState(false);
  const tabRef = useRef({ id: null, url: null });

  const isRunningRef = useRef(false);

  async function summarize(tabId) {
    if (isRunningRef.current) return;

    setSummary("");
    setStatus("extracting");
    isRunningRef.current = true;
    //send message to background worker
    chrome.runtime.sendMessage({
      type: "START_SUMMARY",
      tabId: tabId,
    });
  }

  useEffect(() => {
    const init = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        tabRef.current = {
          id: tab.id,
          url: tab.url,
        };

        // LOAD CACHE FIRST
        const cached = await getCachedSummary(tab.url);

        if (cached) {
          setSummary(cached);
          setStatus("done");
          isRunningRef.current = false;
          return;
        }

        // START SUMMARY IN CACHE ABSENCE
        await summarize(tab.id);
      } catch {
        isRunningRef.current = false;
        setStatus("error");
      }
    };

    init();

    // LISTENER
    const listener = async (message) => {
      if (message.type === "STATUS") {
        setStatus(message.status);

        if (message.status === "error") {
          isRunningRef.current = false;
        }
      }

      if (message.type === "STREAM") {
        setSummary((prev) => prev + message.chunk);
      }

      if (message.type === "DONE") {
        if (!tabRef.current.url) return;
        isRunningRef.current = false;
        await setCachedSummary(tabRef.current.url, message.summary);
        setStatus("done");
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const values = {
    idle: "Ready",
    extracting: "Reading...",
    summarizing: "Summarizing...",
    done: "Done",
    error: "Error",
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  const handleReset = async () => {
    if (isRunningRef.current) return;
    setCopied(false);
    setSummary("");
    setStatus("idle");

    if (!tabRef.current.url) return;
    await chrome.storage.local.remove(tabRef.current.url);
  };

  const handleRetry = () => {
    if (isRunningRef.current) return;
    setSummary("");
    setStatus("extracting");
    summarize(tabRef.current.id);
  };

  return (
    <section className="parent-container">
      {/* HEADER */}
      <header className="header-container">
        <h2>Summr</h2>
        <div className="indicator-container">
          <div className={`indicator ${status}`}></div>
          <span className={`${status}-text indicator-txt`}>
            {values[status]}
          </span>
        </div>
      </header>

      {/* BODY */}
      <main className="body">
        {(status === "extracting" || status === "summarizing") && !summary && (
          <div className="loader"></div>
        )}
        {status === "error" && (
          <div>
            <p className="error-text error-message">
              Could not summarize this page.
            </p>
          </div>
        )}

        {status === "idle" && (
          <div className="idle-placeholder">
            Click "📜 Summarize Page" button to summarize.
          </div>
        )}

        {status !== "error" && summary && <div>{summary}</div>}
      </main>

      <footer className="footer">
        {status === "done" && (
          <button onClick={handleCopy} className="summr-btn copy">
            <span>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            {copied ? "Copied!" : "Copy summary"}
          </button>
        )}
        <div>
          {status === "error" && (
            <button onClick={handleRetry} className="summr-btn try-again">
              Try again
            </button>
          )}

          {status === "done" && (
            <button onClick={handleReset} className="summr-btn secondary">
              Clear
            </button>
          )}

          {status === "idle" && (
            <button onClick={handleRetry} className="summr-btn primary">
              📜 Summarize Page
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

export default App;
