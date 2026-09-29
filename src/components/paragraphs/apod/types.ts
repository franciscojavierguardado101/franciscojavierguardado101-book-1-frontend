// Shape returned by https://science.nasa.gov/wp-json/wp/v2/apod-basic
// NOTE: `url` is the article permalink, NOT the image. Use `hdurl` for the image.
export interface ApodItem {
  date: string;
  title: string;
  explanation: string;    // may contain HTML from the new API
  url: string;            // article permalink
  hdurl?: string;         // actual image URL
  media_type: "image" | "video";
  copyright?: string;     // may contain HTML
  credit?: string;        // may contain HTML
  alt?: string;
  permalink?: string;
}

export interface ApodData {
  id: string;
  heading?: string;
}
