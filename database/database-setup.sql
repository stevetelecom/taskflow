-- =====================================================================
-- Script SQL : creation base + utilisateur applicatif MySQL
-- Projet   : TaskFlow (Spring Boot + React)
-- Usage    : sudo mysql < database/database-setup.sql
-- Securite : l'application n'utilise JAMAIS root (moindre privilege).
--            Remplacez 'MOT_DE_PASSE_A_CHANGER' par un mot de passe fort,
--            puis reportez la meme valeur dans votre fichier .env
--            (DB_USERNAME / DB_PASSWORD). Ne commitez jamais le .env.
-- =====================================================================

-- 1. Creation de la base de donnees (utf8mb4 : Unicode complet)
CREATE DATABASE IF NOT EXISTS todo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Utilisateur applicatif, acces local uniquement
CREATE USER IF NOT EXISTS 'todo_user'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_A_CHANGER';

-- 3. Privileges minimaux, limites a la base todo_db
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, DROP
  ON todo_db.* TO 'todo_user'@'localhost';

-- 4. Application des privileges
FLUSH PRIVILEGES;

-- 5. Verification
SHOW DATABASES LIKE 'todo_db';
SELECT User, Host FROM mysql.user WHERE User = 'todo_user';
