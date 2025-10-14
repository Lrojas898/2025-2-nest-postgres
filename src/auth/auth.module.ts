import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports:[TypeOrmModule.forFeature([User]),
          PassportModule.register({defaultStrategy: 'jwt'}),
          JwtModule.registerAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService) =>{
                return{
                  secret: configService.get('JWT_SECRET'),
                  signOptions:{
                    expiresIn: '1h'
                  }
                }
              }
            })],
  providers: [AuthService],
  exports: [TypeOrmModule, PassportModule, JwtModule]
})
export class AuthModule {}
