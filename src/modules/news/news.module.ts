import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsController } from './news.controller';
import { NewRepository } from './news.repository';
import { NewsService } from './news.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewRepository]), HttpModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
