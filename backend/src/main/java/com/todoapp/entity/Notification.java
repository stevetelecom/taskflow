package com.todoapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Notification in-app : message genere lors des actions CRUD
 * sur les taches de l'utilisateur (ex. "Tache terminee").
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Proprietaire de la notification. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Texte du message (deja traduit cote backend minimal / cle i18n). */
    @NotBlank
    @Size(max = 300)
    @Column(nullable = false, length = 300)
    private String message;

    /** Cle i18n du type : task_created, task_completed, task_deleted... */
    @Size(max = 50)
    @Column(length = 50)
    private String type;

    /** Lue ou non (badge de la cloche). Nom de colonne explicite : "read" est
     * un mot reserve MySQL, on utilise "is_read" pour eviter l'erreur SQL 1064. */
    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    /** Date de creation. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
