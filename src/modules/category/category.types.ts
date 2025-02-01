export interface CategoryWithChildren {
  id: number;
  name: string;
  parentId: number | null;
  children?: CategoryWithChildren[];
}
