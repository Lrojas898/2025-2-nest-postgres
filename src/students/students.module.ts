import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';

@Module({
  controllers: [StudentsController],
  imports:[
    TypeOrmModule.forFeature([Student])
  ],
  providers: [StudentsService],
})
export class StudentsModule {}
