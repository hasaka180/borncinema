import type { Comment, Discussion, FanCast, Notification } from "../types";

export const comments: Comment[] = [
  { id: "m1", storyId: "s1", authorId: "a2", paragraph: 11, text: "This is the paragraph where I realised she was never going to open the door. The coat does all the work.", likes: 412, createdAt: "2026-08-29T02:20:00Z" },
  { id: "m2", storyId: "s1", authorId: "a3", paragraph: 4, text: "\"which is what archives are for\" — I have read this line eleven times.", likes: 388, createdAt: "2026-08-27T22:10:00Z" },
  { id: "m3", storyId: "s1", authorId: "a7", paragraph: 14, text: "The three words. I have a theory. It's 'don't stop here'. Anyone else?", likes: 640, createdAt: "2026-08-26T01:15:00Z" },
  { id: "m4", storyId: "s1", authorId: "a4", paragraph: 14, text: "It's 'I'm still here'. It has to be. She's been saying it to herself on the curve.", likes: 521, createdAt: "2026-08-26T03:02:00Z" },
  { id: "m5", storyId: "s1", authorId: "a8", text: "I would shoot this in one continuous take from inside the cab. Ninety minutes. The platform slides past nine times and each time we see more.", likes: 733, createdAt: "2026-08-24T19:40:00Z" },
  { id: "m6", storyId: "s1", authorId: "a5", paragraph: 8, text: "\"It was a wet March.\" The only joke in the story and it makes the ending worse. Perfect.", likes: 290, createdAt: "2026-08-22T08:00:00Z" },
  { id: "m7", storyId: "s2", authorId: "a1", paragraph: 3, text: "Not zero. Not null. White. That distinction is the whole premise and it's done in six words.", likes: 214, createdAt: "2026-08-20T10:00:00Z" },
  { id: "m8", storyId: "s2", authorId: "a6", text: "The grandmother on the roof is the film. Everything in the tower is the trailer.", likes: 301, createdAt: "2026-08-18T14:30:00Z" },
  { id: "m9", storyId: "s3", authorId: "a2", paragraph: 12, text: "'At the edge of the light, stopped.' I need to know and I never want to know.", likes: 455, createdAt: "2026-08-16T11:50:00Z" },
  { id: "m10", storyId: "s3", authorId: "a8", text: "Seven minutes is a short film. Real time. One shot. Let the sun do the edit.", likes: 388, createdAt: "2026-08-15T09:00:00Z" },
  { id: "m11", storyId: "s4", authorId: "a1", paragraph: 7, text: "\"by someone who cooks.\" I actually put the phone down.", likes: 267, createdAt: "2026-08-31T00:10:00Z" },
  { id: "m12", storyId: "s4", authorId: "a3", paragraph: 4, text: "The knocker in the shape of a hand is such a strong image that I'm surprised it's not the poster.", likes: 143, createdAt: "2026-08-30T21:00:00Z" },
  { id: "m13", storyId: "s5", authorId: "a4", paragraph: 14, text: "\"I can only talk to you about the weather. That was the deal.\" WHAT DEAL. WITH WHO.", likes: 502, createdAt: "2026-08-29T12:00:00Z" },
  { id: "m14", storyId: "s5", authorId: "a6", text: "Lagos rain as a plot device. The ferry from Ikorodu. This is so specific it feels remembered, not invented.", likes: 231, createdAt: "2026-08-28T15:30:00Z" },
  { id: "m15", storyId: "s6", authorId: "a2", paragraph: 8, text: "The sevens. His mother's sevens. That's the moment the novel stops being a mystery and becomes a wound.", likes: 356, createdAt: "2026-08-10T20:00:00Z" },
  { id: "m16", storyId: "s8", authorId: "a5", text: "Two voices, never together. Sound design is the third character. I want to score this.", likes: 198, createdAt: "2026-08-05T17:00:00Z" },
  { id: "m17", storyId: "s10", authorId: "a1", paragraph: 8, text: "\"Where else would I sweep?\" Non-fiction that lands like the last line of a film.", likes: 420, createdAt: "2026-08-02T09:00:00Z" },
  { id: "m18", storyId: "s11", authorId: "a7", paragraph: 8, text: "A town where everyone confesses is a better locked room than a locked room.", likes: 177, createdAt: "2026-08-31T18:00:00Z" },
  { id: "m19", storyId: "s12", authorId: "a4", paragraph: 8, text: "Screen reflected in his glasses. That's how you shoot it. The author already knows.", likes: 288, createdAt: "2026-07-18T21:30:00Z" },
  { id: "m20", storyId: "s7", authorId: "a3", text: "IV is a whole short film. The wrong note in the same place. Waiting for it like a laugh.", likes: 164, createdAt: "2026-07-01T19:00:00Z" },
  { id: "m21", storyId: "s9", authorId: "a8", paragraph: 5, text: "\"By a hundred and twenty-nine years.\" Love a courier with a sense of timing.", likes: 121, createdAt: "2026-06-20T13:00:00Z" },
  { id: "m22", storyId: "s1", authorId: "a6", paragraph: 2, text: "Tiles the colour of old teeth. I can smell this platform.", likes: 209, createdAt: "2026-06-16T04:00:00Z" },
];

export const discussions: Discussion[] = [
  { id: "d1", storyId: "s1", authorId: "a8", question: "Would this work better as a film or a series?", replies: 148, lastActive: "2026-09-02T22:00:00Z", excerpt: "Ninety minutes, one night, one location. A series would have to leave the tunnel and the tunnel is the point." },
  { id: "d2", storyId: "s1", authorId: "a4", question: "What were the three words?", replies: 312, lastActive: "2026-09-02T19:20:00Z", excerpt: "Poll so far: 'I'm still here' (41%), 'Don't stop here' (33%), 'Open the door' (18%), other (8%)." },
  { id: "d3", storyId: "s2", authorId: "a1", question: "Should the white field ever be explained?", replies: 96, lastActive: "2026-09-01T11:00:00Z", excerpt: "If we learn why tomorrow stopped, the story becomes about the Ministry. If we don't, it stays about the grandmother." },
  { id: "d4", storyId: "s3", authorId: "a6", question: "Who is on the pier?", replies: 204, lastActive: "2026-08-31T15:00:00Z", excerpt: "It doesn't matter who. It matters that she doesn't turn around." },
  { id: "d5", storyId: "s5", authorId: "a2", question: "What director would suit this?", replies: 77, lastActive: "2026-08-30T09:00:00Z", excerpt: "Someone who trusts a kitchen. Someone who can make a kettle boiling feel like a countdown." },
  { id: "d6", storyId: "s11", authorId: "a3", question: "Can a mystery work when everyone tells the truth?", replies: 58, lastActive: "2026-09-02T08:00:00Z", excerpt: "The question isn't who's lying. It's what the truth is made of." },
  { id: "d7", storyId: "s12", authorId: "a7", question: "Should the ending stay ambiguous?", replies: 89, lastActive: "2026-08-28T23:00:00Z", excerpt: "We never find out what's on the reel. That's the reel." },
];

export const fanCasts: FanCast[] = [
  { id: "fc1", storyId: "s1", authorId: "a8", director: "A director who shoots in real time", lead: "An actor in her late thirties who can hold a nine-second silence", cinematography: "Anamorphic, sodium and teal, one light source", music: "A single sustained cello note that changes pitch every night", likes: 1240, note: "Cast the platform. Everything else follows." },
  { id: "fc2", storyId: "s1", authorId: "a2", director: "Someone from the Iranian new wave", lead: "An unknown. The audience should not bring a face to the cab.", cinematography: "Digital, high ISO, grainy as the tunnel", music: "None. Rail noise only.", likes: 860, note: "The moment you cast a star the elevator becomes a twist. It's not a twist. It's a mirror." },
  { id: "fc3", storyId: "s3", authorId: "a5", director: "A Scandinavian director who has never made anything shorter than two hours", lead: "Someone who has spent a winter above the circle", cinematography: "Natural light. The film is the light.", music: "A choir, offscreen, from the town", likes: 610, note: "Seven minutes. Real time. Cut to black when the sun goes." },
  { id: "fc4", storyId: "s5", authorId: "a6", director: "A Nigerian director with a documentary background", lead: "An actor who can play a woman listening", cinematography: "Warm. Kitchen light. Rain through louvres.", music: "Highlife on a neighbour's radio, half-heard", likes: 540, note: "The phone is the co-star. Frame it like a face." },
  { id: "fc5", storyId: "s12", authorId: "a4", director: "A director who started as a projectionist", lead: "Someone who looks like they've been awake since 1961", cinematography: "16mm, scratched, projected in-camera", music: "The projector. Only the projector.", likes: 720, note: "Don't restore the print. That's the whole point." },
];

export const notifications: Notification[] = [
  { id: "n1", type: "screenability", text: "The Last Elevator reached 94% screenability. 4,810 readers would watch it as a film.", storyId: "s1", createdAt: "2026-09-02T23:00:00Z", read: false },
  { id: "n2", type: "cast", text: "Amara Reed added a fan cast to The Last Elevator.", storyId: "s1", authorId: "a8", createdAt: "2026-09-02T20:15:00Z", read: false },
  { id: "n3", type: "comment", text: "Tariq El-Amin commented on paragraph 11 of The Last Elevator.", storyId: "s1", authorId: "a2", createdAt: "2026-09-02T02:20:00Z", read: false },
  { id: "n4", type: "featured", text: "The Projectionist was featured in Stories Waiting for Cinema.", storyId: "s12", createdAt: "2026-09-01T09:00:00Z", read: true },
  { id: "n5", type: "milestone", text: "The Last Elevator passed 12,000 readers.", storyId: "s1", createdAt: "2026-08-31T14:00:00Z", read: true },
  { id: "n6", type: "follow", text: "Sofía Reyes started following you.", authorId: "a6", createdAt: "2026-08-30T17:30:00Z", read: true },
  { id: "n7", type: "remix", text: "Devon Okafor imagined The Last Elevator as an animated short.", storyId: "s1", authorId: "a4", createdAt: "2026-08-29T21:00:00Z", read: true },
  { id: "n8", type: "like", text: "Ingrid Halvorsen and 212 others liked The Projectionist.", storyId: "s12", authorId: "a3", createdAt: "2026-08-28T12:00:00Z", read: true },
];
