import { User, UserDocument } from 'src/schemas/users.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(filters = {}, options = {}) {
    return this.userModel.find(filters, options);
  }

  async findOne(filters = {}, projection = '', options = {}) {
    return this.userModel.findOne(filters, projection, options);
  }

  async updateOne(filters = {}, update: UpdateUserDto, options = {}) {
    return this.userModel.findOneAndUpdate(filters, update, options);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
