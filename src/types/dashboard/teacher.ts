export type DBtaskStatusByGroupTypes = {
  [key: number]: {
    label: string;
    courses: {
      [key: number]: {
        label: string;
        item: { id: number; value: number; label: string }[];
      };
    };
  };
};

export type DBStudentsGradeAllocationTypes = {
  [groupId: number]: {
    label: string;
    courses: { id: number; label: string }[];
    items: {
      [key: string]: number | string;
    }[];
  };
};

export type DBgroupsAverageScoresTypes = {
  courses: { id: number; label: string }[];
  items: {
    [key: number | string]: number | string;
  }[];
};
