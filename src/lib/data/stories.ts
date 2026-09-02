import type { Story } from "../types";
import { IMG } from "./images";

const P = (s: string) => s.trim().split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim());

export const stories: Story[] = [
  {
    id: "s1", slug: "the-last-elevator", title: "The Last Elevator", authorId: "a1",
    genre: "Sci-Fi", subgenre: "Psychological Thriller", format: "Short Story", mood: "Eerie", language: "English",
    readingTime: 14,
    hook: "Every night at 2:13 AM, an elevator appears in an abandoned subway station. Tonight, someone gets out.",
    synopsis: "Lena drives the last train of the night through a station that was sealed in 1987. For eleven months she has watched an elevator that should not exist open its doors at exactly 2:13. Tonight she stops the train.",
    cover: IMG.subway, stills: [IMG.tunnel, IMG.corridor, IMG.station],
    tags: ["time", "underground", "night shift", "doppelgänger"],
    publishedAt: "2026-06-14T02:13:00Z",
    stats: { readers: 12480, likes: 8720, comments: 1218, saves: 3140, watchVotes: 4810, completion: 0.91 },
    screenability: 94, allowRemixes: true, featured: true, staffPick: true, inDevelopment: true, filmProjectId: "f1",
    chapters: [{ id: "c1", title: "2:13", paragraphs: P(`
The last train does not stop at Königsplatz. It has not stopped there since 1987, when the station was sealed with concrete and a plaque that nobody reads. But the tunnel still runs through it, and so every night at 2:11 the train slows for the curve, and for nine seconds the platform slides past the windows like a photograph someone forgot to develop.

Lena has driven this route for eleven months. She knows the nine seconds the way a pianist knows a bar of music she has decided never to play again. Tiles the colour of old teeth. A bench. A vending machine with its glass long gone. And at the far end, past the stairs that lead to nothing, an elevator.

The station never had an elevator. She has checked. She has spent evenings in the transit archive with a woman named Frau Ostrowski who smelled of cigarettes and lavender and who eventually stopped asking why. There are blueprints. There are photographs of the opening in 1961, the mayor cutting a ribbon, the escalators still gleaming. There is no elevator. There has never been an elevator.

And yet at 2:13, as the last car clears the platform, the elevator's doors open.

She saw it first in November. A rectangle of light where there should be only dark, and inside it, a figure she could not make out, standing very still, as if waiting for a floor that had not been invented yet. By the time she understood what she was looking at, the tunnel had swallowed it.

She told no one. Who would she tell? The dispatcher, Marek, who once fell asleep during a derailment drill? Her sister, who thought driving trains at night was already a kind of madness? She told the archive instead, and the archive told her nothing, which is what archives are for.

In December the figure raised a hand. In January it stepped forward, to the threshold of the doors, and stayed there. In February Lena began braking a little earlier on the curve, so the nine seconds became eleven. In March, twelve. Marek noticed the schedule drift and wrote it up. She said the rails were wet. He said it was March. She said it was a wet March.

Tonight she stops the train.

It is against every regulation she has ever signed. The brakes take longer than she expects; the cars shudder and squeal and finally rest with the cab exactly opposite the stairs that lead to nothing. The clock on the console reads 2:12:40. She turns off the cab light so her reflection will stop standing between her and the platform.

2:13.

The doors open. The light inside the elevator is the colour of a hospital corridor at four in the morning, and the figure is a woman, and the woman is wearing Lena's coat.

It is not a coat like Lena's coat. It is the coat: the burn mark on the left cuff from the radiator in her first apartment, the replaced button that never quite matched. The woman inside the elevator is older, perhaps by ten years, perhaps by twenty; grief does strange things to faces and Lena cannot tell which kind of years these are. But she knows the way the woman holds her shoulders. She has seen it in every photograph she has ever hated of herself.

The woman steps out of the elevator. She does not look surprised. She looks like someone arriving very late to an appointment she has been dreading for a long time. She walks to the edge of the platform and stops, exactly where the yellow line would be if the yellow line had not been painted over by thirty-nine years of dust.

Lena's hand is on the door release. She does not remember putting it there.

The woman speaks. The glass is thick, and the tunnel hums, and Lena hears only the shape of it, three words, the mouth making them slowly, as if to a child, as if to someone who will have to remember them for a very long time. Then the woman turns and walks back into the elevator, and the doors close, and the platform is dark, and the console clock reads 2:14, and somewhere behind her, in the empty cars, something has started to move.

She has not yet decided whether to open the door. She has decided, though, what the three words were. She is fairly sure she has been saying them, to herself, on every curve, for eleven months.
`) }],
  },
  {
    id: "s2", slug: "the-city-that-forgot-tomorrow", title: "The City That Forgot Tomorrow", authorId: "a2",
    genre: "Sci-Fi", subgenre: "Speculative Drama", format: "Novella", mood: "Melancholic", language: "English",
    readingTime: 42,
    hook: "In a city where the forecast is legally binding, a meteorologist discovers that tomorrow has stopped arriving.",
    synopsis: "Old Dubai, 2071. Weather is scheduled by the Ministry, and the schedule has never been wrong. Then a junior forecaster notices that every prediction for the day after next returns blank. A story about a city built on certainty and the family that survives inside its cracks.",
    cover: IMG.dubaiNight, stills: [IMG.dubai, IMG.desert, IMG.city],
    tags: ["Dubai", "future", "bureaucracy", "family"],
    publishedAt: "2026-05-02T18:00:00Z",
    stats: { readers: 9860, likes: 6210, comments: 842, saves: 2810, watchVotes: 3390, completion: 0.78 },
    screenability: 88, allowRemixes: true, featured: true, inDevelopment: true, filmProjectId: "f2",
    chapters: [
      { id: "c1", title: "The Forecast", paragraphs: P(`
The Ministry of Atmospheric Continuity occupied the forty-first to forty-sixth floors of a tower that had been designed, in an earlier and more optimistic decade, to look like a sail. From the forty-third floor, where Nour worked, the sail's curve made the windows lean outward, so that if you stood close enough to the glass you could feel the city below trying to pull you into it.

Nour did not stand close to the glass. She stood at her desk, at 07:58, and watched the forecast for the day after tomorrow fail to load for the third morning in a row.

It was not an error. Errors had colours and codes and a man named Faisal who came to fix them with a tablet and a sigh. This was simply an absence. Tomorrow was there: 34 degrees, humidity moderated to 41 percent, a scheduled breeze from the Gulf between 16:00 and 18:20 for the benefit of the waterfront restaurants. The day after was a white field. Not zero. Not null. White.

Her supervisor, Mr. Haddad, told her to refresh. She had refreshed. He told her it was a caching issue. She said the cache had been cleared. He told her, in the voice he used for things that were not his department, that the day after tomorrow was not, technically, her department either, and that she should focus on the breeze.

So she focused on the breeze. And at 16:00 the breeze arrived, on time, from the Gulf, and lifted the napkins on the waterfront exactly as promised, and Nour stood at her window and thought about white fields.
`) },
      { id: "c2", title: "Deira", paragraphs: P(`
Her grandmother lived in the old city, in a house that had been condemned four times and rebuilt four times by neighbours who did not believe in condemnation. From the roof you could see the creek, and the abras crossing it, wooden boats that had been carrying people across the same stretch of water for a hundred and fifty years and had no interest in the Ministry's opinions about the weather.

"They stopped the rain again," her grandmother said, by way of greeting. "In my day the rain came when it came."

"In your day the rain flooded the souq every March."

"Yes." Her grandmother smiled, the smile of someone remembering a flood with great affection. "It did."

Nour did not tell her about the white field. She told her about the breeze. Her grandmother listened the way she listened to everything from the Ministry, with the patience of a woman who had outlived three governments and expected to outlive a fourth.

On the roof, after dinner, the sky over the new city glowed the colour of a screen left on in an empty room. The old city, beneath it, was almost dark. Nour looked at the two halves of the place she was from and thought: one of these has a tomorrow, and I am no longer sure which.
`) },
    ],
  },
  {
    id: "s3", slug: "seven-minutes-before-dawn", title: "Seven Minutes Before Dawn", authorId: "a3",
    genre: "Drama", subgenre: "Arctic Drama", format: "Short Story", mood: "Quiet", language: "English",
    readingTime: 18,
    hook: "On the first morning the sun returns to Tromsø, a woman waits on the fjord for a husband who left before the dark.",
    synopsis: "After two months of polar night, the sun rises for seven minutes. Solveig has decided that this is how long she will give him.",
    cover: IMG.aurora, stills: [IMG.snowForest, IMG.dawn, IMG.fogLake],
    tags: ["Arctic", "marriage", "light", "waiting"],
    publishedAt: "2026-01-21T10:00:00Z",
    stats: { readers: 8120, likes: 6880, comments: 612, saves: 2950, watchVotes: 2610, completion: 0.95 },
    screenability: 86, allowRemixes: false, staffPick: true,
    chapters: [{ id: "c1", title: "Mørketid", paragraphs: P(`
The dark had lasted fifty-eight days, and Solveig had counted every one of them the way you count breaths when you are trying not to cry in public. Not because the dark was hard. She had lived above the circle all her life; the dark was simply a room you lived in for a while, with the lights on, being careful on the ice. It was hard because he had said he would be back before it ended.

The sun would return at 11:42. The newspaper had printed it, and the school had planned an assembly, and the café by the harbour had put out a chalkboard promising free coffee for the first seven minutes of light, which was all there would be. Seven minutes. Then the sun would slip back under the mountain across the fjord like something that had only come to check whether anyone was still here.

She walked out onto the pier at 11:20 in her father's coat.

The fjord was black and perfectly still, the kind of still that makes you feel you are being listened to. Across the water, the mountain was a slightly less black shape against the sky, and above its shoulder the sky was doing something she had forgotten it could do: it was turning the colour of the inside of a shell.

She had decided this in December, at the kitchen table, with his last message open on the phone in front of her. Seven minutes. If he was here in the light, she would stay. If the light came and went and the pier was empty, she would take the coat and the dog and the small grey car and drive south until the days were a normal length and nobody knew what she had been waiting for.

It was not a fair test. She knew that. He did not know about it. That was, she thought, the point of a test.

At 11:38 the mountain's edge caught fire.

It was not a sunrise the way the south had sunrises, all at once, a coin flipped over the horizon. It was a rumour of a sun. A thin gold seam along the ridge, then a burr of light, then, at 11:42 exactly, a small fierce piece of it lifting clear, and the whole fjord turned from black to a blue so deep and sudden that she heard herself make a sound.

Behind her, in the town, people cheered. Someone was ringing a bell. The café's door opened and closed and opened.

She did not turn around. That would have been cheating.

The light lay across the water toward her like a path. She watched it for one minute, two, three. It touched the pier. It touched her boots. She felt it on her face like a hand that was not quite warm yet but was trying.

At four minutes she heard footsteps on the boards.

She did not turn around then either. She stood in the seven minutes of sun and waited to find out which of her lives she was in, and behind her the footsteps came closer and then, at the edge of the light, stopped.
`) }],
  },
  {
    id: "s4", slug: "the-house-without-windows", title: "The House Without Windows", authorId: "a7",
    genre: "Horror", subgenre: "Gothic Horror", format: "Short Story", mood: "Tense", language: "English",
    readingTime: 22,
    hook: "A man inherits a house his family swore was demolished in 1974. The estate agent has never been inside. Neither, it turns out, has anyone.",
    synopsis: "The Pell house has no windows and no records. Elliot's first idea for a film, held for nineteen years, finally written down.",
    cover: IMG.oldBuilding, stills: [IMG.corridor, IMG.rain, IMG.fogForest],
    tags: ["inheritance", "house", "family secret", "slow burn"],
    publishedAt: "2026-07-30T22:00:00Z",
    stats: { readers: 4380, likes: 3120, comments: 468, saves: 1610, watchVotes: 2140, completion: 0.83 },
    screenability: 90, allowRemixes: true, newVoice: true, inDevelopment: true, filmProjectId: "f3",
    chapters: [{ id: "c1", title: "Probate", paragraphs: P(`
The letter said the house had been in the family since 1911. My mother had said, for as long as I could remember, that there was no house, that there had never been a house, that the Pells were flat people from a flat town and if I wanted a gothic childhood I should have been born to someone else.

She died in March. The letter came in April. It was from a solicitor in a town I had to look up, and it used the word "windowless" as if it were a feature, like a conservatory.

I drove up on a Saturday because I had nothing else to do with Saturdays anymore. The town was flat, as promised. The house was not in the town. It was two miles beyond it, at the end of a lane the satnav did not believe in, in a field that had been let go so long the field had forgotten it was ever anything else.

It was smaller than I had imagined and worse. A square of grey brick, two storeys, a slate roof gone green. No windows. Not boarded, not bricked up: it had been built without them. The bricks ran uninterrupted from corner to corner like a face with its features sanded off. There was a door. The door had a knocker in the shape of a hand.

The solicitor met me there, a young woman in a good coat who kept her car running. She gave me the keys and a folder and said she had not, herself, been inside. She said this quickly, like something she had decided to say in the car. I asked who had. She looked at the folder as if it might tell her, and then she looked at the house, and then she said she really should get back.

I stood in the field with the keys after she had gone. I want to be clear that I was not frightened. I was forty-one and I had buried my mother and I had, somewhere in a drawer at home, a script I had been failing to write for nineteen years about exactly this: a man, a house, a door. I was not frightened. I was, God help me, interested.

The knocker was cold. The key turned on the first try. The door swung in on a hallway that was completely, perfectly dark, and out of the dark came the smell of a house that has been lived in, recently, by someone who cooks.
`) }],
  },
  {
    id: "s5", slug: "a-letter-from-2049", title: "A Letter From 2049", authorId: "a8",
    genre: "Sci-Fi", subgenre: "Epistolary", format: "Short Story", mood: "Hopeful", language: "English",
    readingTime: 11,
    hook: "A woman receives a phone call from herself, twenty years in the future. The future self only wants to talk about the weather.",
    synopsis: "Adaeze answers a call from a number that is her own. The voice on the other end knows things it should not, and refuses to say the one thing Adaeze needs to hear.",
    cover: IMG.ocean, stills: [IMG.waves, IMG.lighthouse, IMG.windowLight],
    tags: ["time", "phone call", "Lagos", "future self"],
    publishedAt: "2026-08-11T09:00:00Z",
    stats: { readers: 6640, likes: 5010, comments: 720, saves: 2210, watchVotes: 2980, completion: 0.94 },
    screenability: 91, allowRemixes: true, featured: true,
    chapters: [{ id: "c1", title: "Tuesday", paragraphs: P(`
The number on the screen was her own. Not similar. Not one digit off, the way scam calls sometimes were, hoping you would answer out of confusion. It was her number, calling her phone, at 6:40 on a Tuesday morning while she stood in the kitchen watching the kettle refuse to boil.

She answered because she was curious and because she had been raised to answer.

"Don't hang up," the voice said. It was her voice. Older. Lower in the chest, as if it had learned to carry more. "I know. I know. Just listen for one minute."

Adaeze did not hang up. She put a hand on the counter.

"It's going to rain on Thursday," the voice said. "Properly. The kind that floods Ozumba Mbadiwe. Don't take the car. Take the ferry from Ikorodu, it'll be slow but it'll move. Are you writing this down?"

"Who is this?"

"You know who this is. Thursday. The ferry. And on Saturday the light will be very good in the afternoon, around four. Go outside. You'll want to remember it."

"Why?"

There was a pause, and in the pause Adaeze heard, on the other end of the line, a sound she recognised absolutely: the particular creak of the kitchen chair by the window, the one that had been her mother's, the one she had been meaning to fix for six years.

"I can't tell you why," the voice said gently. "You'll work it out. I did."

"Is Mum—"

"The weather, Ada. I can only talk to you about the weather. That was the deal."

"What deal? With who?"

But the kettle had finally boiled, and the voice was saying something about the harmattan coming early this year, and Adaeze stood in the kitchen with her own future in her hand, being told to bring a jacket.
`) }],
  },
  {
    id: "s6", slug: "the-last-person-who-remembered-me", title: "The Last Person Who Remembered Me", authorId: "a3",
    genre: "Drama", subgenre: "Literary Mystery", format: "Novel", mood: "Elegiac", language: "English",
    readingTime: 310,
    hook: "A man returns to his childhood village to find that everyone, including his own mother, has forgotten he was ever born.",
    synopsis: "A novel in four seasons. Jonas comes home for a funeral and discovers his name on no gravestone, in no register, in no memory. Only one person, a woman he does not recognise, calls him by his name.",
    cover: IMG.fogLake, stills: [IMG.lake, IMG.forest, IMG.snowForest],
    tags: ["memory", "village", "identity", "seasons"],
    publishedAt: "2026-03-01T08:00:00Z",
    stats: { readers: 14200, likes: 9840, comments: 1560, saves: 5320, watchVotes: 3810, completion: 0.42 },
    screenability: 79, allowRemixes: false, staffPick: true,
    chapters: [
      { id: "c1", title: "Winter", paragraphs: P(`
The bus dropped him at the crossroads because the bus had always dropped people at the crossroads, and he walked the last two kilometres with his bag on his shoulder and the snow coming sideways off the lake.

He had been away nineteen years. He had expected the village to be smaller; that was what people said, that places shrank. It was not smaller. It was exactly the size it had always been, which was worse, because it meant that he was.

The church was where it had been. The shop was where it had been, though it had a different name now, and a girl behind the counter who looked at him with the flat polite curiosity you give a stranger. He bought coffee. He said his name. He said it the way you say a name in the village you were born in, as a key, expecting a lock.

The girl said, "Sorry?"

He said it again.

She said she had not heard of the family. She said it kindly. She had lived here all her life, she said, and she was sure she would have known.
`) },
      { id: "c2", title: "The Register", paragraphs: P(`
The parish register was kept in a cupboard in the sacristy, as it had been for two hundred years, and the priest, who was new and young and had the anxious eagerness of a man who has read about villages in books, let him look at it without asking why.

Births, 1987. He found the month. He found the week. He found the day, in his mother's handwriting, because she had been the one who kept the book that year; he knew the loop of her sevens.

There was an entry on his birthday. It was a girl. Her name was Marit. There was no other entry for a week on either side.

He closed the book. The priest asked if he had found what he was looking for. He said yes. He was surprised to find it was true.
`) },
    ],
  },
  {
    id: "s7", slug: "blue-hour", title: "Blue Hour", authorId: "a5",
    genre: "Romance", subgenre: "Poetic Romance", format: "Poetry", mood: "Melancholic", language: "English",
    readingTime: 6,
    hook: "Twenty-two short poems written between the moment the sun goes down and the moment the streetlights notice.",
    synopsis: "A sequence of poems recorded in the blue hour in Kyoto, each one a scene that could be a single shot: a bicycle, a bathhouse, a hand on a train window.",
    cover: IMG.japanStreet, stills: [IMG.tokyo, IMG.neon, IMG.rainWindow],
    tags: ["Kyoto", "dusk", "sound", "sequence"],
    publishedAt: "2026-04-18T18:30:00Z",
    stats: { readers: 5230, likes: 4640, comments: 380, saves: 2870, watchVotes: 1620, completion: 0.97 },
    screenability: 72, allowRemixes: true, staffPick: true,
    chapters: [{ id: "c1", title: "I – VI", paragraphs: [
      "I.\nThe river has gone the colour of a bruise\nthat is healing.\nA boy on a bicycle carries a cake\nwith both hands\nand steers with his knees.",
      "II.\nIn the bathhouse the old men\nsit like a row of islands\nand the steam moves between them\nthe way a rumour moves\nthrough a town that trusts it.",
      "III.\nThe train window\nis a slow photograph of your hand\nbeing developed\nby the last of the light.",
      "IV.\nSomeone is practising the same four bars\non a piano above the pharmacy.\nThey get it wrong in the same place\nevery time\nand I have started waiting for it\nthe way you wait for someone's laugh.",
      "V.\nThe vending machine hums\nlike it has a secret.\nIt does.\nIt is the only warm thing on the street.",
      "VI.\nBlue hour: the light says\nyou have twenty minutes\nto decide what you meant\nby everything you said today.\nThe streetlights come on\nbefore I have decided.",
    ] }],
  },
  {
    id: "s8", slug: "the-ocean-between-us", title: "The Ocean Between Us", authorId: "a8",
    genre: "Drama", subgenre: "Migration Drama", format: "Novella", mood: "Elegiac", language: "English",
    readingTime: 56,
    hook: "Two sisters on opposite coasts of the Atlantic record voice notes to each other for one year. They never send them.",
    synopsis: "Lagos and Baltimore. Chiamaka and Ngozi have not spoken since their father's funeral. This is the year they almost do.",
    cover: IMG.waves, stills: [IMG.ocean, IMG.bridge, IMG.windowLight],
    tags: ["sisters", "diaspora", "voice notes", "grief"],
    publishedAt: "2026-02-08T12:00:00Z",
    stats: { readers: 7910, likes: 5720, comments: 690, saves: 3010, watchVotes: 3120, completion: 0.71 },
    screenability: 85, allowRemixes: true, inDevelopment: true, filmProjectId: "f4",
    chapters: [{ id: "c1", title: "January — Lagos", paragraphs: P(`
Okay. Recording. I don't know why I'm doing this. I'm not going to send it.

The generator's been off since Tuesday so I'm sitting on the balcony because it's the only place with air, and there's a wedding three compounds over and they've been playing the same song for forty minutes, which I think means the bride is late. Daddy would have had a theory. Daddy always had a theory about brides.

I found the box. The one with the photographs. You're in most of them. I'm in the rest, usually behind something, usually blurred. You always said that was because I moved too much and I always said it was because you had the camera.

I'm not angry anymore. That's not why I'm not sending this. I just don't know what I would say after hello.

The song has stopped. I think she's arrived.

Okay. Stopping now.
`) }, { id: "c2", title: "January — Baltimore", paragraphs: P(`
It's snowing. You'd hate it. You'd say something about how the whole city looks like it's been photocopied.

I got your number from Auntie Bisi. I haven't used it. I put it in my phone under a different name so I wouldn't have to look at yours every time I scrolled past.

Work is fine. The apartment is fine. I have a plant now, a real one, and it's not dead yet, so tell Daddy — 

I keep doing that. It's been fourteen months and I keep doing that.

The snow's getting heavier. I'm going to go stand in it for a while. I don't know why. Because it's quiet, I think. Because it's the opposite of that balcony.

I'm not sending this either.
`) }],
  },
  {
    id: "s9", slug: "the-cartographer-of-lost-streets", title: "The Cartographer of Lost Streets", authorId: "a4",
    genre: "Fantasy", subgenre: "Urban Fantasy", format: "Novel", mood: "Playful", language: "English",
    readingTime: 240,
    hook: "London has 4,000 streets that were demolished and 41 that were never built. Wren has a map of both, and someone is trying to steal it.",
    synopsis: "A kinetic, panel-by-panel fantasy about a courier who can find the streets the city forgot, and the developer who wants to build over the last of them.",
    cover: IMG.street, stills: [IMG.city, IMG.bridge, IMG.hotel],
    tags: ["London", "maps", "chase", "hidden city"],
    publishedAt: "2026-05-25T16:00:00Z",
    stats: { readers: 6320, likes: 4380, comments: 510, saves: 2140, watchVotes: 2640, completion: 0.58 },
    screenability: 83, allowRemixes: true, inDevelopment: true, filmProjectId: "f5",
    chapters: [{ id: "c1", title: "Fetter Court", paragraphs: P(`
Fetter Court was demolished in 1897 and Wren was standing in it.

It was narrow, the way the old courts had been narrow, two people wide if the two people were friendly. The bricks were sooty in a way no brick in London had been sooty for a hundred years. Somewhere a pump was dripping. Above her, in a thin strip, was a sky that did not quite match the sky she had left on Fleet Street, as if the two had been painted on different days.

The package was in her satchel. The client was waiting at the far end, where the court opened, or had opened, onto Shoe Lane. She could see his shoes.

"You're late," he said.

"I'm early," Wren said. "By a hundred and twenty-nine years."

He did not laugh. Clients never laughed. It was one of the things she had learned in her first month: that the people who paid to have things carried through streets that no longer existed were, without exception, people who had lost their sense of humour somewhere around the same time the streets had.
`) }],
  },
  {
    id: "s10", slug: "the-people-who-stayed", title: "The People Who Stayed", authorId: "a6",
    genre: "Documentary", subgenre: "Reported Non-Fiction", format: "Non-Fiction", mood: "Quiet", language: "English",
    readingTime: 34,
    hook: "Nine years after the town was evacuated, thirty-one people still live there. I went to ask them why.",
    synopsis: "A reported essay from a town the maps have stopped naming. Non-fiction that reads like a film treatment: real people, real light, real refusal.",
    cover: IMG.road, stills: [IMG.desert, IMG.sunset, IMG.oldBuilding],
    tags: ["reportage", "evacuation", "Mexico", "home"],
    publishedAt: "2026-06-30T14:00:00Z",
    stats: { readers: 10120, likes: 6930, comments: 880, saves: 4120, watchVotes: 3420, completion: 0.88 },
    screenability: 87, allowRemixes: false, featured: true,
    chapters: [{ id: "c1", title: "The Road In", paragraphs: P(`
The road into the town is not closed. This surprised me. I had expected a barrier, a sign, a man in a uniform with instructions to turn people back. There is only the road, and a place where the asphalt ends and the dirt begins, and beyond that, the town, sitting in its valley the way it has sat for three hundred years, as if nothing had been decided about it.

Nine years ago the government decided. The river was going to be dammed, the valley was going to be a lake, and the 2,400 people of the town were going to be somewhere else. Most of them are. They were given houses in a new settlement forty kilometres east, houses with the same floor plan, on streets with the same names as the old streets, in an order that does not correspond to anything.

The dam was never finished. The reasons are the usual reasons. The valley is not a lake. The town is not underwater. It is simply, officially, not there.

Thirty-one people disagree.
`) }, { id: "c2", title: "Doña Remedios", paragraphs: P(`
She is eighty-four and she meets me at her gate with a broom, not as a weapon but because she was sweeping. She has been sweeping the same three metres of street every morning since 1961 and she does not see why the absence of the street should change that.

"They moved the church," she says. "Stone by stone. Numbered. Did you know that?" I say I had read about it. "They numbered the stones and they put it back together over there and it faces the wrong way. The sun comes in the wrong window during mass. Nobody goes."

I ask her why she stayed.

She looks at me with the expression of a woman who has answered this question for nine years and has never once heard it asked properly.

"Where else," she says, "would I sweep?"
`) }],
  },
  {
    id: "s11", slug: "nobody-lies-in-verano", title: "Nobody Lies in Verano", authorId: "a2",
    genre: "Mystery", subgenre: "High-Concept Mystery", format: "Short Story", mood: "Feverish", language: "English",
    readingTime: 20,
    hook: "In the town of Verano, lying is physically impossible. So who killed the mayor, and why does everyone say they did?",
    synopsis: "A detective from outside arrives in a town where the truth is compulsory, and discovers that a town without lies is not a town without secrets.",
    cover: IMG.sunset, stills: [IMG.desert, IMG.hotel, IMG.street],
    tags: ["truth", "detective", "small town", "high concept"],
    publishedAt: "2026-08-20T11:00:00Z",
    stats: { readers: 3910, likes: 2860, comments: 402, saves: 1230, watchVotes: 1980, completion: 0.9 },
    screenability: 89, allowRemixes: true, newVoice: false,
    chapters: [{ id: "c1", title: "Arrival", paragraphs: P(`
"Did you kill him?" Inspector Salcedo asked the woman behind the hotel desk, because he had been told that in Verano you could ask anyone anything and get the truth, and he wanted to see whether it was true.

"Yes," she said.

He wrote it down. Then he looked up. She was still watching him, pleasantly, with the unbothered face of someone who has told the truth all her life and has never once been believed.

"You killed the mayor."

"Yes."

"How?"

"I don't know," she said. "I only know that I did."

Outside, the plaza was very bright, and the fountain was dry, and a dog was asleep in the exact centre of the shade of the church. Salcedo looked at it and thought, for the first time in his career, that he might be in a place where his skills were of no use at all.
`) }],
  },
  {
    id: "s12", slug: "the-projectionist", title: "The Projectionist", authorId: "a1",
    genre: "Drama", subgenre: "Period Drama", format: "Short Story", mood: "Elegiac", language: "English",
    readingTime: 16,
    hook: "On the last night of a cinema in 1979, the projectionist screens a film nobody sent him.",
    synopsis: "The Rialto closes tomorrow. Tonight the last reel in the booth is unlabelled, and the audience of four is about to see something none of them will be able to describe.",
    cover: IMG.projector, stills: [IMG.cinema, IMG.curtain, IMG.neon],
    tags: ["cinema", "1979", "last night", "film about film"],
    publishedAt: "2025-12-12T20:00:00Z",
    stats: { readers: 7040, likes: 5580, comments: 640, saves: 2760, watchVotes: 2840, completion: 0.92 },
    screenability: 84, allowRemixes: true, inDevelopment: true, filmProjectId: "f6",
    chapters: [{ id: "c1", title: "Reel Six", paragraphs: P(`
There were four people in the auditorium and Kasper knew three of them. The fourth was a woman in the back row who had bought her ticket with exact change and had not taken off her coat.

The film was a comedy from 1961 that nobody had laughed at in 1961 either. He had chosen it because it was the first thing the Rialto had ever shown and he had a sense of symmetry, or of ceremony, which are the same thing when you are alone in a booth with a machine that is about to become an antique.

Reel five ended. He reached for reel six.

Reel six was not reel six. It was a can with no label, and the film inside was on a core he did not recognise, and when he threaded it, the leader had no numbers, only a strip of something that looked, held up to the lamp, like slow water.

He should have stopped. He had a reel of the comedy somewhere; he could have found it. But there were four people in the dark waiting for the second half of a joke, and the changeover cue was coming, and he had been a projectionist for thirty-one years and had never once left an audience looking at a white screen.

He hit the changeover. Below him, on the screen, the comedy dissolved into something else.

At first he thought it was a documentary. A street. Rain. A woman walking with her collar up. Then the woman turned, and looked directly into the lens, and Kasper recognised the street, because it was this street, and the marquee behind her, because it was this marquee, and the woman, because she was sitting in the back row of his cinema, in her coat, watching herself.
`) }],
  },
];

export const storyBySlug = (slug: string) => stories.find((s) => s.slug === slug);
export const storyById = (id: string) => stories.find((s) => s.id === id);
export const storiesByAuthor = (authorId: string) => stories.filter((s) => s.authorId === authorId);
