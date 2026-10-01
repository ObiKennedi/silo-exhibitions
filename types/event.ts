export type EventMediaType = "image" | "video";

export interface EventMedia {
    id: string;
    type: EventMediaType;
    url: string;
    thumbnail?: string;
    alt?: string;
    cloudinaryPublicId?: string;
}

export interface PastEvent {
    id: string;
    slug: string;
    title: string;
    location: string;
    date: string;
    coverImage: string;
    coverImagePublicId?: string;
    media: EventMedia[];
}

export interface PastEventsPage {
    events: PastEvent[];
    hasMore: boolean;
    total: number;
}