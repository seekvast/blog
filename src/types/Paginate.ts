export interface Paginate<T> {
  code: number;
  items: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  message: string;
}
