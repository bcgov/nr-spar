export type FavActivityType = {
  id: number;
  type: string;
  image: string;
  header: string;
  link: string;
  highlighted: boolean;
  role?: string;
}

export type FavActivityPostType = {
  activity: string;
}
