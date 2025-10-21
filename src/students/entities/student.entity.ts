import {BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { Grade } from './grade.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Student {

    @ApiProperty({
        example: '38c8f3fe-zzzz-xxxx-81ff-77fe9846f1dd',
        description: 'Student id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Gus Gonzalez',
        description: 'Student name',
    })
    @Column('text')
    name: string;

    @ApiProperty()
    @Column({
        type: 'int',
        nullable: true
    })
    age: number;

    @Column({
        type: 'text',
        unique: true
    })
    email:string;

    @Column('text')
    nickname: string;

    @Column('text')
    gender: string;

    @Column({
        type: 'text',
        array: true
    })
    subjects: string[]

    @OneToMany(
        ()=> Grade,
        (grade) => grade.student,
        {cascade: true, eager: true}
    )
    grade?: Grade[]

    @BeforeInsert()
    checkNicknameInsert(){
        if(!this.nickname){
            this.nickname = this.name
        }

        this.nickname = this.nickname.toLowerCase()
                        .replace(" ", "_")
                        +this.age;
    }

    @BeforeUpdate()
    checkNicknameUpdate(){
        this.nickname = this.nickname.toLowerCase()
                        .replace(" ", "_")
                        +this.age;
    }

}
