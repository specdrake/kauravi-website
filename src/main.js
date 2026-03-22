import './style.css';
import wordsData from './data/words.json';
import { getHeritagePiece } from './data/heritage.js';

const DISCORD_INVITE = 'https://discord.gg/NkMp7yC7zH';
const DISCORD_INVITE_CODE = 'NkMp7yC7zH';
const REDDIT_SUB_URL = 'https://www.reddit.com/r/WesternUttarPradesh/';

const REDDIT_FALLBACK = [
  {
    title: 'The Etymology of "Khadiboli": Why raw is not exactly the right translation.',
    excerpt:
      'Most academic texts translate it as standing or raw, but historically in Meerut, the nuance was closer to uncorrupted or straightforward.',
    author: 'u/doab_dweller',
    ups: 342,
    permalink: '/r/WesternUttarPradesh/comments/example1',
    numComments: 45,
    timeAgo: '4h ago',
  },
  {
    title: 'Lost recipes from Muzaffarnagar: Anyone remember making this specific type of Gur?',
    excerpt:
      'My grandmother used to make a variant of jaggery mixed with specific winter spices that I have not seen in markets for decades.',
    author: 'u/ganna_farmer',
    ups: 128,
    permalink: '/r/WesternUttarPradesh/comments/example2',
    numComments: 22,
    timeAgo: '8h ago',
  },
  {
    title: 'Early morning mist over the sugarcane fields.',
    excerpt: 'A quiet moment from the Doab — share your own landscapes of Western UP.',
    author: 'u/saharanpur_chronicles',
    ups: 89,
    permalink: '/r/WesternUttarPradesh/comments/example3',
    numComments: 14,
    timeAgo: '12h ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAet-BmNQEqLmzTImSUhVluQXlyxVj_BKkgJYIL0UzGGcml9j4fkyJ8yVxkyg4gYcTJkEuueqdQsPWhUF5Q-GGXDTHX_GLlxdS-gJcpw44u88Qp--wPqUMJktZYspBqzIV4EZnSZDjgvrOBopW5NMA7cf11w6IWWB999mo0lXhIkL42I7VXXWQVlfe4BKcP-Rtu6wx42l7isZw3LGDgp9ebFiTlB37DGanv-jIcpA-N30Nnx9-hDnB7pqi-orYlXqgP5etIRBSW8Zc',
  },
];

/** @type {typeof wordsData} */
let words = [...wordsData].sort((a, b) => a.word.localeCompare(b.word));

const state = {
  route: 'home',
  heritageSlug: null,
  shabdkoshQuery: '',
  shabdkoshLetter: null,
  modalWord: null,
  discordModalOpen: false,
  redditPosts: null,
  redditError: false,
  discordPresence: null,
  discordMembers: null,
  discordGuildName: null,
  loading: false,
};

const appEl = () => document.getElementById('app');
const modalsEl = () => document.getElementById('modals');

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function formatRedditAge(createdUtc) {
  if (createdUtc == null) return '';
  const sec = Date.now() / 1000 - createdUtc;
  const h = Math.floor(sec / 3600);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function redditPostImageUrl(p) {
  if (p && typeof p === 'object' && 'imageUrl' in p && p.imageUrl) return p.imageUrl;
  const d = p?.data || p;
  if (!d) return null;
  const thumb = d.thumbnail;
  if (thumb && thumb.startsWith('http') && !thumb.includes('redditstatic')) return thumb;
  const u = d.url;
  if (u && typeof u === 'string' && /^https?:\/\//i.test(u) && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(u))
    return u;
  return null;
}

function applyRouteState() {
  const parts = (window.location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const route = parts[0] || 'home';
  const allowed = ['home', 'shabdkosh', 'baithak', 'heritage'];
  state.route = allowed.includes(route) ? route : 'home';
  state.heritageSlug = state.route === 'heritage' && parts[1] ? parts[1] : null;
}

function navigate(route) {
  window.location.hash = `/${route}`;
}

function setRouteFromHash() {
  applyRouteState();
  render();
  bindAfterRender();
  window.scrollTo(0, 0);
}

function filterWords(q) {
  const t = q.trim().toLowerCase();
  if (!t) return words;
  return words.filter(
    (w) =>
      w.word.toLowerCase().includes(t) ||
      w.definition.toLowerCase().includes(t) ||
      (w.ipa && w.ipa.toLowerCase().includes(t))
  );
}

function wordsByLetter(list) {
  const letters = [...new Set(list.map((w) => w.letter))].sort();
  const map = {};
  for (const L of letters) {
    map[L] = list.filter((w) => w.letter === L);
  }
  return { letters, map };
}

function renderDictionaryEntriesHtml(filtered) {
  const { letters, map } = wordsByLetter(filtered);
  if (filtered.length === 0) {
    return `<p class="font-body text-muted py-12">No words found. <a href="#/baithak" class="text-primary hover-underline">Submit a term to the Baithak.</a></p>`;
  }
  let entriesHtml = '';
  for (const L of letters) {
    entriesHtml += `<div class="flex items-center gap-4 mb-8 scroll-mt-28" id="letter-${L}"><h2 class="font-heading text-5xl text-muted/40">${L}</h2><div class="h-px flex-1 bg-parchment/80"></div></div>`;
    for (const w of map[L]) {
      entriesHtml += `
        <article class="word-entry pl-6 py-4 mb-8 cursor-pointer" data-word-id="${escapeHtml(w.id)}">
          <div class="flex items-baseline gap-4 mb-3 flex-wrap">
            <h2 class="font-heading text-[40px] font-bold leading-tight text-ink">${escapeHtml(w.word)}</h2>
            <button type="button" class="audio-btn w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary/40" data-audio="${w.audio || ''}" aria-label="Play pronunciation">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
            </button>
          </div>
          <div class="mb-4 font-body">
            ${w.ipa ? `<span class="text-primary font-medium tracking-wide">${escapeHtml(w.ipa)}</span>` : ''}
            <span class="text-muted text-sm ${w.ipa ? 'ml-3' : ''} italic">${escapeHtml(w.pos)}</span>
          </div>
          <p class="text-base leading-relaxed text-ink mb-4 font-body">${escapeHtml(w.definition)}</p>
        </article>`;
    }
  }
  return entriesHtml;
}

function renderDesktopNav(active) {
  const link = (route, label) => {
    const is = active === route;
    return is
      ? `<a class="nav-site-link font-heading font-bold uppercase tracking-[0.2em] text-sm text-primary border-b-2 border-primary pb-1" href="#/${route}">${label}</a>`
      : `<a class="nav-site-link font-heading font-bold uppercase tracking-[0.2em] text-sm text-surface/80 hover:text-primary transition-colors duration-300" href="#/${route}">${label}</a>`;
  };
  const signIn =
    active === 'home'
      ? `<button type="button" id="home-sign-in" class="nav-site-link font-heading font-bold uppercase tracking-[0.2em] text-sm text-primary scale-95 active:duration-100 hover:opacity-80">Sign In</button>`
      : '';
  return `<nav id="home-nav-desktop" class="hidden lg:flex fixed top-0 w-full z-50 bg-cream/95 backdrop-blur-md border-b border-outline-variant">
    <div class="flex justify-between items-center px-8 xl:px-12 py-6 w-full max-w-screen-2xl mx-auto">
      <a href="#/home" class="nav-site-title text-2xl font-bold text-surface italic font-heading tracking-tight">Kauravi Culture</a>
      <div class="hidden md:flex gap-12">
        ${link('home', 'Home')}
        ${link('shabdkosh', 'Shabdkosh')}
        ${link('baithak', 'Baithak')}
        ${link('heritage', 'Heritage')}
      </div>
      <div class="flex items-center gap-6">
        <a href="#/shabdkosh" class="material-symbols-outlined text-ink cursor-pointer hover:text-primary transition-colors" aria-label="Open Shabdkosh">search</a>
        ${signIn}
      </div>
    </div>
  </nav>`;
}

function renderMobileTopBar() {
  return `<header id="mobile-top-bar" class="lg:hidden fixed top-0 w-full z-50 bg-cream/95 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-outline-variant/50">
      <button type="button" id="btn-mobile-menu-open" class="p-1 text-primary -ml-1 rounded-sm hover:bg-parchment/30" aria-label="Open menu">
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
      <a href="#/home" class="nav-site-title font-heading text-xl font-bold italic text-primary tracking-tight">Khariboli Heritage</a>
      <a href="#/shabdkosh" class="p-1 text-primary -mr-1 rounded-sm hover:bg-parchment/30" aria-label="Open Shabdkosh search">
        <span class="material-symbols-outlined text-2xl">search</span>
      </a>
    </header>`;
}

function renderMobileNavDrawer() {
  return `
    <div id="mobile-menu" class="fixed inset-0 z-[70] hidden" aria-hidden="true">
      <div class="absolute inset-0 bg-ink/50 backdrop-blur-sm" id="mobile-menu-backdrop"></div>
      <div class="absolute top-0 left-0 h-full w-[min(100%,20rem)] bg-background shadow-xl flex flex-col p-8 pt-20 gap-6 font-body">
        <button type="button" id="btn-mobile-menu-close" class="absolute top-4 right-4 p-2 text-muted hover:text-primary" aria-label="Close menu">
          <span class="material-symbols-outlined">close</span>
        </button>
        <a href="#/home" class="nav-site-drawer-link text-lg font-bold text-ink hover:text-primary">Home</a>
        <a href="#/shabdkosh" class="nav-site-drawer-link text-lg font-bold text-ink hover:text-primary">Shabdkosh</a>
        <a href="#/baithak" class="nav-site-drawer-link text-lg font-bold text-ink hover:text-primary">Baithak</a>
        <a href="#/heritage" class="nav-site-drawer-link text-lg font-bold text-ink hover:text-primary">Heritage</a>
      </div>
    </div>`;
}

function renderMobileBottomNav(active) {
  const routes = ['home', 'shabdkosh', 'baithak', 'heritage'];
  const labels = ['Home', 'Shabdkosh', 'Baithak', 'Heritage'];
  const icons = ['home', 'menu_book', 'forum', 'auto_stories'];
  return `<nav id="site-mobile-bottom-nav" class="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-cream border-t border-outline-variant h-20 shadow-[0_-10px_30px_rgba(22,26,48,0.05)]" aria-label="Primary">
    ${routes
      .map((r, i) => {
        const is = active === r;
        const activeCls = is
          ? 'flex flex-col items-center justify-center text-primary scale-110 active:scale-90 duration-150'
          : 'flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-90 duration-150';
        const fill = is ? ` style="font-variation-settings: 'FILL' 1;"` : '';
        return `<a href="#/${r}" class="${activeCls}">
        <span class="material-symbols-outlined mb-1 text-[26px]"${fill}>${icons[i]}</span>
        <span class="nav-site-tab-label font-body uppercase tracking-[0.2em] text-[10px] font-bold">${labels[i]}</span>
      </a>`;
      })
      .join('')}
  </nav>`;
}

function renderMobileBottomNavHome() {
  return `<nav id="site-mobile-bottom-nav" class="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-cream border-t border-outline-variant h-20 shadow-[0_-10px_30px_rgba(22,26,48,0.05)]" aria-label="Primary">
    <a href="#/home" class="flex flex-col items-center justify-center text-primary scale-110 active:scale-90 duration-150">
      <span class="material-symbols-outlined mb-1 text-[26px]" style="font-variation-settings: 'FILL' 1;">auto_stories</span>
      <span class="nav-site-tab-label font-body uppercase tracking-[0.2em] text-[10px] font-bold">Heritage</span>
    </a>
    <a href="#/baithak" class="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-90 duration-150">
      <span class="material-symbols-outlined mb-1 text-[26px]">groups</span>
      <span class="nav-site-tab-label font-body uppercase tracking-[0.2em] text-[10px] font-bold">Baithak</span>
    </a>
    <a href="#/shabdkosh" class="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-90 duration-150">
      <span class="material-symbols-outlined mb-1 text-[26px]">menu_book</span>
      <span class="nav-site-tab-label font-body uppercase tracking-[0.2em] text-[10px] font-bold">Lexicon</span>
    </a>
    <a href="#/heritage" class="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-90 duration-150">
      <span class="material-symbols-outlined mb-1 text-[26px]">inventory_2</span>
      <span class="nav-site-tab-label font-body uppercase tracking-[0.2em] text-[10px] font-bold">Archive</span>
    </a>
  </nav>`;
}

function renderShabdkoshEditorialCallout(imgUrl) {
  return `
  <div class="py-12">
    <div class="relative aspect-[16/9] overflow-hidden rounded-sm">
      <img alt="Traditional weaving patterns of the Doab" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="${imgUrl}" width="1200" height="675" />
      <div class="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none"></div>
      <div class="absolute bottom-6 left-6 right-6 p-6 bg-white/95 backdrop-blur-sm">
        <p class="text-sm font-body uppercase tracking-[0.2em] text-primary mb-2">Editor's Note</p>
        <p class="text-xl font-heading italic leading-snug text-ink">"Every word is a brick in the architecture of our history."</p>
      </div>
    </div>
  </div>`;
}

function renderMobileWordCard(w, letter, isFirstOfLetter) {
  const ipa = w.ipa || '—';
  const head = w.word.split('(')[0].trim();
  const idAttr = isFirstOfLetter ? ` id="letter-mobile-${letter}"` : '';
  return `
  <article class="word-entry-mobile group relative py-8 border-b border-parchment/50 cursor-pointer"${idAttr} data-word-id="${escapeHtml(w.id)}">
    <div class="flex justify-between items-start mb-4 gap-4">
      <div class="min-w-0">
        <h3 class="text-3xl font-heading font-bold text-ink group-hover:text-primary transition-colors duration-300">${escapeHtml(head)}</h3>
        <p class="text-primary italic font-medium tracking-wide mt-1 font-body">${escapeHtml(ipa)}</p>
      </div>
      <button type="button" class="audio-btn w-12 h-12 flex items-center justify-center bg-parchment hover:bg-primary hover:text-white transition-all duration-300 rounded-sm shrink-0" data-audio="${w.audio || ''}" aria-label="Play pronunciation">
        <span class="material-symbols-outlined">volume_up</span>
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
      <span class="text-[10px] font-body uppercase tracking-widest text-muted py-1">${escapeHtml(w.pos)}</span>
      <p class="text-ink/80 leading-relaxed text-lg font-body">${escapeHtml(w.definition)}</p>
    </div>
  </article>`;
}

function renderDictionaryMobileHtml(filtered) {
  const editorialImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBqUsgjsvkbALIB6n7fOBWEu-7pevvLR4ZUW6ejP2ebzUY8agzCv-1VkbahEjkqzCnRVxS4yzzgDQ5Yxai6jW8ps5-vuZC9zWSM_RE04lTrTR6VVPDSxVvLbrMShYpkjYOMUPtws3h1FgSmbIhAicm74nOaEk_zt49E9WaXlWgMd3gY1ahkTu2EOFE-2a3vNu_2Nu-_w_Sbe6QS6NQldgwGywxQlzQgdkTsXxzrfM0NK5EHUrpp_S6QgLF7z9HOnF_aejGEFR7xWDc';
  const CALLOUT_AFTER = 3;
  if (!filtered.length) {
    return `<p class="font-body text-muted py-12">No words found. <a href="#/baithak" class="text-primary underline">Submit a term to the Baithak.</a></p>`;
  }
  const { letters, map } = wordsByLetter(filtered);
  const parts = [];
  let globalIndex = 0;
  for (const L of letters) {
    const group = map[L];
    group.forEach((w, idx) => {
      parts.push(renderMobileWordCard(w, L, idx === 0));
      if (globalIndex === CALLOUT_AFTER - 1 && filtered.length > CALLOUT_AFTER) {
        parts.push(renderShabdkoshEditorialCallout(editorialImg));
      }
      globalIndex++;
    });
  }
  if (filtered.length <= CALLOUT_AFTER) {
    parts.push(renderShabdkoshEditorialCallout(editorialImg));
  }
  return parts.join('');
}

function renderHorizontalLetterStrip(letters, activeLetter) {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .map((L) => {
      const has = letters.includes(L);
      const isActive = L === activeLetter && has;
      const disabled = has ? '' : 'disabled';
      const cls = isActive
        ? 'text-primary italic font-bold border-b-2 border-primary'
        : has
          ? 'text-ink/50 hover:text-primary'
          : 'text-ink/15 cursor-not-allowed';
      return `<button type="button" data-scroll-letter="${L}" ${disabled} class="flex-none px-3 py-2 font-heading transition-colors whitespace-nowrap ${cls}">${L}</button>`;
    })
    .join('');
}

function getWordOfDay() {
  const y = new Date().getFullYear();
  const start = new Date(y, 0, 0);
  const diff = Date.now() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return words[day % words.length];
}

function renderHome() {
  const imgHeroSplit =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCIFycT7jhl2si1_kKGzn4cnObIDuFstf6c41O86Pt5e7qnRi3tEZH82DB0mrPZg3vtKohwk2gxeRMk5pxBXoqNNU74FbGh3-o3DdWeu3Rqr-I4LhvRfKvhAOF5mo237frqAOCWX43gx0XreBxTXX1qnpsUmCBHHf-aKYVRrvS4XUircH5WbtbcYhyHCbMFu-y8QZAmXmhbpSKoOgaeD8kfP50GBj-oeGDPRJ4785UXxwZuF5EQWOnTVDQn3GhZ9wBgJTL2lYz7YkM';
  const car1 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxEq8MZ7mypFYBx0d15yM_SatqVal8JzUnHo7tGOPEZiF7Z3eV0VulM8XfGzJZ7S0MqQSzhFTq4iTW92bLBzN1G7swTF7GRI7kyigCrv52KNDYWSWe78OcvlTm2etzIXOlez2hH-PtUzhy8_tGDYbErWbaqAKHbGb-oMEfZNNp3OghCBM5NHGKnm9vR_7E4mnA1LyzyAZSt796D9PMvV7P8kIEfhKS6qxYThAwijvohultP19P_eUYdxGwRa00tG2xoR7C0Vgrxj8';
  const car2 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1FrvahmWB89e-Eap-rcR9Hqfbcq-AVg046QkNqTD0-F_9CYjRF9xA5Ztw_fJA9mgKJcF339fq5Xn24soGU4eaK2N_u6v_dXN8AXYn0AhryaBYoft-4Xv7pPjqXzFzzYX3-fqj-lQdRfHrVVSMIoj1BfzJXcD4_Uvly6LCcxy9MHZ92Vuxrx98Nde1OLmIdaeOr_FWWjgXcKrkESsnRbTf3VMCO8W1m2r-Lj4O0ulg1_Ona2J6aOIxCpr78AJyrF2Gjx-yy6cfug';
  const car3 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAPLCJ9K-_4WVKrYYEpDvDscc3Pjw-F4kn4H9zMxanX1ZfHdZV6_4rNj5EOMSeWgqkEJMaYLiqo4WzOWAXa8VVcqHu5v5ptvLOZcSpSaQ30ofdXQoZb6P2U5Di6hv6hhb98k2UGYY4y3qdEWLhjrF9-opYL9Xhh7XmYgvmnZyT2KCrspdcp6h5375ahlgh4mKK0kmOTWX239sBJJb0M2sBODswg5_re8iWVJ_8n5C8yi1ggk9QUewOVRtPsdtKuQcdDoAvsCuweTQ8';
  const mobHero =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAwiIog-_1s4A_-bsMly-PRhZmrEyD5aAha_1J8DwgoXpT4SczvOzcpUprMuhb-l7XqoYop9nKWqe_CLknsU97iFOJFX036ZkE4wFC0Qbz6uCb8C79C7fq5yuLGC0Rnc9zrx1x5q9AuZdtkXpjhmI5oDL10paNBY8UbpJbrRiOkwod0npoyp9H0jogw77-_jPur9027xToLfXTKSPOoeiQHQShC0mHiOdi-ZGzIDOz-USPM4S_7tudBWYYPp_DYq5d24jWuLTI7Zrg';
  const mobCar1 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Mm1jsLUhisHhjEypL44iJ63qQfcUtwaHPgFDcxyvR-nLsB9S91cR-UvZiCnrTdFcNKlmpyq6mEhUSj82XAxN2YE5Q7P8DzbGBMlEmdaDt8_xvMjWoqhiKxN1Rhcb5ooo5pcOurar8xDLx6ETL2d_sHyBtGNiGNylL2zg1BUbKGiWwXg6PWa-ushsspPPJN06zt5bhs5yREjgGxbUau0iAp5D4H-ZDgxFQePiswMufKw9IcxCvI8AwbDqsi3h7Q1PNVW9TMhq2jY';
  const mobCar2 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDnxUP452Ix4a0z-Zm7rJMwmxJeo9bWXeajhuh5-VUiyD2NJLe9K06juoWnOPztIzi0VwIg9_86XXqNYL2EdtbmrcQoa0J6bPWknrsCWxUoLVAZXCHgpCJirxILTdDWN4xRBKngjbBLxHOHzrVDJtZjddtxn84qvH1KaMMS0Mp5AmQeml_DV8ygZE6_mMO_fgXTrZmkJ_3T63y7Shx8eAC5qxOebRN0N6e8CRG30CyQ1O_BrBhSeeM-TcV3HMmzvU64jH0a-48sagU';
  const mobCar3 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCg5vjG7i67Vudzh0Do8CFtX6r9GcfiMDzCQiGTX6SV2s-DTOzp0i4nCt3viqUB4gBqRN5mPRr88NbipOd0ajluOdgcL0Wo3Lipav7cCkvRGhWbQabuhlW1XH3HwrCMH-RMXFDO61GUqUx9O-_pgvrRKCWFYF39UGr57gUjSv9mzU3pLCbfqWD4ie-lX5F-7p7_krYcVYbN2THcMqO_c4mkjwqN1aORI8oVj26dcMOWqKiOUCaQUyJz2q8nHTqiAabuBAoTaYQmnQs';

  const wotd = getWordOfDay();
  const wotdHead = escapeHtml(wotd.word.split('(')[0].trim());
  const wotdIpa = wotd.ipa ? escapeHtml(wotd.ipa) : '—';
  const wotdDef = escapeHtml(wotd.definition);
  const wotdDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const discordOnline = state.discordPresence != null ? `${state.discordPresence} online` : '… online';

  return `
  <div class="home-shell bg-cream text-ink selection:bg-primary/20">
    ${renderMobileTopBar()}
    ${renderDesktopNav('home')}

    ${renderMobileNavDrawer()}

    <main class="page-enter pt-[72px] lg:pt-24 pb-28 lg:pb-12">
      <div class="lg:hidden">
        <section class="relative w-full min-h-[751px] flex flex-col justify-end px-6 pb-12 overflow-hidden">
          <div class="absolute inset-0 z-0">
            <img class="w-full h-full object-cover grayscale-[20%] brightness-75" alt="An ancient stone arched architectural gateway in India" src="${mobHero}" width="1200" height="1600" />
            <div class="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent"></div>
          </div>
          <div class="relative z-10">
            <p class="font-body uppercase tracking-[0.3em] text-[10px] text-cream mb-4">Establishing the Legacy</p>
            <h1 class="text-5xl sm:text-6xl font-heading font-bold text-cream leading-[0.9] tracking-tighter mb-6">
              The <span class="italic text-primary">Gateway</span> of the Doab.
            </h1>
            <div class="flex items-center gap-4 flex-wrap">
              <a href="#/heritage" class="inline-block bg-primary text-on-primary px-8 py-3 font-body uppercase tracking-widest text-xs font-bold hover:italic transition-all duration-300">Enter Archive</a>
              <div class="h-0.5 w-12 bg-primary"></div>
            </div>
          </div>
        </section>

        <section class="px-6 py-16 bg-surface-container-lowest">
          <div class="flex flex-col gap-8">
            <div class="flex justify-between items-end border-b-2 border-primary pb-4">
              <div>
                <p class="font-body uppercase tracking-[0.2em] text-[10px] text-muted mb-1">Daily Lexicon</p>
                <h2 class="text-5xl font-heading font-bold">Khanda</h2>
              </div>
              <a href="#/shabdkosh" class="material-symbols-outlined text-primary text-3xl mb-1" aria-label="Open Shabdkosh">menu_book</a>
            </div>
            <div class="grid grid-cols-1 gap-6">
              <div class="flex gap-4">
                <div class="w-1 bg-primary shrink-0 min-h-[4rem]"></div>
                <div>
                  <p class="italic text-xl text-on-surface-variant mb-2 font-heading">/kʰəɳɖaː/</p>
                  <p class="text-lg leading-relaxed font-body">
                    A significant fragment or division; historically used in <span class="italic text-primary">Kauravi</span> dialects to denote a piece of land or a block of stone in architecture.
                  </p>
                </div>
              </div>
              <div class="p-6 bg-surface-container-high italic border-l-2 border-primary font-body text-ink/90">
                "The archive is but a single khanda in the vast structure of our shared memory."
              </div>
            </div>
          </div>
        </section>

        <section class="py-20 bg-cream">
          <div class="px-6 mb-10 flex justify-between items-baseline gap-4">
            <h3 class="text-3xl font-heading font-bold tracking-tight shrink min-w-0">Voices from the Doab</h3>
            <a href="#/heritage" class="font-body text-[10px] uppercase tracking-widest text-primary border-b border-primary shrink-0">View All</a>
          </div>
          <div id="home-mobile-stories" class="flex overflow-x-auto no-scrollbar gap-6 px-6 snap-x scroll-smooth pb-2">
            <div class="flex-none w-[280px] snap-start group">
              <div class="aspect-[4/5] overflow-hidden mb-4">
                <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Old man with a turban sitting in a village" src="${mobCar1}" width="280" height="350" />
              </div>
              <p class="font-body uppercase tracking-widest text-[9px] text-primary mb-2">Oral History</p>
              <h4 class="text-2xl font-heading font-bold group-hover:text-primary transition-colors">The Weaver of Baghpat</h4>
              <p class="text-sm text-on-surface-variant mt-2 line-clamp-2 font-body">Tracing the vanishing patterns of indigo thread across the riverbanks.</p>
            </div>
            <div class="flex-none w-[280px] snap-start group">
              <div class="aspect-[4/5] overflow-hidden mb-4">
                <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Sunlight hitting ancient manuscript pages" src="${mobCar2}" width="280" height="350" />
              </div>
              <p class="font-body uppercase tracking-widest text-[9px] text-primary mb-2">Manuscripts</p>
              <h4 class="text-2xl font-heading font-bold group-hover:text-primary transition-colors">Ink and Irony</h4>
              <p class="text-sm text-on-surface-variant mt-2 line-clamp-2 font-body">Satirical poems found in the margins of 18th-century revenue records.</p>
            </div>
            <div class="flex-none w-[280px] snap-start group">
              <div class="aspect-[4/5] overflow-hidden mb-4">
                <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Traditional market in rural India" src="${mobCar3}" width="280" height="350" />
              </div>
              <p class="font-body uppercase tracking-widest text-[9px] text-primary mb-2">Culture</p>
              <h4 class="text-2xl font-heading font-bold group-hover:text-primary transition-colors">Mandi Melodies</h4>
              <p class="text-sm text-on-surface-variant mt-2 line-clamp-2 font-body">The rhythmic calls of the Sunday bazaar transcribed for the first time.</p>
            </div>
          </div>
        </section>

        <footer class="w-full py-12 px-8 flex flex-col items-center gap-6 bg-surface text-cream text-sm">
          <div class="text-cream font-bold italic text-xl font-heading">Khariboli Heritage</div>
          <div class="flex flex-col items-center gap-4 text-slate-400 text-center">
            <a class="hover:text-primary hover:underline transition-all font-body text-sm" href="#/heritage">The Doab Chronicles</a>
            <span class="font-body text-sm cursor-default">Privacy Archival</span>
            <span class="font-body text-sm cursor-default">Editorial Guidelines</span>
          </div>
          <div class="mt-4 text-slate-500 text-[10px] uppercase tracking-widest text-center font-body">© 2026 Khariboli Heritage. The Digital Archivist.</div>
        </footer>
      </div>

      <div class="hidden lg:block">
      <section class="min-h-screen flex flex-col md:flex-row px-6 lg:px-12 items-stretch gap-0 max-w-screen-2xl mx-auto w-full">
        <div class="w-full md:w-5/12 flex flex-col justify-center py-12 md:py-20 lg:pr-12">
          <span class="font-body uppercase tracking-[0.3em] text-xs text-primary mb-6 lg:mb-8 block">Preserving the Doab Legacy</span>
          <h1 class="font-heading text-6xl sm:text-7xl lg:text-8xl xl:text-[9rem] font-bold leading-[0.85] tracking-tighter mb-8 lg:mb-12">
            Kauravi <br/> <span class="italic font-medium text-primary">Heritage</span>
          </h1>
          <div class="max-w-md">
            <p class="text-lg lg:text-xl mb-8 lg:mb-12 leading-relaxed opacity-90 font-body">
              An exploration into the linguistic and architectural marvels of the Upper Doab region, where history whispers through the Khariboli dialect.
            </p>
            <a class="group editorial-underline flex items-center gap-4 font-body uppercase tracking-widest text-sm font-bold border-b-2 border-ink pb-2 w-fit hover:border-primary transition-colors" href="#/heritage">
              Read the archive
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </a>
          </div>
        </div>
        <div class="w-full md:w-7/12 relative min-h-[400px] md:min-h-[600px] bg-surface-container-highest mt-8 md:mt-0">
          <img alt="Traditional Haveli Gateway" class="w-full h-full min-h-[400px] md:min-h-[600px] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" src="${imgHeroSplit}" width="1200" height="1600" />
          <div class="absolute bottom-8 lg:bottom-12 -left-0 lg:-left-20 bg-cream p-8 lg:p-10 hidden lg:block shadow-2xl max-w-sm">
            <p class="font-body uppercase tracking-widest text-xs text-muted mb-2">Current Exhibit</p>
            <h3 class="font-heading text-2xl lg:text-3xl font-bold leading-tight">The Great Gateway of <br/>Harit Pradesh</h3>
          </div>
        </div>
      </section>

      <section class="px-6 lg:px-12 -mt-12 lg:-mt-20 relative z-10 mb-20 lg:mb-32 max-w-screen-2xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant shadow-2xl">
          <div class="bg-inverse-surface text-cream p-10 md:p-16 lg:p-24 flex flex-col justify-between min-h-[280px]">
            <div>
              <h2 class="font-heading text-4xl md:text-5xl font-bold mb-4 md:mb-6 italic">Baithak</h2>
              <p class="text-lg md:text-xl opacity-70 mb-8 md:mb-12 leading-relaxed max-w-sm font-body">
                Our community square. Join the conversation on the preservation of Kauravi dialects and traditions.
              </p>
            </div>
            <div class="flex flex-wrap gap-6 md:gap-8">
              <a class="flex items-center gap-3 font-body uppercase tracking-widest text-xs hover:text-primary transition-colors" href="#/baithak">
                <span class="material-symbols-outlined">groups</span> Community
              </a>
              <a class="flex items-center gap-3 font-body uppercase tracking-widest text-xs hover:text-primary transition-colors" href="#/baithak">
                <span class="material-symbols-outlined">forum</span> Discussions
              </a>
              <a class="flex items-center gap-3 font-body uppercase tracking-widest text-xs hover:text-primary transition-colors" href="${DISCORD_INVITE}" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined">share</span> Connect
              </a>
            </div>
          </div>
          <div class="bg-surface-container-highest p-10 md:p-16 lg:p-24 flex flex-col justify-between min-h-[280px]">
            <div>
              <div class="flex justify-between items-start mb-8 lg:mb-12 gap-4">
                <span class="font-body uppercase tracking-widest text-xs text-primary font-bold">Shabdkosh: Word of the Day</span>
                <span class="text-xs font-body opacity-40 shrink-0">${wotdDate}</span>
              </div>
              <h2 class="font-heading text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6">${wotdHead}</h2>
              <p class="font-heading italic text-xl md:text-2xl mb-4 text-on-surface-variant">${wotdIpa}</p>
              <p class="text-lg md:text-xl leading-relaxed opacity-80 max-w-md font-body">${wotdDef}</p>
            </div>
            <a class="font-body uppercase tracking-widest text-xs border-b border-ink w-fit pb-1 mt-8 lg:mt-12 hover:text-primary hover:border-primary transition-all" href="#/shabdkosh">Explore Full Dictionary</a>
          </div>
        </div>
      </section>

      <section class="mb-20 lg:mb-32">
        <div class="px-6 lg:px-12 mb-10 lg:mb-16 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div class="max-w-2xl">
            <span class="font-body uppercase tracking-[0.3em] text-xs text-primary mb-4 block underline underline-offset-8">Curated Narratives</span>
            <h2 class="font-heading text-4xl md:text-5xl lg:text-6xl font-bold">Voices from the <span class="italic font-medium">Doab</span></h2>
          </div>
          <div class="flex gap-4 shrink-0">
            <button type="button" id="home-carousel-prev" class="w-12 h-12 flex items-center justify-center border border-muted/30 hover:bg-primary hover:text-white transition-colors rounded-sm" aria-label="Previous stories">
              <span class="material-symbols-outlined">west</span>
            </button>
            <button type="button" id="home-carousel-next" class="w-12 h-12 flex items-center justify-center border border-muted/30 hover:bg-primary hover:text-white transition-colors rounded-sm" aria-label="Next stories">
              <span class="material-symbols-outlined">east</span>
            </button>
          </div>
        </div>
        <div id="home-stories-carousel" class="flex overflow-x-auto hide-scrollbar gap-6 lg:gap-8 px-6 lg:px-12 pb-8 scroll-smooth">
          <a href="#/heritage" class="min-w-[min(400px,85vw)] group shrink-0">
            <div class="aspect-[4/5] overflow-hidden mb-6">
              <img alt="Heritage Site" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${car1}" width="400" height="500" />
            </div>
            <span class="font-body uppercase tracking-widest text-[10px] text-primary mb-2 block">Architecture</span>
            <h3 class="font-heading text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">The Haveli of Saharanpur: A Silent Witness</h3>
          </a>
          <a href="#/heritage" class="min-w-[min(400px,85vw)] group shrink-0">
            <div class="aspect-[4/5] overflow-hidden mb-6">
              <img alt="Traditional Craft" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${car2}" width="400" height="500" />
            </div>
            <span class="font-body uppercase tracking-widest text-[10px] text-primary mb-2 block">Craftsmanship</span>
            <h3 class="font-heading text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">Weaving Khariboli into Warp and Weft</h3>
          </a>
          <a href="#/heritage" class="min-w-[min(400px,85vw)] group shrink-0">
            <div class="aspect-[4/5] overflow-hidden mb-6">
              <img alt="Local Landscape" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${car3}" width="400" height="500" />
            </div>
            <span class="font-body uppercase tracking-widest text-[10px] text-primary mb-2 block">Linguistics</span>
            <h3 class="font-heading text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">How Geography Shapes Our Phonetics</h3>
          </a>
        </div>
      </section>

      <footer class="bg-surface w-full mt-auto">
        <div class="flex flex-col md:flex-row justify-between items-center px-6 lg:px-12 py-12 lg:py-16 w-full max-w-screen-2xl mx-auto gap-8">
          <div class="text-center md:text-left">
            <div class="text-cream font-bold italic text-xl mb-2 font-heading">Kauravi Culture</div>
            <div class="font-body text-cream/60 tracking-widest uppercase text-[10px]">© 2026 Kauravi Culture Heritage. The Digital Archivist.</div>
          </div>
          <div class="flex gap-8 lg:gap-12 flex-wrap justify-center">
            <a class="font-body text-cream/60 tracking-widest uppercase text-[10px] hover:opacity-80 transition-opacity hover:text-primary underline-offset-4 underline" href="#/heritage">Archive</a>
            <span class="font-body text-cream/60 tracking-widest uppercase text-[10px] cursor-default">Privacy</span>
            <span class="font-body text-cream/60 tracking-widest uppercase text-[10px] cursor-default">Contributors</span>
            <span class="font-body text-cream/60 tracking-widest uppercase text-[10px] cursor-default">Contact</span>
          </div>
        </div>
      </footer>
      </div>
    </main>

    <div class="fixed bottom-[6.5rem] left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40 lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0 lg:w-[320px] lg:max-w-[320px] animate-[fadeIn_1s_ease-out_0.5s_both]">
      <div class="lg:hidden bg-surface text-cream p-4 flex items-center justify-between shadow-2xl rounded-lg border border-primary/20 backdrop-blur-md">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 bg-primary flex items-center justify-center rounded-sm shrink-0">
            <span class="material-symbols-outlined text-cream text-xl" style="font-variation-settings: 'FILL' 1;">forum</span>
          </div>
          <div class="min-w-0">
            <h5 class="text-[10px] font-bold uppercase tracking-widest font-body truncate">Join the Baithak</h5>
            <p class="text-[10px] opacity-60 font-body truncate">${discordOnline} · Discord</p>
          </div>
        </div>
        <button type="button" class="btn-discord-home shrink-0 bg-primary text-cream px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-sm font-body">Connect</button>
      </div>
      <div class="hidden lg:block bg-surface text-cream rounded-sm p-6 shadow-float border border-white/10">
        <div class="flex items-center gap-3 mb-4">
          <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">forum</span>
          <h4 class="text-lg font-bold tracking-wide font-heading">Join the Baithak</h4>
        </div>
        <p class="text-sm text-cream/70 mb-6 leading-relaxed font-body">Connect with diaspora, linguists, and locals. Share stories and preserve our heritage together.</p>
        <div class="flex items-center justify-between mb-4 text-xs font-medium tracking-wider uppercase text-cream/50 font-body">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span id="home-discord-count">${discordOnline}</span>
          </div>
        </div>
        <button type="button" class="btn-discord-home w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-sm transition-colors font-medium text-sm tracking-widest uppercase font-body">
          Enter Discord
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>

    ${renderMobileBottomNavHome()}
  </div>`;
}

function renderShabdkosh() {
  const q = state.shabdkoshQuery;
  const filtered = filterWords(q);
  const { letters } = wordsByLetter(filtered);
  const activeLetter = state.shabdkoshLetter || letters[0] || 'A';
  const entriesHtml = renderDictionaryEntriesHtml(filtered);
  const mobileEntriesHtml = renderDictionaryMobileHtml(filtered);
  const stripHtml = renderHorizontalLetterStrip(letters, activeLetter);

  const indexHtml = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .map((L) => {
      const has = letters.includes(L);
      const isActive = L === activeLetter && has;
      return `<li><button type="button" class="font-body text-sm block py-1 w-full text-left transition-colors ${isActive ? 'font-bold text-primary' : has ? 'text-ink hover:text-primary' : 'text-muted/40 cursor-default'}" data-scroll-letter="${L}" ${has ? '' : 'disabled'}>${L}</button></li>`;
    })
    .join('');

  return `
  <div class="min-h-screen bg-background text-ink selection:bg-primary/20">
    ${renderDesktopNav('shabdkosh')}
    ${renderMobileTopBar()}
    ${renderMobileNavDrawer()}
    ${renderMobileBottomNav('shabdkosh')}

    <main class="lg:hidden pt-24 pb-32 px-6 max-w-screen-md mx-auto">
      <header class="mb-10">
        <span class="text-xs font-body uppercase tracking-[0.2em] text-primary font-bold mb-2 block">Linguistic Archive</span>
        <h2 class="text-5xl font-heading font-bold tracking-tight leading-none mb-4">Shabdkosh</h2>
        <p class="text-lg text-on-surface-variant leading-relaxed italic font-body">Preserving the phonetics and soul of the Doab dialect.</p>
      </header>
      <div class="sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm -mx-6 px-6 py-4 space-y-6">
        <div class="relative group">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" aria-hidden="true">search</span>
          <input id="shab-search-mobile" type="text" value="${escapeHtml(q)}" autocomplete="off" placeholder="Search for a word..." class="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary/20 py-4 pl-12 pr-4 text-lg font-heading placeholder:text-muted/60 outline-none transition-all rounded-sm" />
          <div id="shab-suggest-mobile" class="absolute left-0 right-0 top-full mt-1 bg-background border border-parchment shadow-float max-h-56 overflow-y-auto hidden z-30 rounded-sm"></div>
        </div>
        <div class="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-parchment" id="shab-letter-strip">${stripHtml}</div>
      </div>
      <div id="shab-entries-mobile" class="mt-10 space-y-8">${mobileEntriesHtml}</div>
    </main>

    <main class="hidden lg:flex flex-1 max-w-[1440px] mx-auto w-full pt-[72px]">
      <aside class="w-[300px] flex flex-col border-r border-parchment/80 sticky top-[72px] h-[calc(100vh-72px)] p-10 sidebar-scroll overflow-y-auto bg-background">
        <h3 class="text-xs font-medium uppercase tracking-[0.15em] text-muted mb-8 font-body">Index</h3>
        <ul class="flex flex-col gap-2">${indexHtml}</ul>
      </aside>
      <div class="flex-1 max-w-[800px] px-8 py-12 lg:px-16 lg:py-20">
        <div class="mb-12 relative">
          <input id="shab-search" type="search" value="${escapeHtml(q)}" autocomplete="off" placeholder="Search the Kauravi glossary…" class="w-full h-[80px] bg-transparent border-0 border-b border-ink/20 text-ink font-heading text-3xl md:text-4xl placeholder:text-muted focus:ring-0 focus:border-primary transition-colors px-0 py-4 pb-6" />
          <span class="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-muted pointer-events-none">search</span>
          <div id="shab-suggest" class="absolute left-0 right-0 top-full mt-2 bg-background border border-parchment shadow-float max-h-64 overflow-y-auto hidden z-20"></div>
        </div>
        <div id="shab-entries" class="space-y-4">${entriesHtml}</div>
      </div>
    </main>
  </div>`;
}

function renderBaithak() {
  const posts = state.redditError || !state.redditPosts ? REDDIT_FALLBACK : state.redditPosts;
  const onlineLabel =
    state.discordPresence != null
      ? `${state.discordPresence.toLocaleString()} Members Online`
      : '… Members Online';
  const guild = state.discordGuildName || 'Kauravi Discord';

  const redditCardsHtml = posts.slice(0, 3).map((p, i) => {
    const title = 'title' in p ? p.title : p.data?.title;
    const author = 'author' in p ? p.author : `u/${p.data?.author || 'reddit'}`;
    const ups = 'ups' in p ? p.ups : p.data?.ups ?? 0;
    const comments = 'numComments' in p ? p.numComments : p.data?.num_comments ?? 0;
    const timeAgo =
      'timeAgo' in p && p.timeAgo
        ? p.timeAgo
        : formatRedditAge(p.data?.created_utc) || 'recently';
    const link =
      'permalink' in p && p.permalink
        ? `https://www.reddit.com${p.permalink}`
        : p.data?.permalink
          ? `https://www.reddit.com${p.data.permalink}`
          : REDDIT_SUB_URL;
    const imgUrl = redditPostImageUrl(p);
    const kind = i === 0 ? 'Pinned' : i === 1 ? 'Hot' : 'Photo';
    const meta = `${kind} • Posted by ${author}`;
    const thumb =
      imgUrl && i === 2
        ? `<div class="w-24 h-24 bg-surface-container-high flex-shrink-0 overflow-hidden"><img alt="" class="w-full h-full object-cover grayscale opacity-80" src="${escapeHtml(imgUrl)}" width="96" height="96" /></div>`
        : '';
    const body = thumb
      ? `<div class="flex gap-6">
        <div class="flex-1 min-w-0">
          <h4 class="text-xl font-bold text-surface mb-3 group-hover:text-primary transition-colors leading-snug font-heading">${escapeHtml(title)}</h4>
          <div class="flex gap-4 text-xs font-bold uppercase tracking-widest opacity-70 font-body">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">arrow_upward</span> ${ups}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">chat_bubble</span> ${comments} Comments</span>
          </div>
        </div>
        ${thumb}
      </div>`
      : `<h4 class="text-xl font-bold text-surface mb-3 group-hover:text-primary transition-colors leading-snug font-heading">${escapeHtml(title)}</h4>
        <div class="flex gap-4 text-xs font-bold uppercase tracking-widest opacity-70 font-body">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">arrow_upward</span> ${ups}</span>
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">chat_bubble</span> ${comments} Comments</span>
        </div>`;
    return `
      <div class="group bg-white p-6 border border-parchment transition-all hover:border-primary cursor-pointer" data-open="${escapeHtml(link)}">
        <div class="flex justify-between items-start mb-4">
          <span class="text-xs font-bold text-primary tracking-widest uppercase font-body">${escapeHtml(meta)}</span>
          <span class="text-xs opacity-50 font-body">${escapeHtml(timeAgo)}</span>
        </div>
        ${body}
      </div>`;
  }).join('');

  const feedNote = state.redditError
    ? `<p class="mt-4 text-sm text-amber-800/90 font-body max-w-2xl">Community feeds are resting. <a class="underline hover:text-primary" href="${REDDIT_SUB_URL}" target="_blank" rel="noopener">Open r/WesternUttarPradesh</a> directly.</p>`
    : '';

  return `
  <div class="min-h-screen bg-background text-ink selection:bg-primary selection:text-white">
    ${renderDesktopNav('baithak')}
    ${renderMobileTopBar()}
    ${renderMobileNavDrawer()}
    ${renderMobileBottomNav('baithak')}

    <main class="pt-24 pb-28 md:pb-0">
      <section class="px-6 py-12 md:py-24 bg-surface-bright border-b border-parchment">
        <div class="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div class="md:col-span-8">
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block font-body">The Digital Chaupal</span>
            <h2 class="text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter text-surface mb-6 font-heading">
              The <span class="italic text-primary">Baithak</span> Experience.
            </h2>
            <p class="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed font-body">
              Step into our virtual gathering place. A space where the Kauravi diaspora and regional enthusiasts connect, debate, and celebrate the heritage of the Doab.
            </p>
            ${feedNote}
          </div>
          <div class="md:col-span-4 flex justify-start md:justify-end pb-2">
            <div class="h-32 w-32 rounded-full border-2 border-primary flex items-center justify-center p-2">
              <div class="h-full w-full rounded-full bg-surface flex items-center justify-center text-background text-center leading-none">
                <span class="text-[10px] uppercase font-bold tracking-widest font-body">Est. 2024<br/>Digital<br/>Archive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-background text-ink py-16 md:py-24 px-6 border-b border-parchment">
        <div class="max-w-screen-xl mx-auto">
          <div class="flex flex-col lg:flex-row gap-12">
            <div class="flex-1 space-y-8">
              <div class="flex items-center gap-4">
                <div class="h-14 w-14 bg-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-3xl">forum</span>
                </div>
                <div>
                  <h3 class="text-3xl font-bold tracking-tight text-surface font-heading">${escapeHtml(guild)}</h3>
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full bg-green-600"></span>
                    <span class="text-xs uppercase tracking-widest font-bold opacity-70 font-body">${escapeHtml(onlineLabel)}</span>
                  </div>
                </div>
              </div>
              <div class="aspect-[16/9] w-full bg-white border border-parchment relative overflow-hidden group">
                <div class="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <span class="text-primary italic text-lg mb-2 font-bold font-body">#Chaupal-General</span>
                  <p class="text-2xl md:text-3xl font-bold text-surface mb-8 font-heading">Join the conversation about dialect preservation and local history.</p>
                  <a class="inline-block bg-primary text-white px-10 py-4 font-bold uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 font-body" href="${DISCORD_INVITE}" target="_blank" rel="noopener noreferrer">
                    Join the Server
                  </a>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-6 bg-white border border-parchment border-l-4 border-l-primary">
                  <span class="text-[10px] uppercase tracking-widest font-bold block mb-2 text-primary font-body">Latest Announcement</span>
                  <p class="text-sm italic text-on-surface-variant font-medium font-body">"New vocabulary bot added to the #shabdkosh channel. Try contributing local idioms!"</p>
                </div>
                <div class="p-6 bg-white border border-parchment border-l-4 border-l-primary">
                  <span class="text-[10px] uppercase tracking-widest font-bold block mb-2 text-primary font-body">Active Debate</span>
                  <p class="text-sm italic text-on-surface-variant font-medium font-body">"Comparing Kauravi vowel shifts with neighboring Braj Bhasha influences."</p>
                </div>
              </div>
            </div>
            <div class="hidden lg:block w-px bg-parchment shrink-0"></div>
            <div class="flex-1 space-y-8">
              <div class="flex items-center gap-4">
                <div class="h-14 w-14 bg-surface flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary text-3xl">history_edu</span>
                </div>
                <div>
                  <h3 class="text-3xl font-bold tracking-tight text-surface font-heading">r/WesternUttarPradesh</h3>
                  <span class="text-xs uppercase tracking-widest font-bold opacity-70 font-body">The Regional Subreddit</span>
                </div>
              </div>
              <div class="space-y-6">${redditCardsHtml}</div>
              <div class="pt-4">
                <a href="${REDDIT_SUB_URL}" target="_blank" rel="noopener noreferrer" class="block w-full border-2 border-surface py-4 text-surface uppercase tracking-[0.2em] font-bold hover:bg-surface hover:text-white transition-colors text-center font-body">
                  View Subreddit
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>`;
}

/** Full featured essay body (desktop + mobile Heritage). Pass unique id — both layouts exist in the DOM. */
function heritageFeaturedNarrativeHtml(narrativeId) {
  return `
    <div id="${narrativeId}" class="space-y-5">
      <p class="heritage-hub-mobile-drop-cap text-lg leading-relaxed text-ink text-justify font-body">
        In the whispers of the Doab wind, the echoes of the ancient bards still linger. Long before the ink met the parchment, the history of the Kauravi heartland was carried in the throats of wandering storytellers who mapped the geography of an empire through song.
      </p>
      <p class="text-lg leading-relaxed text-ink text-justify font-body">
        These singers were not court poets alone. They were the keepers of village memory—recording famine and harvest, love and betrayal, in metres that children could repeat before they could read.
      </p>
      <p class="text-lg leading-relaxed text-ink text-justify font-body">
        Their routes followed the monsoon and the fair season: from the cane fields of the west to the temple towns where ragas were traded alongside grain. Each performance was a ledger of names, feuds, and small mercies that official chronicles rarely caught.
      </p>
      <p class="text-lg leading-relaxed text-ink text-justify font-body">
        Today we recover their fragments from folk songs, temple inscriptions, and the half-remembered lines elders still hum at weddings. The archive is never finished; each retelling adds a brick to the bridge between past and present.
      </p>
    </div>`;
}

function renderHeritageNotFound() {
  return `
  <div class="min-h-screen bg-cream text-ink selection:bg-primary/20">
    ${renderDesktopNav('heritage')}
    ${renderMobileTopBar()}
    ${renderMobileNavDrawer()}
    ${renderMobileBottomNav('heritage')}
    <main class="pt-28 lg:pt-32 pb-32 px-6 max-w-lg mx-auto text-center">
      <h1 class="font-heading text-3xl md:text-4xl font-bold mb-4">This piece is not in the archive</h1>
      <p class="font-body text-on-surface-variant mb-8">Check the URL or return to the Heritage hub.</p>
      <a href="#/heritage" class="inline-block bg-primary text-on-primary px-8 py-3 font-body uppercase tracking-widest text-xs font-bold">Back to Heritage</a>
    </main>
  </div>`;
}

function renderHeritageArticle(piece) {
  const isEssay = piece.kind === 'essay';
  const pCls = isEssay ? 'text-cream/88' : 'text-ink/90';
  const bodyHtml = piece.body
    .map((p) => `<p class="text-lg leading-relaxed ${pCls} text-justify mb-6 font-body">${escapeHtml(p)}</p>`)
    .join('');
  const num =
    isEssay && piece.number
      ? `<span class="block text-6xl font-light text-primary/40 font-heading mb-4 select-none">${piece.number}</span>`
      : '';
  const shell = isEssay
    ? 'bg-inverse-surface text-cream'
    : 'bg-cream text-ink';
  const headingCls = isEssay ? 'text-cream' : 'text-ink';
  const dekCls = isEssay ? 'text-cream/70' : 'text-on-surface-variant';

  return `
  <div class="min-h-screen ${shell} selection:bg-primary/30">
    ${renderDesktopNav('heritage')}
    ${renderMobileTopBar()}
    ${renderMobileNavDrawer()}
    ${renderMobileBottomNav('heritage')}
    <main class="pt-24 lg:pt-28 pb-32 px-6 lg:px-10 max-w-3xl mx-auto">
      <a href="#/heritage" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary font-body hover:underline mb-8 lg:mb-10">← Heritage hub</a>
      ${num}
      <p class="font-body text-[10px] uppercase tracking-[0.25em] ${tagCls} font-bold mb-3">${escapeHtml(piece.tag)} · ${isEssay ? 'Essay' : 'Story'}</p>
      <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold ${headingCls} leading-tight mb-4">${escapeHtml(piece.title)}</h1>
      <p class="font-body text-base ${dekCls} mb-8 lg:mb-10 leading-relaxed">${escapeHtml(piece.dek)}</p>
      <div class="aspect-[16/10] w-full overflow-hidden mb-10 rounded-sm border ${isEssay ? 'border-white/10' : 'border-outline-variant/40'}">
        <img alt="" class="w-full h-full object-cover" src="${piece.image}" width="1200" height="750" />
      </div>
      <div>${bodyHtml}</div>
    </main>
  </div>`;
}

function renderHeritage() {
  const pieceFromSlug = state.heritageSlug ? getHeritagePiece(state.heritageSlug) : null;
  if (state.heritageSlug) {
    if (!pieceFromSlug) return renderHeritageNotFound();
    return renderHeritageArticle(pieceFromSlug);
  }

  const desktopHero =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Z55yIlFJ5qGI3PKR6prtukDFAXO2gLi8mCP8KcQkV1GEL6w92ySJurIBiDzidLRXzenH03tzLg2u7h5em2_LKuaFbIN4bwXw8zqi6DcUh1GkwJoU7W_qt-BSJUiPeK3L-ZfVN-p9O27gLaRsPh9SPES92Qk3nHwOaY-ekHZwc95XvW4_Wu10xaYAq2deD2YigGHd8IF7QGFvI6XKHmhvLXFG0DGQQ6m5b1IQv1K9Z2cj-8ixwhpxztGpCSbD0qspP4txO9X8guc';
  const latest1 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAy-WVadjYbBKshJCTM-e1iHCmWM8ChXURX6_qPCNLudR03qQR4LG3u7coKBeZcVQ_AZjZADZT5HPoFLz0GhU3aUrMVhs4xAl9MCdoHvAcfFzkmBUHEur4QBvCXubdDmo2FOdRfxFLzmm-42b_B5AZvwDpylL_qpTCHbbWHyQ62W0TVtKnD4C63UCK5WEX4TGpLUpleB9XqX4Gsz_6wxjC_ZTYkkIvesbRf63ocbt9ea--LiTxNj6Fhqxb0G92FGJN3MSKwAioSGTw';
  const latest2 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2-OgxDzJRQq7Hw7TXIs1wb-EmSEwZVygOsHSGY1KqgJpUvaeWN-EXYALUzl0GcRFQj598v6Dd2cLf-P4JlYbAL4mBlgWBwKc669gRdrY3OQOkD3PSeksil7faoxtbvwxYGzw1f2geAp36FX-QUSIMVyBJkmg_srqGR4-sX9koXzXQd3bdLSX2vjDKzbbLJxa8ImgjVyMX7LE4JjWcWRE1NR4g7fak-MhpyihzLmsOa2TXpySVu-_pc8P9Px7MG17Tx1IERiAI2g';
  const latest3 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAAv0snS-njS4w2UjZVpw8rfmf4hEzp4ohEmeCEQrUJP33PsOm0K_XkYSxdAks2wImjl6jBF_OVjwVaPQCGADcINBU9ux4ZDodfLkgPgyWEN-GxtOo5Bl2mHMTCDUKMdg4w8r_Th0ZQYvoSkdEvtWdYXshaVDNDAcK2VA-iMUUCQjhWfzQLboms13otD5vabTEiz-9MSQ_4lNhNciqsyF2npmWJw01IqlfLhuQ4CcCvNluiR4HHf310P7FWNsuf3dwNe4TqPUpC-RY';
  const mobileHero =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWpUWq0W9x_08tsVxq9DEP_SH4DIPXFacTusS-T7XY_sKPgfyiNLKm8rSdp4Lg7IF7UmKren9kvGAGKk00o0nMCk8c3sabgVmocOkxjlxT4HquUVLAzOoMhPEH51hyLx6FjkdnisoJNKw52DeB8soMIIW7ugfxQuvdRsEcAeXjHcOmU_kgetUqQ8nMylxOGNC_wXXZyLX4n81y6GeCu8KkRBLUbMadV6GZH4FhnBiWPitCYVTQenSKDW9lxEV9kA7mffzjXzVw4lo';
  const mStory1 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBNmPya9gNAoWWIkXzQ6UolGPfu7SHFunFntDIq7_1n47fLRiHWdMqKgszCh-u4sGXYtpyxwRBLyUZEhKuYkG7u2t5DonAXPyCUUediq-FVM8duXzfFVSVUacV-1xe0rZmnNOvfcxy7SJujJKkomL4o8ObLQ_ZEjyJQFnZD-5t0lgwKrOOc8ZdlGZUb115vZWHXELAeE3Udt-8or_tRoVrAxikTCtyn_2oBgtVGhnyNFZRDVIuhB2mqgTJ0p4iBVouUo4GIewKTl2E';
  const mStory2 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAM92-6FX-4GFuFHvhQekJ1jsp1oT-NTr3i0MyAK2cuQE4WrZ7ecPPK4ukmBYOp_dj8wSZN3MS3Hk4B1F2vk3mMS8PRpnfJ4sN-VZ9t8FCkkxxDyg2A70wGKW0v1QHZIg7Txym4Tv-nc_oY9iYL7Uw7b2rlFF5cwjYAwkgQ_HPZM8zdJRtsP0rqm5mw8ZCPPlLDiYHqnBmsAbqHfN2q8FIuSgnevgiPixvurdZ2xBrfyWvJaZAoVgsSIbcTQC_s-bpkKUPjtIUmRHM';
  const mStory3 =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBB0c5spcWW9MSY2K1WQlwJMSewMxMLV291TpAZUBwtQlujH4H_dKK9z1MOmtpm91CRpCZMl9zzmprtyG0bHOVayxsrHZ4LS4wdStQB4NmUf6qSycdBSiNdqsN9CXKdY3wAhwFei4bYpn0QA4o-gh4jGLyjNoOXX1YpEUEJn1YhxFqlWphk4dS5KAe9Qlqh9H2Pgaa_TCCrnVy23AYohkxyrbw4JrF4T9CXAXKTZ4IMFpAjH0px8Vglkx_luB8XOUZ65S6JNgCaaRM';

  return `
  <div class="min-h-screen bg-cream text-ink selection:bg-primary/20">
    ${renderDesktopNav('heritage')}
    ${renderMobileTopBar()}
    ${renderMobileNavDrawer()}
    ${renderMobileBottomNav('heritage')}

    <!-- Desktop main -->
    <main class="hidden lg:block pt-24 bg-cream pb-0">
      <section class="relative h-[min(921px,92vh)] w-full overflow-hidden flex items-end">
        <div class="absolute inset-0 z-0">
          <img alt="Ancient ruins of Hastinapur landscape" class="w-full h-full object-cover" src="${desktopHero}" width="1920" height="1080" />
          <div class="absolute inset-0 hero-gradient-heritage"></div>
        </div>
        <div class="relative z-10 w-full max-w-screen-2xl mx-auto px-8 pb-20">
          <div class="max-w-4xl">
            <span class="text-white/80 uppercase tracking-[0.3em] text-xs font-bold mb-4 block font-body">Featured Story</span>
            <h1 class="text-white text-6xl md:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 font-heading">
              The Forgotten <span class="text-primary italic">Bards</span> of Hastinapur
            </h1>
            <div class="flex items-center space-x-6">
              <div class="h-0.5 w-12 bg-primary"></div>
              <p class="text-white text-xl font-medium tracking-tight font-body">by Anurag Chaudhary</p>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-3xl mx-auto px-8 py-16 lg:py-20 border-b border-outline-variant/60" aria-labelledby="heritage-essay-heading">
        <h2 id="heritage-essay-heading" class="font-heading text-3xl md:text-4xl font-bold mb-8 text-ink">
          The Forgotten Bards of <span class="text-primary italic">Hastinapur</span>
        </h2>
        <p class="text-sm uppercase tracking-[0.15em] text-muted mb-10 font-body font-bold">By Anurag Chaudhary</p>
        ${heritageFeaturedNarrativeHtml('heritage-full-narrative-desktop')}
      </section>

      <section class="py-24 px-8 max-w-screen-2xl mx-auto">
        <div class="flex justify-between items-end mb-16 border-b border-outline-variant pb-8">
          <div>
            <span class="text-xs uppercase tracking-[0.2em] font-bold text-muted mb-2 block font-body">Curation</span>
            <h2 class="text-5xl font-bold tracking-tight font-heading">Latest <span class="italic text-primary">Stories</span></h2>
          </div>
          <a class="text-sm uppercase tracking-widest font-bold border-b-2 border-primary pb-1 text-ink hover:text-primary transition-colors font-body" href="#heritage-latest">View Archive</a>
        </div>
        <div id="heritage-latest" class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <a href="#/heritage/wells" class="group block text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
            <div class="aspect-[4/5] overflow-hidden mb-6">
              <img alt="Deep subterranean well architecture" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${latest1}" width="600" height="750" />
            </div>
            <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3 block font-body">Architecture</span>
            <h3 class="text-3xl font-bold leading-tight font-heading group-hover:text-primary transition-colors">
              The Subterranean Architecture of <span class="italic">Kauravi</span> Wells
            </h3>
            <span class="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-primary font-body border-b border-primary pb-0.5">Read story</span>
          </a>
          <a href="#/heritage/handloom" class="group block text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
            <div class="aspect-[4/5] overflow-hidden mb-6">
              <img alt="Close up of handloom textile" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${latest2}" width="600" height="750" />
            </div>
            <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3 block font-body">Craftsmanship</span>
            <h3 class="text-3xl font-bold leading-tight font-heading group-hover:text-primary transition-colors">
              Threads of the <span class="italic">Doab</span>: The Dying Art of Handloom
            </h3>
            <span class="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-primary font-body border-b border-primary pb-0.5">Read story</span>
          </a>
          <a href="#/heritage/sanjhi" class="group block text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
            <div class="aspect-[4/5] overflow-hidden mb-6">
              <img alt="Sanjhi paper cutting art" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${latest3}" width="600" height="750" />
            </div>
            <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3 block font-body">Fine Arts</span>
            <h3 class="text-3xl font-bold leading-tight font-heading group-hover:text-primary transition-colors">
              Sanjhi: The Sacred Art of <span class="italic">Paper Cutting</span>
            </h3>
            <span class="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-primary font-body border-b border-primary pb-0.5">Read story</span>
          </a>
        </div>
      </section>

      <section class="bg-inverse-surface text-cream py-24">
        <div class="max-w-screen-2xl mx-auto px-8">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-16">
            <div class="md:col-span-4">
              <div class="md:sticky md:top-32">
                <span class="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block font-body">Deep Dives</span>
                <h2 class="text-5xl md:text-6xl font-bold tracking-tighter leading-none mb-8 font-heading">Cultural <span class="italic text-primary">Essays</span></h2>
                <p class="text-cream/60 text-lg leading-relaxed mb-10 font-body">
                  Exploring the socio-linguistic fabric of the Upper Doab region through long-form investigative journalism and personal narratives.
                </p>
                <div class="h-px w-full bg-cream/10 mb-10"></div>
                <div class="flex items-start space-x-4">
                  <span class="material-symbols-outlined text-primary">auto_stories</span>
                  <div>
                    <h4 class="font-bold font-heading">Long-form series</h4>
                    <p class="text-sm text-cream/50 font-body">Each essay opens in full below—method, sources, and open questions included.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="md:col-span-8 space-y-24">
              <article class="group">
                <div class="flex flex-col md:flex-row gap-8 items-start">
                  <span class="text-6xl font-light text-primary/30 font-heading select-none">01</span>
                  <div>
                    <h3 class="text-3xl md:text-4xl font-bold mb-4 font-heading">
                      <a href="#/heritage/dialects-dust" class="group-hover:text-primary transition-colors">Dialects of the Dust: Mapping Khariboli's Evolution</a>
                    </h3>
                    <p class="text-xl text-cream/70 leading-relaxed mb-6 font-body">How the language of the common folk met print, reform, and the nation-making project—mapped through petitions, ballads, and classroom politics.</p>
                    <a href="#/heritage/dialects-dust" class="inline-flex items-center text-primary font-bold tracking-widest uppercase text-xs font-body hover:underline">Read essay <span class="material-symbols-outlined ml-2 text-sm">arrow_forward</span></a>
                  </div>
                </div>
              </article>
              <article class="group">
                <div class="flex flex-col md:flex-row gap-8 items-start">
                  <span class="text-6xl font-light text-primary/30 font-heading select-none">02</span>
                  <div>
                    <h3 class="text-3xl md:text-4xl font-bold mb-4 font-heading">
                      <a href="#/heritage/rasiya-rhythms" class="group-hover:text-primary transition-colors">The Rhythms of Rasiya: Folklore of the Braj-Kauravi Border</a>
                    </h3>
                    <p class="text-xl text-cream/70 leading-relaxed mb-6 font-body">Where tāl meets dialect on the fuzzy line between regions—field tapes, code-switching, and the politics of the refrain.</p>
                    <a href="#/heritage/rasiya-rhythms" class="inline-flex items-center text-primary font-bold tracking-widest uppercase text-xs font-body hover:underline">Read essay <span class="material-symbols-outlined ml-2 text-sm">arrow_forward</span></a>
                  </div>
                </div>
              </article>
              <article class="group">
                <div class="flex flex-col md:flex-row gap-8 items-start">
                  <span class="text-6xl font-light text-primary/30 font-heading select-none">03</span>
                  <div>
                    <h3 class="text-3xl md:text-4xl font-bold mb-4 font-heading">
                      <a href="#/heritage/culinary-cartography" class="group-hover:text-primary transition-colors">Culinary Cartography: The Spices of the Meerut Belt</a>
                    </h3>
                    <p class="text-xl text-cream/70 leading-relaxed mb-6 font-body">Recipes as documents: trade routes, dowry notebooks, and changing fog patterns that alter what “bitter greens” can mean.</p>
                    <a href="#/heritage/culinary-cartography" class="inline-flex items-center text-primary font-bold tracking-widest uppercase text-xs font-body hover:underline">Read essay <span class="material-symbols-outlined ml-2 text-sm">arrow_forward</span></a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <footer class="bg-surface border-t-4 border-primary w-full py-12 px-8">
        <div class="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div class="text-lg font-bold text-cream mb-4 font-heading">Khariboli Heritage</div>
            <div class="flex flex-wrap gap-6 font-body text-sm uppercase tracking-widest">
              <span class="text-parchment/60">Archives</span>
              <span class="text-parchment/60">Contribution Guidelines</span>
              <span class="text-parchment/60">Privacy Policy</span>
              <span class="text-parchment/60">Terms of Service</span>
            </div>
          </div>
          <div class="md:text-right">
            <p class="text-parchment/60 font-body text-sm uppercase tracking-widest">© 2026 Kauravi Culture</p>
            <div class="mt-4 flex md:justify-end space-x-4">
              <span class="material-symbols-outlined text-cream/40 hover:text-primary transition-colors cursor-default" aria-hidden="true">public</span>
              <span class="material-symbols-outlined text-cream/40 hover:text-primary transition-colors cursor-default" aria-hidden="true">share</span>
              <span class="material-symbols-outlined text-cream/40 hover:text-primary transition-colors cursor-default" aria-hidden="true">mail</span>
            </div>
          </div>
        </div>
      </footer>
    </main>

    <!-- Mobile main -->
    <main class="lg:hidden pt-[72px] pb-28 bg-cream">
      <article id="heritage-featured" class="relative w-full">
        <div class="px-6 pt-8">
          <p class="font-body text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 italic">Featured Archival</p>
          <h2 class="font-heading text-5xl font-bold leading-[0.9] tracking-tight mb-6 text-ink">
            The Forgotten Bards of <span class="text-primary italic">Hastinapur</span>
          </h2>
          <p class="font-body text-sm uppercase tracking-[0.1em] text-on-surface-variant opacity-80 mb-8 border-l-2 border-primary pl-4">
            By Anurag Chaudhary
          </p>
        </div>
        <div class="relative w-full aspect-[4/5] mt-4">
          <img alt="Ancient stone pillars and epic landscapes" class="w-full h-full object-cover grayscale-[20%] contrast-110" src="${mobileHero}" width="800" height="1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent"></div>
        </div>
        <div class="px-6 -mt-10 relative z-10 pb-4">
          <div class="bg-surface-container-low p-6 shadow-sm border-t-4 border-primary">
            ${heritageFeaturedNarrativeHtml('heritage-full-narrative-mobile')}
            <a href="#heritage-more-stories" class="inline-block mt-8 text-sm font-extrabold uppercase tracking-[0.2em] text-primary border-b-2 border-primary pb-1 hover:text-on-surface-variant transition-colors font-body">More stories</a>
          </div>
        </div>
      </article>

      <div class="px-6 py-12">
        <div class="h-px bg-outline-variant w-full"></div>
      </div>

      <section id="heritage-more-stories" class="px-6 pb-8 scroll-mt-24">
        <div class="flex items-baseline justify-between mb-10">
          <h3 class="font-heading text-3xl font-bold text-ink">More <span class="italic text-primary">Stories</span></h3>
          <span class="font-body text-[10px] uppercase tracking-[0.2em] opacity-60">Volume IV / 2024</span>
        </div>
        <div class="space-y-16">
          <a href="#/heritage/wells" class="group block text-left">
            <div class="aspect-[4/5] overflow-hidden mb-6 bg-surface-container-highest">
              <img alt="Traditional stepwell architecture" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${mStory1}" width="600" height="750" />
            </div>
            <p class="font-body text-[10px] uppercase tracking-[0.2em] text-primary mb-2 italic">Architecture</p>
            <h4 class="font-heading text-2xl font-bold mb-3 group-hover:text-primary transition-colors text-ink">
              Kauravi Wells Architecture: The Subterranean Sculptures
            </h4>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-4 font-body">
              Discover the hidden hydraulic marvels that sustained the agrarian societies of the upper Gangetic plains for centuries. Stepwells were not only water; they were social stages, cool refuges, and proof of a civilization that negotiated depth before height.
            </p>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-primary font-body border-b border-primary">Read full story</span>
          </a>
          <a href="#/heritage/handloom" class="group block text-left">
            <div class="aspect-[4/5] overflow-hidden mb-6 bg-surface-container-highest">
              <img alt="Handloom weaving process" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${mStory2}" width="600" height="750" />
            </div>
            <p class="font-body text-[10px] uppercase tracking-[0.2em] text-primary mb-2 italic">Craftsmanship</p>
            <h4 class="font-heading text-2xl font-bold mb-3 group-hover:text-primary transition-colors text-ink">
              Handloom Art: Threads of the Doab Identity
            </h4>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-4 font-body">
              A deep dive into the resilient weaving traditions that transformed cotton into a medium of regional storytelling. Patterns encoded caste histories, dowry expectations, and the quiet pride of women who could read a loom the way others read scripture.
            </p>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-primary font-body border-b border-primary">Read full story</span>
          </a>
          <a href="#/heritage/sanjhi" class="group block text-left">
            <div class="aspect-[4/5] overflow-hidden mb-6 bg-surface-container-highest">
              <img alt="Paper cutting art detail" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${mStory3}" width="600" height="750" />
            </div>
            <p class="font-body text-[10px] uppercase tracking-[0.2em] text-primary mb-2 italic">Folklore</p>
            <h4 class="font-heading text-2xl font-bold mb-3 group-hover:text-primary transition-colors text-ink">
              Sanjhi Paper Cutting: Patterns of Devotion
            </h4>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-4 font-body">
              The fragile, ephemeral art of paper stenciling used to decorate shrines and courtyard floors during festivals. Each cut was a prayer in negative space, dissolved when the monsoon arrived, as if devotion itself were meant to be temporary.
            </p>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-primary font-body border-b border-primary">Read full story</span>
          </a>
        </div>
      </section>

      <section class="px-6 py-12 bg-inverse-surface text-cream border-t border-white/10">
        <h3 class="font-heading text-2xl font-bold mb-6">Cultural essays</h3>
        <ul class="space-y-4 font-body text-sm">
          <li><a class="text-cream/90 underline decoration-primary underline-offset-4 hover:text-primary" href="#/heritage/dialects-dust">Dialects of the Dust — Khariboli’s evolution</a></li>
          <li><a class="text-cream/90 underline decoration-primary underline-offset-4 hover:text-primary" href="#/heritage/rasiya-rhythms">The Rhythms of Rasiya — Braj-Kauravi border</a></li>
          <li><a class="text-cream/90 underline decoration-primary underline-offset-4 hover:text-primary" href="#/heritage/culinary-cartography">Culinary Cartography — the Meerut belt</a></li>
        </ul>
      </section>

      <footer class="mt-20 px-6 py-16 bg-inverse-surface text-cream text-center">
        <h5 class="text-2xl font-black uppercase tracking-[0.3em] mb-6 font-heading">Kauravi</h5>
        <p class="font-body italic text-lg opacity-80 max-w-xs mx-auto mb-8">
          "Preserving the linguistic and visual echoes of the Land between Rivers."
        </p>
        <div class="font-body text-[10px] uppercase tracking-[0.1em] opacity-40">© 2026 Kauravi Culture</div>
      </footer>
    </main>
  </div>`;
}

function renderWordModal(w) {
  if (!w) return '';
  const ex = w.example
    ? `<div class="bg-parchment/40 p-5 rounded-sm border border-parchment mt-6">
        <p class="font-heading italic text-lg text-ink mb-2">"${escapeHtml(w.example)}"</p>
        <p class="text-sm text-muted uppercase tracking-wider font-body">Example usage</p>
      </div>`
    : '';
  return `
  <div class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" id="word-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-word-title">
    <div class="bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm shadow-float border border-parchment p-8 relative animate-[fadeIn_0.2s_ease-out]">
      <button type="button" class="absolute top-4 right-4 text-muted hover:text-primary p-2" id="word-modal-close" aria-label="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="flex items-baseline gap-3 flex-wrap mb-2">
        <h2 id="modal-word-title" class="font-heading text-4xl font-bold text-ink">${escapeHtml(w.word)}</h2>
        <button type="button" class="audio-btn w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all" data-audio="${w.audio || ''}" aria-label="Play pronunciation">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
        </button>
      </div>
      ${w.ipa ? `<p class="font-heading text-xl italic text-muted mb-4">${escapeHtml(w.ipa)}</p>` : ''}
      <p class="text-sm text-primary font-medium uppercase tracking-wider font-body mb-4">${escapeHtml(w.pos)} · Etymology</p>
      <p class="font-body text-base leading-relaxed text-ink mb-4">${escapeHtml(w.etymology)}</p>
      <p class="font-body text-base leading-relaxed text-ink">${escapeHtml(w.definition)}</p>
      ${ex}
    </div>
  </div>`;
}

function renderDiscordModal() {
  const online = state.discordPresence != null ? state.discordPresence : '—';
  const members = state.discordMembers != null ? state.discordMembers : '—';
  return `
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" id="discord-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="discord-modal-title">
    <div class="bg-surface text-[#F9F8F6] w-full max-w-md rounded-sm shadow-float border border-white/10 p-8 relative">
      <button type="button" class="absolute top-4 right-4 text-white/60 hover:text-white p-2" id="discord-modal-close" aria-label="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="flex items-center gap-3 mb-6">
        <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">forum</span>
        <h2 id="discord-modal-title" class="font-heading text-2xl font-bold leading-tight tracking-tight">Join the Baithak</h2>
      </div>
      <p class="text-sm text-white/70 mb-6 leading-relaxed font-body">
        ${state.discordGuildName ? `You are joining <strong class="text-white">${escapeHtml(state.discordGuildName)}</strong> on Discord.` : 'Connect with the community on Discord.'}
      </p>
      <div class="grid grid-cols-2 gap-4 mb-8 text-center font-body">
        <div class="bg-white/5 rounded-sm p-4 border border-white/10">
          <p class="text-xs uppercase tracking-widest text-muted mb-1">Online now</p>
          <p class="text-2xl font-bold text-primary">${online}</p>
        </div>
        <div class="bg-white/5 rounded-sm p-4 border border-white/10">
          <p class="text-xs uppercase tracking-widest text-muted mb-1">Members</p>
          <p class="text-2xl font-bold text-primary">${members}</p>
        </div>
      </div>
      <a href="${DISCORD_INVITE}" target="_blank" rel="noopener noreferrer" id="discord-modal-open" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-sm transition-colors font-medium text-sm tracking-widest uppercase font-body">
        Open Discord
        <span class="material-symbols-outlined text-[18px]">open_in_new</span>
      </a>
    </div>
  </div>`;
}

function render() {
  const root = appEl();
  if (!root) return;
  let html = '';
  switch (state.route) {
    case 'shabdkosh':
      html = renderShabdkosh();
      break;
    case 'baithak':
      html = renderBaithak();
      break;
    case 'heritage':
      html = renderHeritage();
      break;
    default:
      html = renderHome();
  }
  root.innerHTML = html;

  const mod = modalsEl();
  if (mod) {
    let m = '';
    if (state.modalWord) m += renderWordModal(state.modalWord);
    if (state.discordModalOpen) m += renderDiscordModal();
    mod.innerHTML = m;
  }
}

function bindShabdkoshWordClicks() {
  document.querySelectorAll('#shab-entries .word-entry, #shab-entries-mobile .word-entry-mobile').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.audio-btn')) return;
      const id = el.getAttribute('data-word-id');
      const w = words.find((x) => x.id === id);
      if (w) {
        state.modalWord = w;
        render();
        bindAfterRender();
      }
    });
  });
  document.querySelectorAll('#shab-entries .audio-btn, #shab-entries-mobile .audio-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playAudio(btn);
    });
  });
}

function updateShabdkoshEntries(f) {
  const wrap = document.getElementById('shab-entries');
  if (wrap) wrap.innerHTML = renderDictionaryEntriesHtml(f);
  const wrapM = document.getElementById('shab-entries-mobile');
  if (wrapM) wrapM.innerHTML = renderDictionaryMobileHtml(f);
  const strip = document.getElementById('shab-letter-strip');
  if (strip) {
    const { letters } = wordsByLetter(f);
    const activeLetter = state.shabdkoshLetter || letters[0] || 'A';
    strip.innerHTML = renderHorizontalLetterStrip(letters, activeLetter);
  }
  bindShabdkoshWordClicks();
}

function bindSuggestions(inputId, suggestId, isHome) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestId);
  if (!input || !box) return;

  const show = (list) => {
    if (!list.length || !input.value.trim()) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }
    box.innerHTML = list
      .slice(0, 8)
      .map(
        (w) =>
          `<button type="button" class="w-full text-left px-4 py-3 hover:bg-parchment/50 font-heading text-xl text-ink border-b border-parchment/50 last:border-0 font-medium" data-word-id="${escapeHtml(w.id)}">${escapeHtml(w.word)}</button>`
      )
      .join('');
    box.classList.remove('hidden');
  };

  input.addEventListener('input', () => {
    const q = input.value;
    if (isHome) {
      const f = filterWords(q);
      show(f);
      return;
    }
    state.shabdkoshQuery = q;
    const otherId = inputId === 'shab-search' ? 'shab-search-mobile' : 'shab-search';
    const other = document.getElementById(otherId);
    if (other && other.value !== q) other.value = q;
    const f = filterWords(q);
    show(f);
    updateShabdkoshEntries(f);
  });

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-word-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-word-id');
    const w = words.find((x) => x.id === id);
    if (w) {
      state.modalWord = w;
      if (!isHome) state.shabdkoshQuery = w.word;
      box.classList.add('hidden');
      render();
      bindAfterRender();
    }
  });
}

function bindAfterRender() {
  if (state.route === 'home') {
    const nav = document.getElementById('home-nav-desktop');
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('nav-scrolled');
      else nav.classList.remove('nav-scrolled');
    };
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll);
    onScroll();

    document.querySelectorAll('.btn-discord-home').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.discordModalOpen = true;
        render();
        bindAfterRender();
      });
    });

    document.getElementById('home-sign-in')?.addEventListener('click', (e) => {
      e.preventDefault();
    });

    const carousel = document.getElementById('home-stories-carousel');
    document.getElementById('home-carousel-prev')?.addEventListener('click', () => {
      carousel?.scrollBy({ left: -420, behavior: 'smooth' });
    });
    document.getElementById('home-carousel-next')?.addEventListener('click', () => {
      carousel?.scrollBy({ left: 420, behavior: 'smooth' });
    });
  }

  if (state.route === 'shabdkosh') {
    bindSuggestions('shab-search', 'shab-suggest', false);
    bindSuggestions('shab-search-mobile', 'shab-suggest-mobile', false);
    bindShabdkoshWordClicks();
  }

  if (state.route === 'baithak') {
    document.querySelectorAll('[data-open]').forEach((el) => {
      el.addEventListener('click', () => {
        const u = el.getAttribute('data-open');
        if (u) window.open(u, '_blank', 'noopener,noreferrer');
      });
    });
  }

  document.getElementById('word-modal-close')?.addEventListener('click', () => {
    state.modalWord = null;
    render();
    bindAfterRender();
  });
  document.getElementById('word-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'word-modal-backdrop') {
      state.modalWord = null;
      render();
      bindAfterRender();
    }
  });

  document.getElementById('discord-modal-close')?.addEventListener('click', () => {
    state.discordModalOpen = false;
    render();
    bindAfterRender();
  });
  document.getElementById('discord-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'discord-modal-backdrop') {
      state.discordModalOpen = false;
      render();
      bindAfterRender();
    }
  });

  modalsEl()?.querySelectorAll('.audio-btn').forEach((btn) => {
    btn.addEventListener('click', () => playAudio(btn));
  });
}

function playAudio(btn) {
  const url = btn.getAttribute('data-audio');
  btn.classList.add('is-playing');
  setTimeout(() => btn.classList.remove('is-playing'), 500);
  if (!url) return;
  const a = new Audio(url);
  a.play().catch(() => {});
}

async function fetchDiscordInvite() {
  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`);
    if (!res.ok) throw new Error('discord');
    const data = await res.json();
    state.discordPresence = data.approximate_presence_count ?? null;
    state.discordMembers = data.approximate_member_count ?? null;
    state.discordGuildName = data.guild?.name ?? null;
  } catch {
    state.discordPresence = null;
    state.discordMembers = null;
  }
}

async function fetchReddit() {
  try {
    const res = await fetch(`${REDDIT_SUB_URL}hot.json?limit=8`, { mode: 'cors' });
    if (!res.ok) throw new Error('reddit');
    const data = await res.json();
    const children = data?.data?.children?.filter((c) => c?.data?.title) || [];
    if (!children.length) throw new Error('empty');
    state.redditPosts = children;
    state.redditError = false;
  } catch {
    state.redditPosts = null;
    state.redditError = true;
  }
}

function init() {
  document.addEventListener('click', (e) => {
    const letterBtn = e.target.closest('button[data-scroll-letter]');
    if (letterBtn && state.route === 'shabdkosh' && !letterBtn.hasAttribute('disabled')) {
      const L = letterBtn.getAttribute('data-scroll-letter');
      const preferMobile = window.matchMedia('(max-width: 1023px)').matches;
      const el =
        (preferMobile ? document.getElementById(`letter-mobile-${L}`) : null) || document.getElementById(`letter-${L}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (e.target.closest('#btn-mobile-menu-open')) {
      const menu = document.getElementById('mobile-menu');
      menu?.classList.remove('hidden');
      menu?.setAttribute('aria-hidden', 'false');
    } else if (e.target.closest('#btn-mobile-menu-close') || e.target.id === 'mobile-menu-backdrop') {
      const menu = document.getElementById('mobile-menu');
      menu?.classList.add('hidden');
      menu?.setAttribute('aria-hidden', 'true');
    } else if (e.target.closest('#mobile-menu a[href^="#/"]')) {
      const menu = document.getElementById('mobile-menu');
      menu?.classList.add('hidden');
      menu?.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('click', (e) => {
    ['home-suggest', 'shab-suggest', 'shab-suggest-mobile'].forEach((id) => {
      const box = document.getElementById(id);
      if (!box || box.classList.contains('hidden')) return;
      const inputId =
        id === 'home-suggest' ? 'home-shab-search' : id === 'shab-suggest-mobile' ? 'shab-search-mobile' : 'shab-search';
      const input = document.getElementById(inputId);
      if (input && !box.contains(e.target) && e.target !== input) box.classList.add('hidden');
    });
  });

  window.addEventListener('hashchange', () => {
    state.modalWord = null;
    state.discordModalOpen = false;
    document.getElementById('mobile-menu')?.classList.add('hidden');
    document.getElementById('mobile-menu')?.setAttribute('aria-hidden', 'true');
    setRouteFromHash();
  });

  applyRouteState();

  Promise.all([fetchDiscordInvite(), fetchReddit()]).then(() => {
    render();
    bindAfterRender();
  });
}

init();
