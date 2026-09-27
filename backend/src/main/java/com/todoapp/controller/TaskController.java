package com.todoapp.controller;

import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints proteges des taches (JWT obligatoire).
 * L'utilisateur est identifie via le contexte de securite Spring.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /** GET /api/tasks?filter=all|active|done */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            Authentication authentication,
            @RequestParam(defaultValue = "all") String filter) {
        return ResponseEntity.ok(taskService.getTasks(authentication.getName(), filter));
    }

    /** POST /api/tasks */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            Authentication authentication,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.createTask(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** PUT /api/tasks/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(authentication.getName(), id, request));
    }

    /** PATCH /api/tasks/{id}/toggle */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggleTask(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleTask(authentication.getName(), id));
    }

    /** DELETE /api/tasks/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            Authentication authentication,
            @PathVariable Long id) {
        taskService.deleteTask(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/tasks/completed */
    @DeleteMapping("/completed")
    public ResponseEntity<Map<String, Object>> deleteCompleted(Authentication authentication) {
        int count = taskService.deleteCompleted(authentication.getName());
        return ResponseEntity.ok(Map.of("deleted", count));
    }
}
