import { VCardMeta, VCardRaw } from "src/sync/adapters/adapter";
import { AdapterInterface } from "src/sync/adapters/adapterInterface";

export class CarddavGenericAdapter implements AdapterInterface {
  private bearerToken: string;
  private addressBookUrl: string;

  constructor() {
    this.bearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMDFkZjgwZmMwNmQ2ZTUzZTYxMjA4MGQ1MTRhMGRkYThmMGYxNzBkOGFiM2MxYmM0ZDIxM2Y4NDk0MzFjNDNmZGQxZTc4YzMxYTgxZDY2OGEiLCJpYXQiOjE3NTAzMzY3NzQuNjg4ODc2LCJuYmYiOjE3NTAzMzY3NzQuNjg4ODc4LCJleHAiOjE3ODE4NzI3NzQuNjgzMDM5LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.KwCHqO-9wBxmo86W-CLc4uEdFelVX2ZSHuG_e-6Gem3cRadw9ARP19OfusVanE9OPP88-8LCPTHM9ZAYu9sEVAC5kCEKI0HQ9AIvmLDlzgTTmmm_UZMYbOj86h2tevvxdttHlhJYbMl-9L9URy9AfHtxafB4oBiNLA9fsXWnC00cAuxNyLXVtcxedvlDemNXSRr6GZlTfrwKs0Unaf3TFVQlDznOn78lBSUkM53sxq6UP7zCNrfxIjY1lG75C0oFtEkalQXqnSu0-Cd6rPecCjK76mZoWNrcLK04ss2UtOyKWyytSwdnllF2CMXnB995xKOkmzxTWtnz7WuToHVMad7ED87QiVXVld3lJXmR-1NuAfLeWGN1AY4VUu5tq7uu38Px5XYWUi-D_Tkog3uNT9J015RnfRJQvQO6SaUFjUYRNlx2uZ78TqDwrQmruHAhmj4RxaLVKdVcNhiLGk1b-fnr1GV4ki7nrxGgdxudEGnB-A5GAPAjVyM7ML4r2wT0RR-q2QZMUi2D-vuPHM1EPL21hPIssDmrBxhaXh9NUaKk16BnzRr8RaHXWlZMtwe9V5Piy0U5QU9fIDA1aR2qBuW-37toVZDP6H6rNShe8x72c5OSUqyxuvaXDhEsbxZ4DecaP2ILFHtNG0b59eACMcW6drzW4YZx_v1LZFppc7c' ;
    this.addressBookUrl = 'http://localhost:8080/dav/addressbooks/broekema41@gmail.com/contacts' ;
  }

  private getAuthHeader() {
    return 'Bearer ' + this.bearerToken;
  }

  private async doFetch(options: RequestInit): Promise<Response> {
    return fetch(this.addressBookUrl, {
      ...options,
      headers: {
        ...options.headers,
        ['Authorization']: this.getAuthHeader()
      }
    });
  }

  private async doPush(options: RequestInit, vcard: VCardRaw): Promise<void> {
    const vcfUrl = this.addressBookUrl + `${vcard.uid}.vcf`;
    const res = await fetch(vcfUrl, {
      method: 'PUT',
      body: vcard.raw,
      headers: {
        ...options.headers,
        ['Authorization']: this.getAuthHeader(),
        ['Content-Type']: 'text/vcard; charset=utf-8'
      }
    });
    if (!res.ok) throw new Error(`Push failed: ${res.statusText}`);
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const res = await this.doFetch({ method: 'OPTIONS' });
      return res.ok;
    } catch {
      return false;
    }
  }

  getList(): Promise<VCardMeta[]> {
    return Promise.resolve([]);
  }

  pull(uid: string): Promise<VCardRaw | undefined> {
    return Promise.resolve(undefined);
  }

  push(vcard: VCardRaw): Promise<void> {
    return Promise.resolve(undefined);
  }

}

