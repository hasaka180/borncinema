import type { Idea } from "../types";

export const ideas: Idea[] = [
  { id: "i1", text: "A man wakes up every day in a different person's body, but always in the same city, and he is starting to recognise the city better than the people.", createdAt: "2026-08-30T21:10:00Z", tags: ["identity", "city"], status: "developing", connections: ["i7"] },
  { id: "i2", text: "A city where nobody can lie.", createdAt: "2026-08-28T09:00:00Z", tags: ["high concept", "mystery"], status: "story", connections: ["i9"] },
  { id: "i3", text: "A restaurant that only appears once every ten years. The same waiter. The same six tables. The guests have aged. He has not.", createdAt: "2026-08-25T23:40:00Z", tags: ["time", "ritual"], status: "seed", connections: ["i6"] },
  { id: "i4", text: "Two astronauts on a long mission discover their ship has been broadcasting a radio drama the whole time, and they are the characters.", createdAt: "2026-08-22T13:20:00Z", tags: ["sci-fi", "meta"], status: "seed" },
  { id: "i5", text: "A lighthouse keeper who receives letters addressed to the ships that sank.", createdAt: "2026-08-19T07:30:00Z", tags: ["sea", "letters"], status: "developing", connections: ["i8"] },
  { id: "i6", text: "A wedding photographer who can see, in the viewfinder, how long the marriage will last.", createdAt: "2026-08-14T18:00:00Z", tags: ["romance", "gift/curse"], status: "seed", connections: ["i3"] },
  { id: "i7", text: "A hotel where every room is the same room in a different year.", createdAt: "2026-08-10T02:00:00Z", tags: ["time", "hotel"], status: "seed", connections: ["i1"] },
  { id: "i8", text: "A translator hired to translate a language only one living person speaks, and that person is lying.", createdAt: "2026-08-04T16:45:00Z", tags: ["language", "thriller"], status: "seed", connections: ["i5"] },
  { id: "i9", text: "A small-town radio station that has been broadcasting the same day's weather for forty years, and it has always been right.", createdAt: "2026-07-29T11:00:00Z", tags: ["weather", "small town"], status: "seed", connections: ["i2"] },
  { id: "i10", text: "The last video rental store on Earth. Someone keeps returning films that were never made.", createdAt: "2026-07-20T20:20:00Z", tags: ["cinema", "mystery"], status: "archived" },
];
