export interface UserProps {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export class User {
  readonly id?: number;
  name: string;
  email: string;
  password: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
  }
}
