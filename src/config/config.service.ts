import * as fs from 'fs';
import { parse } from 'dotenv';
export class ConfigService {
  private readonly envConf: { [key: string]: string };

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      const filePath = __dirname + '/../../.env';
      const existPath = fs.existsSync(filePath);

      if (!existPath) {
        console.log('ENV: Development');
        process.exit(0);
      }

      this.envConf = parse(fs.readFileSync(filePath));
    } else {
      this.envConf = {
        PORT: process.env.PORT,
      };
    }
  }

  get(key: string): string {
    return this.envConf[key];
  }
}
