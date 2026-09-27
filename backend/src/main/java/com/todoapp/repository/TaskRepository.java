package com.todoapp.repository;

import com.todoapp.entity.Task;
import com.todoapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Acces aux donnees taches.
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Toutes les taches d'un utilisateur, les plus recentes d'abord. */
    List<Task> findByUserOrderByCreatedAtDesc(User user);

    /** Taches non terminees d'un utilisateur. */
    List<Task> findByUserAndDoneFalseOrderByCreatedAtDesc(User user);

    /** Taches terminees d'un utilisateur. */
    List<Task> findByUserAndDoneTrueOrderByCreatedAtDesc(User user);
}
