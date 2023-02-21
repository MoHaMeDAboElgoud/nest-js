import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserContactDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async isUsernameUnique(username) {
    const foundUser = await this.usersService.findOne({ username });
    return Boolean(!foundUser);
  }

  async checkRequired(field) {
    return new Promise((resolve, reject) => {
      if (!field) {
        reject(new HttpException({
          status: HttpStatus.FORBIDDEN,
          message: 'Required Data',
        }, HttpStatus.FORBIDDEN));
      }
      resolve("");
    }); 
  }

  async validateUserData(user) {
    const { name, username, password, address } = user;
    const [hashedPassword, isUniqueUserName] = await Promise.all([
      bcrypt.hash(password, 10),
      this.isUsernameUnique(username),
      this.checkRequired(password),
      this.checkRequired(name),
      this.checkRequired(username),
      this.checkRequired(address),
    ]);
    if (!isUniqueUserName) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        message: "Username Already Exists",
      }, HttpStatus.FORBIDDEN);
    }
    return {
      name,
      username,
      address,
      password: hashedPassword
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const userData = await this.validateUserData(createUserDto);
      const createdUser = await this.usersService.create(userData);
      return { userId: createdUser._id };
    } catch (error) {
      const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response.message || 'Internal Server Error';
      throw new HttpException({
        status,
        error: message,
      }, status, {
        cause: error
      });
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ _id: id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // return this.usersService.updateOne(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  async validateUserContact(userContactData) {
    const { phone, name } = userContactData;
    await Promise.all([
      this.checkRequired(phone),
      this.checkRequired(name)
    ]);
    return {
      phone,
      name
    }
  }

  @Post(':id/contact')
  async addUserContact(@Param('id') id: string, @Body() userContact: CreateUserContactDto) {
    try {
      const user = await this.usersService.findOne({ _id: id });
      if (!user) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Not found id",
        }, HttpStatus.NOT_FOUND);
      }
      const userContactData = await this.validateUserContact(userContact);
      return this.usersService.updateOne({ _id: id }, {
        $addToSet: { contacts: userContactData }
      }, {
        projection: "name address contacts",
        new: true
      })
    } catch (error) {
      const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response.message || 'Internal Server Error';
      throw new HttpException({
        status,
        error: message,
      }, status, {
        cause: error
      });
    }
  }

  @Delete(':id/contact/:contactIndex')
  async deleteUserContact(@Param('id') id: string, @Param('contactIndex') contactIndex: number) {
    try {
      const user = await this.usersService.findOne({ _id: id }, 'contacts');
      if (!user) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Not found id",
        }, HttpStatus.NOT_FOUND);
      }
      if (!(user.contacts && user.contacts[contactIndex])) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Not found contact",
        }, HttpStatus.NOT_FOUND);
      }
      user.contacts.splice(contactIndex, 1);
      return user.save();
    } catch (error) {
      const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response.message || 'Internal Server Error';
      throw new HttpException({
        status,
        error: message,
      }, status, {
        cause: error
      });
    }
  }
}
