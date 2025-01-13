export interface Paginate {
    code: number;
    data: {
      items: any[];
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    }
    message: string;
  }