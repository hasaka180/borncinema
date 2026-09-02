import type { Author } from "../types";
import { IMG } from "./images";

export const authors: Author[] = [
  {
    id: "a1", handle: "maravoss", name: "Mara Voss", role: "Writer · Former subway operator",
    bio: "I write about the hours nobody is awake for. Twelve years driving the last train taught me that every empty platform is a stage waiting for one person to walk on.",
    location: "Berlin", avatar: IMG.portrait2, followers: 18420, following: 212,
    creativeDNA: { genres: ["Sci-Fi", "Thriller", "Mystery"], themes: ["Time", "Isolation", "Memory"], styles: ["Sparse", "Slow-burn", "First person present"], influences: ["Tarkovsky", "Denis Villeneuve", "Ursula K. Le Guin"] },
  },
  {
    id: "a2", handle: "tariqel", name: "Tariq El-Amin", role: "Screenwriter · Film student",
    bio: "Cairo-born, Dubai-raised. I am interested in cities that pretend to be finished and the people who know they are not.",
    location: "Dubai", avatar: IMG.portrait5, followers: 9310, following: 480,
    creativeDNA: { genres: ["Drama", "Sci-Fi", "Crime"], themes: ["Cities", "Family", "Ambition"], styles: ["Ensemble", "Non-linear", "Visual"], influences: ["Wong Kar-wai", "Asghar Farhadi", "Chantal Akerman"] },
  },
  {
    id: "a3", handle: "ingridhalvorsen", name: "Ingrid Halvorsen", role: "Novelist",
    bio: "Three novels about weather and one about a marriage, which was also about weather.",
    location: "Tromsø", avatar: IMG.portrait4, followers: 31200, following: 96,
    creativeDNA: { genres: ["Drama", "Romance", "Historical"], themes: ["Grief", "Landscape", "Silence"], styles: ["Lyrical", "Long-form", "Close third"], influences: ["Ingmar Bergman", "Tove Jansson", "Kelly Reichardt"] },
  },
  {
    id: "a4", handle: "devonokafor", name: "Devon Okafor", role: "Comic creator · Storyboard artist",
    bio: "I think in panels. I am here to find out whether my panels can become frames.",
    location: "London", avatar: IMG.portrait3, followers: 12750, following: 640,
    creativeDNA: { genres: ["Fantasy", "Adventure", "Animation"], themes: ["Belonging", "Myth", "Rebellion"], styles: ["Visual", "Kinetic", "Dialogue-driven"], influences: ["Satoshi Kon", "Guillermo del Toro", "Moebius"] },
  },
  {
    id: "a5", handle: "yukitanabe", name: "Yuki Tanabe", role: "Poet · Sound designer",
    bio: "Small poems for large rooms. I record the sound of every place I write about.",
    location: "Kyoto", avatar: IMG.portrait6, followers: 7280, following: 310,
    creativeDNA: { genres: ["Experimental", "Drama", "Romance"], themes: ["Sound", "Distance", "Ritual"], styles: ["Fragmentary", "Sensory", "Minimal"], influences: ["Hirokazu Kore-eda", "Anne Carson", "Apichatpong Weerasethakul"] },
  },
  {
    id: "a6", handle: "sofiareyes", name: "Sofía Reyes", role: "Journalist · Non-fiction writer",
    bio: "I spent nine years reporting from places that no longer exist. Now I write about the people who stayed.",
    location: "Mexico City", avatar: IMG.portrait8, followers: 22100, following: 150,
    creativeDNA: { genres: ["Documentary", "Drama", "Crime"], themes: ["Truth", "Borders", "Survival"], styles: ["Reported", "Immersive", "Restrained"], influences: ["Patricio Guzmán", "Joan Didion", "Alfonso Cuarón"] },
  },
  {
    id: "a7", handle: "elliotbrand", name: "Elliot Brand", role: "Aspiring filmmaker",
    bio: "Never written a screenplay. Have had the same idea for a movie since I was fourteen. Finally putting it somewhere.",
    location: "Manchester", avatar: IMG.portrait7, followers: 1140, following: 88,
    creativeDNA: { genres: ["Horror", "Mystery", "Thriller"], themes: ["Houses", "Inheritance", "Fear"], styles: ["Atmospheric", "Slow", "Unreliable"], influences: ["Ari Aster", "Shirley Jackson", "Robert Eggers"] },
  },
  {
    id: "a8", handle: "amarareed", name: "Amara Reed", role: "Director · Visual storyteller",
    bio: "I direct commercials to pay for the films I have not made yet. This is where I keep the films.",
    location: "Lagos", avatar: IMG.portrait1, followers: 15600, following: 402,
    creativeDNA: { genres: ["Drama", "Sci-Fi", "Experimental"], themes: ["Water", "Migration", "Technology"], styles: ["Image-first", "Elliptical", "Bold"], influences: ["Claire Denis", "Mati Diop", "Barry Jenkins"] },
  },
];

const memberAuthor = (id: string): Author => ({ id, handle: id, name: "Member creator", role: "Creator", bio: "", location: "", avatar: "", followers: 0, following: 0, creativeDNA: { genres: [], themes: [], styles: [], influences: [] } });
export const authorById = (id: string) => authors.find((a) => a.id === id) || memberAuthor(id);
/** Prefer the author carried on the story (member creators), else the demo catalogue. */
export const authorOf = (s: { authorId: string; author?: { name: string; handle: string; role?: string; avatar?: string } }): Author => s.author ? { ...memberAuthor(s.authorId), ...s.author, avatar: s.author.avatar || "" } : authorById(s.authorId);
export const authorByHandle = (h: string) => authors.find((a) => a.handle === h);
