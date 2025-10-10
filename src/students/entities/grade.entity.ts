import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./student.entity";

@Entity()
export class Grade{

    @PrimaryGeneratedColumn('uuid')
    id?:string;

    @Column('text')
    subject:string;

    @Column('text')
    grade:number;

    @ManyToOne(
        () => Student,
        (student)=> student.grade,
        { onDelete: 'CASCADE'}
    )
    student?:Student;
}