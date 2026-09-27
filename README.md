<div align="center">

# TaskFlow

**Gérez vos tâches avec fluidité — une application full-stack moderne et sécurisée.**

![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

</div>

## Aperçu

TaskFlow est une application de gestion de tâches personnelles, construite avec une
architecture full-stack professionnelle :

- **Landing page** moderne en split-screen avec vidéo de présentation en lecture permanente
- **Authentification** par compte utilisateur avec token **JWT**
- **Gestion complète des tâches** : création, modification, complétion, suppression, filtres
- **Interface soignée** : Material Symbols, Google Fonts, animations fluides, modals et notifications toast
- **Sécurité de niveau production** : validation des entrées, protection anti-injection, hachage BCrypt, secrets hors du code

## Architecture

```
├── backend/                       # API REST Spring Boot 3 (Java 21)
│   ├── src/main/java/com/todoapp/
│   │   ├── config/                # Configuration Spring Security + CORS
│   │   ├── controller/            # Endpoints /api/auth, /api/tasks
│   │   ├── dto/                   # Objets de transfert validés
│   │   ├── entity/                # Entités JPA (User, Task)
│   │   ├── exception/             # Gestion globale des erreurs
│   │   ├── repository/            # Repositories Spring Data JPA
│   │   ├── security/              # JWT : génération, validation, filtre
│   │   └── service/               # Logique métier
│   └── src/main/resources/        # application.yml (sans secrets)
├── database/                      # Script d'initialisation MySQL
├── src/                           # Frontend React 18 (Vite)
│   ├── components/                # AuthPage, TasksPage, modals, toasts…
│   └── api.js                     # Client HTTP avec token JWT
└── public/                        # Logo, vidéo de la landing page
```

## Démarrage rapide

### Prérequis

- Java 21+ et Maven
- Node.js 18+
- MySQL 8+

### 1. Base de données

Créez la base et un utilisateur applicatif dédié (jamais root) :

```bash
sudo mysql < database/database-setup.sql
```

> Le script utilise le placeholder `MOT_DE_PASSE_A_CHANGER` : remplacez-le avant exécution,
> ou éditez-le d'abord. Reportez ensuite ces identifiants dans votre `.env`.

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Renseignez ensuite `.env` avec vos valeurs locales (base de données, secret JWT).

### 3. Backend

```bash
cd backend
mvn spring-boot:run
```

L'API démarre sur `http://localhost:8080`.

### 4. Frontend

```bash
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173` (le proxy Vite transmet `/api` au backend).

## Sécurité

| Mesure | Mise en œuvre |
|---|---|
| Mots de passe | Hachage BCrypt, jamais stockés en clair |
| Sessions | JWT signé HMAC-SHA256, expiration 24 h, API stateless |
| Secrets | Variables d'environnement via `.env` (spring-dotenv), hors dépôt Git |
| Entrées utilisateur | Validation stricte côté serveur (Bean Validation) |
| Accès aux données | Chaque tâche vérifiée comme appartenant à l'utilisateur (anti-IDOR) |
| Base de données | Utilisateur applicatif aux privilèges minimaux, jamais root |

## Roadmap

- [ ] Dates d'échéance et priorités
- [ ] Réordonnancement par glisser-déposer
- [ ] Notifications et rappels
- [ ] Déploiement continu (Vercel + CI/CD)

---

<div align="center">
Sous licence <a href="LICENSE">MIT</a> · Réalisé avec Spring Boot, React et MySQL
</div>
