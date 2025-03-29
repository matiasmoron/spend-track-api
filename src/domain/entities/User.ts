interface UserProps {
  id?: number;
  name: string;
  email: string;
  passwordHash: string;
}

export class User {
  public readonly id?: number;
  public name: string;
  public email: string;
  public passwordHash: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
  }
}
