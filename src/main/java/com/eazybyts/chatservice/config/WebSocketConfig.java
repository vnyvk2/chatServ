package com.eazybyts.chatservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint that clients will use to connect to the WebSocket server
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable a simple in-memory message broker to carry the messages back to the client on destinations prefixed with "/topic"
        registry.enableSimpleBroker("/topic", "/queue");
        
        // Define prefix for messages that are bound for @MessageMapping-annotated methods
        registry.setApplicationDestinationPrefixes("/app");
        
        // Set prefix for user-specific destinations
        registry.setUserDestinationPrefix("/user");
    }
}
