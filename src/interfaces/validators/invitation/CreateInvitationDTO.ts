import {
  IsInt,
  IsEmail,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsNotEmpty,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneUserField', async: false })
export class AtLeastOneUserField implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as { invitedUserId?: number; invitedUserEmail?: string };
    return !!(obj.invitedUserId || obj.invitedUserEmail);
  }
  defaultMessage(_args: ValidationArguments) {
    return 'Either invitedUserId or invitedUserEmail must be provided';
  }
}

export class CreateInvitationDTO {
  @IsNotEmpty({ message: 'Group ID is required' })
  @IsInt({ message: 'Group ID must be an integer' })
  groupId!: number;

  @ValidateIf((o) => o.invitedUserId !== undefined)
  @IsInt({ message: 'User ID must be an integer' })
  invitedUserId?: number;

  @ValidateIf((o) => o.invitedUserEmail !== undefined)
  @IsEmail({}, { message: 'User email must be valid' })
  invitedUserEmail?: string;

  @Validate(AtLeastOneUserField)
  atLeastOneUserField?: any;
}
