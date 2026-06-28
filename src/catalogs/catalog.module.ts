import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductController } from 'src/catalogs/controllers/product.controller';
import { ProductService } from 'src/catalogs/services/product.service';
import { MailModule } from 'src/mails/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), AuthModule, MailModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class CatalogModule {}
