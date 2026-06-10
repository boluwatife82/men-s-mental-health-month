/* ============================================================
   api.js — all backend calls live here
   Every function talks to the real Express API
   Import this before section1.js in your HTML
============================================================ */

const API = {

  /* ---- STORIES (Section 3) ---- */

  async getStories(burden, limit = 20) {
    try {
      const res  = await fetch(`/api/stories?burden=${burden}&limit=${limit}`);
      const data = await res.json();
      return data.ok ? data.data : [];
    } catch {
      return FALLBACK_STORIES[burden] || FALLBACK_STORIES.other;
    }
  },

  async saveStory({ content, burden, country = 'Anonymous' }) {
    const res  = await fetch('/api/stories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content, burden, country })
    });
    return res.json();
  },

  async getStoryCount(burden) {
    try {
      const res  = await fetch(`/api/stories/count?burden=${burden}`);
      const data = await res.json();
      return data.ok ? data.total : FALLBACK_COUNTS[burden] || 12000;
    } catch {
      return FALLBACK_COUNTS[burden] || 12000;
    }
  },

  /* ---- LETTERS (Section 4) ---- */

  async getLetter(burden, excludeId = null) {
    try {
      const url = excludeId
        ? `/api/letters/random?burden=${burden}&exclude=${excludeId}`
        : `/api/letters/random?burden=${burden}`;
      const res  = await fetch(url);
      const data = await res.json();
      return data.ok ? data.data : _fallbackLetter(burden);
    } catch {
      return _fallbackLetter(burden);
    }
  },

  async heartLetter(letterId) {
    const res = await fetch(`/api/letters/${letterId}/heart`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async submitLetter({ title, body, from_line = 'Anonymous', burden }) {
    const res = await fetch('/api/letters', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, body, from_line, burden })
    });
    return res.json();
  },

  /* ---- MESSAGES (Section 6 & 7) ---- */

  async getMessage(burden, excludeId = null) {
    try {
      const url = excludeId
        ? `/api/messages/random?burden=${burden}&exclude=${excludeId}`
        : `/api/messages/random?burden=${burden}`;
      const res  = await fetch(url);
      const data = await res.json();
      return data.ok ? data.data : _fallbackMessage(burden);
    } catch {
      return _fallbackMessage(burden);
    }
  },

  async getAllMessages(limit = 60) {
    try {
      const res  = await fetch(`/api/messages/all?limit=${limit}`);
      const data = await res.json();
      return data.ok ? data.data : [];
    } catch {
      return [];
    }
  },

  async saveMessage({ content, burden }) {
    const res = await fetch('/api/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content, burden })
    });
    return res.json();
  },

  async heartMessage(messageId) {
    const res = await fetch(`/api/messages/${messageId}/heart`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  /* ---- SUBMISSIONS — "If Men Were Honest" (Section 5) ---- */

  async saveSubmission({ content, burden }) {
    const res = await fetch('/api/submissions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content, burden })
    });
    return res.json();
  },

  async getRecentSubmissions(burden, limit = 5) {
    try {
      const res  = await fetch(`/api/submissions/recent?burden=${burden}&limit=${limit}`);
      const data = await res.json();
      return data.ok ? data.data : [];
    } catch {
      return [];
    }
  },

};

/* ============================================================
   FALLBACKS — shown if backend is unreachable
   Mirrors your seeded DB data so the UI never breaks
============================================================ */
const FALLBACK_COUNTS = {
  financial:18742, family:14231, loneliness:21834, relationship:16503,
  career:19208,    grief:11942,  selfdoubt:22617,  lost:17389,
  fatherhood:9841, other:8340
};

const FALLBACK_STORIES = {
  financial:[
    { content:"I haven't bought new clothes in 3 years. Every naira goes to my family.", country:"Nigeria" },
    { content:"Everyone calls me strong but nobody asks if I'm tired.", country:"Kenya" },
    { content:"I graduated two years ago and still feel like a failure.", country:"Ghana" },
    { content:"I told my wife we were okay. We weren't.", country:"Nigeria" },
  ],
  family:[
    { content:"I am the first son. There is no room for me to fail.", country:"Nigeria" },
    { content:"They see a provider. I just want to be seen as a person.", country:"South Africa" },
    { content:"My parents' dreams became my prison before I turned 20.", country:"Ghana" },
  ],
  loneliness:[
    { content:"I am surrounded by people and completely alone.", country:"UK" },
    { content:"I have a hundred contacts and nobody to truly call.", country:"USA" },
    { content:"I smile at dinner so nobody asks questions.", country:"Nigeria" },
  ],
  relationship:[
    { content:"My girlfriend thinks I'm emotionally distant. The truth is I'm drowning.", country:"Nigeria" },
    { content:"We sleep in the same bed and feel miles apart.", country:"South Africa" },
    { content:"I miss who we used to be.", country:"UK" },
  ],
  career:[
    { content:"I lie awake calculating how many months I have left.", country:"Nigeria" },
    { content:"Every rejection email breaks something in me.", country:"South Africa" },
    { content:"I work hard and watch mediocre men get promoted.", country:"Kenya" },
  ],
  grief:[
    { content:"I still reach for my phone to call him.", country:"Nigeria" },
    { content:"I am still not over it. I just pretend I am.", country:"Kenya" },
    { content:"I never cried at the funeral. I still haven't.", country:"Nigeria" },
  ],
  selfdoubt:[
    { content:"I question every decision I make. Every single one.", country:"Nigeria" },
    { content:"I look confident. Inside I am terrified.", country:"South Africa" },
    { content:"I don't trust my own judgement anymore.", country:"Canada" },
  ],
  lost:[
    { content:"I have no idea what I'm doing with my life.", country:"Nigeria" },
    { content:"Everyone has a path. I can't even find the road.", country:"Ghana" },
  ],
  fatherhood:[
    { content:"I never had a father. I'm terrified of repeating the pattern.", country:"Nigeria" },
    { content:"My child looks up to me and I don't feel worthy.", country:"South Africa" },
  ],
  other:[
    { content:"I carry something I have never said out loud.", country:"Anonymous" },
    { content:"The weight is real even if I can't explain it.", country:"Anonymous" },
  ]
};

function _fallbackLetter(burden) {
  const fallbacks = {
    financial: { id:'f1', title:"To The Man Who Can't Make Ends Meet", from_line:"A man who made it through", hearts:241, source:'seeded',
      body:["I know what it feels like to check your account before you sleep and wake up checking it again.","You are not a failure. You are a man in a hard season.","Keep going. Not because it's easy. But because you are stronger than this moment knows."] },
    family: { id:'fam1', title:"To The Man Nobody Checks On", from_line:"Someone who sees you", hearts:445, source:'seeded',
      body:["You're always the strong one. Always the one people call. So nobody thinks to ask how you are.","But I'm asking today: how are you, really?","The strongest men I've ever known broke and kept going."] },
    loneliness: { id:'l1', title:"To The Lonely Man", from_line:"A man who found his way back", hearts:523, source:'seeded',
      body:["You can be in a room full of people and feel completely invisible.","You are not broken for feeling this way.","Don't give up on finding your people."] },
    other: { id:'o1', title:"To The Man Carrying Something He Can't Name", from_line:"A man who also carries the unnamed", hearts:554, source:'seeded',
      body:["Not every burden has a name.","That unnamed thing is still real. And you carrying it still counts.","You are seen. Even in the things you can't yet speak."] }
  };
  return fallbacks[burden] || fallbacks.other;
}

function _fallbackMessage(burden) {
  const fallbacks = {
    financial: { id:'fm1', content:"Keep going brother. This season won't last forever.", hearts:2100 },
    family:    { id:'fam1', content:"You don't have to carry everyone. Breathe.", hearts:1432 },
    loneliness:{ id:'lon1', content:"You are not invisible. I see you. A lot of us do.", hearts:3241 },
    other:     { id:'oth1', content:"Keep going brother. The world needs you in it.", hearts:3341 }
  };
  return fallbacks[burden] || fallbacks.other;
}