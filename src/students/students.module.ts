import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Grade } from './entities/grade.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StudentsController],
  imports:[
    TypeOrmModule.forFeature([Student, Grade]),
    AuthModule
  ],
  providers: [StudentsService],
  exports: [StudentsService]
})
export class StudentsModule {}
