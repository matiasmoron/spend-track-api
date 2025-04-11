import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';
import { GroupType } from '../../../domain/entities/group';

export class CreateGroupDTO {
  @IsNotEmpty({ message: 'Group name is required' })
  @Matches(/^(?!\s*$).+/, { message: 'Group name cannot be empty or only spaces' })
  @IsString({ message: 'Group name must be a string' })
  name!: string;

  @IsNotEmpty({ message: 'Group type is required' })
  @IsEnum(GroupType, {
    message: `Group type must be one of: ${Object.values(GroupType).join(', ')}`,
  })
  type!: GroupType;
}
