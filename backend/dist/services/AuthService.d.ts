import { AuthRepository } from "../repositories/AuthRepository";
import { LoginDto, RegisterDto, AuthResponse, UserInfo } from "../models/Auth";
export declare class AuthService {
    private authRepo;
    constructor(authRepo: AuthRepository);
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    getCurrentUser(user: any): UserInfo;
}
//# sourceMappingURL=AuthService.d.ts.map