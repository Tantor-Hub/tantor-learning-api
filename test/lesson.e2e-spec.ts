import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SessionCours } from '../src/models/model.sessioncours';
import { getModelToken } from '@nestjs/sequelize';

describe('LessonController (e2e)', () => {
  let app: INestApplication<App>;
  let sessionCoursModel: typeof SessionCours;
  let validSessionCoursId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    sessionCoursModel = moduleFixture.get<typeof SessionCours>(
      getModelToken(SessionCours),
    );

    // Create a test SessionCours for valid tests
    const testSessionCours = await sessionCoursModel.create({
      title: 'Test Course',
      description: 'Test course for lesson creation',
      is_published: true,
    });
    validSessionCoursId = testSessionCours.id;
  });

  afterEach(async () => {
    // Clean up test data
    if (validSessionCoursId) {
      await sessionCoursModel.destroy({ where: { id: validSessionCoursId } });
    }
  });

  describe('/lesson/create (POST)', () => {
    it('should create a lesson with valid id_cours', () => {
      const createLessonDto = {
        title: 'Test Lesson',
        description: 'Test lesson description',
        id_cours: validSessionCoursId,
      };

      return request(app.getHttpServer())
        .post('/lesson/create')
        .send(createLessonDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(createLessonDto.title);
          expect(res.body.description).toBe(createLessonDto.description);
          expect(res.body.id_cours).toBe(createLessonDto.id_cours);
        });
    });

    it('should fail to create a lesson with invalid id_cours', () => {
      const createLessonDto = {
        title: 'Test Lesson',
        description: 'Test lesson description',
        id_cours: 'invalid-uuid-that-does-not-exist',
      };

      return request(app.getHttpServer())
        .post('/lesson/create')
        .send(createLessonDto)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('SessionCours with id');
          expect(res.body.message).toContain('does not exist');
        });
    });
  });
});
