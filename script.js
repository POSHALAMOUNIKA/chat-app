let username = "";
let messages = [];

// Load saved messages (so they stay after refresh)
if (localStorage.getItem("messages")) {
  messages = JSON.parse(localStorage.getItem("messages"));
}

function login() {
  username = document.getElementById("usernameInput").value.trim();
  if (username) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("chatScreen").style.display = "block";
    document.getElementById("welcome").innerText = "Welcome, " + username + " 👋";
    renderMessages();
  }
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (text) {
    const msg = { user: username, text: text };
    messages.push(msg);
    localStorage.setItem("messages", JSON.stringify(messages)); // save in browser
    renderMessages();
    input.value = "";
  }
}

function renderMessages() {
  const box = document.getElementById("messages");
  box.innerHTML = "";
  messages.forEach(msg => {
    const p = document.createElement("p");
    p.innerHTML = <strong>${msg.user}:</strong> ${msg.text};
    box.appendChild(p);
  });
  box.scrollTop = box.scrollHeight; // auto-scroll to bottom
}
