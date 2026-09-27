package com.todoapp.controller;

import com.todoapp.dto.NotificationResponse;
import com.todoapp.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints proteges des notifications in-app.
 * GET    /api/notifications          : liste
 * GET    /api/notifications/unread   : compteur non lues (badge cloche)
 * PUT    /api/notifications/{id}/read    : marquer comme lue
 * PUT    /api/notifications/read-all     : tout marquer comme lu
 * DELETE /api/notifications/{id}         : supprimer
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(Authentication authentication) {
        return ResponseEntity.ok(notificationService.list(authentication.getName())
                .stream().map(NotificationResponse::fromEntity).toList());
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count",
                notificationService.unreadCount(authentication.getName())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable Long id) {
        notificationService.markAsRead(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        notificationService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
