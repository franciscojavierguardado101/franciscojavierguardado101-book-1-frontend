import type { ArtPosition, ButtonColor } from "./types";

export const POSITION_CLASSES: Record<ArtPosition, string> = {
  carousel_hero_lower_left: "items-end justify-start",
  carousel_hero_lower_right: "items-end justify-end",
  carousel_hero_upper_left: "items-start justify-start",
  carousel_hero_upper_right: "items-start justify-end",
  carousel_hero_artistic_middle_left: "items-center justify-start",
  carousel_hero_artistic_middle_right: "items-center justify-end",
};

export const BUTTON_COLORS: Record<ButtonColor, { bg: string; text: string }> = {
  carousel_hero_magenta: { bg: "#c66ec2", text: "#000000" },
  carousel_hero_black: { bg: "#000000", text: "#ffffff" },
  carousel_hero_yellow: { bg: "#e1e72a", text: "#000000" },
  carousel_hero_dark_red: { bg: "#C20000", text: "#ffffff" },
};

export const DEFAULT_AUTOPLAY_INTERVAL = 10000;
