import { Test, TestingModule } from '@nestjs/testing';
import { ModeledeformationController } from './modeledeformation.controller';

describe('ModeledeformationController', () => {
  let controller: ModeledeformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModeledeformationController],
    }).compile();

    controller = module.get<ModeledeformationController>(ModeledeformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
