
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ username }, 'username password _id name');
    if (user) {
        const isValidPass = await bcrypt.compare(pass, user.password);
        if (isValidPass) {
            const { password, ...result } = user.toObject();
            return result;
        }
    }
    return null;
  }

  async login(user) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
