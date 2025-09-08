-- EazyByts Chat Application Database Schema
-- This file contains the SQL schema for the chat application

-- Create database (run this manually if needed)
-- CREATE DATABASE chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE chatdb;

-- Note: The following tables will be created automatically by Hibernate/JPA
-- This file is for reference and manual setup if needed

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

-- User-Role mapping table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat room members table
CREATE TABLE IF NOT EXISTS chat_room_members (
    chat_room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (chat_room_id, user_id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    sender_id BIGINT NOT NULL,
    chat_room_id BIGINT,
    recipient_id BIGINT,
    message_type VARCHAR(10) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT IGNORE INTO roles (name) VALUES 
('ROLE_USER'),
('ROLE_MODERATOR'),
('ROLE_ADMIN');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_private ON chat_rooms(is_private);

-- Sample data (optional - for testing)
-- Uncomment the following lines to insert sample data

/*
-- Sample users (passwords are 'password123' encrypted with BCrypt)
INSERT INTO users (username, email, password, first_name, last_name, is_online) VALUES
('john_doe', 'john@example.com', '$2a$10$rKjHPrHqHqZYavFG.Bs6/.qzjE1rZABmW.XpVzC6JWLf7C0HU1xqa', 'John', 'Doe', true),
('jane_smith', 'jane@example.com', '$2a$10$rKjHPrHqHqZYavFG.Bs6/.qzjE1rZABmW.XpVzC6JWLf7C0HU1xqa', 'Jane', 'Smith', false),
('mike_wilson', 'mike@example.com', '$2a$10$rKjHPrHqHqZYavFG.Bs6/.qzjE1rZABmW.XpVzC6JWLf7C0HU1xqa', 'Mike', 'Wilson', true);

-- Assign USER role to all sample users
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r WHERE r.name = 'ROLE_USER';

-- Sample chat rooms
INSERT INTO chat_rooms (name, description, is_private, created_by) VALUES
('General Discussion', 'Main chat room for general topics', false, 1),
('Tech Talk', 'Discuss technology and programming', false, 2),
('Random Chat', 'Chat about anything and everything', false, 3);

-- Add users to chat rooms
INSERT INTO chat_room_members (chat_room_id, user_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 2), (3, 3);

-- Sample messages
INSERT INTO messages (content, sender_id, chat_room_id, message_type, sent_at) VALUES
('Welcome to the General Discussion room!', 1, 1, 'CHAT', NOW()),
('Hello everyone! 👋', 2, 1, 'CHAT', NOW()),
('Great to be here!', 3, 1, 'CHAT', NOW());
*/
