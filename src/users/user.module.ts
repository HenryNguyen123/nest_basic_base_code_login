import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./controllers/user.controller";
import { Module } from "@nestjs/common";

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [UserController],
    providers: [],
    exports: [],
})
export class UserModule;
