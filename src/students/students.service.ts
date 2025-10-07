import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { isUUID } from 'class-validator';

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

  async findAll(paginationDto: PaginationDto) {
    try{
      const {limit, offset} = paginationDto;
      return await this.studentRepository.find({
        take: limit,
        skip: offset
      });
    }catch(error){
      this.handleException(error);
    }
  }

  async findOne(term: string) {
    let student : Student | null;

    if(isUUID(term)){
      student = await this.studentRepository.findOneBy({id: term})
    }else{
      const queryBuilder = this.studentRepository.createQueryBuilder('student');
      student = await queryBuilder.where('UPPER(name)=:name or nickname=:nickname',{
        name: term.toUpperCase(),
        nickname: term.toLowerCase()
      })
      .getOne()
    }

    if(!student)
      throw new NotFoundException(`Student with ${term} not found`);

    return student;
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
