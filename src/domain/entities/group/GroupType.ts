export type GroupType = 'trip' | 'house' | 'couple' | 'other';

export type GroupTypeEnum = {
  [key in GroupType]: string;
};
