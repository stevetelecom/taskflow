package com.todoapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Entite tache : appartient a un utilisateur.
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Titre de la tache, 1 a 200 caracteres. */
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 1, max = 200, message = "Le titre doit contenir entre 1 et 200 caracteres")
    @Column(nullable = false, length = 200)
    private String title;

    /** Description optionnelle, 500 caracteres max. */
    @Size(max = 500, message = "La description ne doit pas depasser 500 caracteres")
    @Column(length = 500)
    private String description;

    /** Tache terminee ou non. */
    @Column(nullable = false)
    private boolean done = false;

    /** Date de creation (auto-remplie). */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Date de derniere modification. */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** Proprietaire de la tache. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters / Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
