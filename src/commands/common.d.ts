interface ContentJsonImage {
  filename: string;
  idiom: string;
  scale: string;
  size?: string;
}

interface ContentJsonInfo {
  author: string;
  version: number;
}

interface ContentJson {
  images: ContentJsonImage[];
  info: ContentJsonInfo;
}
