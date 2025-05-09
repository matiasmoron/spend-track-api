import { IsNotEmpty, IsString, IsEnum, Matches, MaxLength } from 'class-validator';
import { GroupType } from '../../../domain/value-objects';

export class CreateGroupDTO {
  @IsNotEmpty({ message: 'Group name is required' })
  @Matches(/^(?!\s*$).+/, { message: 'Group name cannot be empty or only spaces' })
  @IsString({ message: 'Group name must be a string' })
  @MaxLength(200, { message: 'Group name must be shorter than or equal to 200 characters' })
  name!: string;

  @IsNotEmpty({ message: 'Group type is required' })
  @IsEnum(GroupType, {
    message: `Group type must be one of: ${Object.values(GroupType).join(', ')}`,
  })
  type!: GroupType;
}
