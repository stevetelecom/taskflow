package com.todoapp.service;

import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.entity.Task;
import com.todoapp.entity.User;
import com.todoapp.exception.ApiException;
import com.todoapp.repository.TaskRepository;
import com.todoapp.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des taches (CRUD).
 * Chaque operation verifie que la tache appartient bien a
 * l'utilisateur authentifie (protection IDOR).
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository,
                       @Lazy NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /** Renvoie toutes les taches de l'utilisateur (plus recentes d'abord). */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(String username, String filter) {
        User user = requireUser(username);
        List<Task> tasks = switch (filter == null ? "all" : filter) {
            case "active" -> taskRepository.findByUserAndDoneFalseOrderByCreatedAtDesc(user);
            case "done" -> taskRepository.findByUserAndDoneTrueOrderByCreatedAtDesc(user);
            default -> taskRepository.findByUserOrderByCreatedAtDesc(user);
        };
        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    /** Cree une tache pour l'utilisateur. */
    @Transactional
    public TaskResponse createTask(String username, TaskRequest request) {
        User user = requireUser(username);

        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() == null ? null : request.getDescription().trim());
        task.setDone(request.isDone());
        task.setUser(user);

        Task saved = taskRepository.save(task);

        // Notification in-app associee a la creation
        notificationService.create(username, "task_created",
                "Tache creee : " + saved.getTitle());

        return TaskResponse.fromEntity(saved);
    }
    /** Modifie une tache existante si elle appartient a l'utilisateur. */
    @Transactional
    public TaskResponse updateTask(String username, Long taskId, TaskRequest request) {
        Task task = requireOwnedTask(username, taskId);

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() == null ? null : request.getDescription().trim());
        task.setDone(request.isDone());

        Task saved = taskRepository.save(task);

        // Notification in-app : tache modifiee
        notificationService.create(username, "task_updated",
                "Tache modifiee : " + saved.getTitle());

        return TaskResponse.fromEntity(saved);
    }

    /** Bascule l'etat done d'une tache. */
    @Transactional
    public TaskResponse toggleTask(String username, Long taskId) {
        Task task = requireOwnedTask(username, taskId);
        task.setDone(!task.isDone());
        Task saved = taskRepository.save(task);

        // Notification in-app : passage a l'etat termine (ou reactivation)
        notificationService.create(username,
                saved.isDone() ? "task_completed" : "task_reopened",
                (saved.isDone() ? "Tache terminee : " : "Tache reactivee : ") + saved.getTitle());

        return TaskResponse.fromEntity(saved);
    }

    /** Supprime une tache si elle appartient a l'utilisateur. */
    @Transactional
    public void deleteTask(String username, Long taskId) {
        Task task = requireOwnedTask(username, taskId);
        String title = task.getTitle();
        taskRepository.delete(task);

        // Notification in-app : tache supprimee
        notificationService.create(username, "task_deleted",
                "Tache supprimee : " + title);
    }

    /** Supprime toutes les taches terminees de l'utilisateur. */
    @Transactional
    public int deleteCompleted(String username) {
        User user = requireUser(username);
        List<Task> done = taskRepository.findByUserAndDoneTrueOrderByCreatedAtDesc(user);
        taskRepository.deleteAll(done);
        return done.size();
    }

    /** Charge l'utilisateur ou leve une erreur 404. */
    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Utilisateur introuvable", 404));
    }

    /** Charge la tache et verifie qu'elle appartient a l'utilisateur. */
    private Task requireOwnedTask(String username, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ApiException("Tache introuvable", 404));
        if (!task.getUser().getUsername().equals(username)) {
            // 404 (et non 403) pour ne pas reveler l'existence d'identifiants d'autrui
            throw new ApiException("Tache introuvable", 404);
        }
        return task;
    }
}
