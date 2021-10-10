import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly _newsService: NewsService) {}

  @Post('/list')
  @HttpCode(HttpStatus.OK)
  async list(@Body() body): Promise<Record<string, unknown>> {
    const {
      data: { Filters },
    } = body;
    const result = this._newsService.list(Filters);
    return result;
  }

  @Post('/delete')
  @HttpCode(HttpStatus.OK)
  async delete(@Body() body): Promise<Record<string, unknown>> {
    const {
      data: { newId },
    } = body;
    return await this._newsService.delete({ newId });
  }
}
