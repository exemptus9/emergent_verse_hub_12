from fastapi import APIRouter
from datetime import datetime, timezone
import uuid

from database import db

router = APIRouter()


def _generate_poem_id() -> str:
    return str(uuid.uuid4())


def _build_poems_data() -> list[dict]:
    """Build the list of seed poems."""
    poems_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "RhymeMosaic Book Available For Purchase",
            "slug": "rhymemosaic-book-available",
            "content": "After way too much delay, I proudly present the entirety of my poetic work in a single printed volume, available now for purchase on Amazon.\n\nIf you would like to purchase a signed copy, please contact me privately. Thanks!",
            "categories": ["Uncategorized"],
            "tags": ["book", "announcement", "milestone"],
            "date": "November 26, 2023",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.8,
            "ratingCount": 15,
            "totalRatingSum": 72,
            "isAnnouncement": True,
            "amazonLink": "https://a.co/d/aKlvWgS",
            "createdAt": "2023-11-26T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Love Burden",
            "slug": "love-burden",
            "content": """I was bruised and I was hurting
In my weakness, was a burden
Though your strength sustained me through
It clearly took its toll on you

And though I hate you went away
I am amazed how long you stayed
The simple words here I will say
Are all I can do to repay

I so regret accepting help
Focusing solely on myself
And though I gave what I could spare
There was no way it could compare

It seems unfair for me to blame
The deepest poignance of my pain
On one who so long did sustain
Well past the point it was a strain

Though heavy was the load I bore
You stood beside me, evermore
Your love, a beacon through this night
Your life sufficing my insight

My gratitude, it now takes flight
This thankfulness is only right
For all you've done, both day and night
My heart forever holds you tight

With weathered love, I now embrace
These gifts of healing, warmth and grace
Your selfless acts never erased
For you my soul forever waits""",
            "categories": ["Uncategorized"],
            "tags": ["broken hearted", "hurt", "love", "sadness", "gratitude", "loss", "regret"],
            "date": "December 23, 2023",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.5,
            "ratingCount": 12,
            "totalRatingSum": 54,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2023-12-23T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Nice Future",
            "slug": "nice-future",
            "content": """I don't mean to discourage
I don't care to cast blame
I just see me succeeding
And for you want the same

If you'd heed my advice
There's no doubt you would soar
Why settle now for less
When you could have oh so much more?

It is the way you view things
Through lenses ever dark
Your attitude is stifling
The shining of your spark

You must take hold of action
And do now what you must
The first step of your journey
Is your falling into trust

I see that you are struggling
You are fearful and you're fraught
But the problem is within you
Your mind is what's at fault

Just trust that this beginning
Is all it really takes
It may not seem so easy
But this pain is what creates

Though struggle is ensuing
It's prudent you should take
The urging of these yearnings
To shape and twist your fate

To break free from this cycle
Escape from shades of gray
While striving for horizons
You're inventing all your ways

With vision, you will conquer
Long determined, sure, you'll rise
And though challenges daunt us
We will reach unequaled skies

In unity, with effort
We will rewrite all our fates
To turn yearnings to action
As new futures we create""",
            "categories": ["caring", "confused", "self-focused"],
            "tags": ["philosophy/life", "encouraging", "motivation", "hope", "self-improvement", "perseverance"],
            "date": "October 21, 2023",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.8,
            "ratingCount": 23,
            "totalRatingSum": 110.4,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2023-10-21T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "TruthSeeker",
            "slug": "truthseeker",
            "content": """Anchor my roots in Your dirt by the river
The Savior's pursuit mends the hurts at my center
Amazing that You seek the worst of all sinners
And blatantly prove You're a perfect forgiver

I'm certain You heal and bind up all my hurting
That You will improve how I feel; lighten burdens
Observing Your Word, as I'm still finding purpose
My dreams are complete and fulfilled, writing sermons

I'm learning to trust and in You put my faith
You deserve it and plus continue giving grace
I'll be serving, discussing, defending Who's Great
You are worth it, for justice You do demonstrate

Now You're working in me, fingerprints on my soul
Certainly leaving hints, glimpses where I might go
Intently sensing visions You're likely to show
For my God, I'm convinced, has the best truth I know!""",
            "categories": ["Uncategorized", "faith/religious"],
            "tags": ["faith", "religious", "god", "salvation", "purpose", "healing", "spirituality"],
            "date": "March 15, 2023",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.2,
            "ratingCount": 8,
            "totalRatingSum": 33.6,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2023-03-15T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Seasonal Change",
            "slug": "seasonal-change",
            "content": """The stillness of the chillest air
Instills some feelings of despair
The leaves are leaving trees so bare
Completing seasons we've all shared

Now warmth is growing, Light's increased
Our hope has formed as nights have ceased
The old's eroding, groans and griefs
Have shown our past's over, complete

Erased by saving grace we've found
Replaced creations, pain's rewound
By faith, no more by chains be bound
To make our Savior's name renowned

Now spring will bring His dreams to life
No eye has seen such green delights
Serene as we have reached the prize
Believing these teachings of Christ""",
            "categories": ["Uncategorized", "faith/religious"],
            "tags": ["seasons", "change", "faith", "hope", "renewal", "spirituality", "nature"],
            "date": "March 15, 2023",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.0,
            "ratingCount": 15,
            "totalRatingSum": 60,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2023-03-15T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Root-Bound",
            "slug": "root-bound",
            "content": """Losing grip, sinking ship, same ole shit, sick of it
Lost my place, fuck the race, back of line, another time
This is it, I'll end my trip, it's time to split, I'm done; I quit!
I won't exist, I won't be missed, I form a fist and slit my wrist

I drag the razor down the vein
And make it hurt to numb the pain
A squirt, a spurt of crimson rain
Berserk I flirt with ending shame

Pervert what works and face disgrace
The end begins, I'm laid to waste
Escaping this degrading place
Away I wither, fade with haste""",
            "categories": ["angry", "betrayed", "depressed", "destructive", "dying", "frustrated", "hopelessness", "stress", "suicidal", "violent"],
            "tags": ["angry", "dying", "frustrated", "hurt", "poem", "violent", "despair", "darkness", "pain", "self-harm"],
            "date": "June 11, 2020",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 3.8,
            "ratingCount": 18,
            "totalRatingSum": 68.4,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2020-06-11T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": '"Soon," I Sighed (Suicide)',
            "slug": "soon-i-sighed",
            "content": """The blood on these walls is so beautiful
I scratched all my nails down to their cuticles
I numbed all the pain with pharmaceuticals
This ending to my life's so suitable

I ran off everyone who ever knew me
I knew not what I do, was quite unruly
These mistakes have taken over, they overgrew me
There's no hope surviving, but I'm smiling – truly

To be at the end, and finally have the peace
To stare at this sin, yet then accept the beast
To be on the mend, but still so crave release
To no more defend, and blindly let me cease

To hold in my hands this fragile sense surviving
I'm trapped in a land that's barely of my liking
I'm captive and that's exactly why I'm dying
It's crap that fam'ly will find me out while crying

There's no sense in going on, no use denying
Despite what I try, it's useless when I'm lying
These lines so inscribed deny myself while sighing
This existence done, this is my final writing""",
            "categories": ["depressed", "destructive", "dying", "hopelessness", "hurt", "sadness", "suicidal"],
            "tags": ["despair", "darkness", "pain", "isolation", "finality", "suffering", "mental health"],
            "date": "June 1, 2020",
            "author": "rhymemosaic",
            "comments": 1,
            "rating": 4.1,
            "ratingCount": 22,
            "totalRatingSum": 90.2,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2020-06-01T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "So Much More To Gain",
            "slug": "so-much-more-to-gain",
            "content": """Earth's built at a tilt that I am not aligned to
It's certain I should work in a way I'm not designed to
To wit: this must be it, and all there is that I'm confined to
But if you think like this, then shit, they've been able to blind you!

Have you longed to be so lost that one could never ever find you?
Or to go so far into the dark you don't know what's behind you?
Wondered how'd life be without your thoughts there to remind you
Of the pain of all the chains in place created just to bind you?

Have you ever read the signs between the lines of what is said
Or felt the dread of being led to where your life instead is dead
Or been surprised when you realized that all you prized was merely lies
And all the striving in this life could not suffice to make it right?

Well I am there and I am scared, quite unprepared for what I bear
I've barely felt apparent welts and there is blood that can't be spared
I understand it's by my hand that I have landed where I am
And though I'm faring fairly well, I feel to hell I should be damned

And in a manic panic, frantic, anti-depressed ain't fast enough
My grandest plans demand expansion, unplanned aggressions can erupt
When losing touch it seems so much distrust just bubbles ever up
As the lessons never lessen, doors keep closing, never shut

But just before ignoring warnings and performing warring games
The present moment is remembered, I experience the pain
And as I face the fears they fall so flatly, fuming into flames
And I am grateful for these gifts that give us so much more to gain""",
            "categories": ["confused", "depressed", "destructive", "frustrated", "hopelessness", "hurt", "sadness", "self analysis"],
            "tags": ["introspection", "struggle", "mental health", "gratitude", "growth", "pain", "self-awareness", "resilience"],
            "date": "November 14, 2016",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.6,
            "ratingCount": 19,
            "totalRatingSum": 87.4,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2016-11-14T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Never ! (Version)",
            "slug": "never-version",
            "content": """Adrift amid desolate waters
I recollect the depths the wetness hides
The surface, this thin boundary
Divides the separate sides

As I recall the wrecks that led me to
The depths of water Grey
I see the deep beneath me's
Not at all that far away

And then I feel a tug that nudges
Budging downward bound
A sudden plunge, I'm under
But the source it seems I've found:

It is this world circ'ling the drain
Pulling to drown me once again
But this time I have strength;
There's simply no way I'll give in

Struggling, strenuous swimming
Beginning to win despite weight that I bear
Envision my ending as sinking
Instead I am thinking I won't go back there

There's no lowering down to that level
I'll never again allow losing Insight
I will no longer let lies ligate me
And regain my place at the helm of this Life!""",
            "categories": ["encouraging"],
            "tags": ["encouraging", "triumphant", "strength", "perseverance", "overcoming", "hope", "determination", "survival"],
            "date": "September 12, 2014",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.9,
            "ratingCount": 31,
            "totalRatingSum": 151.9,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2014-09-12T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Dearly Beloved,",
            "slug": "dearly-beloved",
            "content": """Another relationship ends in disaster
Why can I not seem to find what I'm after?
For two to be one, 'till death do us part
To love and to hold, with all of our hearts

The concept is simple, the idea is trite
So why should it be such a chore to get right?
I accept your flaws, and you accept mine
Supporting each other through good and bad times

I know in the past I have stumbled; I fell
And there's no one to blame for these things but myself
But your foibles and fumbles I always forgave
Was it too much to ask for the patience to wait?

I was floundering, sinking, tossed 'round by the waves
And I knew that your hand would be waiting to save
So I grasped for the grip guaranteed you'd let down
But I found you'd sailed off, leaving me here to drown

So I guess that it's best at least you will survive
No dead weight to drag down what is left of your life
As for me, I'll keep seeking the fabulous wealth
Of a mate that will stay in my sickness and health""",
            "categories": ["betrayed", "broken hearted", "depressed", "hurt", "sadness"],
            "tags": ["break-up", "broken hearted", "hurt", "poem", "poetry", "relationship", "abandonment", "loneliness", "love lost"],
            "date": "June 9, 2011",
            "author": "rhymemosaic",
            "comments": 1,
            "rating": 4.6,
            "ratingCount": 19,
            "totalRatingSum": 87.4,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2011-06-09T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Pink Serpent",
            "slug": "pink-serpent",
            "content": """There's a hole in my heart the size of your love
Try to keep it below but it's rising above
And it's spreading and snaking its way through enough
That I'm sitting here saying this stuff is too much

And I'm wishing and praying that you'd disappear
Wanna be left alone, but I look, you're still here
And the unknown you know, is my life's biggest fear
You have moved on along but I'm still facing years

I am sorry for all of the time I was stuck
For the moments I used you, that you were my crutch
That the hardest I gave was not given enough
That my most was your least, and was treated as such

And the hope that I clutch just keeps slipping away
And I fight and I fight it, to keep it at bay
But my solid foundation is starting to sway
Order turned into chaos, from sane to dismay

Though I try to deny the display on my face
There's no masking reaction to flavor I taste
What we had quickly over, disposed of with haste
Left me hating the ways that my faith was a waste

In this place I've been taken, I'm all on my own
Lost in so large a world with no place to call home
You can reach, but at this point, I'll just be alone
For protection I'm letting this heart turn to stone""",
            "categories": ["betrayed", "broken hearted", "depressed", "hurt", "regret", "sadness"],
            "tags": ["heartbreak", "loss", "regret", "isolation", "pain", "moving on", "emotional walls"],
            "date": "June 9, 2011",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.3,
            "ratingCount": 14,
            "totalRatingSum": 60.2,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2011-06-09T01:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Aphasic Lamentation",
            "slug": "aphasic-lamentation",
            "content": """Make this place amazing
And I'll stay for many days
But take away this great escape
And I may fade into the gray

Of such despair that there
Are hardly terms I find that could compare
To match the horror of this beauty
That I stare at everywhere

I find my life inside has died
And I'm denied the right to scribe
Or to assign this slice of life
A type of bright insightful lines

But though I stew and make a fuss
The only truth is, life is tough
Oh, what to do? Futile to bluff
I guess this proves my flame's been snuffed""",
            "categories": ["depressed", "frustrated", "hopelessness", "sadness"],
            "tags": ["despair", "creativity block", "struggle", "emptiness", "loss of passion", "darkness"],
            "date": "June 9, 2011",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.0,
            "ratingCount": 11,
            "totalRatingSum": 44,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2011-06-09T02:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "TinMan",
            "slug": "tinman",
            "content": """You're insane to be happy
So I must bring you down
Your smile, it attacks me
So with me you must frown

Your success is a threat
To the chains that I'm bound
I cannot fly with you
So we'll both hit the ground

If I cannot be
Then none of us will
If I can't believe
Then your faith I shall kill

If I can't receive
Don't expect to be filled
If my way's not easy
Then yours must be uphill

If I cannot have it
Then you'll possess lack
I did it the hard way
So I'll cut you no slack

Whatever I give you
You've got to give back
'Cause if you aren't of value
I don't owe you jack

This world's about me
And all in it is mine
And you might have problems
But I pay them no mind

'Cause I'm helping myself
So I don't have the time
To hear anyone else
Give a yelp or a whine

For "I" am the center
And with "me" you're stuck
And try as you might
I will not give "you" up

"We" are in this together
So to "us," best of luck
If within lies our treasure
Moth and rust doth corrupt""",
            "categories": ["philosophy/life", "sarcastic", "self-focused"],
            "tags": ["philosophy/life", "sarcastic", "self-focused", "narcissism", "social commentary", "irony", "selfishness"],
            "date": "June 23, 2009",
            "author": "rhymemosaic",
            "comments": 2,
            "rating": 4.7,
            "ratingCount": 27,
            "totalRatingSum": 126.9,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-23T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Transmuted",
            "slug": "transmuted",
            "content": """I see with different eyes
I hear with other ears
Transparent now the lies
The truth so very clear

The grip that had a hold
Has slipped and been released
The dark that was so cold
Has markedly decreased

In warmth I have been freed
The shadow's been replaced
The Light is what I need
In it my strength is based

I face the day ahead
With faith I'll make it through
Wherever I am led
My heart will follow Truth""",
            "categories": ["faith/religious", "philosophy/life", "salvation"],
            "tags": ["faith/religious", "philosophy/life", "salvation", "transformation", "enlightenment", "truth", "spiritual awakening"],
            "date": "June 22, 2009",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.4,
            "ratingCount": 16,
            "totalRatingSum": 70.4,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-22T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Inverted Indifference",
            "slug": "inverted-indifference",
            "content": """Your memory's attached to all that I know
Your essence is with me wherever I go
The pain that I feel's getting hard not to show
I want it to end but it's fading so slow

And I know that your love I don't even deserve
And that fact seems to touch such a sensitive nerve
Though I wish we could try again, making "us" work
I am fearful of causing you any more hurt

And I hope that you know, if for only your sake
That I'm paying quite deeply for all my mistakes
If it seems like I'm happy, please know that it's fake
It's my way of erasing the pain that I make

'Cause now I'm alone and I've made quite a mess
My endurance has surely been put to the test
And what you are thinking I can't even guess
But I hope that you're peaceful, and wish you the best""",
            "categories": ["broken hearted", "love", "philosophy/life"],
            "tags": ["broken hearted", "love", "philosophy/life", "regret", "loss", "memory", "longing", "guilt"],
            "date": "June 21, 2009",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.1,
            "ratingCount": 11,
            "totalRatingSum": 45.1,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-21T00:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "The Next White Rapper",
            "slug": "the-next-white-rapper",
            "content": """I'm gonna be the next white rapper
Not a cracker, cracked and brittle
I don't wanna be an M&M
I wanna be a Skittle

And let you sip a little bit of this here hasty brainy flow
And like LSD, be havin you tastin the rainbow
Cause I'm a poet, not just a mf'in rapper
A reality show, not some average half assed actor

A multiple, there's no way I'm a Fear Factor
Just a human plough, I got no need for John Deere tractors
I'm not a stalker, I'm a body tracker like GPS
Tracin your calls with the government like Sprint PCS

Cuz things are fucked up in the world and they're completely messed
But I'ma tidy things up, life's not gonna leave me stressed
Cause I'm at my best, and I'm blessed more and more each day
Whatever I wrest, won't give less than four times that away

And this I pray, you find contented peace in your life
Cause every day was invented as release for your strife""",
            "categories": ["fun", "philosophy/life"],
            "tags": ["rap", "humor", "self-expression", "wordplay", "positivity", "creativity", "fun"],
            "date": "June 21, 2009",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.3,
            "ratingCount": 13,
            "totalRatingSum": 55.9,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-21T01:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Helping Hand",
            "slug": "helping-hand",
            "content": """If you are here and reading this
I probably understand
Why you are desperate, searching
For a single helping hand

Amid these middle fingers
That this world thrusts right at you
You're seeking some relief
Some kind of peace to guide you through

I come to you and write this
In hopes that when you stretch
Your arms into the crowd
My hand's the one you catch

I'm here if you should need me
Yes, for you, reading this now
I'll help in any way I can
If you'll just tell me how""",
            "categories": ["caring", "encouraging", "friendship"],
            "tags": ["support", "compassion", "hope", "outreach", "kindness", "empathy", "connection", "help"],
            "date": "June 21, 2009",
            "author": "rhymemosaic",
            "comments": 1,
            "rating": 4.95,
            "ratingCount": 42,
            "totalRatingSum": 207.9,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-21T02:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Abcessed Insanity",
            "slug": "abcessed-insanity",
            "content": """By God we're molested
It's called "being tested"
For His Holy Sake
We are beaten and Raped

Bleed so He's entertained
We get suffering, pain
Seems then we take the blame
Which is fucking insane!

We've no choice how it goes
In a life we've not(?) chose
In this body we're stuck
But if we give it up

Then our time we'll be spending
In hell never-ending
A catch-22
And it's Him versus you

If He says our Will's Free
Then what of Destiny?
If we Control our hands,
Then how's He got a Plan?

If we Follow His voice
Then do we have a Choice?
Are we given a say
In what happens each day?

Or in being at all?
Seems we're Made just to fall
Seems we're part of His Fun
Jeez I wish He'd be done

With the me that I know
Cause I'm ready to go
Give me Wings so I'll fly
And I'll kiss life goodbye""",
            "categories": ["angry", "confused", "frustrated", "violent"],
            "tags": ["angry", "confusion", "god", "hurt", "poem", "poetry", "existential", "questioning faith", "free will", "frustration"],
            "date": "June 21, 2009",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 3.9,
            "ratingCount": 17,
            "totalRatingSum": 66.3,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-21T03:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Puppet Master",
            "slug": "puppet-master",
            "content": """My body is my puppet
And my mind the puppet master
It pulls the strings that bring the things
My mind thinks it is after

It craves the way (to your dismay)
That life's a big disaster
But in the end it's just pretend
And only meant for laughter!""",
            "categories": ["fun", "philosophy/life"],
            "tags": ["philosophy/life", "humor", "mind", "perspective", "lighthearted", "self-awareness"],
            "date": "June 21, 2009",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 3.9,
            "ratingCount": 7,
            "totalRatingSum": 27.3,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-21T04:00:00Z"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "RainCloud",
            "slug": "raincloud",
            "content": """I'm a stain on your rainbow halo
Raining on your vain parade, I stay low
I'm a raincloud, as you may know
Just ask the plains I rain on, they grow

Cause they know you can't have storms without lightning
So when I might get bright do not be frightened
By my might because I don't like fighting
I prefer writing

And righting wrongs
And writing songs
All about rainbows
And storm clouds dressed in plain clothes
Cause I'm secretly writing about me…""",
            "categories": ["angry", "betrayed", "self-confidence"],
            "tags": ["metaphor", "self-identity", "storms", "creativity", "introspection", "resilience", "writing"],
            "date": "June 21, 2009",
            "author": "rhymemosaic",
            "comments": 0,
            "rating": 4.2,
            "ratingCount": 9,
            "totalRatingSum": 37.8,
            "isAnnouncement": False,
            "amazonLink": None,
            "createdAt": "2009-06-21T05:00:00Z"
        }
    ]
    return poems_data


def _build_comments_data(poems_data: list[dict]) -> list[dict]:
    """Build seed comments keyed to specific poems."""
    return [
        {
            "id": _generate_poem_id(),
            "poemId": next(p["id"] for p in poems_data if p["slug"] == "dearly-beloved"),
            "author": "Anonymous Reader",
            "content": "This poem really resonates with me. The raw emotion about relationships and abandonment is powerful.",
            "createdAt": "2011-06-10T00:00:00Z"
        },
        {
            "id": _generate_poem_id(),
            "poemId": next(p["id"] for p in poems_data if p["slug"] == "soon-i-sighed"),
            "author": "Hope Seeker",
            "content": "Please know that there is always hope. If you or anyone reading this is struggling, please reach out for help.",
            "createdAt": "2020-06-02T00:00:00Z"
        },
        {
            "id": _generate_poem_id(),
            "poemId": next(p["id"] for p in poems_data if p["slug"] == "tinman"),
            "author": "Thoughtful Reader",
            "content": "The irony in this piece is masterful. It perfectly captures narcissistic thinking.",
            "createdAt": "2009-06-24T00:00:00Z"
        },
        {
            "id": _generate_poem_id(),
            "poemId": next(p["id"] for p in poems_data if p["slug"] == "tinman"),
            "author": "Poetry Fan",
            "content": "This is a brilliant social commentary. The ending with the Biblical reference ties it all together.",
            "createdAt": "2009-07-01T00:00:00Z"
        },
        {
            "id": _generate_poem_id(),
            "poemId": next(p["id"] for p in poems_data if p["slug"] == "helping-hand"),
            "author": "Grateful Soul",
            "content": "Thank you for writing this. Sometimes we all need to know someone cares.",
            "createdAt": "2009-06-22T00:00:00Z"
        }
    ]


@router.post("/seed")
async def seed_database() -> dict:
    """Seed the database with initial poems and comments."""
    count = await db.poems.count_documents({})
    if count > 0:
        return {"message": f"Database already has {count} poems"}

    poems_data = _build_poems_data()
    await db.poems.insert_many(poems_data)

    comments_data = _build_comments_data(poems_data)
    await db.comments.insert_many(comments_data)

    return {"message": f"Seeded {len(poems_data)} poems and {len(comments_data)} comments"}
