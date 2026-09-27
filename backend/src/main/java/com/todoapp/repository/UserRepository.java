package com.todoapp.repository;

import com.todoapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acces aux donnees utilisateurs.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** Recherche un utilisateur par son nom (unique). */
    Optional<User> findByUsername(String username);

    /** Verifie l'existence d'un nom d'utilisateur. */
    boolean existsByUsername(String username);
}
