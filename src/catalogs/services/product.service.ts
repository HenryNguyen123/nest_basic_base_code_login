import { Injectable } from '@nestjs/common';

@Injectable({})
export class ProductService {
  constructor() {}
  async test() {
    const check = () => {
      const name = 'nguyen van a';
      return name;
    };
    return check();
  }
}
