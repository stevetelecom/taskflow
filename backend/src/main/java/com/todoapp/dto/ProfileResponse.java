package com.todoapp.dto;

import com.todoapp.entity.User;

/**
 * Reponse profil : toutes les donnees non sensibles de l'utilisateur.
 */
public class ProfileResponse {

    private Long id;
    private String username;
    private String displayName;
    private String photo;
    private String language;
    private String theme;
    private String timezone;

    public static ProfileResponse fromEntity(User user) {
        ProfileResponse dto = new ProfileResponse();
        dto.id = user.getId();
        dto.username = user.getUsername();
        dto.displayName = user.getDisplayName();
        dto.photo = user.getPhoto();
        dto.language = user.getLanguage();
        dto.theme = user.getTheme();
        dto.timezone = user.getTimezone();
        return dto;
    }

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
}
