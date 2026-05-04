async function handleSummary(tabId) {
  try {
    // Tell popup: extracting
    chrome.runtime.sendMessage({ type: "STATUS", status: "extracting" });

    //send message for content script and wait for response
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "EXTRACT_TEXT",
    });

    chrome.runtime.sendMessage({ type: "STATUS", status: "summarizing" });

    //send response from the content script to the AI and await response
    const res = await fetch("http://localhost:3000/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let fullSummary;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullSummary += chunk;

      // stream chunks back to UI
      chrome.runtime.sendMessage({
        type: "STREAM",
        chunk,
      });
    }
    chrome.runtime.sendMessage({ type: "DONE", summary: fullSummary });

    chrome.runtime.sendMessage({ type: "STATUS", status: "done" });
  } catch {
    chrome.runtime.sendMessage({ type: "STATUS", status: "error" });
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "START_SUMMARY") {
    handleSummary(message.tabId);
  }
  return true;
});
