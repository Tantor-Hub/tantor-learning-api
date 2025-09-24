# Prisma Schema for Tantor Learning API

This Prisma schema represents the complete database structure for the Tantor Learning API, converted from the existing Sequelize models.

## 🗄️ Database Structure Overview

### Core Models

#### **Users** (`___tbl_tantor_users`)

- **Primary Key**: `id` (auto-increment integer)
- **Unique Identifier**: `uuid` (UUID v4)
- **Authentication**: email, password, verification_code, otp
- **Profile**: firstName, lastName, avatar, phone, address, etc.
- **Role-based Access**: instructor, student, admin, secretary
- **Status Management**: is_verified, status, can_update_password

#### **TrainingCategory** (`___tbl_tantor_trainingcategory`)

- **Primary Key**: `id` (UUID)
- **Content**: title, description
- **Relationships**: One-to-many with Trainings and Formations

#### **Training** (`___tbl_tantor_trainings`)

- **Primary Key**: `id` (UUID)
- **Content**: title, subtitle, description, requirement, pedagogygoals
- **Training Details**: trainingtype (enum), rnc, prix
- **Relationships**: Belongs to TrainingCategory

#### **Formations** (`___tbl_tantor_formationsascours`)

- **Primary Key**: `id` (UUID)
- **Content**: titre, sous_titre, description, prerequis, alternance
- **Training Details**: type_formation (enum), prix, status
- **Relationships**: Belongs to TrainingCategory

#### **Session** (`___tbl_tantor_sessions`)

- **Primary Key**: `id` (UUID)
- **Session Details**: title, description, duree, progression
- **Capacity**: nb_places, nb_places_disponible
- **Schedule**: date_session_debut, date_session_fin
- **Documents**: text_reglement, required_documents (JSON)
- **Relationships**: Created by Users, contains documents and payments

### Learning Management Models

#### **Cours** (`___tbl_tantor_cours`)

- **Primary Key**: `id` (auto-increment integer)
- **Content**: title, description, ponderation
- **Status**: is_published
- **Relationships**: Created by Users, contains Lessons

#### **Lesson** (`___tbl_tantor_lesson`)

- **Primary Key**: `id` (auto-increment integer)
- **Content**: title, description
- **Relationships**: Belongs to Cours, contains documents

#### **ModuleDeFormation** (`___tbl_tantor_moduledeformation`)

- **Primary Key**: `id` (UUID)
- **Content**: description, piece_jointe
- **Unique**: uuid field

### Document Management

#### **Lessondocument** (`___tbl_tantor_lessondocument`)

- **Primary Key**: `id` (auto-increment integer)
- **File Info**: file_name, url, type
- **Relationships**: Belongs to Lesson and Session, created by Users

#### **Sessiondocument** (`___tbl_tantor_sessiondocument`)

- **Primary Key**: `id` (auto-increment integer)
- **File Info**: title, description, piece_jointe, type
- **Category**: pendant, durant, apres (enum)
- **Relationships**: Belongs to Session, created by Users

### Payment System

#### **Payement** (`___tbl_tantor_payementmethode`)

- **Primary Key**: `id` (auto-increment integer)
- **Payment Info**: amount, id_stripe_payment
- **Card Details**: card_number, month, year, cvv
- **Status**: 0=not paid, 1=paid, 2=failed, 3=refunded, 4=disputed
- **Unique Constraint**: [id_user, id_session, id_session_student]
- **Relationships**: Belongs to Users and Session

### Communication Models

#### **Newsletter** (`___tbl_tantor_newsletter`)

- **Primary Key**: `user_email` (unique string)
- **Status**: active/inactive

#### **Contacts** (`___tbl_tantor_contacts`)

- **Primary Key**: `id` (auto-increment integer)
- **Contact Info**: from_name, from_mail, subject, content

#### **Messages** (`___tbl_tantor_messages`)

- **Primary Key**: `id` (auto-increment integer)
- **Content**: message content

### Survey System

#### **SurveyResponse** (`___tbl_tantor_surveyresponse`)

- **Primary Key**: `id` (auto-increment integer)
- **Response**: JSON data

#### **OptionQuestionnaires** (`___tbl_tantor_optionquestionnaires`)

- **Primary Key**: `id` (auto-increment integer)
- **Option**: questionnaire option text

#### **QuestionnaireOnInscriptionSession** (`___tbl_tantor_questionnaireoninscriptionsession`)

- **Primary Key**: `id` (auto-increment integer)
- **Question**: questionnaire question text

#### **QuestionsPourQuestionnaireInscription** (`___tbl_tantor_questionspourquestionnaireinscription`)

- **Primary Key**: `id` (auto-increment integer)
- **Question**: questionnaire question text

### Additional Models

#### **ReclamationFormation** (`___tbl_tantor_docsreclamationformations`)

- **Primary Key**: `id` (auto-increment integer)
- **Content**: reclamation content

#### **AppInfos** (`___tbl_tantor_infos`)

- **Primary Key**: `id` (auto-increment integer)
- **Info**: application information

## 🔗 Key Relationships

### User-Centric Relationships

- **Users** → **Sessions** (createdBy)
- **Users** → **Cours** (createdBy)
- **Users** → **Documents** (createdBy)
- **Users** → **Payements** (id_user)

### Training Hierarchy

- **TrainingCategory** → **Training** (one-to-many)
- **TrainingCategory** → **Formations** (one-to-many)
- **Training** → **Session** (one-to-many)

### Learning Structure

- **Cours** → **Lesson** (one-to-many)
- **Lesson** → **Lessondocument** (one-to-many)
- **Session** → **Sessiondocument** (one-to-many)
- **Session** → **Lessondocument** (one-to-many)

## 📊 Enums

### UserRole

- `instructor`
- `student`
- `admin`
- `secretary`

### TrainingType

- `EN_LIGNE`
- `VISION_CONFERENCE`
- `EN_PRESENTIEL`
- `HYBRIDE`

### FormationType

- `EN_LIGNE`
- `VISION_CONFERENCE`
- `EN_PRESENTIEL`
- `HYBRIDE`

### DocumentCategory

- `pendant` (before)
- `durant` (during)
- `apres` (after)

## 🚀 Getting Started

1. **Install Prisma CLI**:

   ```bash
   npm install prisma @prisma/client
   ```

2. **Set up environment variables**:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tantor_learning"
   ```

3. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

4. **Run migrations**:

   ```bash
   npx prisma migrate dev
   ```

5. **View your database**:
   ```bash
   npx prisma studio
   ```

## 🔧 Migration from Sequelize

This schema maintains compatibility with the existing Sequelize models while providing:

- **Type Safety**: Full TypeScript support
- **Better Performance**: Optimized queries
- **Modern ORM**: Latest Prisma features
- **Database Introspection**: Automatic schema generation
- **Migration Management**: Version-controlled schema changes

## 📝 Notes

- All table names use the `___tbl_tantor_` prefix as defined in the original configuration
- UUID fields are properly typed with `@db.Uuid`
- Decimal fields use `@db.Decimal(10, 2)` for precise monetary values
- JSON fields are used for flexible data storage (required_documents, survey responses)
- Unique constraints are maintained where specified in the original models
- Timestamps are automatically managed by Prisma
