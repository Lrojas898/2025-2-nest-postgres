import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { initialData } from './data/seed-student.data';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class SeedService {

    constructor(private readonly studentsService: StudentsService){}


    async runSeed(){
        await this.insertNewStudents();
        return 'SEED EXECUTED';
    }

    async insertNewStudents(){
        await this.studentsService.deleteAllStudents();
        const students = initialData.students;

        const insertPromises : Promise<Student | undefined>[] = [];

        students.forEach(student => {
            insertPromises.push(this.studentsService.create(student));
        })

        await Promise.all(insertPromises);
        return true;
    }

}
