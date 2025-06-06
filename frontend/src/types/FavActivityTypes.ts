export type FavActivityType = {
  id: number;
  type: string;
  image: string;
  header: string;
  link: string;
  highlighted: boolean;
  isConsep?: boolean;
  department?: string;
}

export type FavActivityPostType = {
  activity: string;
  isConsep?: boolean;
}
