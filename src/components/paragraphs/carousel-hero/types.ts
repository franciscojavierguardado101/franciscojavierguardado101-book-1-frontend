export type ArtPosition =
  | "carousel_hero_lower_left"
  | "carousel_hero_lower_right"
  | "carousel_hero_upper_left"
  | "carousel_hero_upper_right"
  | "carousel_hero_artistic_middle_left"
  | "carousel_hero_artistic_middle_right";

export type ButtonColor =
  | "carousel_hero_magenta"
  | "carousel_hero_black"
  | "carousel_hero_yellow"
  | "carousel_hero_dark_red";

export interface CarouselCardData {
  id: string;
  image: string;
  imageAlt?: string;
  artPosition: ArtPosition;
  topCaption?: string;
  title: string;
  lowCaption?: string;
  linkLabel?: string;
  linkHref?: string;
  buttonColor?: ButtonColor;
}

export interface CarouselHeroData {
  cards: CarouselCardData[];
  autoplayInterval?: number;
}
