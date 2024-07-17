export type GroupDto = {
  id: number;
  name: string;
};

export type CreateGroupDto = Omit<GroupDto, 'id'>;
export type UpdateGroupDto = Partial<CreateGroupDto>;
