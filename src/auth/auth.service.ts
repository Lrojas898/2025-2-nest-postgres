import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {
    const {password, ...userData }= createUserDto;
    try{
      const user = this.userRepository.create({
        ...userData,
        password: this.encryptPassword(password)
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
    }catch(error){
      this.handleException(error);
    }
  }

  async login(loginDto: LoginDto){
    const {email, password} = loginDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true}
    })

    if(!user) throw new NotFoundException(`User ${email} not found`)
    
      if(!bcrypt.compareSync(password, user.password!))
        throw new UnauthorizedException(`Email or password incorrect`);

    delete user.password;
    return user;
  }   

  encryptPassword(password){
    return bcrypt.hashSync(password, 10)
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
  private handleException(error){
      this.logger.error(error);
      if(error.code === '23505')
          throw new InternalServerErrorException(error.detail)
    }
}
