import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Company} from './company.entity';
import {CompanyController} from './company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
