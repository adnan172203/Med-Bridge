import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SignupDto, SigninDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorators';
import { AuthType } from './enums/auth-type.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(AuthType.None)
  @Post('signup')
  signUp(@Body() body: SignupDto) {
    return this.authService.signUp(body);
  }

  @Auth(AuthType.None)
  @Post('signin')
  signIn(@Body() body: SigninDto, @Res() res: Response) {
    return this.authService.signIn(res, body);
  }
}
