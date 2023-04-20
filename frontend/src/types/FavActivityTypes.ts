export type FavActivityType = {
  id: number;
  image: string;
  header: string;
  description: string;
  link: string;
  highlighted?: boolean;
  activity: string;
}

export type FavActivityPostType = {
  activity: string;
}
