chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startPoW") {
    startMining(message.challenge, message.difficulty);
  }
});

async function startMining(challenge, difficulty) {
  let nonce = 0;
  let found = false;
  const targetPrefix = "0".repeat(difficulty);

  async function mineBatch() {
    for (let i = 0; i < 1000; i++) {
      const text = challenge + nonce;
      const hash = await sha256(text);
      if (hash.startsWith(targetPrefix)) {
        found = true;
        saveSolution(challenge, nonce, hash);
        chrome.runtime.sendMessage({ action: "done", nonce, hash });
        break;
      }
      nonce++;
    }
    if (!found) {
      chrome.runtime.sendMessage({ action: "count", count: nonce });
      setTimeout(mineBatch, 10); // Continue next batch
    }
  }

  mineBatch();
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function saveSolution(challenge, nonce, hash) {
  const time = new Date().toISOString().replace("T", " ").substring(0, 19);
  chrome.storage.local.get(["history"], (data) => {
    const history = data.history || [];
    history.unshift({ challenge, nonce, hash, time });
    chrome.storage.local.set({ history });
  });
}
