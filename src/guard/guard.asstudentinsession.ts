import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';
import { AllSercices } from '../services/serices.all';
import { Users } from 'src/models/model.users';
import { UserInSession } from 'src/models/model.userinsession';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Lessondocument } from 'src/models/model.lessondocument';
import { TrainingSession } from 'src/models/model.trainingssession';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { InjectModel } from '@nestjs/sequelize';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@Injectable()
export class JwtAuthGuardAsStudentInSession implements CanActivate {
  keyname: string;
  allowedTo: number[] = [4]; // Assuming student role ID
  accessLevel: number = 90;

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    @InjectModel(UserInSession)
    private readonly userInSessionModel: typeof UserInSession,
    @InjectModel(SessionCours)
    private readonly sessionCoursModel: typeof SessionCours,
    @InjectModel(Lesson)
    private readonly lessonModel: typeof Lesson,
    @InjectModel(Lessondocument)
    private readonly lessondocumentModel: typeof Lessondocument,
    @InjectModel(TrainingSession)
    private readonly trainingSessionModel: typeof TrainingSession,
    @InjectModel(Studentevaluation)
    private readonly studentEvaluationModel: typeof Studentevaluation,
  ) {
    this.keyname = this.configService.get<string>(
      'APPKEYAPINAME',
      'authorization',
    ) as string;
  }

  /**
   * Resolves any entity ID to its corresponding session ID
   * Supports: sessionId, sessioncoursId, lessonId, lessondocumentId
   */
  private matchesParam(
    params: Record<string, any>,
    entityId: string,
    paramNames: string[],
  ): boolean {
    if (!params) {
      return false;
    }
    return paramNames.some((name) => {
      const value = params[name];
      return value !== undefined && String(value) === String(entityId);
    });
  }

  private async resolveEntityToSessionId(
    entityId: string,
    requestParams: Record<string, any>,
  ): Promise<string> {
    console.log(
      '🔍 [ENTITY RESOLVER] Resolving entity ID to session ID:',
      entityId,
    );
    console.log('🔍 [ENTITY RESOLVER] Request params:', requestParams);

    // 1. Check if it's a direct session ID (trainingssession endpoints)
    if (
      this.matchesParam(
        requestParams,
        entityId,
        ['sessionId', 'id_session', 'trainingSessionId', 'trainingSessionID'],
      )
    ) {
      console.log('🔍 [ENTITY RESOLVER] Direct session ID detected via params');
      return entityId;
    }

    // 2. Check if it's a session ID in sessioncours student endpoint
    if (
      this.matchesParam(
        requestParams,
        entityId,
        ['sessionStudentId', 'session_id_student'],
      )
    ) {
      console.log(
        '🔍 [ENTITY RESOLVER] Session ID linked to student session params detected',
      );
      return entityId;
    }

    // 3. Check if it's a sessioncours ID (sessioncours endpoints)
    if (
      this.matchesParam(
        requestParams,
        entityId,
        [
          'sessionCoursId',
          'sessioncoursId',
          'sessionCoursID',
          'sessioncoursID',
          'coursId',
          'id_sessioncours',
        ],
      )
    ) {
      console.log(
        '🔍 [ENTITY RESOLVER] SessionCours param detected, looking up session',
      );
      const sessionCours = await this.sessionCoursModel.findByPk(entityId);
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session avec l'identifiant "${entityId}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || entityId}" n'est pas lié à une session de formation.`,
        );
      }
      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from sessioncours:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 3.1 Check if it's an evaluation ID
    if (
      this.matchesParam(
        requestParams,
        entityId,
        [
          'evaluationId',
          'evaluationID',
          'studentevaluationId',
          'studentEvaluationId',
          'evaluation_id',
        ],
      )
    ) {
      console.log(
        '🔍 [ENTITY RESOLVER] Evaluation ID detected via params, resolving to session',
      );
      const evaluation = await this.studentEvaluationModel.findByPk(entityId);
      if (!evaluation) {
        throw new ForbiddenException(
          `Erreur: L'évaluation avec l'identifiant "${entityId}" n'existe pas.`,
        );
      }
      if (!evaluation.sessionCoursId) {
        throw new ForbiddenException(
          `Erreur: L'évaluation "${evaluation.title || entityId}" n'est pas liée à un cours de session.`,
        );
      }
      const sessionCours = await this.sessionCoursModel.findByPk(
        evaluation.sessionCoursId,
      );
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session associé à l'évaluation "${evaluation.title || evaluation.sessionCoursId}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || evaluation.sessionCoursId}" n'est pas lié à une session de formation.`,
        );
      }
      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from evaluation:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 4. Check if it's a lesson ID
    if (
      this.matchesParam(
        requestParams,
        entityId,
        ['lessonId', 'lesson_id', 'id_lesson'],
      )
    ) {
      console.log(
        '🔍 [ENTITY RESOLVER] Lesson ID detected, looking up sessioncours then session',
      );
      const lesson = await this.lessonModel.findByPk(entityId);
      if (!lesson) {
        throw new ForbiddenException(
          `Erreur: La leçon avec l'identifiant "${entityId}" n'existe pas.`,
        );
      }
      if (!lesson.id_cours) {
        throw new ForbiddenException(
          `Erreur: La leçon "${lesson.title || entityId}" n'est pas liée à un cours de session.`,
        );
      }

      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session associé à la leçon "${lesson.title || entityId}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || lesson.id_cours}" n'est pas lié à une session de formation.`,
        );
      }

      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from lesson:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 5. Check if it's a lessondocument ID
    if (
      this.matchesParam(
        requestParams,
        entityId,
        [
          'lessondocumentId',
          'lessonDocumentId',
          'documentId',
          'id_lessondocument',
        ],
      )
    ) {
      console.log(
        '🔍 [ENTITY RESOLVER] LessonDocument ID detected, looking up lesson then sessioncours then session',
      );
      const lessondocument = await this.lessondocumentModel.findByPk(entityId);
      if (!lessondocument) {
        throw new ForbiddenException(
          `Erreur: Le document de leçon avec l'identifiant "${entityId}" n'existe pas.`,
        );
      }
      if (!lessondocument.id_lesson) {
        throw new ForbiddenException(
          `Erreur: Le document "${lessondocument.title || entityId}" n'est pas lié à une leçon.`,
        );
      }

      const lesson = await this.lessonModel.findByPk(lessondocument.id_lesson);
      if (!lesson) {
        throw new ForbiddenException(
          `Erreur: La leçon associée au document "${lessondocument.title || entityId}" n'existe pas.`,
        );
      }
      if (!lesson.id_cours) {
        throw new ForbiddenException(
          `Erreur: La leçon "${lesson.title || lessondocument.id_lesson}" n'est pas liée à un cours de session.`,
        );
      }

      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session associé à la leçon "${lesson.title || lesson.id_cours}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || lesson.id_cours}" n'est pas lié à une session de formation.`,
        );
      }

      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from lessondocument:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 6. Fallback: try to determine by checking what entity exists
    console.log(
      '🔍 [ENTITY RESOLVER] Unknown endpoint, trying to determine entity type...',
    );

    // Try evaluation
    const evaluation = await this.studentEvaluationModel.findByPk(entityId);
    if (evaluation && evaluation.sessionCoursId) {
      console.log('🔍 [ENTITY RESOLVER] Detected as evaluation ID in fallback');
      const sessionCours = await this.sessionCoursModel.findByPk(
        evaluation.sessionCoursId,
      );
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session associé à l'évaluation "${evaluation.title || evaluation.sessionCoursId}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || evaluation.sessionCoursId}" n'est pas lié à une session de formation.`,
        );
      }
      return sessionCours.id_session;
    }

    // Try lessondocument first (most specific)
    const lessondocument = await this.lessondocumentModel.findByPk(entityId);
    if (lessondocument && lessondocument.id_lesson) {
      console.log('🔍 [ENTITY RESOLVER] Detected as lessondocument ID');
      // Resolve directly to avoid recursion
      const lesson = await this.lessonModel.findByPk(lessondocument.id_lesson);
      if (!lesson) {
        throw new ForbiddenException(
          `Erreur: La leçon associée au document "${lessondocument.title || entityId}" n'existe pas.`,
        );
      }
      if (!lesson.id_cours) {
        throw new ForbiddenException(
          `Erreur: La leçon "${lesson.title || lessondocument.id_lesson}" n'est pas liée à un cours de session.`,
        );
      }
      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session associé à la leçon "${lesson.title || lesson.id_cours}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || lesson.id_cours}" n'est pas lié à une session de formation.`,
        );
      }
      return sessionCours.id_session;
    }

    // Try lesson
    const lesson = await this.lessonModel.findByPk(entityId);
    if (lesson && lesson.id_cours) {
      console.log('🔍 [ENTITY RESOLVER] Detected as lesson ID');
      // Resolve directly to avoid recursion
      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours) {
        throw new ForbiddenException(
          `Erreur: Le cours de session associé à la leçon "${lesson.title || entityId}" n'existe pas.`,
        );
      }
      if (!sessionCours.id_session) {
        throw new ForbiddenException(
          `Erreur: Le cours de session "${sessionCours.title || lesson.id_cours}" n'est pas lié à une session de formation.`,
        );
      }
      return sessionCours.id_session;
    }

    // Try sessioncours
    const sessionCours = await this.sessionCoursModel.findByPk(entityId);
    if (sessionCours && sessionCours.id_session) {
      console.log('🔍 [ENTITY RESOLVER] Detected as sessioncours ID');
      // Resolve directly to avoid recursion
      return sessionCours.id_session;
    }

    // If none found, assume it's a session ID
    console.log(
      '🔍 [ENTITY RESOLVER] No specific entity found, assuming session ID',
    );
    return entityId;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[this.keyname] as string;

    // Extract sessionId from params - handle sessionId, id, sessionCoursId, lessonId parameters
    let sessionId =
      request.params.sessionId ||
      request.params.trainingSessionId ||
      request.params.trainingSessionID ||
      request.params.sessionCoursId ||
      request.params.sessioncoursId ||
      request.params.lessonId ||
      request.params.lesson_id ||
      request.params.lessondocumentId ||
      request.params.lessonDocumentId ||
      request.params.evaluationId ||
      request.params.studentevaluationId ||
      request.params.studentEvaluationId ||
      request.params.id;

    console.log('🔍 [JWT GUARD STUDENT IN SESSION] Debug Info:');
    console.log('  - Request URL:', request.url);
    console.log('  - Session ID:', sessionId);
    console.log('  - All params:', request.params);
    console.log('  - Auth header key:', this.keyname);
    console.log('  - Auth header value:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        '❌ JwtAuthGuardAsStudentInSession: No valid auth header for',
        request.url,
      );
      throw new ForbiddenException(
        "Aucune clé d'authentification n'a été fournie",
      );
    }

    const [_, token] = authHeader.split(' ');

    try {
      console.log(
        '🔍 [JWT GUARD STUDENT IN SESSION] Starting token verification...',
      );
      const decoded = await this.jwtService.verifyTokenWithRound(token);

      if (!decoded || decoded.error) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: Token verification failed for',
          request.url,
        );

        if (decoded && decoded.type === 'TokenExpiredError') {
          throw new ForbiddenException(
            'Votre session a expiré. Veuillez vous reconnecter.',
          );
        } else if (decoded && decoded.type === 'JsonWebTokenError') {
          throw new ForbiddenException(
            "Token d'authentification invalide ou malformé. Veuillez vous reconnecter.",
          );
        } else {
          throw new ForbiddenException(
            "La clé d'authentification fournie est invalide ou a expiré. Veuillez vous reconnecter.",
          );
        }
      }

      const userId = decoded.id_user;

      if (!userId) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: No user ID in token for',
          request.url,
        );
        throw new ForbiddenException(
          "Erreur d'authentification: Le token ne contient pas d'identifiant utilisateur. Veuillez vous reconnecter.",
        );
      }

      // Fetch user by id
      const user = await this.usersModel.findOne({
        where: { id: userId },
      });

      if (!user) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: User not found in database for ID:',
          userId,
        );
        throw new ForbiddenException(
          "Erreur d'authentification: Utilisateur non trouvé dans la base de données. Veuillez contacter le support.",
        );
      }

      // Check if user is verified
      if (user.is_verified === false) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: User not verified:',
          user.email,
        );
        throw new ForbiddenException(
          "Votre compte n'est pas vérifié. Veuillez contacter un administrateur.",
        );
      }

      // Check if user has student role
      if (user.role !== 'student') {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: Access denied for',
          user.email,
          '- Role:',
          user.role,
          '(Required: student)',
        );
        throw new ForbiddenException(
          `Accès refusé: Cette ressource est réservée aux étudiants. Votre rôle actuel est "${user.role}".`,
        );
      }

      // Check enrollment in the session
      if (!sessionId) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: No session ID provided for',
          request.url,
        );
        throw new ForbiddenException(
          "Erreur: L'identifiant de session est requis pour accéder à cette ressource.",
        );
      }

      // Use the entity resolver to get the actual session ID
      let actualSessionId: string;
      try {
        actualSessionId = await this.resolveEntityToSessionId(
          sessionId,
          request.params,
        );
      } catch (resolveError) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: Error resolving entity to session ID:',
          resolveError.message,
        );
        // If it's already a ForbiddenException, re-throw it
        if (resolveError instanceof ForbiddenException) {
          throw resolveError;
        }
        // Otherwise, provide a clear error message
        throw new ForbiddenException(
          `Erreur: Impossible de trouver la session associée à l'identifiant "${sessionId}". Veuillez vérifier que la ressource existe et est correctement liée à une session.`,
        );
      }

      const enrollment = await this.userInSessionModel.findOne({
        where: {
          id_user: userId,
          id_session: actualSessionId,
        },
      });

      console.log(
        '🔍 [JWT GUARD STUDENT IN SESSION] UserInSession lookup result:',
      );
      console.log('  - User ID:', userId);
      console.log('  - Session ID:', actualSessionId);
      console.log('  - Enrollment found:', !!enrollment);

      if (enrollment) {
        console.log('  - Enrollment details:', {
          id: enrollment.id,
          id_user: enrollment.id_user,
          id_session: enrollment.id_session,
          status: enrollment.status,
        });
      } else {
        console.log(
          '  - No enrollment record found for this user-session combination',
        );
      }

      // Fetch session details for error message
      const session = await this.trainingSessionModel.findByPk(actualSessionId);
      const sessionTitle = session?.title || 'Session inconnue';

      // Translate status to French
      const getStatusInFrench = (status: string): string => {
        const statusMap: { [key: string]: string } = {
          in: 'actif',
          out: 'inactif',
          pending: 'en attente',
          suspended: 'suspendu',
          cancelled: 'annulé',
          completed: 'terminé',
          expelled: 'expulsé',
        };
        return statusMap[status] || status;
      };

      if (!enrollment) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: Student not enrolled in session',
          actualSessionId,
          'for user:',
          userId,
        );
        throw new HttpException(
          {
            statusCode: 403,
            message: `Accès refusé: Vous n'êtes pas inscrit à la session "${sessionTitle}". Veuillez contacter un administrateur pour vous inscrire.`,
            error: 'Accès refusé',
          },
          403,
        );
      }

      if (enrollment.status !== 'in') {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: Student enrollment status is not "in"',
          'Current status:',
          enrollment.status,
          'Required status: "in"',
        );
        throw new HttpException(
          {
            statusCode: 403,
            message: `Accès refusé: Votre inscription à la session "${sessionTitle}" est en statut "${getStatusInFrench(enrollment.status)}". Vous devez avoir le statut "actif" pour accéder à cette ressource. Veuillez contacter le secrétaire pour activer votre accès.`,
            error: 'Accès refusé',
          },
          403,
        );
      }

      // Attach user info to request
      request.user = {
        ...decoded,
        roles_user: [user.role],
      } as IJwtSignin;

      console.log(
        '✅ JwtAuthGuardAsStudentInSession: Student authenticated and enrolled:',
        user.email,
        'in session:',
        actualSessionId,
        'for',
        request.url,
      );

      return true;
    } catch (error) {
      // Re-throw known exceptions with their clear messages
      if (
        error instanceof ForbiddenException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      console.log(
        '❌ JwtAuthGuardAsStudentInSession: Unexpected error for',
        request.url,
        ':',
        error.message,
      );
      console.error('Full error:', error);
      
      // Provide a clear error message for unexpected errors
      throw new ForbiddenException(
        `Erreur d'authentification: ${error.message || "Une erreur inattendue s'est produite lors de la vérification de l'accès. Veuillez réessayer ou contacter le support."}`,
      );
    }
  }
}
