import {IsString, IsNumber, IsEmail, IsIn, IsArray} from 'class-validator'
export class CreateStudentDto {
   
        @IsString()
        name: string;
    
        @IsNumber()
        age: number;
    
        @IsString()
        @IsEmail()
        email:string;
    
        @IsString()
        nickname: string;
    
         @IsString()
         @IsIn(['Male', 'Female', 'Other'])
        gender: string;

        @IsArray()
        subjects: string[]
}
