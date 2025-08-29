// Frontend-only chat client using WebSocket.
// Default demo WebSocket: wss://echo.websocket.events (echo server for demo).
// Replace wsUrl with your own chat server URL (wss://...) for multi-user behavior.

(() => {
  const usernameEl = document.getElementById('username');
  const wsUrlEl = document.getElementById('wsUrl');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const statusEl = document.getElementById('status');
  const messagesEl = document.getElementById('messages');
  const sendForm = document.getElementById('sendForm');
  const messageInput = document.getElementById('messageInput');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const downloadLogBtn = document.getElementById('downloadLog');

  const STORAGE_KEY = 'codtech_chat_history_v1';
  let socket = null;
  let pendingMap = new Map(); // pending id => element

  function setStatus(text, color) {
    statusEl.textContent = text;
    statusEl.style.color = color || '';
  }

  function saveHistory(msgObj) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(msgObj);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) { /* ignore */ }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    messagesEl.innerHTML = '';
  }

  function downloadTranscript() {
    const history = loadHistory();
    const lines = history.map(h => `[${new Date(h.time).toLocaleString()}] ${h.user}: ${h.text}`);
    const blob = new Blob([lines.join('\n')], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-transcript.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString();
  }

  function renderMessage(msg, direction, pending=false) {
    // msg: { id, user, text, time }
    const el = document.createElement('div');
    el.className = 'message ' + (direction === 'out' ? 'outgoing' : 'incoming');
    el.dataset.id = msg.id || '';
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = `${msg.user || 'Unknown'} • ${formatTime(msg.time || Date.now())}`;
    const body = document.createElement('div');
    body.className = 'msg-body';
    body.textContent = msg.text;
    el.appendChild(meta);
    el.appendChild(body);

    if (pending) {
      el.style.opacity = '0.75';
      el.title = 'sending...';
      pendingMap.set(msg.id, el);
    }

    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function connect() {
    const url = (wsUrlEl.value || '').trim() || 'wss://echo.websocket.events';
    const user = (usernameEl.value || 'Guest').trim() || 'Guest';
    try {
      socket = new WebSocket(url);
    } catch (err) {
      setStatus('Invalid WS URL', 'crimson');
      return;
    }

    setStatus('Connecting...', 'orange');
    connectBtn.disabled = true;
    wsUrlEl.disabled = true;
    usernameEl.disabled = true;

    socket.addEventListener('open', () => {
      setStatus('Connected', 'green');
      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
    });

    socket.addEventListener('message', (ev) => {
      const raw = ev.data;
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        // If server sends plain text, wrap it
        parsed = { id: null, user: 'Remote', text: String(raw), time: Date.now() };
      }

      // If server echoes our sent message (matching id), update pending element instead of duplicating
      if (parsed.id && pendingMap.has(parsed.id)) {
        const pendingEl = pendingMap.get(parsed.id);
        pendingEl.style.opacity = '';
        pendingEl.title = '';
        pendingMap.delete(parsed.id);
        // update meta to reflect server timestamp/user if different
        const meta = pendingEl.querySelector('.msg-meta');
        if (meta) meta.textContent = `${parsed.user || usernameEl.value} • ${formatTime(parsed.time || Date.now())}`;
        // save to history (confirmed)
        saveHistory({ id: parsed.id, user: parsed.user || usernameEl.value, text: parsed.text, time: parsed.time || Date.now() });
      } else {
        // new incoming message
        renderMessage(parsed, 'in');
        saveHistory({ id: parsed.id || ('r_' + Date.now()), user: parsed.user || 'Remote', text: parsed.text, time: parsed.time || Date.now() });
      }
    });

    socket.addEventListener('close', () => {
      setStatus('Disconnected', 'crimson');
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      wsUrlEl.disabled = false;
      usernameEl.disabled = false;
      // mark any pending as failed
      pendingMap.forEach((el, id) => {
        el.style.opacity = '0.6';
        el.title = 'failed to send (disconnected)';
      });
      pendingMap.clear();
    });

    socket.addEventListener('error', (err) => {
      console.warn('WS error', err);
      setStatus('Error', 'crimson');
    });
  }

  function disconnect() {
    if (!socket) return;
    socket.close();
    socket = null;
    setStatus('Disconnected', 'crimson');
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    wsUrlEl.disabled = false;
    usernameEl.disabled = false;
  }

  function sendMessage(text) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      alert('Not connected. Click Connect first.');
      return;
    }
    const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
    const payload = {
      id,
      user: (usernameEl.value || 'Guest').trim() || 'Guest',
      text: text,
      time: Date.now()
    };
    try {
      socket.send(JSON.stringify(payload));
      // Render optimistic pending message — it will be confirmed/updated when echoed by the server
      renderMessage(payload, 'out', true);
      // Do NOT save to history until server confirms (on message event).
    } catch (e) {
      alert('Failed to send message: ' + e.message);
    }
  }

  // load persisted history and draw
  function bootstrapHistory() {
    const hist = loadHistory();
    hist.forEach(h => {
      renderMessage(h, h.user === (usernameEl.value || '').trim() ? 'out' : 'in', false);
    });
  }

  // event listeners
  connectBtn.addEventListener('click', () => connect());
  disconnectBtn.addEventListener('click', () => disconnect());

  sendForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const txt = messageInput.value.trim();
    if (!txt) return;
    sendMessage(txt);
    messageInput.value = '';
    messageInput.focus();
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear local chat history?')) clearHistory();
  });
  downloadLogBtn.addEventListener('click', downloadTranscript);

  // initialize UI
  setStatus('Disconnected', 'crimson');
  bootstrapHistory();
})();
