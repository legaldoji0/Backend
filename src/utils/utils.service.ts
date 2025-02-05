import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
// import { nanoid } from 'nanoid';

@Injectable()
export class UtilsService {
  /**
   * @name hashString
   * @description
   * Hashes the given string using SHA-256 algorithm. ( node.js crypto module )
   */
  hashString(str: string): string {
    const hash = createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
  }

  randomString(length: number): string {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // uuid(): string {
  //   return nanoid(20);
  // }
}
