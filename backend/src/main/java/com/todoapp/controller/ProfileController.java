package com.todoapp.controller;

import com.todoapp.dto.PasswordChangeRequest;
import com.todoapp.dto.ProfileRequest;
import com.todoapp.dto.ProfileResponse;
import com.todoapp.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints proteges du profil utilisateur.
 * GET  /api/profile        : lire le profil
 * PUT  /api/profile        : mettre a jour le profil
 * PUT  /api/profile/password : changer le mot de passe
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeRequest request) {
        profileService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifie avec succes"));
    }
}
