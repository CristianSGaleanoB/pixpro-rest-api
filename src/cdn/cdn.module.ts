import { Module } from '@nestjs/common';
import { CdnService } from './cdn.service';
import { MockCdnService } from './mock-cdn.service';

@Module({
  providers: [
    {
      provide: CdnService,
      useClass: MockCdnService,
    },
  ],
  exports: [CdnService],
})
export class CdnModule {}
