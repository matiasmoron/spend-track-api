import { GroupType } from './GroupType';

export interface GroupProps {
  id?: number;
  name: string;
  type: GroupType;
  createdAt?: Date;
}

export class Group {
  readonly id?: number;
  name: string;
  type: GroupType;
  createdAt: Date;

  constructor(props: GroupProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.createdAt = props.createdAt || new Date();
  }
}
