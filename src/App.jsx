import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("idle");
  const [clear, setClear] = useState("false");

  async function summarize() {
    setSummary("");
    setStatus("extracting");

    //wait to query target tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    //send message to background worker
    chrome.runtime.sendMessage({
      type: "START_SUMMARY",
      tabId: tab.id,
    });
  }

  useEffect(() => {
    //wrappinig async to make running in useEffect possible
    const summarizeEffect = async () => {
      await summarize();
    };
    //this allows the extension run on load
    summarizeEffect();

    const listener = (message) => {
      if (message.type === "STATUS") {
        setStatus(message.status);
      }

      if (message.type === "STREAM") {
        setSummary((prev) => prev + message.chunk);
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

  const handleReset = () => {
    setSummary("");
    setStatus("idle");
  };

  const handleRetry = () => {
    setSummary("");
    setStatus("extracting");
    summarize();
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
          <p>Loading...</p>
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
          <button onClick={handleReset} className="summr-btn secondary">
            Clear
          </button>
        )}
        <div>
          {status === "error" && (
            <button onClick={handleRetry} className="summr-btn try-again">
              Try again
            </button>
          )}

          {status !== "error" && (
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
