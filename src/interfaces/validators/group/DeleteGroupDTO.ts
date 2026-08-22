import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteGroupDTO {
  @IsNotEmpty({ message: 'Group ID is required' })
  @IsInt({ message: 'Group ID must be an integer' })
  groupId!: number;
}
