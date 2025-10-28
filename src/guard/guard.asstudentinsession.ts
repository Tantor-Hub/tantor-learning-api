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
  private async resolveEntityToSessionId(
    entityId: string,
    requestUrl: string,
  ): Promise<string> {
    console.log(
      '🔍 [ENTITY RESOLVER] Resolving entity ID to session ID:',
      entityId,
    );
    console.log('🔍 [ENTITY RESOLVER] Request URL:', requestUrl);

    // 1. Check if it's a direct session ID (trainingssession endpoint)
    if (requestUrl.includes('/trainingssession/')) {
      console.log('🔍 [ENTITY RESOLVER] Direct session ID detected');
      return entityId;
    }

    // 2. Check if it's a session ID in sessioncours student endpoint
    if (requestUrl.includes('/sessioncours/student/session/')) {
      console.log(
        '🔍 [ENTITY RESOLVER] Session ID in sessioncours student endpoint detected',
      );
      return entityId;
    }

    // 3. Check if it's a sessioncours ID (sessioncours endpoint)
    if (requestUrl.includes('/sessioncours/')) {
      console.log(
        '🔍 [ENTITY RESOLVER] SessionCours ID detected, looking up session',
      );
      const sessionCours = await this.sessionCoursModel.findByPk(entityId);
      if (!sessionCours || !sessionCours.id_session) {
        throw new ForbiddenException(
          'Session course not found or not linked to a session',
        );
      }
      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from sessioncours:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 4. Check if it's a lesson ID (lesson endpoint)
    if (requestUrl.includes('/lesson/')) {
      console.log(
        '🔍 [ENTITY RESOLVER] Lesson ID detected, looking up sessioncours then session',
      );
      const lesson = await this.lessonModel.findByPk(entityId);
      if (!lesson || !lesson.id_cours) {
        throw new ForbiddenException(
          'Lesson not found or not linked to a course',
        );
      }

      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours || !sessionCours.id_session) {
        throw new ForbiddenException(
          'Lesson course not found or not linked to a session',
        );
      }

      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from lesson:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 5. Check if it's a lessondocument ID (lessondocument endpoint)
    if (requestUrl.includes('/lessondocument/')) {
      console.log(
        '🔍 [ENTITY RESOLVER] LessonDocument ID detected, looking up lesson then sessioncours then session',
      );
      const lessondocument = await this.lessondocumentModel.findByPk(entityId);
      if (!lessondocument || !lessondocument.id_lesson) {
        throw new ForbiddenException(
          'Lesson document not found or not linked to a lesson',
        );
      }

      const lesson = await this.lessonModel.findByPk(lessondocument.id_lesson);
      if (!lesson || !lesson.id_cours) {
        throw new ForbiddenException(
          'Lesson not found or not linked to a course',
        );
      }

      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours || !sessionCours.id_session) {
        throw new ForbiddenException(
          'Lesson course not found or not linked to a session',
        );
      }

      console.log(
        '🔍 [ENTITY RESOLVER] Found session ID from lessondocument:',
        sessionCours.id_session,
      );
      return sessionCours.id_session;
    }

    // 6. Check if it's an event session ID (event endpoint)
    if (requestUrl.includes('/event/student/session/')) {
      console.log('🔍 [ENTITY RESOLVER] Event session ID detected');
      return entityId;
    }

    // 7. Fallback: try to determine by checking what entity exists
    console.log(
      '🔍 [ENTITY RESOLVER] Unknown endpoint, trying to determine entity type...',
    );

    // Try lessondocument first (most specific)
    const lessondocument = await this.lessondocumentModel.findByPk(entityId);
    if (lessondocument && lessondocument.id_lesson) {
      console.log('🔍 [ENTITY RESOLVER] Detected as lessondocument ID');
      // Resolve directly to avoid recursion
      const lesson = await this.lessonModel.findByPk(lessondocument.id_lesson);
      if (!lesson || !lesson.id_cours) {
        throw new ForbiddenException(
          'Lesson not found or not linked to a course',
        );
      }
      const sessionCours = await this.sessionCoursModel.findByPk(
        lesson.id_cours,
      );
      if (!sessionCours || !sessionCours.id_session) {
        throw new ForbiddenException(
          'Lesson course not found or not linked to a session',
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
      if (!sessionCours || !sessionCours.id_session) {
        throw new ForbiddenException(
          'Lesson course not found or not linked to a session',
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

    // Extract sessionId from params - handle both 'sessionId' and 'id' parameters
    let sessionId = request.params.sessionId || request.params.id;

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

      // if (!decoded || decoded.error) {
      //   console.log(
      //     '❌ JwtAuthGuardAsStudentInSession: Token verification failed for',
      //     request.url,
      //   );

      //   if (decoded && decoded.type === 'TokenExpiredError') {
      //     throw new ForbiddenException(
      //       'Votre session a expiré. Veuillez vous reconnecter.',
      //     );
      //   } else if (decoded && decoded.type === 'JsonWebTokenError') {
      //     throw new ForbiddenException("Token d'authentification invalide");
      //   } else {
      //     throw new ForbiddenException(
      //       "La clé d'authentification fournie a déjà expiré",
      //     );
      //   }
      // }

      const userId = decoded.id_user;

      if (!userId) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: No user ID in token for',
          request.url,
        );
        throw new ForbiddenException(
          "La clé d'authentification ne contient pas d'identifiant utilisateur",
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
        throw new ForbiddenException('Utilisateur non trouvé');
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
          "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources",
        );
      }

      // Check enrollment in the session
      if (!sessionId) {
        console.log(
          '❌ JwtAuthGuardAsStudentInSession: No session ID provided for',
          request.url,
        );
        throw new ForbiddenException(
          'Session ID is required (parameter should be sessionId or id)',
        );
      }

      // Use the entity resolver to get the actual session ID
      const actualSessionId = await this.resolveEntityToSessionId(
        sessionId,
        request.url,
      );

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
          `Accès refusé - Vous n'êtes pas inscrit à la session "${sessionTitle}"`,
          402,
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
          `Accès refusé - Votre inscription à la session "${sessionTitle}" est en statut "${getStatusInFrench(enrollment.status)}". Veuillez attendre que le secrétaire vous laisse entrer.`,
          402,
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
      throw new ForbiddenException(
        "La clé d'authentification fournie a déjà expiré",
      );
    }
  }
}
