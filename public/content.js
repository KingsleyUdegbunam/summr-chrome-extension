// this function extracts the text from the document
function extractContent() {
  const main =
    document.querySelector("main") ||
    document.querySelector("article") ||
    document.body;

  return main?.innerText.replace(/\s+/g, " ").trim() || "";
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "EXTRACT_TEXT") {
    //run function and pass extracted texts as response value
    sendResponse({ text: extractContent() });
  }
  return true;
});
