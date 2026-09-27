package com.todoapp.repository;

import com.todoapp.entity.Notification;
import com.todoapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Acces aux donnees notifications.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Notifications d'un utilisateur, les plus recentes d'abord. */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    /** Compteur de notifications non lues (badge cloche). */
    long countByUserAndReadFalse(User user);

    /** Notifications non lues d'un utilisateur. */
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
}
