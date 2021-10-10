import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './news.entity';
import { NewRepository } from './news.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

import moment from 'moment';

import { Like, Between } from 'typeorm';
@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewRepository)
    private readonly _newRepository: NewRepository,
    private _httpService: HttpService,
  ) {}

  async list(
    Filters: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const where = {};

    if (Filters.title) {
      where['title'] = Like(`%${Filters.title}%`);
    }
    if (Filters.authorId) {
      where['author'] = Like(`%${Filters.author}%`);
    }
    if (Filters.tags) {
      where['tags'] = Like(`%${Filters.tags}%`);
    }
    if (Filters.month) {
      const months = {
        january: '01',
        february: '02',
        march: '03',
        april: '04',
        may: '05',
        june: '06',
        july: '07',
        august: '08',
        september: '09',
        october: '10',
        november: '11',
        december: '12',
      };
      const year = moment().format('YYYY');
      const month = months[`${Filters.month}`];
      const endDay = moment(`${year}-${month}-01`).endOf('month').format('DD');

      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-${endDay}`;

      where['createDate'] = Between(startDate, endDate);
    }
    const news: News[] = await this._newRepository.find({
      where,
      take: 5,
    });
    const arr = [];
    for (let i = 0; i < news.length; i++) {
      const item = news[i];
      arr.push({
        id: item.id,
        text: item.text,
        title: item.title,
      });
    }
    return {
      message: 'OK',
      data: {
        News: arr,
      },
    };
  }

  async delete(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    await this._newRepository.softDelete(data.newId);
    return {
      message: 'OK',
      data: {},
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async save() {
    const result = await this._httpService
      .get('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
      .toPromise();

    const hits = result.data.hits;
    for (let i = 0; i < hits.length; i++) {
      const item = hits[i];
      const tags = item._tags;
      const auxId = tags[2].split('_')[1];
      const hitId = item.story_id ? item.story_id : auxId;
      const title =
        item.title || item.story_title
          ? item.title || item.story_title
          : item._highlightResult.story_title.value || 'no_title';

      const text = item.comment_text
        ? item.comment_text
        : item._highlightResult.comment_text.value || 'no_comment';

      const auxAuthor = tags[1].split('_')[1];

      const author = item.author ? item.author : auxAuthor;
      const createDate = item.created_at;
      const newItem = {
        createDate,
        hitId,
        author,
        title,
        text,
        tags,
      };
      const newsIdDb: News[] = await this._newRepository.find({
        where: {
          hitId: hitId,
        },
        withDeleted: true,
      });
      console.log(newsIdDb.length == 0);
      if (newsIdDb.length == 0) {
        this._newRepository.save(newItem);
      }
    }
  }
}
// ,
