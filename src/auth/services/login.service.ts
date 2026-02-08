import { Injectable } from "@nestjs/common";

@Injectable()
export class LoginService {
    constructor() { }
    // step: login
    async login() {
        return 'Hello World!';
    }
}