import { GroupType } from '../../value-objects';

export interface GroupProps {
  id?: number;
  name: string;
  type: GroupType;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Group {
  readonly id?: number;
  name: string;
  type: GroupType;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: GroupProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;
  }
}
