import {IsString, IsNumber, IsEmail, IsIn, IsArray, IsPositive, IsOptional} from 'class-validator'
import { Grade } from '../entities/grade.entity';
export class CreateStudentDto {
   
        @IsString()
        name: string;
    
        @IsNumber()
        @IsPositive()
        @IsOptional()
        age: number;
    
        @IsString()
        @IsEmail()
        email:string;
       
         @IsString()
         @IsIn(['Male', 'Female', 'Other'])
        gender: string;

        @IsArray()
        subjects: string[];

        @IsArray()
        @IsOptional()
        grades: Grade[];
}
