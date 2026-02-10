import { CategoryController } from 'src/categories/controllers/category.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [],
  exports: [],
})
export class CategoryModule {}
