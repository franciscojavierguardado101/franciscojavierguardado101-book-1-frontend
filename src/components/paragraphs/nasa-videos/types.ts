export interface NasaVideoItem {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  thumbnail: string;
  keywords: string[];
}

export interface NasaVideosData {
  id: string;
  heading?: string;
  defaultQuery?: string;
}
