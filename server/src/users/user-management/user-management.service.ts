import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAllUsers() {
    return await this.userRepository.find({});
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async updateUser(id: string, userData: Partial<User>) {
    const existingUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, userData);
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
