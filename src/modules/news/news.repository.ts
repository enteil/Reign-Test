import { Repository, EntityRepository } from 'typeorm';
import { News } from './news.entity';
@EntityRepository(News)
export class NewRepository extends Repository<News> {}
