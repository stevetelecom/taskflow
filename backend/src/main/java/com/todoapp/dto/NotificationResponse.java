package com.todoapp.dto;

import com.todoapp.entity.Notification;

import java.time.LocalDateTime;

/**
 * Reponse notification envoyee au frontend.
 */
public class NotificationResponse {

    private Long id;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse dto = new NotificationResponse();
        dto.id = notification.getId();
        dto.message = notification.getMessage();
        dto.type = notification.getType();
        dto.read = notification.isRead();
        dto.createdAt = notification.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
