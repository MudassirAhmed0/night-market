import { IsString, Length } from 'class-validator';

export class IdParamDto {
  @IsString()
  @Length(10, 100)
  id!: string;
}
