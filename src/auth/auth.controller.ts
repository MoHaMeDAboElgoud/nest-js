import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Controller, UseGuards, Post, Request } from '@nestjs/common';

@UseGuards(AuthGuard('local'))
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}
