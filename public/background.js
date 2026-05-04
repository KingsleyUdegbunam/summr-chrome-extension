chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "START_SUMMARY") {
    console.log("message");
  }
  return true;
});
