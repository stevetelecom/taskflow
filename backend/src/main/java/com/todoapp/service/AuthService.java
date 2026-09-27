package com.todoapp.service;

import com.todoapp.dto.AuthRequest;
import com.todoapp.dto.AuthResponse;
import com.todoapp.entity.User;
import com.todoapp.exception.ApiException;
import com.todoapp.repository.UserRepository;
import com.todoapp.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service d'authentification.
 * - Inscription : verifie l'unicite du pseudo, hache le mot de passe (BCrypt)
 * - Connexion : compare les hachs, genere un JWT
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Inscription d'un nouvel utilisateur.
     * - 409 si le pseudo est deja pris
     * - Mot de passe hache BCrypt, jamais stocke en clair
     */
    @Transactional
    public AuthResponse register(AuthRequest request) {
        String username = request.getUsername().trim();

        if (userRepository.existsByUsername(username)) {
            throw new ApiException("Ce nom d'utilisateur est deja pris", 409);
        }

        User user = new User(username, passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    /**
     * Connexion d'un utilisateur existant.
     * - 401 si identifiants invalides
     * Message d'erreur volontairement identique pour pseudo inconnu et
     * mot de passe errone (evite l'enumeration de comptes).
     */
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String username = request.getUsername().trim();

        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Identifiants invalides", 401);
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }
}
