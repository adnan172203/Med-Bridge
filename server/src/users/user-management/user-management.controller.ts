import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UpdateUserDto } from './dto/user.management.dto';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get('')
  findAll() {
    return this.userManagementService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userManagementService.findUserById(id);
  }

  //put update
  @Put('/:id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userManagementService.updateUser(id, body);
  }
}
