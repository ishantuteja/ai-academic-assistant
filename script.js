document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileUpload = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const fileCount = document.getElementById('file-count');
    const chatArea = document.getElementById('chat-area');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const clearChatBtn = document.getElementById('clear-chat-btn');

    // API URL - Uses relative path so it works both locally and in production
    const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
        ? 'http://127.0.0.1:5000/api' 
        : '/api';

    // State
    let files = [];
    let isWaitingForResponse = false;

    // Theme Management
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    };

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ?
            '<i class="fa-solid fa-sun"></i>' :
            '<i class="fa-solid fa-moon"></i>';
    });

    initTheme();

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') {
            this.style.height = 'auto';
        }
    });

    // File Upload Handler
    fileUpload.addEventListener('change', async (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            const formData = new FormData();
            let addedNew = false;

            newFiles.forEach(file => {
                if (!files.some(f => f.name === file.name && f.size === file.size)) {
                    files.push(file);
                    formData.append('files', file);
                    addedNew = true;
                }
            });

            if (addedNew) {
                renderFileList();

                // Show a system message for upload parsing
                addMessage("Uploading and indexing documents...", 'sys');
                isWaitingForResponse = true;

                try {
                    const response = await fetch(`${API_BASE_URL}/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        addMessage(`✅ ${data.message} You can now ask me questions!`, 'sys');
                    } else {
                        addMessage(`❌ Upload error: ${data.error}`, 'sys');
                        // Remove the failed files from UI list
                        newFiles.forEach(nf => {
                            files = files.filter(f => f.name !== nf.name);
                        });
                        renderFileList();
                    }
                } catch (error) {
                    addMessage("❌ Connection error: Could not reach the backend server. Please try again shortly.", 'sys');
                    newFiles.forEach(nf => {
                        files = files.filter(f => f.name !== nf.name);
                    });
                    renderFileList();
                }
                isWaitingForResponse = false;
            }
            fileUpload.value = '';
        }
    });

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'pdf') return '<i class="fa-solid fa-file-pdf"></i>';
        if (['doc', 'docx'].includes(ext)) return '<i class="fa-solid fa-file-word" style="color:#2563eb;"></i>';
        if (ext === 'txt') return '<i class="fa-solid fa-file-lines" style="color:#4b5563;"></i>';
        return '<i class="fa-solid fa-file"></i>';
    }

    window.removeFile = function (index) {
        files.splice(index, 1);
        renderFileList();
        // Since we are using FAISS in memory, removing a file visually doesn't 
        // automatically remove it from the backend unless we write an endpoint for it.
        // For prototype purposes, this is fine visually.
    };

    function renderFileList() {
        fileList.innerHTML = '';
        fileCount.textContent = files.length;

        if (files.length === 0) {
            fileList.innerHTML = `
                <li class="file-item placeholder">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>No documents uploaded yet</p>
                </li>
            `;
            return;
        }

        files.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';

            li.innerHTML = `
                <div class="file-name-container">
                    ${getFileIcon(file.name)}
                    <span class="file-name" title="${file.name}">${file.name}</span>
                </div>
                <button class="file-remove-btn" onclick="removeFile(${index})" title="Remove file">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            fileList.appendChild(li);
        });
    }

    // Chat Logic
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');

        if (sender === 'sys') {
            messageDiv.className = 'message ai-message';
            messageDiv.style.opacity = '0.8';
        } else {
            messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        }

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `avatar ${(sender === 'ai' || sender === 'sys') ? 'ai-avatar' : ''}`;

        if (sender === 'user') {
            avatarDiv.innerHTML = '<i class="fa-solid fa-user"></i>';
        } else if (sender === 'sys') {
            avatarDiv.innerHTML = '<i class="fa-solid fa-gear"></i>';
            avatarDiv.style.background = 'transparent';
            avatarDiv.style.color = 'var(--text-muted)';
            avatarDiv.style.boxShadow = 'none';
        } else {
            avatarDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Basic markdown formatting (bold)
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        contentDiv.innerHTML = formattedText;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        chatArea.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message ai-message typing-indicator-msg';
        indicatorDiv.id = 'typing-indicator';

        indicatorDiv.innerHTML = `
            <div class="avatar ai-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        chatArea.appendChild(indicatorDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: 'smooth'
        });
    }

    async function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text || isWaitingForResponse) return;

        // Add user message
        addMessage(text, 'user');

        // Reset input
        userInput.value = '';
        userInput.style.height = 'auto';
        isWaitingForResponse = true;

        showTypingIndicator();

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            hideTypingIndicator();
            const data = await response.json();

            if (response.ok) {
                addMessage(data.response, 'ai');
            } else {
                addMessage(`❌ Error: ${data.error}`, 'sys');
            }
        } catch (error) {
            hideTypingIndicator();
            addMessage("❌ Connection error: Could not reach the backend server. Please try again shortly.", 'sys');
        }

        isWaitingForResponse = false;
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleUserMessage);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line
            handleUserMessage();
        }
    });

    clearChatBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Keep only the initial greeting
            const firstMessage = chatArea.firstElementChild.cloneNode(true);
            chatArea.innerHTML = '';
            chatArea.appendChild(firstMessage);
        }
    });

});
