document.addEventListener("DOMContentLoaded", async () => {
  const urlDisplay = document.getElementById("current-url");
  const scanBtn = document.getElementById("scan-btn");

  let activeUrl = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      activeUrl = tab.url;
      urlDisplay.textContent = activeUrl;
    } else {
      urlDisplay.textContent = "Local or restricted browser surface";
    }
  } catch {
    urlDisplay.textContent = "Unable to read current tab";
  }

  scanBtn.addEventListener("click", () => {
    const target = activeUrl ? `http://localhost:3000/investigate?url=${encodeURIComponent(activeUrl)}` : `http://localhost:3000/investigate`;
    chrome.tabs.create({ url: target });
  });
});
