interface UserProps {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export class User {
  public readonly id?: number;
  public name: string;
  public email: string;
  public password: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
  }
}
