import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/users/dtos/request/create-user.dto";

@Injectable()
export class UserService {
    constructor() {}
    //create user
    async create(createUserDto: CreateUserDto) {}
}