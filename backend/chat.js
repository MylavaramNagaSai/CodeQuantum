let currentThreadId = null;

// Load the sidebar from the Database
async function loadSidebar() {
    const res = await fetch(`${API_URL}/threads`);
    const threads = await res.json();
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<p class="history-label">Recent</p>';

    threads.forEach(thread => {
        const item = document.createElement('div');
        item.className = `history-item ${thread.is_pinned ? 'pinned' : ''}`;
        item.innerHTML = `
            <span onclick="selectThread(${thread.id})">${thread.title}</span>
            <button class="pin-btn" onclick="togglePin(${thread.id})">${thread.is_pinned ? '📍' : '📌'}</button>
        `;
        historyList.appendChild(item);
    });
}

async function selectThread(id) {
    currentThreadId = id;
    // 1. Fetch messages for this thread
    // 2. Clear chatContainer and appendMessage for each
}

async function togglePin(id) {
    await fetch(`${API_URL}/threads/${id}/pin`, { method: 'PATCH' });
    loadSidebar(); // Refresh list
}

// Update the Chat Form to send the Thread ID
chatForm.addEventListener('submit', async (e) => {
    // ... same logic ...
    body: JSON.stringify({ 
        prompt: message,
        thread_id: currentThreadId // Send the ID so the DB knows where to save
    })
});
