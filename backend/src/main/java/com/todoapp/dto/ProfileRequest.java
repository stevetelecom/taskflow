package com.todoapp.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Requete de mise a jour du profil.
 * Champs optionnels ; validation stricte des valeurs autorisees.
 */
public class ProfileRequest {

    @Size(max = 100, message = "Le nom affiche ne doit pas depasser 100 caracteres")
    private String displayName;

    /** Photo : data-URL base64 d'une image (limitée en taille). */
    @Size(max = 500000, message = "Photo trop volumineuse (max ~350 Ko)")
    private String photo;

    @Pattern(regexp = "^(fr|en)$", message = "Langue non supportee (fr ou en)")
    private String language;

    @Pattern(regexp = "^(dark|light)$", message = "Theme invalide (dark ou light)")
    private String theme;

    @Size(max = 50, message = "Fuseau horaire invalide")
    private String timezone;

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
