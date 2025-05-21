const challengeInput = document.getElementById("challenge");
const difficultyInput = document.getElementById("difficulty");
const computeBtn = document.getElementById("compute");
const progressEl = document.getElementById("progress");
const resultEl = document.getElementById("result");
const historyTable = document.getElementById("history");

computeBtn.addEventListener("click", () => {
  const challenge = challengeInput.value;
  const difficulty = parseInt(difficultyInput.value);

  if (!challenge || isNaN(difficulty) || difficulty < 1) {
    alert("Please enter valid challenge and difficulty (>=1)");
    return;
  }

  progressEl.textContent = "Progress: 0 attempts";
  resultEl.textContent = "";

  chrome.runtime.sendMessage({ action: "startPoW", challenge, difficulty });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "count") {
    progressEl.textContent = `Progress: ${message.count} attempts`;
  }
  if (message.action === "done") {
    resultEl.textContent = `Nonce: ${message.nonce}, Hash: ${message.hash}`;
    loadHistory();
  }
});

function loadHistory() {
  chrome.storage.local.get(["history"], (data) => {
    const history = data.history || [];
    // Clear old rows
    historyTable.innerHTML = `
      <tr>
        <th>Challenge</th><th>Nonce</th><th>Hash</th><th>Time</th>
      </tr>
    `;
    // Add each history row
    history.forEach((item) => {
      const row = historyTable.insertRow();
      row.insertCell().textContent = item.challenge;
      row.insertCell().textContent = item.nonce;
      row.insertCell().textContent = item.hash;
      row.insertCell().textContent = item.time;
    });
  });
}

loadHistory(); // Load history when popup opens
