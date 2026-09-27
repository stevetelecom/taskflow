package com.todoapp.service;

import com.todoapp.entity.Notification;
import com.todoapp.entity.User;
import com.todoapp.repository.NotificationRepository;
import com.todoapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de notifications in-app.
 * Les notifications sont generees automatiquement lors des actions
 * sur les taches (creation, completion, suppression...) via create().
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /** Liste des notifications de l'utilisateur (les plus recentes d'abord). */
    @Transactional(readOnly = true)
    public List<Notification> list(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /** Nombre de notifications non lues (badge de la cloche). */
    @Transactional(readOnly = true)
    public long unreadCount(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByUserAndReadFalse(user);
    }

    /** Marque une notification comme lue. */
    @Transactional
    public void markAsRead(String username, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getUsername().equals(username))
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /** Marque toutes les notifications de l'utilisateur comme lues. */
    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return;
        }
        List<Notification> unread =
                notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /** Supprime une notification. */
    @Transactional
    public void delete(String username, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getUsername().equals(username))
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        notificationRepository.delete(notification);
    }

    /**
     * Cree une notification pour un utilisateur (appele par TaskService).
     * Methode utilitaire : ne leve jamais d'exception pour ne pas bloquer
     * l'action metier principale.
     */
    @Transactional
    public void create(String username, String type, String message) {
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                return;
            }
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setMessage(message);
            notificationRepository.save(notification);
        } catch (Exception e) {
            // Une notification ne doit jamais faire echouer l'action metier
        }
    }
}
