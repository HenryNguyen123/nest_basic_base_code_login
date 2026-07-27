import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleAdminGuard } from 'src/auth/guards/role-admin.guard';
import { ProductService } from 'src/catalogs/services/product.service';
import { measureTime, timeNow } from 'src/commons/utils/performance.util';

@ApiTags('product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('test')
  async test() {
    const start = timeNow();
    const res = await this.productService.test();
    measureTime('msql', start);
    return res;
  }
  //create
  @Post()
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  async create() {}
  //read
  @Get()
  async read() {}
  //update
  @Patch(':id')
  async update() {}
  //delete
  @Delete(':id')
  async remove() {}
}
