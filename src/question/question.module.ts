import {Module} from '@nestjs/common';
import {QuestionController} from './question.controller';
import {QuestionService} from './question.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Question} from './question.entity';
import {Score} from '../score/score.entity';
import {Company} from '../company/company.entity';
import {ScoreService} from '../score/score.service';

@Module({
    imports: [TypeOrmModule.forFeature([Company, Score, Question])],
    controllers: [QuestionController],
    providers: [QuestionService, ScoreService],
})
export class QuestionModule { }
