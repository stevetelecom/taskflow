package com.todoapp.service;

import com.todoapp.dto.PasswordChangeRequest;
import com.todoapp.dto.ProfileRequest;
import com.todoapp.dto.ProfileResponse;
import com.todoapp.entity.User;
import com.todoapp.exception.ApiException;
import com.todoapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion du profil utilisateur.
 * - Lecture et mise a jour des preferences (langue, theme, photo...)
 * - Changement de mot de passe avec verification de l'ancien
 */
@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Renvoie le profil de l'utilisateur connecte. */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String username) {
        return ProfileResponse.fromEntity(requireUser(username));
    }

    /**
     * Met a jour le profil. Seuls les champs fournis (non null) sont modifies.
     */
    @Transactional
    public ProfileResponse updateProfile(String username, ProfileRequest request) {
        User user = requireUser(username);

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getPhoto() != null) {
            validatePhoto(request.getPhoto());
            user.setPhoto(request.getPhoto());
        }
        if (request.getLanguage() != null) {
            user.setLanguage(request.getLanguage());
        }
        if (request.getTheme() != null) {
            user.setTheme(request.getTheme());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone().trim());
        }

        return ProfileResponse.fromEntity(userRepository.save(user));
    }

    /**
     * Changement de mot de passe : verifie l'ancien, hache le nouveau.
     * Message d'erreur identique si l'ancien mot de passe est faux.
     */
    @Transactional
    public void changePassword(String username, PasswordChangeRequest request) {
        User user = requireUser(username);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException("Mot de passe actuel incorrect", 400);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /** Verifie que la photo est une data-URL image base64 valide. */
    private void validatePhoto(String photo) {
        if (photo.length() > 500000) {
            throw new ApiException("Photo trop volumineuse (max ~350 Ko)", 400);
        }
        if (!photo.startsWith("data:image/")) {
            throw new ApiException("Format de photo invalide (image attendue)", 400);
        }
    }

    /** Charge l'utilisateur ou leve une erreur 404. */
    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Utilisateur introuvable", 404));
    }
}
