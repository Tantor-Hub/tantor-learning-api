# Module PaymentMethodOpco

Ce module gère les méthodes de paiement OPCO pour les sessions de formation.

## 📋 Structure

### Modèle

- **PaymentMethodOpco** : Entité principale avec les champs :
  - `id` : UUID (clé primaire, auto-généré)
  - `id_session` : UUID (référence vers TrainingSession)
  - `nom_opco` : String (optionnel, nom de l'OPCO)
  - `nom_entreprise` : String (obligatoire, nom de l'entreprise)
  - `siren` : String (obligatoire, numéro SIREN)
  - `nom_responsable` : String (obligatoire, nom du responsable)
  - `telephone_responsable` : String (obligatoire, téléphone du responsable)
  - `email_responsable` : String (obligatoire, email du responsable)
  - `status` : ENUM (pending, rejected, validated)
  - `id_user` : UUID (référence vers Users)
  - `createdAt` / `updatedAt` : Timestamps

### Relations

- **TrainingSession** : Une méthode de paiement appartient à une session
- **Users** : Une méthode de paiement appartient à un utilisateur

## 🚀 Endpoints API

### Routes Secrétaire (JwtAuthGuardAsSecretary)

#### POST `/api/paymentmethodopco/create`

Créer une nouvelle méthode de paiement OPCO

```json
{
  "id_session": "uuid",
  "nom_opco": "OPCO Mobilités", // optionnel
  "nom_entreprise": "Entreprise ABC",
  "siren": "123456789",
  "nom_responsable": "Jean Dupont",
  "telephone_responsable": "0123456789",
  "email_responsable": "jean.dupont@entreprise.com",
  "id_user": "uuid",
  "status": "pending" // optionnel, défaut: pending
}
```

#### GET `/api/paymentmethodopco/getall`

Récupérer toutes les méthodes de paiement OPCO

#### GET `/api/paymentmethodopco/:id`

Récupérer une méthode de paiement OPCO par ID

#### GET `/api/paymentmethodopco/session/:sessionId`

Récupérer toutes les méthodes de paiement OPCO pour une session

#### GET `/api/paymentmethodopco/siren/:siren`

Récupérer toutes les méthodes de paiement OPCO par numéro SIREN

#### GET `/api/paymentmethodopco/status/:status`

Récupérer toutes les méthodes de paiement OPCO avec un statut spécifique

#### PATCH `/api/paymentmethodopco/update`

Mettre à jour une méthode de paiement OPCO

```json
{
  "id": "uuid",
  "status": "validated" // optionnel
}
```

#### DELETE `/api/paymentmethodopco`

Supprimer une méthode de paiement OPCO

```json
{
  "id": "uuid"
}
```

#### DELETE `/api/paymentmethodopco/delete-all`

Supprimer toutes les méthodes de paiement OPCO

### Routes Étudiant (JwtAuthGuardAsStudent)

#### GET `/api/paymentmethodopco/user/:userId`

Récupérer toutes les méthodes de paiement OPCO d'un utilisateur

## 🔧 Statuts disponibles

- **pending** : En attente de validation
- **rejected** : Rejeté
- **validated** : Validé

## 📊 Contraintes

- Un utilisateur ne peut avoir qu'une seule méthode de paiement par session (contrainte d'unicité)
- Les clés étrangères vers `trainingssession` et `users` sont obligatoires
- `nom_opco` est optionnel (nullable)
- `nom_entreprise`, `siren`, `nom_responsable`, `telephone_responsable`, `email_responsable` sont obligatoires
- Validation du format email pour `email_responsable`
- Validation du format SIREN (9 chiffres)
- Validation du format téléphone français
- Suppression en cascade si la session ou l'utilisateur est supprimé

## 🗄️ Migration SQL

Exécuter le fichier `create-paymentmethodopco-table.sql` pour créer la table et les contraintes.

## 📝 Exemples d'utilisation

### Créer une méthode de paiement OPCO

```typescript
const paymentMethod = await paymentMethodOpcoService.create({
  id_session: 'session-uuid',
  nom_entreprise: 'Entreprise ABC',
  siren: '123456789',
  nom_responsable: 'Jean Dupont',
  telephone_responsable: '0123456789',
  email_responsable: 'jean.dupont@entreprise.com',
  id_user: 'user-uuid',
  status: PaymentMethodOpcoStatus.PENDING,
});
```

### Créer avec un OPCO

```typescript
const paymentMethod = await paymentMethodOpcoService.create({
  id_session: 'session-uuid',
  nom_opco: 'OPCO Mobilités',
  nom_entreprise: 'Entreprise XYZ',
  siren: '987654321',
  nom_responsable: 'Marie Martin',
  telephone_responsable: '0987654321',
  email_responsable: 'marie.martin@entreprise.com',
  id_user: 'user-uuid',
  status: PaymentMethodOpcoStatus.VALIDATED,
});
```

### Mettre à jour le statut

```typescript
const updated = await paymentMethodOpcoService.update({
  id: 'payment-uuid',
  status: PaymentMethodOpcoStatus.VALIDATED,
});
```

### Récupérer par SIREN

```typescript
const paymentMethods = await paymentMethodOpcoService.findBySiren('123456789');
```

### Récupérer les méthodes d'un utilisateur

```typescript
const userPayments = await paymentMethodOpcoService.findByUserId('user-uuid');
```

## 🏢 Gestion OPCO

Ce module est conçu pour gérer les paiements OPCO :

- `nom_opco` peut stocker le nom de l'OPCO (OPCO Mobilités, AFDAS, etc.)
- `siren` permet d'identifier l'entreprise
- `nom_responsable`, `telephone_responsable`, `email_responsable` pour les contacts
- Facilite le suivi des demandes de financement OPCO
- Permet la validation/rejet des demandes par les administrateurs
