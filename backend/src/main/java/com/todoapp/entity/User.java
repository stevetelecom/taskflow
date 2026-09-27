package com.todoapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/**
 * Entite utilisateur : compte d'acces a l'application.
 * Le mot de passe est stocke hache (BCrypt), jamais en clair.
 */
@Entity
@Table(name = "users",
       uniqueConstraints = @UniqueConstraint(columnNames = "username"))
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom d'utilisateur unique, 3 a 50 caracteres. */
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caracteres")
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /** Nom affiche optionnel (profil). */
    @Size(max = 100, message = "Le nom affiche ne doit pas depasser 100 caracteres")
    @Column(length = 100)
    private String displayName;

    /** Photo de profil : data-URL (image petite) ou URL externe, validee. */
    @Size(max = 500000, message = "Photo trop volumineuse")
    @Column(length = 500000, columnDefinition = "TEXT")
    private String photo;

    /** Langue de l'interface : "fr" ou "en" (preference i18n). */
    @Size(max = 5)
    @Column(length = 5)
    private String language = "fr";

    /** Theme de l'interface : "dark" ou "light" (preference). */
    @Size(max = 10)
    @Column(length = 10)
    private String theme = "dark";

    /** Fuseau horaire (profil). */
    @Size(max = 50)
    @Column(length = 50)
    private String timezone = "UTC";

    /** Mot de passe hache BCrypt (60 caracteres). */
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(nullable = false, length = 100)
    private String passwordHash;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    public User() {
    }

    public User(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
    }

    // --- Getters / Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
}
