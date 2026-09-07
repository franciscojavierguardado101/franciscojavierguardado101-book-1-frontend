export type FeatureSpotPosition =
  | "fs_up_right_side"
  | "fs_up_left_side"
  | "lo_right_side"
  | "lo_left_side";

export type FeatureSpotBgColor = "feat_spot_black" | "feat_spot_white";

export interface FeatureSpotData {
  id: string;
  title: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
  imageUrl: string;
  imageAlt?: string;
  position: FeatureSpotPosition;
  bgColor?: FeatureSpotBgColor;
}
