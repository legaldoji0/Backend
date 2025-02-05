import { DatabaseModule } from '../../database/database.module';
import { Module } from '@nestjs/common';
import { ClientAdvocateController } from './client.advo.controller';

@Module({
  imports: [DatabaseModule],
  providers: [],
  controllers: [ClientAdvocateController],
})
export class ClientAdvocateModule {}
