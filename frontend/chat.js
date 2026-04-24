/* --- 🧠 CODEQUANTUM CORE ENGINE --- */
const API_URL = "https://codequantum.tech/api";
let currentThreadId = null;

// DOM Selectors
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const sidebarList = document.getElementById('sidebarList');
const micBtn = document.getElementById('micBtn');
const errorPrompt = document.getElementById('errorPrompt');
const dynamicDisclaimer = document.getElementById('dynamicDisclaimer');

// Mobile UI Selectors
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarElement = document.querySelector('.sidebar');

/* --- 📱 MOBILE SIDEBAR LOGIC --- */
function toggleSidebar() {
    if (sidebarElement && sidebarOverlay) {
        sidebarElement.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        
        if (sidebarOverlay.classList.contains('active')) {
            sidebarOverlay.style.display = 'block';
            setTimeout(() => sidebarOverlay.style.opacity = '1', 10);
        } else {
            sidebarOverlay.style.opacity = '0';
            setTimeout(() => sidebarOverlay.style.display = 'none', 300);
        }
    }
}

function autoCloseSidebarOnMobile() {
    if (window.innerWidth <= 768 && sidebarElement && sidebarElement.classList.contains('active')) {
        toggleSidebar();
    }
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

/* --- ✨ SMART DISCLAIMER SYSTEM --- */
const smartTips = [
    "CodeQuantum is an AI and can make mistakes. Verify important info.",
    "💡 Did you know? You can run Python, C++, and Java directly in the chat.",
    "💡 Use the top-right menu to switch between Standard, Reviewer, and Interviewer personas.",
    "💡 Click the speaker icon on my messages to hear them read aloud.",
    "💡 Try asking me to '/imagine a futuristic cyberpunk city'."
];
let tipIndex = 0;
let tipTimer;

function updateDisclaimer(text) {
    if (!dynamicDisclaimer) return;
    dynamicDisclaimer.style.opacity = '0';
    setTimeout(() => {
        dynamicDisclaimer.innerText = text;
        dynamicDisclaimer.style.opacity = '1';
    }, 300);
}

function startSmartTips() {
    clearInterval(tipTimer);
    updateDisclaimer(smartTips[tipIndex]);
    tipTimer = setInterval(() => {
        tipIndex = (tipIndex + 1) % smartTips.length;
        updateDisclaimer(smartTips[tipIndex]);
    }, 8000); 
}

function setStaticDisclaimer(text) {
    clearInterval(tipTimer);
    updateDisclaimer(text);
}

/* --- 🔑 OAUTH TOKEN CATCHER --- */
const urlParams = new URLSearchParams(window.location.search);
const auth_token = urlParams.get('token');

if (auth_token) {
    localStorage.setItem('token', auth_token);
    localStorage.setItem('userName', urlParams.get('name'));
    localStorage.setItem('userEmail', urlParams.get('email'));
    localStorage.setItem('userAvatar', urlParams.get('avatar'));
    window.history.replaceState({}, document.title, "/chat.html");
}

/* --- 🎨 MARKDOWN & CODE HIGHLIGHTING CONFIG --- */
if (typeof marked !== 'undefined') {
    const renderer = new marked.Renderer();
    
    renderer.code = function(arg1, arg2) {
        const code = typeof arg1 === 'object' ? arg1.text : arg1;
        const language = typeof arg1 === 'object' ? arg1.lang : arg2;
        
        const validLanguage = (language && hljs.getLanguage(language)) ? language : 'plaintext';
        
        let highlightedCode = code;
        try {
            highlightedCode = hljs.highlight(code, { language: validLanguage, ignoreIllegals: true }).value;
        } catch (error) {
            console.warn("Highlighting mid-stream...");
        }
        
        const encodedCode = encodeURIComponent(code).replace(/'/g, "%27");

        const runnableLangs = ['python', 'javascript', 'js', 'c', 'cpp', 'java'];
        let runBtnHtml = '';
        
        if (runnableLangs.includes(validLanguage)) {
            const apiLang = validLanguage === 'js' ? 'javascript' : validLanguage;
            runBtnHtml = `<button class="run-btn" type="button" onclick="executeCode(this, '${apiLang}', '${encodedCode}')">▶ Run</button>`;
        }

        return `
            <div class="code-wrapper" style="border-radius: 8px; overflow: hidden; margin: 15px 0;">
                <div class="code-header" style="background: #21252b; padding: 8px 15px; display: flex; justify-content: space-between; align-items: center; color: #abb2bf; font-family: monospace; font-size: 12px;">
                    <span>${validLanguage}</span>
                    <div class="code-actions">
                        ${runBtnHtml}
                        <button class="copy-btn" type="button" onclick="copyToClipboard(this, '${encodedCode}')" style="background: #3e4451; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
                    </div>
                </div>
                <pre style="margin: 0; padding: 15px; background: #282c34; overflow-x: auto;"><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>
                <div class="terminal-output" style="display: none;"></div>
            </div>
        `;
    };

    marked.setOptions({ renderer: renderer, breaks: true, gfm: true });
}

window.copyToClipboard = function(button, encodedText) {
    const decodedText = decodeURIComponent(encodedText);
    navigator.clipboard.writeText(decodedText).then(() => {
        const originalText = button.innerText;
        button.innerText = 'Copied! ✅';
        button.style.background = '#28a745';
        setTimeout(() => {
            button.innerText = originalText;
            button.style.background = '#3e4451';
        }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
};

// --- 💻 LIVE CODE EXECUTION ENGINE ---
window.executeCode = async function(button, lang, encodedCode) {
    const code = decodeURIComponent(encodedCode);
    const wrapper = button.closest('.code-wrapper');
    const terminal = wrapper.querySelector('.terminal-output');
    
    terminal.style.display = 'block';
    terminal.innerHTML = '<span class="terminal-system">> Compiling & Executing in CodeQuantum Sandbox...</span>';
    button.disabled = true;
    button.innerHTML = '⏳ Running';
    
    setStaticDisclaimer("⚙️ Compiling and executing code in Local Sandbox...");

    try {
        const response = await fetch(`${API_URL}/execute`, {
            method: 'POST',
            headers: getHeaders(), 
            body: JSON.stringify({ language: lang, code: code })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            terminal.innerHTML = `<span class="terminal-error">> Server Error: ${data.detail || 'Execution failed'}</span>`;
            return;
        }
        
        if (data.run) {
            if (data.compile && data.compile.code !== 0) {
                terminal.innerHTML = `<span class="terminal-error">> Compile Error:<br>${data.compile.stderr.replace(/\n/g, '<br>')}</span>`;
                return;
            }

            if (data.run.stderr) {
                terminal.innerHTML = `<span class="terminal-error">> Error:<br>${data.run.stderr.replace(/\n/g, '<br>')}</span>`;
            } else if (data.run.output) {
                terminal.innerHTML = `> ${data.run.output.replace(/\n/g, '<br>> ')}`;
            } else {
                terminal.innerHTML = '<span class="terminal-system">> Process exited cleanly with no output.</span>';
            }
        } else {
            terminal.innerHTML = `<span class="terminal-error">> System Error: Failed to parse sandbox response.</span>`;
        }
    } catch (err) {
        terminal.innerHTML = `<span class="terminal-error">> Network Error: Could not connect to CodeQuantum Backend.</span>`;
    } finally {
        button.disabled = false;
        button.innerHTML = '▶ Run';
        startSmartTips(); 
    }
};

/* --- 🔒 SECURITY & PROFILE --- */
function getHeaders() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'index.html'; return; }
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

function loadProfile() {
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || '';
    const avatar = localStorage.getItem('userAvatar');

    if (name) document.getElementById('displayUserName').innerText = name;
    if (email) document.getElementById('displayUserEmail').innerText = email;

    const profilePic = document.getElementById('userProfilePic');
    if (avatar && avatar !== "default_avatar.png" && avatar !== "null") {
        profilePic.src = avatar;
    } else {
        profilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a73e8&color=fff&size=100&bold=true`;
    }
}

function showError(msg) {
    if(errorPrompt) {
        errorPrompt.innerText = msg;
        errorPrompt.style.display = 'block';
        setTimeout(() => { errorPrompt.style.display = 'none'; }, 5000);
    }
}

/* --- 📂 SIDEBAR & HISTORY LOGIC --- */
async function loadSidebar() {
    try {
        const response = await fetch(`${API_URL}/threads`, { headers: getHeaders() });
        if (response.status === 401) return logout();
        
        let threads = await response.json();
        threads.sort((a, b) => (b.is_pinned === true) - (a.is_pinned === true));

        if(sidebarList) sidebarList.innerHTML = ''; 
        
        if (threads.length > 0 && !currentThreadId) {
            loadPastChat(threads[0].id);
        }

        let hasAddedPinnedHeader = false;
        let hasAddedRecentHeader = false;

        threads.forEach(thread => {
            if (thread.is_pinned && !hasAddedPinnedHeader) {
                sidebarList.insertAdjacentHTML('beforeend', `<div class="sidebar-category-header">📌 Pinned</div>`);
                hasAddedPinnedHeader = true;
            } else if (!thread.is_pinned && !hasAddedRecentHeader) {
                sidebarList.insertAdjacentHTML('beforeend', `<div class="sidebar-category-header">🕒 Recent</div>`);
                hasAddedRecentHeader = true;
            }

            const safeTitle = thread.title ? thread.title.replace(/'/g, "\\'") : "Chat";
            const pinClass = thread.is_pinned ? 'is-pinned' : '';
            const activeClass = thread.id === currentThreadId ? 'active' : '';
            
            const item = document.createElement('div');
            item.className = `sidebar-item ${activeClass} ${pinClass}`;
            item.innerHTML = `
                <div class="chat-title-wrapper" onclick="loadPastChat(${thread.id})">
                    <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span class="chat-title-text">${thread.title}</span>
                </div>
                <div class="chat-actions">
                    <button onclick="renameChat(${thread.id}, '${safeTitle}')" class="action-icon-btn" title="Rename"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button onclick="togglePin(${thread.id}, ${thread.is_pinned})" class="action-icon-btn ${thread.is_pinned ? 'pinned-active' : ''}" title="${thread.is_pinned ? 'Unpin' : 'Pin'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.24V6a3 3 0 0 0-6 0v5.24a2 2 0 0 1-1.11 1.31l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg></button>
                    <button onclick="deleteChat(${thread.id})" class="action-icon-btn delete-btn" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                </div>
            `;
            if(sidebarList) sidebarList.appendChild(item);
        });
    } catch (error) { console.error("Sidebar error:", error); }
}

async function loadPastChat(threadId) {
    currentThreadId = threadId;
    autoCloseSidebarOnMobile(); 
    chatContainer.innerHTML = '<div style="text-align:center; color:#888; margin-top:20px;">Loading conversation...</div>'; 
    try {
        const response = await fetch(`${API_URL}/threads/${threadId}/messages`, { headers: getHeaders() });
        const messages = await response.json();
        chatContainer.innerHTML = ''; 
        if (messages.length === 0) showWelcome();
        else messages.forEach(msg => appendMsg(msg.role, msg.content));
        loadSidebar(); 
    } catch (error) { console.error("History error:", error); }
}

async function startNewChat() {
    autoCloseSidebarOnMobile(); 
    try {
        const res = await fetch(`${API_URL}/threads`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ title: "New Conversation" }) });
        const data = await res.json();
        currentThreadId = data.id;
        chatContainer.innerHTML = '';
        showWelcome();
        loadSidebar();
    } catch (e) { console.error(e); }
}

/* --- 💬 CHAT UI & ON-DEMAND TEXT-TO-SPEECH --- */
function showWelcome() {
    chatContainer.innerHTML = `
        <div class="welcome-screen" style="text-align:center; margin:auto;">
            <h1 style="font-size: 48px; color: #1a73e8; margin-bottom: 10px;">Hello, Buddy.</h1>
            <p style="font-size: 18px; color: #888;">How Can I Assist you Today?</p>
        </div>
    `;
}

function appendMsg(role, text, isGenerating = false) {
    const welcome = document.querySelector('.welcome-screen');
    if (welcome) welcome.remove();

    const msgRow = document.createElement('div');
    msgRow.style.display = "flex";
    msgRow.style.width = "100%";
    msgRow.style.marginBottom = "25px";
    msgRow.style.justifyContent = role === 'user' ? "flex-end" : "flex-start";

    const msgBubble = document.createElement('div');
    msgBubble.className = "message-bubble"; 
    msgBubble.style.display = "flex";
    msgBubble.style.gap = "15px";
    msgBubble.style.maxWidth = "85%";
    if (role === 'user') msgBubble.style.flexDirection = "row-reverse";

    let iconHtml = '';
    if (role === 'user') {
        const profilePicSrc = document.getElementById('userProfilePic').src;
        iconHtml = `<img src="${profilePicSrc}" alt="User" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`;
    } else {
        iconHtml = `<span style="font-size: 24px;">🚀</span>`;
    }

    const bgColor = role === 'user' ? '#e8f0fe' : '#f1f3f4';
    let htmlContent = (role !== 'user' && typeof marked !== 'undefined' && text) ? marked.parse(text) : text;

    if (isGenerating && !text) {
        htmlContent = `
            <div class="thinking-indicator">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
        `;
    }

    const idleSpeakerSVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>`;
    const fullVolumeSVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;

    const displayStyle = isGenerating ? 'none' : 'flex';
    const actionBarHTML = role !== 'user' ? `
        <div class="action-bar" style="display: ${displayStyle}; justify-content: flex-end; margin-top: 4px;">
            <button class="play-msg-btn" type="button" title="Read Aloud" style="background: none; border: none; cursor: pointer; color: #5f6368; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; transition: background 0.2s; padding: 0;">
                ${idleSpeakerSVG}
            </button>
        </div>
    ` : '';

    msgBubble.innerHTML = `
        <div style="flex-shrink: 0; display: flex; align-items: flex-end; padding-bottom: 5px;">${iconHtml}</div>
        <div class="message-content" style="position: relative; background: ${bgColor}; padding: 14px 20px; border-radius: 20px; color: #202124; line-height: 1.6; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 100%; min-width: 0;">
            <div class="text-content" style="overflow-x: auto;">${htmlContent}</div>
            ${actionBarHTML}
        </div>
    `;
    
    msgRow.appendChild(msgBubble);
    chatContainer.appendChild(msgRow);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (role !== 'user') {
        const playBtn = msgBubble.querySelector('.play-msg-btn');
        let isPlaying = false;
        
        playBtn.addEventListener('click', () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            
            if (isPlaying) {
                isPlaying = false;
                playBtn.innerHTML = idleSpeakerSVG;
                playBtn.title = "Read Aloud";
                return;
            }

            document.querySelectorAll('.play-msg-btn').forEach(btn => {
                btn.innerHTML = idleSpeakerSVG;
                btn.title = "Read Aloud";
            });

            isPlaying = true;
            playBtn.innerHTML = fullVolumeSVG;
            playBtn.title = "Stop Reading";

            const textContentBox = msgBubble.querySelector('.text-content');
            let cleanText = textContentBox.innerText.replace(/Copy/g, " I have provided the code below. ");
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.05;
            
            const resetBtn = () => {
                isPlaying = false;
                playBtn.innerHTML = idleSpeakerSVG;
                playBtn.title = "Read Aloud";
            };
            
            utterance.onend = resetBtn;
            utterance.onerror = resetBtn;

            window.speechSynthesis.speak(utterance);
        });
        
        playBtn.addEventListener('mouseenter', () => playBtn.style.background = 'rgba(0,0,0,0.05)');
        playBtn.addEventListener('mouseleave', () => playBtn.style.background = 'transparent');
    }
    
    return msgBubble.querySelector('.text-content'); 
}

/* --- 📏 AUTO-EXPANDING TEXT AREA & SMART TIPS --- */
userInput.addEventListener('input', function() {
    this.style.height = 'auto'; 
    this.style.height = (this.scrollHeight) + 'px'; 
    this.style.overflowY = this.scrollHeight >= 200 ? 'auto' : 'hidden';
});

userInput.addEventListener('focus', () => setStaticDisclaimer("⌨️ Press Enter to send, Shift + Enter for a new line."));
userInput.addEventListener('blur', () => startSmartTips());

/* --- 📎 FILE ATTACHMENT LOGIC --- */
const fileUpload = document.getElementById('fileUpload');
const attachBtn = document.getElementById('attachBtn');
const attachmentIndicator = document.getElementById('attachmentIndicator');
const attachedFileName = document.getElementById('attachedFileName');
let selectedFile = null;

if(attachBtn) attachBtn.addEventListener('click', () => fileUpload.click());

if(fileUpload) {
    fileUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            selectedFile = this.files[0];
            attachedFileName.innerText = selectedFile.name;
            attachmentIndicator.style.display = 'flex';
            userInput.focus();
        }
    });
}

function clearAttachment() {
    selectedFile = null;
    if(fileUpload) fileUpload.value = '';
    if(attachmentIndicator) attachmentIndicator.style.display = 'none';
}

/* --- 🎙️ VOICE TO TEXT (MICROPHONE) LOGIC --- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (micBtn) {
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false; 

        micBtn.addEventListener('click', () => {
            try {
                recognition.start();
                micBtn.classList.add('listening');
                userInput.placeholder = "Listening...";
                setStaticDisclaimer("🎙️ Listening to your voice...");
            } catch (error) { console.error("Mic error:", error); }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const currentText = userInput.value;
            userInput.value = currentText ? currentText + ' ' + transcript : transcript;
            userInput.style.height = 'auto'; 
            userInput.style.height = (userInput.scrollHeight) + 'px'; 
        };

        recognition.onend = () => {
            micBtn.classList.remove('listening');
            userInput.placeholder = "Ask CodeQuantum or upload a file...";
            startSmartTips();
        };

        recognition.onerror = (event) => {
            micBtn.classList.remove('listening');
            userInput.placeholder = "Ask CodeQuantum or upload a file...";
            if (event.error === 'not-allowed') showError("Microphone access blocked!");
            startSmartTips();
        };
    } else {
        micBtn.addEventListener('click', () => showError("Voice recognition not supported in this browser."));
    }
}

/* --- ⌨️ SMART INPUT HANDLING (ENTER TO SEND) --- */
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        chatForm.dispatchEvent(new Event('submit')); 
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    
    if (!message && !selectedFile) return;

    userInput.disabled = true; 
    document.getElementById('sendBtn').style.opacity = '0.5';

    let isNewChat = false;
    if (!currentThreadId) {
        await startNewChat();
        isNewChat = true; 
    }

    if (isNewChat && message) updateThreadAPI(currentThreadId, { title: message.substring(0, 25) + (message.length > 25 ? "..." : "") });
    else if (isNewChat && selectedFile) updateThreadAPI(currentThreadId, { title: `File: ${selectedFile.name}` });

    let activeBubble = null;

    if (selectedFile) {
        appendMsg('user', `📎 Uploading document: ${selectedFile.name}...`);
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        try {
            setStaticDisclaimer("📄 Processing your document securely...");
            const uploadRes = await fetch(`${API_URL}/threads/${currentThreadId}/upload`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData
            });
            if (!uploadRes.ok) throw new Error("File upload failed");
            appendMsg('assistant', `I have read **${selectedFile.name}**. What would you like to know about it?`);
            clearAttachment(); 
            if (!message) {
                userInput.disabled = false;
                document.getElementById('sendBtn').style.opacity = '1';
                userInput.focus();
                loadSidebar();
                startSmartTips();
                return; 
            }
        } catch (error) {
            showError(`Upload Error: ${error.message}`);
            userInput.disabled = false;
            document.getElementById('sendBtn').style.opacity = '1';
            startSmartTips();
            return;
        }
    }

    appendMsg('user', message);
    userInput.value = '';
    userInput.style.height = 'auto'; 

    try {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.startsWith("/imagine ") || lowerMsg.startsWith("/create ") || lowerMsg.includes("create an image") || lowerMsg.includes("generate an image") || lowerMsg.includes("create a ")) {
            let imagePrompt = message;
            if (lowerMsg.startsWith("/imagine ")) imagePrompt = message.substring(9);
            else if (lowerMsg.startsWith("/create ")) imagePrompt = message.substring(8);
            
            const contentBox = appendMsg('assistant', '', true);
            
            activeBubble = contentBox.closest('.message-content');
            if (activeBubble) activeBubble.classList.add('ai-generating');

            userInput.disabled = false;
            document.getElementById('sendBtn').style.opacity = '1';
            userInput.focus();
            
            setStaticDisclaimer("🎨 Sending request to the Art AI in the background...");

            try {
                const response = await fetch(`${API_URL}/generate-image`, {
                    method: 'POST', headers: getHeaders(), body: JSON.stringify({ prompt: imagePrompt, thread_id: currentThreadId })
                });
                const data = await response.json();
                if (!response.ok || !data.job_id) throw new Error("Could not start image job.");
                
                const jobId = data.job_id;
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await fetch(`${API_URL}/jobs/${jobId}`);
                        const statusData = await statusRes.json();
                        
                        if (statusData.status === "Complete") {
                            clearInterval(pollInterval); 
                            
                            if (activeBubble) {
                                activeBubble.classList.remove('ai-generating');
                                activeBubble.classList.add('image-message-container'); 
                                activeBubble.style.background = 'transparent';
                                activeBubble.style.padding = '0';
                                activeBubble.style.boxShadow = 'none';
                                
                                const actionBar = activeBubble.querySelector('.action-bar');
                                if (actionBar) actionBar.remove(); 
                            }
                            
                            contentBox.innerHTML = (typeof marked !== 'undefined') ? marked.parse(statusData.content) : statusData.content;
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                            
                        } else if (statusData.status === "Failed") {
                            clearInterval(pollInterval); 
                            if (activeBubble) {
                                activeBubble.classList.remove('ai-generating');
                                const actionBar = activeBubble.querySelector('.action-bar');
                                if (actionBar) actionBar.style.display = 'flex'; 
                            }
                            contentBox.innerHTML = `⚠️ Error: ${statusData.error}`;
                        }
                    } catch (pollError) {
                        clearInterval(pollInterval);
                        if (activeBubble) {
                            activeBubble.classList.remove('ai-generating');
                            const actionBar = activeBubble.querySelector('.action-bar');
                            if (actionBar) actionBar.style.display = 'flex';
                        }
                        contentBox.innerHTML = "⚠️ Lost connection to the server while painting.";
                    }
                }, 5000);

            } catch(startError) {
                if (activeBubble) {
                    activeBubble.classList.remove('ai-generating');
                    const actionBar = activeBubble.querySelector('.action-bar');
                    if (actionBar) actionBar.style.display = 'flex';
                }
                contentBox.innerHTML = `⚠️ ${startError.message}`;
            }
            
        } else {
            
            const selectedPersonaElement = document.getElementById('personaDropdown');
            const selectedPersona = selectedPersonaElement ? selectedPersonaElement.value : "standard";

            setStaticDisclaimer("🧠 CodeQuantum is analyzing your request...");

            const contentBox = appendMsg('assistant', '', true);
            
            activeBubble = contentBox.closest('.message-content');
            if (activeBubble) activeBubble.classList.add('ai-generating');

            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST', 
                headers: getHeaders(), 
                body: JSON.stringify({ 
                    prompt: message, 
                    thread_id: currentThreadId,
                    persona: selectedPersona 
                })
            });
            
            if (!response.ok) throw new Error("Cannot connect to AI. Is your backend running?");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullAiText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                fullAiText += decoder.decode(value, { stream: true });
                contentBox.innerHTML = (typeof marked !== 'undefined') ? marked.parse(fullAiText) : fullAiText;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            
            if (activeBubble) {
                activeBubble.classList.remove('ai-generating');
                const actionBar = activeBubble.querySelector('.action-bar');
                if (actionBar) actionBar.style.display = 'flex'; 
            }
            activeBubble = null;
            
            userInput.disabled = false;
            document.getElementById('sendBtn').style.opacity = '1';
            userInput.focus();
        }
    } catch (error) {
        if (activeBubble) {
            activeBubble.classList.remove('ai-generating');
            const actionBar = activeBubble.querySelector('.action-bar');
            if (actionBar) actionBar.style.display = 'flex';
        }
        showError(`Error: ${error.message}`);
        userInput.disabled = false;
        document.getElementById('sendBtn').style.opacity = '1';
    } finally {
        loadSidebar();
        startSmartTips(); 
    }
});

/* --- 📄 EXPORT TO PDF --- */
function exportPDF() {
    const element = document.getElementById('chatContainer');
    html2pdf().set({
        margin: 0.5, filename: `CodeQuantum_Export.pdf`, image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
}

/* --- 🚀 INITIALIZATION --- */
window.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    startSmartTips(); 
    if(sidebarList) loadSidebar(); 
    else showWelcome(); 
});

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

/* --- ✏️ RENAME, 📌 PIN & 🗑️ DELETE LOGIC --- */
async function updateThreadAPI(threadId, data) {
    try {
        await fetch(`${API_URL}/threads/${threadId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
        loadSidebar(); 
    } catch (error) { console.error("Failed to update thread", error); }
}

function renameChat(threadId, currentTitle) {
    const newTitle = prompt("Rename your conversation:", currentTitle);
    if (newTitle && newTitle.trim() !== "" && newTitle !== currentTitle) updateThreadAPI(threadId, { title: newTitle.trim() });
}

function togglePin(threadId, currentPinState) {
    updateThreadAPI(threadId, { is_pinned: !currentPinState });
}

async function deleteChat(threadId) {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
        const response = await fetch(`${API_URL}/threads/${threadId}`, { method: 'DELETE', headers: getHeaders() });
        if (response.ok) {
            if (currentThreadId === threadId) {
                currentThreadId = null;
                chatContainer.innerHTML = '';
                showWelcome();
            }
            loadSidebar(); 
        }
    } catch (error) { console.error("Delete error:", error); }
}

/* --- 🐛 BUG REPORT MODAL LOGIC WITH SCREENSHOT UPLOAD --- */
const bugModalOverlay = document.getElementById('bugModalOverlay');
const bugReportForm = document.getElementById('bugReportForm');
const submitBugBtn = document.getElementById('submitBugBtn');
const bugFormMessage = document.getElementById('bugFormMessage');

function openBugModal() {
    if (bugModalOverlay) {
        bugModalOverlay.classList.add('active');
    }
}

function closeBugModal() {
    if (bugModalOverlay) {
        bugModalOverlay.classList.remove('active');
        setTimeout(() => {
            if (bugReportForm) {
                bugReportForm.reset();
                document.getElementById('bugScreenshotName').innerHTML = '📸 Click to select a screenshot';
                document.getElementById('bugScreenshotName').style.color = '#5f6368';
            }
            if (bugFormMessage) bugFormMessage.style.display = 'none';
        }, 300); 
    }
}

if (bugModalOverlay) {
    bugModalOverlay.addEventListener('click', (e) => {
        if (e.target === bugModalOverlay) closeBugModal();
    });
}

// Handle Bug Submit with Full Metadata Capture
if (bugReportForm) {
    bugReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('bugTitle').value;
        const description = document.getElementById('bugDescription').value;
        const screenshotInput = document.getElementById('bugScreenshot');
        
        submitBugBtn.disabled = true;
        submitBugBtn.innerHTML = '⏳ Submitting...';
        submitBugBtn.style.opacity = '0.7';

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            
            // ✨ AUTO-CAPTURED FIELDS
            formData.append('time_occurred', new Date().toLocaleString()); 
            formData.append('browser_info', navigator.userAgent); 
            
            if (screenshotInput.files && screenshotInput.files.length > 0) {
                formData.append('screenshot', screenshotInput.files[0]);
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/bugs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            });
            
            if (response.ok) {
                bugFormMessage.style.background = '#e6f4ea';
                bugFormMessage.style.color = '#137333';
                bugFormMessage.innerText = '✅ Bug reported. Metadata & Screenshot captured!';
                bugFormMessage.style.display = 'block';
                setTimeout(closeBugModal, 2000); 
            } else {
                throw new Error('Server returned an error.');
            }
        } catch (err) {
            bugFormMessage.style.background = '#fce8e6';
            bugFormMessage.style.color = '#c5221f';
            bugFormMessage.innerText = '⚠️ Failed to submit bug report. Try again later.';
            bugFormMessage.style.display = 'block';
        } finally {
            submitBugBtn.disabled = false;
            submitBugBtn.innerHTML = 'Submit Bug Report';
            submitBugBtn.style.opacity = '1';
        }
    });
}