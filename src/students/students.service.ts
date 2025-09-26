import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentsService {
  private logger = new Logger('StudentsService')

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>
  ){}

  async create(createStudentDto: CreateStudentDto) {
    try{
      const student = this.studentRepository.create(createStudentDto);
      await this.studentRepository.save(student);
      return student;
    }catch(error){
      this.handleException(error);
    }
  }

  findAll() {
    return `This action returns all students`;
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  private handleException(error){
    this.logger.error(error);
    if(error.code === '23505')
        throw new InternalServerErrorException(error.detail)
      
  }
}
