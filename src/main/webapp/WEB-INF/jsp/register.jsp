<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - EazyByts Chat</title>
    <link rel="stylesheet" href="/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="form-container">
        <div class="form-card">
            <h1 class="form-title">Join the Conversation</h1>
            <p class="form-subtitle">Create your account to get started</p>
            
            <form id="registerForm">
                <div class="form-group">
                    <label for="firstName" class="form-label">
                        <i class="fas fa-user"></i>
                        First Name
                    </label>
                    <input 
                        type="text" 
                        id="firstName" 
                        name="firstName" 
                        class="form-input" 
                        placeholder="Enter your first name"
                    >
                </div>
                
                <div class="form-group">
                    <label for="lastName" class="form-label">
                        <i class="fas fa-user"></i>
                        Last Name
                    </label>
                    <input 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        class="form-input" 
                        placeholder="Enter your last name"
                    >
                </div>
                
                <div class="form-group">
                    <label for="username" class="form-label">
                        <i class="fas fa-at"></i>
                        Username
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        class="form-input" 
                        placeholder="Choose a username"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="email" class="form-label">
                        <i class="fas fa-envelope"></i>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="form-input" 
                        placeholder="Enter your email"
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
                        placeholder="Create a strong password"
                        required
                        minlength="6"
                    >
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword" class="form-label">
                        <i class="fas fa-lock"></i>
                        Confirm Password
                    </label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        class="form-input" 
                        placeholder="Confirm your password"
                        required
                        minlength="6"
                    >
                </div>
                
                <div id="error-message" class="error hidden"></div>
                <div id="success-message" class="success hidden"></div>
                
                <button type="submit" class="btn btn-primary form-button">
                    <i class="fas fa-user-plus"></i>
                    <span id="register-text">Create Account</span>
                    <div id="register-loading" class="loading hidden"></div>
                </button>
            </form>
            
            <div class="form-link">
                Already have an account? 
                <a href="/login">Sign in here</a>
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
