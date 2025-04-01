import { Test, TestingModule } from '@nestjs/testing';
import { HasrolesController } from './hasroles.controller';

describe('HasrolesController', () => {
  let controller: HasrolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HasrolesController],
    }).compile();

    controller = module.get<HasrolesController>(HasrolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
