import { CSSProperties } from "react";

export interface CardItem {
  problem: string;
  solution: string;
}

export interface CardData {
  emoji: string;
  title: string;
  items: CardItem[];
  footer: string;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  style: CSSProperties;
  overlayClass?: string;
  footerStyle?: CSSProperties;
}

export interface YoutubeMetadata {
  title: string;
  description: string;
  hashtags: string[];
}