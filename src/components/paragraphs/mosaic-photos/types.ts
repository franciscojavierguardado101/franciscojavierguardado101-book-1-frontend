export interface MosaicPhotoCardData {
  id: string;
  title: string;
  caption?: string;
  credit?: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  mediaType: "image" | "remote_video" | "video";
  videoUrl?: string;
}

export interface MosaicPhotosData {
  id: string;
  heading?: string;
  cards: MosaicPhotoCardData[];
}
