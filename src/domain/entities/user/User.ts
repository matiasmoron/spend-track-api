export interface UserProps {
  id?: number;
  name: string;
  email: string;
  password: string;
  isGuest?: boolean;
  claimEmail?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id?: number;
  name: string;
  email: string;
  password: string;
  readonly isGuest: boolean;
  readonly claimEmail: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.isGuest = props.isGuest ?? false;
    this.claimEmail = props.claimEmail ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
