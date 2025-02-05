import { Module } from '@nestjs/common';
import { RazorService } from './razor.service';

@Module({
  providers: [RazorService],
  exports: [RazorService],
})
export class RazorModule {}
