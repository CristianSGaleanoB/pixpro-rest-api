import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CdnService } from './cdn.service';
import { PassThrough } from 'stream';

// Mock cloudinary completely — we never hit the real API
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';
import type { UploadedFile as UploadedFileType } from 'src/common/types/uploaded-file.type';

describe('CdnService', () => {
  let service: CdnService;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  const mockFile: UploadedFileType = {
    buffer: Buffer.from('fake-image-data'),
    mimetype: 'image/jpeg',
    originalname: 'test.jpg',
    size: 100,
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'CLOUDINARY_CLOUD_NAME':
          return 'test-cloud';
        case 'CLOUDINARY_API_KEY':
          return 'test-key';
        case 'CLOUDINARY_API_SECRET':
          return 'test-secret';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CdnService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CdnService>(CdnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure cloudinary on instantiation', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  });

  describe('uploadRawFile', () => {
    type CloudinaryCallback = (error: Error | null, result?: { secure_url?: string }) => void;

    function mockStream(behavior: (cb: CloudinaryCallback) => void): PassThrough {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_options: unknown, callback: CloudinaryCallback) => {
          behavior(callback);
          return new PassThrough();
        },
      );
      return new PassThrough();
    }

    it('should upload a file and return the secure URL on success', async () => {
      const fakeUrl = 'https://res.cloudinary.com/pixpro/raw/project-123/image-456';

      mockStream((callback) => {
        setImmediate(() => {
          callback(null, { secure_url: fakeUrl });
        });
      });

      const result = await service.uploadRawFile(mockFile, 'project-123', 'image-456');

      expect(result).toBe(fakeUrl);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'pixpro/raw/project-123',
          public_id: 'image-456',
          resource_type: 'image',
        },
        expect.any(Function),
      );
    });

    it('should reject when cloudinary returns an error', async () => {
      const uploadError = new Error('Cloudinary upload failed');

      mockStream((callback) => {
        setImmediate(() => {
          callback(uploadError, undefined);
        });
      });

      await expect(service.uploadRawFile(mockFile, 'project-123', 'image-456')).rejects.toThrow(
        'Cloudinary upload failed',
      );
    });

    it('should reject when cloudinary returns no result and no error', async () => {
      mockStream((callback) => {
        setImmediate(() => {
          callback(null, undefined);
        });
      });

      await expect(service.uploadRawFile(mockFile, 'project-123', 'image-456')).rejects.toThrow(
        'Upload returned empty result',
      );
    });

    it('should pass the correct folder structure based on projectId', async () => {
      const fakeUrl = 'https://res.cloudinary.com/pixpro/raw/project-999/img-001';

      mockStream((callback) => {
        setImmediate(() => {
          callback(null, { secure_url: fakeUrl });
        });
      });

      await service.uploadRawFile(mockFile, 'project-999', 'img-001');

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'pixpro/raw/project-999',
          public_id: 'img-001',
          resource_type: 'image',
        },
        expect.any(Function),
      );
    });
  });
});
