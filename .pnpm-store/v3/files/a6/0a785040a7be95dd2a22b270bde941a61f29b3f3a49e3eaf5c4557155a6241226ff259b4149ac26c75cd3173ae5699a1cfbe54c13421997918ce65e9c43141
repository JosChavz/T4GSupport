import { Injectable } from '@angular/core';
import CryptoES from 'crypto-es';

// https://javascript.info/localstorage
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private ENCRYPT_KEY = 'asdfjkl;';

  constructor() { }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setItem(key: string, data: any): void {
    localStorage.setItem(key, this.encrypt(JSON.stringify(data)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getItem(key: string): any {
    const data = localStorage.getItem(key) || '';
    if (data) {
      return JSON.parse(this.decrypt(data));
    } else {
      return null;
    }
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }

  // Using encryption following this:
  // https://blog.jscrambler.com/working-with-angular-local-storage
  // https://medium.com/front-end-weekly/refactoring-cryptojs-in-modern-ecmascript-1d4e1837c272

  private encrypt(txt: string): string {
    return CryptoES.AES.encrypt(txt, this.ENCRYPT_KEY).toString();
  }

  private decrypt(txtToDecrypt: string) {
    return CryptoES.AES.decrypt(txtToDecrypt, this.ENCRYPT_KEY).toString(CryptoES.enc.Utf8);
  }
}
