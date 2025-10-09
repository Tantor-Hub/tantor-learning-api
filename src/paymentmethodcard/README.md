# Module PaymentMethodCard

Ce module gère les méthodes de paiement par carte pour les sessions de formation.

## 📋 Structure

### Modèle

- **PaymentMethodCard** : Entité principale avec les champs :
  - `id` : UUID (clé primaire, auto-généré)
  - `id_session` : UUID (référence vers TrainingSession)
  - `id_stripe_payment` : UUID (optionnel, référence vers Stripe)
  - `id_user` : UUID (référence vers Users)
  - `status` : ENUM (pending, rejected, validated)
  - `createdAt` / `updatedAt` : Timestamps

### Relations

- **TrainingSession** : Une méthode de paiement appartient à une session
- **Users** : Une méthode de paiement appartient à un utilisateur

## 🚀 Endpoints API

### Routes Secrétaire (JwtAuthGuardAsSecretary)

#### POST `/api/paymentmethodcard/create`

Créer une nouvelle méthode de paiement par carte

```json
{
  "id_session": "uuid",
  "id_stripe_payment": "pi_1234567890", // optionnel
  "id_user": "uuid",
  "status": "pending" // optionnel, défaut: pending
}
```

#### GET `/api/paymentmethodcard/getall`

Récupérer toutes les méthodes de paiement par carte

#### GET `/api/paymentmethodcard/:id`

Récupérer une méthode de paiement par carte par ID

#### GET `/api/paymentmethodcard/session/:sessionId`

Récupérer toutes les méthodes de paiement par carte pour une session

#### GET `/api/paymentmethodcard/stripe/:stripePaymentId`

Récupérer une méthode de paiement par carte par ID Stripe

#### GET `/api/paymentmethodcard/status/:status`

Récupérer toutes les méthodes de paiement par carte avec un statut spécifique

#### PATCH `/api/paymentmethodcard/update`

Mettre à jour une méthode de paiement par carte

```json
{
  "id": "uuid",
  "status": "validated" // optionnel
}
```

#### DELETE `/api/paymentmethodcard`

Supprimer une méthode de paiement par carte

```json
{
  "id": "uuid"
}
```

#### DELETE `/api/paymentmethodcard/delete-all`

Supprimer toutes les méthodes de paiement par carte

### Routes Étudiant (JwtAuthGuardAsStudent)

#### GET `/api/paymentmethodcard/user/:userId`

Récupérer toutes les méthodes de paiement par carte d'un utilisateur

## 🔧 Statuts disponibles

- **pending** : En attente de validation
- **rejected** : Rejeté
- **validated** : Validé

## 📊 Contraintes

- Un utilisateur ne peut avoir qu'une seule méthode de paiement par session (contrainte d'unicité)
- Les clés étrangères vers `trainingssession` et `users` sont obligatoires
- `id_stripe_payment` est optionnel (nullable)
- Suppression en cascade si la session ou l'utilisateur est supprimé

## 🗄️ Migration SQL

Exécuter le fichier `create-paymentmethodcard-table.sql` pour créer la table et les contraintes.

## 📝 Exemples d'utilisation

### Créer une méthode de paiement par carte

```typescript
const paymentMethod = await paymentMethodCardService.create({
  id_session: 'session-uuid',
  id_user: 'user-uuid',
  status: PaymentMethodCardStatus.PENDING,
});
```

### Créer avec un paiement Stripe

```typescript
const paymentMethod = await paymentMethodCardService.create({
  id_session: 'session-uuid',
  id_stripe_payment: 'pi_1234567890',
  id_user: 'user-uuid',
  status: PaymentMethodCardStatus.VALIDATED,
});
```

### Mettre à jour le statut

```typescript
const updated = await paymentMethodCardService.update({
  id: 'payment-uuid',
  status: PaymentMethodCardStatus.VALIDATED,
});
```

### Récupérer par ID Stripe

```typescript
const paymentMethod =
  await paymentMethodCardService.findByStripePaymentId('pi_1234567890');
```

### Récupérer les méthodes d'un utilisateur

```typescript
const userPayments = await paymentMethodCardService.findByUserId('user-uuid');
```

## 🔗 Intégration Stripe

Ce module est conçu pour s'intégrer avec Stripe :

- `id_stripe_payment` peut stocker l'ID du paiement Stripe
- Permet de faire le lien entre les paiements Stripe et les sessions de formation
- Facilite le suivi des paiements et leur statut
