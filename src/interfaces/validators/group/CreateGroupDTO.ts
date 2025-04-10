import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { GroupType } from '../../../domain/entities/group';

export class CreateGroupDTO {
  @IsNotEmpty({ message: 'Group name is required' })
  @IsString({ message: 'Group name must be a string' })
  name!: string;

  @IsNotEmpty({ message: 'Group type is required' })
  @IsIn(['trip', 'home', 'couple', 'other'], { message: 'Invalid group type' })
  type!: GroupType;
}
