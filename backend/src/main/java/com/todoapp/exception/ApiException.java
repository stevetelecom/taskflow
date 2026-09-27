package com.todoapp.exception;

/**
 * Exception metier avec code HTTP associe.
 * Permet de renvoyer des messages clairs au frontend.
 */
public class ApiException extends RuntimeException {

    private final int status;

    public ApiException(String message, int status) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
