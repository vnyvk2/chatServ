<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat - EazyByts Chat</title>
    <link rel="stylesheet" href="/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="chat-container">
        <!-- Sidebar -->
        <aside class="chat-sidebar">
            <div class="sidebar-header">
                <div class="user-info">
                    <div class="user-avatar" id="currentUserAvatar">U</div>
                    <div>
                        <div id="currentUserName">Loading...</div>
                        <div id="currentUserStatus" style="font-size: 12px; opacity: 0.8;">Online</div>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline" style="margin-left: auto; padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
                
                <div class="sidebar-tabs">
                    <button class="tab-button active" data-tab="rooms">
                        <i class="fas fa-users"></i>
                        Rooms
                    </button>
                    <button class="tab-button" data-tab="users">
                        <i class="fas fa-user-friends"></i>
                        Users
                    </button>
                </div>
            </div>
            
            <div class="sidebar-content">
                <!-- Chat Rooms Tab -->
                <div id="rooms-tab" class="tab-content">
                    <div class="room-list">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Chat Rooms</h3>
                            <button id="createRoomBtn" class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;">
                                <i class="fas fa-plus"></i>
                                New
                            </button>
                        </div>
                        <div id="roomsList">
                            <!-- Rooms will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Users Tab -->
                <div id="users-tab" class="tab-content hidden">
                    <div class="user-list">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Online Users</h3>
                            <input type="text" id="userSearch" placeholder="Search users..." style="padding: 4px 8px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        </div>
                        <div id="usersList">
                            <!-- Online users will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Chat Area -->
        <main class="chat-main">
            <div class="chat-header-main">
                <div class="chat-info">
                    <div class="room-avatar" id="currentChatAvatar">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div>
                        <h2 id="currentChatName" style="margin: 0; font-size: 18px; font-weight: 600;">Select a chat room</h2>
                        <p id="currentChatStatus" style="margin: 0; font-size: 12px; color: #6b7280;">Choose a room to start chatting</p>
                    </div>
                </div>
                
                <div id="chatActions" class="hidden">
                    <button id="leaveRoomBtn" class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-sign-out-alt"></i>
                        Leave Room
                    </button>
                </div>
            </div>
            
            <div class="chat-messages-container" id="messagesContainer">
                <!-- Messages will be populated here -->
                <div id="welcomeMessage" class="text-center" style="padding: 2rem; color: #6b7280;">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>Welcome to EazyByts Chat!</h3>
                    <p>Select a chat room or start a private conversation to begin messaging.</p>
                </div>
            </div>
            
            <div class="chat-input" id="chatInputContainer" style="display: none;">
                <div class="input-group">
                    <textarea 
                        id="messageInput" 
                        class="message-input" 
                        placeholder="Type a message..." 
                        rows="1"
                    ></textarea>
                    <button id="sendBtn" class="send-button">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </main>
    </div>

    <!-- Create Room Modal -->
    <div id="createRoomModal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Chat Room</h3>
                <button id="closeModalBtn" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="createRoomForm">
                <div class="form-group">
                    <label for="roomName">Room Name</label>
                    <input type="text" id="roomName" name="name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="roomDescription">Description (optional)</label>
                    <textarea id="roomDescription" name="description" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="isPrivate" name="isPrivate"> 
                        Private Room
                    </label>
                </div>
                <button type="submit" class="btn btn-primary">Create Room</button>
            </form>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>
    <script src="/js/chat.js"></script>

    <style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        width: 90%;
        max-width: 400px;
        max-height: 80%;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6b7280;
    }

    .close-btn:hover {
        color: #374151;
    }

    .text-center {
        text-align: center;
    }

    .tab-content {
        display: block;
    }
    
    .tab-content.hidden {
        display: none;
    }
    </style>
</body>
</html>
