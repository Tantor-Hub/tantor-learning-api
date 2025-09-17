import { Test, TestingModule } from '@nestjs/testing';
import { ModeledeformationService } from './modeledeformation.service';

describe('ModeledeformationService', () => {
  let service: ModeledeformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModeledeformationService],
    }).compile();

    service = module.get<ModeledeformationService>(ModeledeformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
