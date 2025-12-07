export interface AdminAccount {
  id: number;
  username: string;
  employee_id: number;
  employee?: {
    name: string;
  };
}

