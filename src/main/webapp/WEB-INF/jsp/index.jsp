<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EazyByts Chat Application</title>
    <link rel="stylesheet" href="/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="landing-container">
        <header class="header">
            <nav class="navbar">
                <div class="nav-brand">
                    <i class="fas fa-comments"></i>
                    <span>EazyByts Chat</span>
                </div>
                <div class="nav-links">
                    <a href="/login" class="btn btn-outline">Login</a>
                    <a href="/register" class="btn btn-primary">Get Started</a>
                </div>
            </nav>
        </header>

        <main class="main-content">
            <section class="hero">
                <div class="hero-content">
                    <h1 class="hero-title">Connect, Chat, Collaborate</h1>
                    <p class="hero-subtitle">
                        Experience seamless real-time communication with secure messaging, 
                        private conversations, and collaborative chat rooms.
                    </p>
                    <div class="hero-actions">
                        <a href="/register" class="btn btn-primary btn-large">
                            <i class="fas fa-rocket"></i>
                            Start Chatting
                        </a>
                        <a href="/login" class="btn btn-secondary btn-large">
                            <i class="fas fa-sign-in-alt"></i>
                            Sign In
                        </a>
                    </div>
                </div>
                <div class="hero-image">
                    <div class="chat-preview">
                        <div class="chat-window">
                            <div class="chat-header">
                                <i class="fas fa-users"></i>
                                <span>General Discussion</span>
                            </div>
                            <div class="chat-messages">
                                <div class="message">
                                    <div class="message-avatar">A</div>
                                    <div class="message-content">
                                        <span class="message-author">Alice</span>
                                        <span class="message-text">Welcome to our chat app!</span>
                                    </div>
                                </div>
                                <div class="message">
                                    <div class="message-avatar">B</div>
                                    <div class="message-content">
                                        <span class="message-author">Bob</span>
                                        <span class="message-text">This is amazing! Real-time messaging 🚀</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="features">
                <div class="container">
                    <h2 class="features-title">Why Choose Our Chat App?</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-bolt"></i>
                            </div>
                            <h3>Real-time Messaging</h3>
                            <p>Instant message delivery with WebSocket technology for seamless communication.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <h3>Secure Authentication</h3>
                            <p>JWT-based authentication with encrypted message storage for maximum security.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <h3>Chat Rooms</h3>
                            <p>Create and join public chat rooms or enjoy private conversations with friends.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <h3>Smart Notifications</h3>
                            <p>Never miss a message with real-time notifications and unread message indicators.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <h3>Responsive Design</h3>
                            <p>Perfect experience across all devices - desktop, tablet, and mobile.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <h3>Search & Discovery</h3>
                            <p>Find users and chat rooms easily with our powerful search functionality.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 EazyByts Chat Application. Built with Spring Boot & WebSocket.</p>
            </div>
        </footer>
    </div>
</body>
</html>
