import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Score} from './score.entity';
import {Repository} from 'typeorm';
import {VoteDto} from '../vote/vote.dto';
import * as Elo from '@pelevesque/elo';
import {Outcome, OutcomeResponse} from './interfaces/outcome.interface';
import {Company} from '../company/company.entity';
import {Question} from '../question/question.entity';

const DEFAULT_SCORE: number = 1000;
const EloCalculator = new Elo();

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {
  }

  async vote(voteDto: VoteDto) {
    const winnerScore: Score = await this.getScore(voteDto, 'winner');
    const loserScore: Score = await this.getScore(voteDto, 'loser');

    const oldWinnerScore: number = winnerScore ? winnerScore.score : DEFAULT_SCORE;
    const oldLoserScore: number = loserScore ? loserScore.score : DEFAULT_SCORE;

    const outcome: OutcomeResponse = this.calculateOutcome(oldWinnerScore, oldLoserScore);

    await this.saveScore(voteDto, winnerScore, outcome.winnerScore, 'winner');
    await this.saveScore(voteDto, loserScore, outcome.loserScore, 'loser');

    return outcome;
  }

  private getScore(voteDto: VoteDto, position: string) {
    return this.scoreRepository
      .createQueryBuilder()
      .where(`"questionId" = :questionId AND "companyId" = :${position}Id`, voteDto)
      .getOne();
  }

  private async saveScore(voteDto: VoteDto, score: Score, rating: number, position: string) {
    if (score) {
      score.score = rating;
      return this.scoreRepository.save(score);
    } else {
      const newScore: Score = new Score();
      newScore.company = await this.companyRepository.findOne(voteDto[`${position}Id`]);
      newScore.question = await this.questionRepository.findOne(voteDto.questionId);
      newScore.score = rating;
      return this.scoreRepository.save(newScore);
    }
  }

  private calculateOutcome(a: number, b: number) {
    const outcome: Outcome = EloCalculator.getOutcome(a, b, 1, 40, 400);
    return {
      winnerScore: Math.round(outcome.a.rating),
      winnerDelta: Math.round(outcome.a.delta),
      loserScore: Math.round(outcome.b.rating),
      loserDelta: Math.round(outcome.b.delta),
    };
  }
}