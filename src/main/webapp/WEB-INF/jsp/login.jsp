<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - EazyByts Chat</title>
    <link rel="stylesheet" href="/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="form-container">
        <div class="form-card">
            <h1 class="form-title">Welcome Back</h1>
            <p class="form-subtitle">Sign in to continue chatting</p>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="username" class="form-label">
                        <i class="fas fa-user"></i>
                        Username
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        class="form-input" 
                        placeholder="Enter your username"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="password" class="form-label">
                        <i class="fas fa-lock"></i>
                        Password
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-input" 
                        placeholder="Enter your password"
                        required
                    >
                </div>
                
                <div id="error-message" class="error hidden"></div>
                <div id="success-message" class="success hidden"></div>
                
                <button type="submit" class="btn btn-primary form-button">
                    <i class="fas fa-sign-in-alt"></i>
                    <span id="login-text">Sign In</span>
                    <div id="login-loading" class="loading hidden"></div>
                </button>
            </form>
            
            <div class="form-link">
                Don't have an account? 
                <a href="/register">Create one here</a>
            </div>
            
            <div class="form-link">
                <a href="/">
                    <i class="fas fa-arrow-left"></i>
                    Back to Home
                </a>
            </div>
        </div>
    </div>

    <script src="/js/auth.js"></script>
</body>
</html>
