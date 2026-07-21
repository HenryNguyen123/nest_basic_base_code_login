import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductService } from 'src/catalogs/services/product.service';

@ApiTags('product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('test')
  async test() {
    const start = performance.now();
    const res = await this.productService.test();
    console.log(`MySQL: ${(performance.now() - start).toFixed(4)} ms`);
    return res;
  }
}
