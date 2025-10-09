# Module UserInSession

Ce module gère les utilisateurs participants aux sessions de formation.

## 📋 Structure

### Modèle

- **UserInSession** : Entité principale avec les champs :
  - `id` : UUID (clé primaire, auto-généré)
  - `id_session` : UUID (référence vers TrainingSession)
  - `status` : ENUM (refusedpayment, notpaid, pending, in, out)
  - `id_user` : UUID (référence vers Users)
  - `createdAt` / `updatedAt` : Timestamps

### Relations

- **TrainingSession** : Un utilisateur appartient à une session
- **Users** : Un utilisateur appartient à un utilisateur

## 🚀 Endpoints API

### Routes Secrétaire (JwtAuthGuardAsSecretary)

#### POST `/api/userinsession/create`

Créer une nouvelle inscription utilisateur-session

```json
{
  "id_session": "uuid",
  "id_user": "uuid",
  "status": "pending" // optionnel, défaut: pending
}
```

#### GET `/api/userinsession/getall`

Récupérer toutes les inscriptions utilisateur-session

#### GET `/api/userinsession/:id`

Récupérer une inscription utilisateur-session par ID

#### GET `/api/userinsession/session/:sessionId`

Récupérer tous les participants d'une session

#### GET `/api/userinsession/status/:status`

Récupérer tous les utilisateurs avec un statut spécifique

#### PATCH `/api/userinsession/update`

Mettre à jour une inscription utilisateur-session

```json
{
  "id": "uuid",
  "status": "in" // optionnel
}
```

#### DELETE `/api/userinsession`

Supprimer une inscription utilisateur-session

```json
{
  "id": "uuid"
}
```

#### DELETE `/api/userinsession/delete-all`

Supprimer toutes les inscriptions utilisateur-session

### Routes Étudiant (JwtAuthGuardAsStudent)

#### GET `/api/userinsession/user/:userId`

Récupérer toutes les sessions d'un utilisateur

## 🔧 Statuts disponibles

- **refusedpayment** : Paiement refusé
- **notpaid** : Non payé
- **pending** : En attente
- **in** : Inscrit/Présent
- **out** : Sorti/Retiré

## 📊 Contraintes

- Un utilisateur ne peut être qu'une seule fois dans une session (contrainte d'unicité)
- Les clés étrangères vers `trainingssession` et `users` sont obligatoires
- Suppression en cascade si la session ou l'utilisateur est supprimé
- Gestion automatique des places disponibles dans la session

## 🗄️ Migration SQL

Exécuter le fichier `create-userinsession-table.sql` pour créer la table et les contraintes.

## 📝 Exemples d'utilisation

### Créer une inscription utilisateur-session

```typescript
const userInSession = await userInSessionService.create({
  id_session: 'session-uuid',
  id_user: 'user-uuid',
  status: UserInSessionStatus.PENDING,
});
```

### Mettre à jour le statut

```typescript
const updated = await userInSessionService.update({
  id: 'userinsession-uuid',
  status: UserInSessionStatus.IN,
});
```

### Récupérer les sessions d'un utilisateur

```typescript
const userSessions = await userInSessionService.findByUserId('user-uuid');
```

### Récupérer les participants d'une session

```typescript
const participants = await userInSessionService.findBySessionId('session-uuid');
```

## 🔄 Gestion automatique des places

- Lors de la création d'une inscription, le nombre de places disponibles est automatiquement décrémenté
- Lors de la suppression d'une inscription, le nombre de places disponibles est automatiquement incrémenté
- Vérification que des places sont disponibles avant l'inscription
