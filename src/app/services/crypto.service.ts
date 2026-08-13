import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * AES-256 encrypt / decrypt — matches Node.js backend crypto.js.
 * Key must match CRYPTO_KEY in node-backend/.env
 */
@Injectable({ providedIn: 'root' })
export class CryptoService {

  private readonly SECRET_KEY = 'PlantMap$SecureKey#2026!AES256!!';

  decrypt(token: string): string {
    return CryptoJS.AES.decrypt(token, this.SECRET_KEY).toString(CryptoJS.enc.Utf8);
  }

  encrypt(plaintext: string): string {
    return CryptoJS.AES.encrypt(plaintext, this.SECRET_KEY).toString();
  }
}
