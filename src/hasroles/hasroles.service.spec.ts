import { Test, TestingModule } from '@nestjs/testing';
import { HasrolesService } from './hasroles.service';

describe('HasrolesService', () => {
  let service: HasrolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HasrolesService],
    }).compile();

    service = module.get<HasrolesService>(HasrolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
