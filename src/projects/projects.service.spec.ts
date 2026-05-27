import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { BrokerService } from '../broker/broker.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockProjectModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockBrokerService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken('Project'),
          useValue: mockProjectModel,
        },
        {
          provide: BrokerService,
          useValue: mockBrokerService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
