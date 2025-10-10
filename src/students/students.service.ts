import { Injectable, InternalServerErrorException, Logger, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { isUUID } from 'class-validator';
import { Grade } from './entities/grade.entity';

@Injectable()
export class StudentsService {
  private logger = new Logger('StudentsService')

  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly dataSource: DataSource
  ){}

  async create(createStudentDto: CreateStudentDto) {
    try{
      const { grades = [], ...studentDetails} = createStudentDto;
      const student = this.studentRepository.create({
        ...studentDetails,
        grade: grades.map(grade => this.gradeRepository.create(grade))
      });
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
      .leftJoinAndSelect('student.grade', 'studentGrades')
      .getOne()
    }

    if(!student)
      throw new NotFoundException(`Student with ${term} not found`);

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {

    const {grades, ...studentDetails} = updateStudentDto;

    const student = await this.studentRepository.preload({
      id:id,
      ...studentDetails
    })

    if(!student) throw new NotFoundException(`Student with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      if(grades){
        await queryRunner.manager.delete(Grade, {student:{id}});
        student.grade = grades.map(grade => this.gradeRepository.create(grade))
      }

      await queryRunner.manager.save(student);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);
      
    }catch(error){
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  deleteAllStudents(){
    const query = this.studentRepository.createQueryBuilder();
    try{
      return query.delete()
                        .where({})
                        .execute();
    }catch(error){
      this.handleException(error);
    }
  }

  private handleException(error){
    this.logger.error(error);
    if(error.code === '23505')
        throw new InternalServerErrorException(error.detail)
  }
}
