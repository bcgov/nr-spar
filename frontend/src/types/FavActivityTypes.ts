export type FavActivityType = {
  id: number;
  type: string;
  image: string;
  header: string;
  link: string;
  highlighted: boolean;
  isConsep?: boolean;
}

export type FavActivityPostType = {
  activity: string;
  isConsep?: boolean;
}
