// Chat Application
class ChatApp {
    constructor() {
        this.baseUrl = '';
        this.token = localStorage.getItem('jwt_token');
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
        this.stompClient = null;
        this.currentRoom = null;
        this.currentChatType = 'room'; // 'room' or 'private'
        this.currentPrivateUser = null;
        this.connected = false;
        
        if (!this.token || !this.currentUser) {
            window.location.href = '/login';
            return;
        }
        
        this.init();
    }

    init() {
        this.setupUI();
        this.bindEvents();
        this.loadInitialData();
        this.connectWebSocket();
    }

    setupUI() {
        // Set current user info
        const userAvatar = document.getElementById('currentUserAvatar');
        const userName = document.getElementById('currentUserName');
        
        if (userAvatar && userName) {
            userAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
            userName.textContent = this.currentUser.firstName 
                ? `${this.currentUser.firstName} ${this.currentUser.lastName || ''}`.trim()
                : this.currentUser.username;
        }
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Create room modal
        const createRoomBtn = document.getElementById('createRoomBtn');
        const createRoomModal = document.getElementById('createRoomModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const createRoomForm = document.getElementById('createRoomForm');

        if (createRoomBtn && createRoomModal) {
            createRoomBtn.addEventListener('click', () => {
                createRoomModal.classList.remove('hidden');
            });
        }

        if (closeModalBtn && createRoomModal) {
            closeModalBtn.addEventListener('click', () => {
                createRoomModal.classList.add('hidden');
            });
        }

        if (createRoomForm) {
            createRoomForm.addEventListener('submit', (e) => this.handleCreateRoom(e));
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            messageInput.addEventListener('input', () => {
                messageInput.style.height = 'auto';
                messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Leave room
        const leaveRoomBtn = document.getElementById('leaveRoomBtn');
        if (leaveRoomBtn) {
            leaveRoomBtn.addEventListener('click', () => this.leaveCurrentRoom());
        }

        // User search
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            let searchTimeout;
            userSearch.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.searchUsers(userSearch.value), 300);
            });
        }
    }

    async loadInitialData() {
        await Promise.all([
            this.loadRooms(),
            this.loadOnlineUsers()
        ]);
    }

    async loadRooms() {
        try {
            const response = await fetch('/api/chatrooms/public', {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const rooms = await response.json();
                this.displayRooms(rooms);
            }
        } catch (error) {
            console.error('Failed to load rooms:', error);
        }
    }

    async loadOnlineUsers() {
        try {
            const response = await fetch('/api/users/online', {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const users = await response.json();
                this.displayUsers(users.filter(user => user.id !== this.currentUser.id));
            }
        } catch (error) {
            console.error('Failed to load online users:', error);
        }
    }

    displayRooms(rooms) {
        const roomsList = document.getElementById('roomsList');
        if (!roomsList) return;

        if (rooms.length === 0) {
            roomsList.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #6b7280;">
                    <i class="fas fa-comments" style="font-size: 24px; opacity: 0.5; margin-bottom: 0.5rem;"></i>
                    <p>No chat rooms available</p>
                </div>
            `;
            return;
        }

        roomsList.innerHTML = rooms.map(room => `
            <div class="room-item" data-room-id="${room.id}" onclick="chatApp.joinRoom(${room.id}, '${room.name}')">
                <div class="room-avatar">${room.name.charAt(0).toUpperCase()}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px;">${room.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${room.description || 'No description'}
                    </div>
                </div>
                <div style="font-size: 10px; color: #9ca3af;">
                    ${room.members ? room.members.length : 0} members
                </div>
            </div>
        `).join('');
    }

    displayUsers(users) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        if (users.length === 0) {
            usersList.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #6b7280;">
                    <i class="fas fa-users" style="font-size: 24px; opacity: 0.5; margin-bottom: 0.5rem;"></i>
                    <p>No users online</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-item" data-user-id="${user.id}" onclick="chatApp.startPrivateChat('${user.username}', '${user.firstName || user.username}')">
                <div class="user-list-avatar">${user.username.charAt(0).toUpperCase()}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px;">
                        ${user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">@${user.username}</div>
                </div>
                ${user.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
        `).join('');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');

        // Refresh data for the active tab
        if (tabName === 'rooms') {
            this.loadRooms();
        } else if (tabName === 'users') {
            this.loadOnlineUsers();
        }
    }

    async handleCreateRoom(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const roomData = {
            name: formData.get('name'),
            description: formData.get('description'),
            isPrivate: formData.get('isPrivate') === 'on'
        };

        try {
            const response = await fetch('/api/chatrooms/create', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(roomData)
            });

            if (response.ok) {
                // Close modal and refresh rooms
                document.getElementById('createRoomModal').classList.add('hidden');
                form.reset();
                await this.loadRooms();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create room');
            }
        } catch (error) {
            console.error('Create room error:', error);
            alert('Network error. Please try again.');
        }
    }

    async joinRoom(roomId, roomName) {
        try {
            // Join room via API
            const response = await fetch(`/api/chatrooms/${roomId}/join`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.currentRoom = { id: roomId, name: roomName };
                this.currentChatType = 'room';
                this.currentPrivateUser = null;
                
                // Update UI
                this.updateChatHeader(roomName, `Room • Click to view members`);
                
                // Clear and load messages
                await this.loadRoomMessages(roomId);
                
                // Show chat input
                document.getElementById('chatInputContainer').style.display = 'flex';
                document.getElementById('welcomeMessage').style.display = 'none';
                document.getElementById('chatActions').classList.remove('hidden');
                
                // Update room selection
                this.updateRoomSelection(roomId);
                
                // Subscribe to room messages
                this.subscribeToRoom(roomId);
                
                // Send join notification
                this.sendJoinMessage(roomId);
                
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to join room');
            }
        } catch (error) {
            console.error('Join room error:', error);
            alert('Failed to join room');
        }
    }

    async startPrivateChat(username, displayName) {
        this.currentRoom = null;
        this.currentChatType = 'private';
        this.currentPrivateUser = { username, displayName };
        
        // Update UI
        this.updateChatHeader(`${displayName}`, `Private conversation with @${username}`);
        
        // Load private messages
        await this.loadPrivateMessages(username);
        
        // Show chat input
        document.getElementById('chatInputContainer').style.display = 'flex';
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('chatActions').classList.add('hidden');
        
        // Update user selection
        this.updateUserSelection(username);
        
        // Subscribe to private messages
        this.subscribeToPrivateMessages();
    }

    async loadRoomMessages(roomId) {
        try {
            const response = await fetch(`/api/chatrooms/${roomId}/messages`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const messages = await response.json();
                this.displayMessages(messages);
            }
        } catch (error) {
            console.error('Failed to load room messages:', error);
        }
    }

    async loadPrivateMessages(username) {
        try {
            const response = await fetch(`/api/messages/private/${username}`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const messages = await response.json();
                this.displayMessages(messages);
            }
        } catch (error) {
            console.error('Failed to load private messages:', error);
        }
    }

    displayMessages(messages) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-comment" style="font-size: 48px; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>No messages yet</h3>
                    <p>Be the first to send a message!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(message => this.createMessageHTML(message)).join('');
        this.scrollToBottom();
    }

    createMessageHTML(message) {
        const isOwn = message.sender.username === this.currentUser.username;
        const time = new Date(message.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const senderName = message.sender.firstName 
            ? `${message.sender.firstName} ${message.sender.lastName || ''}`.trim()
            : message.sender.username;

        return `
            <div class="message-item ${isOwn ? 'own' : ''}" data-message-id="${message.id}">
                <div class="message-avatar-chat">${message.sender.username.charAt(0).toUpperCase()}</div>
                <div class="message-bubble">
                    <div class="message-header">
                        <span class="message-sender">${senderName}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(message.content)}</div>
                </div>
            </div>
        `;
    }

    updateChatHeader(name, status) {
        const nameEl = document.getElementById('currentChatName');
        const statusEl = document.getElementById('currentChatStatus');
        const avatarEl = document.getElementById('currentChatAvatar');
        
        if (nameEl) nameEl.textContent = name;
        if (statusEl) statusEl.textContent = status;
        if (avatarEl) {
            avatarEl.innerHTML = this.currentChatType === 'room' 
                ? `<i class="fas fa-users"></i>` 
                : name.charAt(0).toUpperCase();
        }
    }

    updateRoomSelection(roomId) {
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-room-id="${roomId}"]`)?.classList.add('active');
    }

    updateUserSelection(username) {
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });
        // Find user item by username and mark as active
        document.querySelectorAll('.user-item').forEach(item => {
            const userText = item.querySelector('div:nth-child(2)').textContent;
            if (userText.includes(`@${username}`)) {
                item.classList.add('active');
            }
        });
    }

    connectWebSocket() {
        const socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);
        
        // Add authentication headers
        const headers = {
            'Authorization': `Bearer ${this.token}`
        };

        this.stompClient.connect(headers, 
            () => {
                console.log('WebSocket connected');
                this.connected = true;
                this.subscribeToPrivateMessages();
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                this.connected = false;
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.connectWebSocket(), 3000);
            }
        );
    }

    subscribeToRoom(roomId) {
        if (!this.stompClient || !this.connected) return;
        
        // Unsubscribe from previous room if any
        if (this.roomSubscription) {
            this.roomSubscription.unsubscribe();
        }
        
        this.roomSubscription = this.stompClient.subscribe(`/topic/public/${roomId}`, 
            (message) => {
                const chatMessage = JSON.parse(message.body);
                this.handleIncomingMessage(chatMessage);
            }
        );
    }

    subscribeToPrivateMessages() {
        if (!this.stompClient || !this.connected) return;
        
        if (this.privateSubscription) {
            this.privateSubscription.unsubscribe();
        }
        
        this.privateSubscription = this.stompClient.subscribe(`/user/queue/messages`, 
            (message) => {
                const chatMessage = JSON.parse(message.body);
                this.handleIncomingMessage(chatMessage);
            }
        );
    }

    handleIncomingMessage(chatMessage) {
        // Only add message if it's for the current chat
        if (this.currentChatType === 'room' && this.currentRoom && chatMessage.chatRoomId === this.currentRoom.id) {
            this.addMessageToChat(chatMessage);
        } else if (this.currentChatType === 'private' && this.currentPrivateUser && 
                  (chatMessage.sender === this.currentPrivateUser.username || chatMessage.sender === this.currentUser.username)) {
            this.addMessageToChat(chatMessage);
        }
        
        // Show notification for messages not in current chat
        if (chatMessage.sender !== this.currentUser.username) {
            this.showNotification(chatMessage);
        }
    }

    addMessageToChat(chatMessage) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        // Remove welcome message if it exists
        const welcomeMsg = container.querySelector('div[style*="text-align: center"]');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        // Create message object in the format expected by createMessageHTML
        const message = {
            id: chatMessage.id || Date.now(),
            content: chatMessage.content,
            sentAt: chatMessage.timestamp || new Date().toISOString(),
            sender: {
                username: chatMessage.sender,
                firstName: chatMessage.sender // This could be enhanced with actual user data
            }
        };

        const messageHTML = this.createMessageHTML(message);
        container.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !this.stompClient || !this.connected) return;

        const content = messageInput.value.trim();
        if (!content) return;

        if (this.currentChatType === 'room' && this.currentRoom) {
            this.sendRoomMessage(content);
        } else if (this.currentChatType === 'private' && this.currentPrivateUser) {
            this.sendPrivateMessage(content);
        }

        messageInput.value = '';
        messageInput.style.height = 'auto';
    }

    sendRoomMessage(content) {
        const message = {
            content: content,
            type: 'CHAT',
            chatRoomId: this.currentRoom.id
        };

        this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
    }

    sendPrivateMessage(content) {
        const message = {
            content: content,
            type: 'PRIVATE',
            recipient: this.currentPrivateUser.username
        };

        this.stompClient.send('/app/chat.sendPrivateMessage', {}, JSON.stringify(message));
    }

    sendJoinMessage(roomId) {
        if (!this.stompClient || !this.connected) return;
        
        const message = {
            type: 'JOIN',
            chatRoomId: roomId
        };

        this.stompClient.send('/app/chat.addUser', {}, JSON.stringify(message));
    }

    async leaveCurrentRoom() {
        if (!this.currentRoom) return;

        try {
            const response = await fetch(`/api/chatrooms/${this.currentRoom.id}/leave`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                // Reset chat state
                this.currentRoom = null;
                this.currentChatType = 'room';
                
                // Update UI
                document.getElementById('currentChatName').textContent = 'Select a chat room';
                document.getElementById('currentChatStatus').textContent = 'Choose a room to start chatting';
                document.getElementById('chatInputContainer').style.display = 'none';
                document.getElementById('chatActions').classList.add('hidden');
                document.getElementById('welcomeMessage').style.display = 'block';
                document.getElementById('messagesContainer').innerHTML = document.getElementById('welcomeMessage').outerHTML;
                
                // Clear room selection
                document.querySelectorAll('.room-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Unsubscribe from room
                if (this.roomSubscription) {
                    this.roomSubscription.unsubscribe();
                }
            }
        } catch (error) {
            console.error('Leave room error:', error);
        }
    }

    async searchUsers(query) {
        if (!query.trim()) {
            this.loadOnlineUsers();
            return;
        }

        try {
            const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const users = await response.json();
                this.displayUsers(users.filter(user => user.id !== this.currentUser.id));
            }
        } catch (error) {
            console.error('Search users error:', error);
        }
    }

    showNotification(chatMessage) {
        // This is a basic notification - could be enhanced with browser notifications
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${chatMessage.sender}`, {
                body: chatMessage.content,
                icon: '/favicon.ico'
            });
        }
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async logout() {
        try {
            await fetch('/api/auth/signout', {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Disconnect WebSocket
            if (this.stompClient && this.connected) {
                this.stompClient.disconnect();
            }
            
            // Clear local storage
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            
            // Redirect to home page
            window.location.href = '/';
        }
    }
}

// Initialize chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    window.chatApp = new ChatApp();
});
