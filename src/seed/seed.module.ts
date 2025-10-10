import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { StudentsModule } from 'src/students/students.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports:[StudentsModule]
})
export class SeedModule {}
