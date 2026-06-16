
/* ============================================================
   seed.js — PostgreSQL version
   Run: node seed/seed.js
   Safe to run multiple times — checks before inserting
============================================================ */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

console.log('🌱 Starting seed...\n');

const STORIES = [
  { content:"I haven't bought new clothes in 3 years. Every naira goes to my family.", burden:'financial', country:'Nigeria' },
  { content:"Everyone calls me strong but nobody asks if I'm tired.", burden:'financial', country:'Kenya' },
  { content:"I graduated two years ago and still feel like a failure.", burden:'financial', country:'Ghana' },
  { content:"I told my wife we were okay. We weren't.", burden:'financial', country:'Nigeria' },
  { content:"I work two jobs and still can't afford rent.", burden:'financial', country:'UK' },
  { content:"I am the first son. There is no room for me to fail.", burden:'family', country:'Nigeria' },
  { content:"I have never once been asked how I am doing.", burden:'family', country:'Uganda' },
  { content:"They see a provider. I just want to be seen as a person.", burden:'family', country:'South Africa' },
  { content:"My parents' dreams became my prison before I turned 20.", burden:'family', country:'Ghana' },
  { content:"I chose the career they wanted. I hate every day of it.", burden:'family', country:'Nigeria' },
  { content:"I am surrounded by people and completely alone.", burden:'loneliness', country:'UK' },
  { content:"I have a hundred contacts and nobody to truly call.", burden:'loneliness', country:'USA' },
  { content:"I forgot what it felt like to be known by someone.", burden:'loneliness', country:'Canada' },
  { content:"I smile at dinner so nobody asks questions.", burden:'loneliness', country:'Nigeria' },
  { content:"My last real conversation was six months ago.", burden:'loneliness', country:'Australia' },
  { content:"My girlfriend thinks I'm emotionally distant. The truth is I'm drowning.", burden:'relationship', country:'Nigeria' },
  { content:"I love her but I don't know how to say it right.", burden:'relationship', country:'Ghana' },
  { content:"We sleep in the same bed and feel miles apart.", burden:'relationship', country:'South Africa' },
  { content:"I keep pushing people away and I don't know how to stop.", burden:'relationship', country:'USA' },
  { content:"I miss who we used to be.", burden:'relationship', country:'UK' },
  { content:"I lie awake calculating how many months I have left.", burden:'career', country:'Nigeria' },
  { content:"Every rejection email breaks something in me.", burden:'career', country:'South Africa' },
  { content:"I built a business. It failed. I don't know who I am anymore.", burden:'career', country:'USA' },
  { content:"I'm overqualified everywhere and employed nowhere.", burden:'career', country:'Nigeria' },
  { content:"I work hard and watch mediocre men get promoted.", burden:'career', country:'Kenya' },
  { content:"I still reach for my phone to call him.", burden:'grief', country:'Nigeria' },
  { content:"Nobody told me grief could feel like anger.", burden:'grief', country:'Ghana' },
  { content:"I am still not over it. I just pretend I am.", burden:'grief', country:'Kenya' },
  { content:"I never cried at the funeral. I still haven't.", burden:'grief', country:'Nigeria' },
  { content:"Some days I forget. Then I remember and it hits all over again.", burden:'grief', country:'UK' },
  { content:"I question every decision I make. Every single one.", burden:'selfdoubt', country:'Nigeria' },
  { content:"I feel like a fraud at work every day.", burden:'selfdoubt', country:'USA' },
  { content:"I look confident. Inside I am terrified.", burden:'selfdoubt', country:'South Africa' },
  { content:"I've talked myself out of every opportunity I've had.", burden:'selfdoubt', country:'Nigeria' },
  { content:"I don't trust my own judgement anymore.", burden:'selfdoubt', country:'Canada' },
  { content:"I have no idea what I'm doing with my life.", burden:'lost', country:'Nigeria' },
  { content:"Everyone has a path. I can't even find the road.", burden:'lost', country:'Ghana' },
  { content:"I woke up at 32 and realised I had been living someone else's life.", burden:'lost', country:'UK' },
  { content:"I don't know what I want. That scares me more than anything.", burden:'lost', country:'Nigeria' },
  { content:"I never had a father. I'm terrified of repeating the pattern.", burden:'fatherhood', country:'Nigeria' },
  { content:"I provide everything except presence. I'm working on it.", burden:'fatherhood', country:'Ghana' },
  { content:"My child looks up to me and I don't feel worthy.", burden:'fatherhood', country:'South Africa' },
  { content:"I missed too many moments I can't get back.", burden:'fatherhood', country:'USA' },
  { content:"I want to be the father I never had. I don't know how.", burden:'fatherhood', country:'Nigeria' },
  { content:"I carry something I have never said out loud.", burden:'other', country:'Anonymous' },
  { content:"It doesn't have a name but it's always there.", burden:'other', country:'Anonymous' },
  { content:"I don't have words for it yet.", burden:'other', country:'Anonymous' },
  { content:"The weight is real even if I can't explain it.", burden:'other', country:'Anonymous' },
];

const LETTERS = [
  { title:"To The Man Who Can't Make Ends Meet", burden:'financial', from_line:"A man who made it through", hearts:241,
    body:["I know what it feels like to check your account before you sleep and wake up checking it again.","I know the weight of being the one everyone depends on — while quietly wondering how you'll make it through the month.","You are not a failure. You are a man in a hard season.","This is not the end of your story. It is just one chapter — and chapters end.","Keep going. Not because it's easy. But because you are stronger than this moment knows."] },
  { title:"To The Man Providing In Silence", burden:'financial', from_line:"Another provider", hearts:188,
    body:["Nobody sees the calculations you run in your head every single day.","Nobody sees the sacrifices — the things you denied yourself so others could have.","But I see you.","It's okay to ask for help. It's okay to say 'I'm struggling.' That is not weakness. That is honesty.","You carry enough. You don't have to carry it alone."] },
  { title:"To The Broke Young Man", burden:'financial', from_line:"A man who was once where you are", hearts:312,
    body:["The world told you by 25 you should have it figured out. By 30 you should be stable.","And here you are — working, trying, grinding — and it still doesn't feel like enough.","Your worth is not your net worth.","The season you're in right now is building something in you that money cannot buy.","Hold on. Your breakthrough is not cancelled. It's just delayed."] },
  { title:"To The Man Carrying His Family's Dreams", burden:'family', from_line:"A first son who understands", hearts:197,
    body:["You became the hope of the family before you were old enough to understand what that meant.","Somewhere along the way, you forgot to ask yourself: what do I actually want?","Honouring them does not mean disappearing yourself.","You can love your family and still choose your own path. Those two things can exist together."] },
  { title:"To The Man Nobody Checks On", burden:'family', from_line:"Someone who sees you", hearts:445,
    body:["You're always the strong one. Always the one people call. So nobody thinks to ask how you are.","But I'm asking today: how are you, really?","The strongest men I've ever known were not the ones who never broke. They were the ones who broke and kept going."] },
  { title:"To The Lonely Man", burden:'loneliness', from_line:"A man who found his way back", hearts:523,
    body:["You can be in a room full of people and feel completely invisible.","That kind of loneliness — the kind nobody can see — is one of the heaviest things a man can carry.","You are not broken for feeling this way.","You deserve people who know the real you. And they exist. They're looking for you too.","Don't give up on finding your people."] },
  { title:"To The Man Who Feels Invisible", burden:'loneliness', from_line:"Another invisible man, now found", hearts:301,
    body:["You walk into rooms and feel like no one truly sees you.","Loneliness lies. It tells you that you are unworthy of closeness. It is wrong.","You are worthy of deep friendship. Of real love. Of being truly known.","Keep your heart open. The right people will find their way in."] },
  { title:"To The Man With a Broken Heart", burden:'relationship', from_line:"A man who loved and lost and loved again", hearts:389,
    body:["Men are not supposed to talk about heartbreak. We are supposed to move on.","But heartbreak is one of the most brutal things a human being can experience.","If it broke you a little — that just means you loved with your whole chest.","There is no weakness in grief. There is no shame in missing someone.","You will not always feel this way. Life will open again."] },
  { title:"To The Man Falling Behind", burden:'career', from_line:"A man who waited and won", hearts:267,
    body:["You watch your peers move forward. Get promoted. Start companies.","Stop measuring your chapter 3 against someone else's chapter 10.","The things being built in you during this waiting season cannot be bought.","Your time is coming. Do not abandon yourself before it arrives."] },
  { title:"To The Man Whose Business Failed", burden:'career', from_line:"A fellow builder", hearts:341,
    body:["You built something with your own hands and watched it fall.","That grief is real. That shame is real. I'm not going to pretend otherwise.","The failure of your business is not the failure of you.","Every man who built something great has a graveyard of attempts behind him.","You are not finished. You are only beginning to understand what you're made of."] },
  { title:"To The Man Who Lost Someone", burden:'grief', from_line:"A grieving man who made it to the other side", hearts:612,
    body:["There's a specific silence that comes after losing someone you love.","A silence in the phone — because you keep forgetting you can no longer call them.","Grief is love with nowhere to go.","Feel it all. Cry if you need to. Cry even if you haven't let yourself yet.","Grief is not weakness. It is the truest proof of how deeply you loved."] },
  { title:"To The Man Who Doubts Himself", burden:'selfdoubt', from_line:"A man who silenced the voice", hearts:489,
    body:["That voice in your head — the one that says you're not enough — I know it.","I know how loud it gets in the quiet.","But that voice is not the truth. It is fear wearing a familiar face.","You have already survived every hard day you've faced. Your track record is 100%.","You are more capable than your worst thoughts of yourself."] },
  { title:"To The Man Who Doesn't Know Where He's Going", burden:'lost', from_line:"A man who was lost and then found", hearts:378,
    body:["Not knowing your direction is terrifying when everyone around you seems to have a map.","Purpose is rarely a lightning bolt. It's usually a slow accumulation of honest choices.","The fact that you're searching means you haven't given up on yourself.","Keep moving. Even without a clear destination. Movement creates clarity.","You were made for something — and it is still waiting for you."] },
  { title:"To The Man Trying To Be a Good Father", burden:'fatherhood', from_line:"A father who is also figuring it out", hearts:721,
    body:["You are trying to give your children what you may not have received yourself.","Your children don't need a perfect father. They need a present one.","They need to see you try. They need to see you apologise when you're wrong.","They need to see that a man can be strong and tender at the same time.","You are enough."] },
  { title:"To The Man Carrying Something He Can't Name", burden:'other', from_line:"A man who also carries the unnamed", hearts:554,
    body:["Not every burden has a name.","Sometimes it's just a weight. A heaviness. A feeling that something is off.","That unnamed thing is still real. And you carrying it still counts.","You don't need to explain it perfectly for it to be worth carrying less.","You are seen. Even in the things you can't yet speak."] },
];

const MESSAGES = [
  { content:"Keep going brother. This season won't last forever.", burden:'financial', hearts:2100 },
  { content:"You are not what's in your account. You are what's in your chest.", burden:'financial', hearts:1843 },
  { content:"The fact that you're still fighting means you haven't given up. Don't stop now.", burden:'financial', hearts:1567 },
  { content:"One day you'll look back at this season and know it built you.", burden:'financial', hearts:922 },
  { content:"You don't have to carry everyone. Put yourself down for a moment. Breathe.", burden:'family', hearts:1432 },
  { content:"Choosing yourself is not betraying them. It's surviving for them.", burden:'family', hearts:1201 },
  { content:"You are a person first. Remember that.", burden:'family', hearts:889 },
  { content:"You are not invisible. I see you. A lot of us do.", burden:'loneliness', hearts:3241 },
  { content:"The right people are still coming. Don't shut the door before they arrive.", burden:'loneliness', hearts:2108 },
  { content:"Being alone right now doesn't mean being alone forever.", burden:'loneliness', hearts:1754 },
  { content:"Loving deeply is not a weakness. It's one of the bravest things a man can do.", burden:'relationship', hearts:1990 },
  { content:"Heal before you blame yourself for everything. Some things just break.", burden:'relationship', hearts:1344 },
  { content:"You will love again. And it will be better because of what this taught you.", burden:'relationship', hearts:1122 },
  { content:"Your time is coming. Don't leave before the miracle.", burden:'career', hearts:2443 },
  { content:"Every no is moving you closer to the yes that changes everything.", burden:'career', hearts:1887 },
  { content:"The grind is quiet. The breakthrough is loud. Keep going quietly.", burden:'career', hearts:1632 },
  { content:"Grief is not a sign of weakness. It's a sign you loved well.", burden:'grief', hearts:2987 },
  { content:"You don't have to be over it. You just have to keep going.", burden:'grief', hearts:2341 },
  { content:"They would want you to still have a life. Give yourself permission.", burden:'grief', hearts:1876 },
  { content:"You've made it through every hard day so far. Today is no different.", burden:'selfdoubt', hearts:3102 },
  { content:"That voice lying to you — it's fear. Not truth. Don't let it drive.", burden:'selfdoubt', hearts:2234 },
  { content:"You are further along than you think. Look back at how far you've come.", burden:'selfdoubt', hearts:1998 },
  { content:"Not knowing the destination doesn't mean you're going the wrong way.", burden:'lost', hearts:2567 },
  { content:"Keep moving. Clarity comes through action, not waiting.", burden:'lost', hearts:1923 },
  { content:"You haven't lost your purpose. You just haven't found it yet. Keep looking.", burden:'lost', hearts:1644 },
  { content:"The fact that you worry about being a good father means you already are one.", burden:'fatherhood', hearts:4201 },
  { content:"Show up imperfectly. That's still showing up.", burden:'fatherhood', hearts:3456 },
  { content:"Your children need your presence more than your perfection.", burden:'fatherhood', hearts:2987 },
  { content:"Whatever you're carrying — you don't have to carry it forever.", burden:'other', hearts:2100 },
  { content:"You are seen. Even in the things you can't put into words.", burden:'other', hearts:1765 },
  { content:"Keep going brother. The world needs you in it.", burden:'other', hearts:3341 },
];

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stories (
      id         SERIAL PRIMARY KEY,
      content    TEXT    NOT NULL,
      burden     TEXT    NOT NULL,
      country    TEXT    NOT NULL DEFAULT 'Anonymous',
      source     TEXT    NOT NULL DEFAULT 'community',
      approved   BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS letters (
      id         SERIAL PRIMARY KEY,
      title      TEXT    NOT NULL,
      body       JSONB   NOT NULL,
      from_line  TEXT    NOT NULL DEFAULT 'Anonymous',
      burden     TEXT    NOT NULL,
      source     TEXT    NOT NULL DEFAULT 'seeded',
      hearts     INTEGER NOT NULL DEFAULT 0,
      approved   BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id         SERIAL PRIMARY KEY,
      content    TEXT    NOT NULL,
      burden     TEXT    NOT NULL,
      source     TEXT    NOT NULL DEFAULT 'community',
      hearts     INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id         SERIAL PRIMARY KEY,
      content    TEXT    NOT NULL,
      burden     TEXT    NOT NULL,
      promoted   BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS letter_hearts (
      letter_id  INTEGER NOT NULL,
      ip_hash    TEXT    NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (letter_id, ip_hash)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_hearts (
      message_id INTEGER NOT NULL,
      ip_hash    TEXT    NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (message_id, ip_hash)
    )
  `);
  console.log('  ✅ Tables ready');
}

async function seedStories() {
  const { rows } = await pool.query(`SELECT COUNT(*) as n FROM stories WHERE source = 'seeded'`);
  if (parseInt(rows[0].n) > 0) { console.log('  ⏭  Stories already seeded'); return; }
  for (const s of STORIES) {
    await pool.query(
      `INSERT INTO stories (content, burden, country, source, approved) VALUES ($1,$2,$3,'seeded',true)`,
      [s.content, s.burden, s.country]
    );
  }
  console.log(`  ✅ Seeded ${STORIES.length} stories`);
}

async function seedLetters() {
  const { rows } = await pool.query(`SELECT COUNT(*) as n FROM letters WHERE source = 'seeded'`);
  if (parseInt(rows[0].n) > 0) { console.log('  ⏭  Letters already seeded'); return; }
  for (const l of LETTERS) {
    await pool.query(
      `INSERT INTO letters (title, body, from_line, burden, source, hearts, approved) VALUES ($1,$2,$3,$4,'seeded',$5,true)`,
      [l.title, JSON.stringify(l.body), l.from_line, l.burden, l.hearts]
    );
  }
  console.log(`  ✅ Seeded ${LETTERS.length} letters`);
}

async function seedMessages() {
  const { rows } = await pool.query(`SELECT COUNT(*) as n FROM messages WHERE source = 'seeded'`);
  if (parseInt(rows[0].n) > 0) { console.log('  ⏭  Messages already seeded'); return; }
  for (const m of MESSAGES) {
    await pool.query(
      `INSERT INTO messages (content, burden, source, hearts) VALUES ($1,$2,'seeded',$3)`,
      [m.content, m.burden, m.hearts]
    );
  }
  console.log(`  ✅ Seeded ${MESSAGES.length} messages`);
}

async function run() {
  try {
    await createTables();
    await seedStories();
    await seedLetters();
    await seedMessages();
    console.log('\n🌿 Seed complete. Database is ready.\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();