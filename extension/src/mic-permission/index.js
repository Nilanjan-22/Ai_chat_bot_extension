const grantBtn = document.getElementById("grant-btn");
const status = document.getElementById("status");

grantBtn.addEventListener("click", async () => {
  grantBtn.disabled = true;
  status.textContent = "";
  status.className = "";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission granted — stop the stream immediately.
    stream.getTracks().forEach((track) => track.stop());

    status.textContent = "✓ Microphone access granted! You can close this tab.";
    status.className = "success";
    grantBtn.textContent = "Done";

    // Notify the extension that permission was granted.
    chrome.runtime.sendMessage({ type: "MIC_PERMISSION_GRANTED" }).catch(() => {});

    // Auto-close after a short delay.
    setTimeout(() => window.close(), 1500);
  } catch (err) {
    status.textContent = "Microphone access was denied. Please try again and click Allow.";
    status.className = "error";
    grantBtn.disabled = false;
  }
});
