export const getCachedSummary = async (url) => {
  const result = await chrome.storage.local.get([url]);
  return result[url];
};

export const setCachedSummary = async (url, summary) => {
  await chrome.storage.local.set({ [url]: summary });
};
