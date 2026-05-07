const categories = {
  diagnosis: "診断",
  record: "記録",
  research: "研究",
  game: "ゲーム",
  service: "サービス",
};

const apps = [
  {
    id: "evolve",
    title: "進化診断",
    category: "diagnosis",
    axis: "SELF / PHASE",
    question: "いまの自分は、どの段階にいるのか。",
    description: "自分の進化段階・成長フェーズを可視化する診断",
    url: "https://evolve-five-gamma.vercel.app/",
  },
  {
    id: "consciousness",
    title: "意識診断",
    category: "diagnosis",
    axis: "AWARENESS / META",
    question: "自分は、自分をどこから見ているのか。",
    description: "自分の意識のあり方・自己認識を測る診断",
    url: "https://whoyournot.vercel.app/",
  },
  {
    id: "past",
    title: "過去診断",
    category: "diagnosis",
    axis: "MEMORY / PATTERN",
    question: "過去は、どんな癖として現在に残っているのか。",
    description: "過去の傾向やパターンから自分を読み解く診断",
    url: "https://pazst.vercel.app/result",
  },
  {
    id: "minus",
    title: "負の診断",
    category: "diagnosis",
    axis: "SHADOW / WEAKNESS",
    question: "見ないようにしている弱さは、何を知らせているのか。",
    description: "自分のネガティブ面・弱みを言語化する診断",
    url: "https://minus-kappa.vercel.app/",
  },
  {
    id: "opportunity",
    title: "機会診断",
    category: "diagnosis",
    axis: "POSSIBILITY / GAP",
    question: "まだ掴んでいない可能性は、どこに開いているのか。",
    description: "掴めていない機会・可能性を見つける診断",
    url: "https://a-irobot.vercel.app/",
  },
  {
    id: "workstyle",
    title: "作業法診断",
    category: "diagnosis",
    axis: "METHOD / ENERGY",
    question: "自分は、どんな進め方のときに動けるのか。",
    description: "自分に合う作業スタイル・進め方を診断",
    url: "https://micron-sigma.vercel.app/",
  },
  {
    id: "values",
    title: "価値観診断",
    category: "diagnosis",
    axis: "VALUE / CENTER",
    question: "判断の中心にある価値は何か。",
    description: "自分の価値観を整理する診断",
    url: "https://valuse.vercel.app/",
  },
  {
    id: "habit",
    title: "習慣記録",
    category: "record",
    axis: "RHYTHM / REPEAT",
    question: "繰り返している行動は、自分をどこへ運んでいるのか。",
    description: "日々の習慣をログするアプリ",
    url: "https://solnova.biz/ja",
  },
  {
    id: "life-tracker",
    title: "生活記録",
    category: "record",
    axis: "LIFE / TRACE",
    question: "生活の断片は、どんな線になって残るのか。",
    description: "生活全般の出来事を記録するアプリ",
    url: "https://v0-life-tracker-app-zeta.vercel.app/",
  },
  {
    id: "inner-outer",
    title: "内面外面記録",
    category: "record",
    axis: "INSIDE / OUTSIDE",
    question: "内側の状態と外側の行動は、どこでずれているのか。",
    description: "内面の状態と外面の行動のギャップを記録するアプリ",
    url: "https://gap-steel.vercel.app/",
  },
  {
    id: "exchange",
    title: "交換可視化",
    category: "record",
    axis: "EXCHANGE / RELATION",
    question: "人との間で、何を渡し、何を受け取っているのか。",
    description: "他者と何を交換しているか（時間・価値など）を可視化するアプリ",
    url: "https://exchangeapp2.vercel.app/",
  },
  {
    id: "dna",
    title: "生命分類",
    category: "research",
    axis: "LIFE / CODE",
    question: "生命は、どのような差分として分類できるのか。",
    description: "DNA比較で生命を分類・比較するアプリ",
    url: "https://comparedna.vercel.app/",
  },
  {
    id: "conversation",
    title: "会話分類",
    category: "research",
    axis: "DIALOGUE / FORM",
    question: "会話には、どんな構造と型が潜んでいるのか。",
    description: "会話の種類やパターンを分類するアプリ",
    url: "https://resonance-eta-woad.vercel.app/",
  },
  {
    id: "ai-talk",
    title: "AI対話実験",
    category: "research",
    axis: "AI / OBSERVATION",
    question: "AI同士の対話から、人間の何が見えてくるのか。",
    description: "AI同士や人とAIの対話を観察する実験アプリ",
    url: "https://people-talking.vercel.app/",
  },
  {
    id: "feelings",
    title: "感情分類論文",
    category: "research",
    axis: "FEELING / THEORY",
    question: "感情は、どんな仕組みとして記述できるのか。",
    description: "感情の仕組みを論文形式で整理するアプリ",
    url: "https://how-feelings-work.vercel.app/",
  },
  {
    id: "scale",
    title: "スケールゲーム",
    category: "game",
    axis: "SCALE / BODY",
    question: "視点の大きさが変わると、世界はどう変形するのか。",
    description: "スケールを変えて遊ぶゲーム",
    url: "https://skalegame.vercel.app/",
  },
  {
    id: "babysit",
    title: "子守ゲーム",
    category: "game",
    axis: "CARE / SIMULATION",
    question: "誰かを世話することは、自分に何を起こすのか。",
    description: "子守をテーマにしたゲーム",
    url: "https://wrong-seven.vercel.app/",
  },
  {
    id: "self-image",
    title: "自分の姿",
    category: "game",
    axis: "IMAGE / ILLUSION",
    question: "自分が見ている自分は、本当に自分なのか。",
    description: "自分が見ている自分の姿（虚像）を扱うアプリ",
    url: "https://lie-six.vercel.app/",
  },
  {
    id: "problem-match",
    title: "悩みマッチング",
    category: "service",
    axis: "PAIN / CONNECTION",
    question: "個人の悩みは、どこで他者との接点になるのか。",
    description: "似た悩みを持つ人同士をマッチングするサービス",
    url: "https://problemmach.vercel.app/",
  },
];

const categoryNotes = {
  diagnosis: ["measure self", "inner state"],
  record: ["leave trace", "daily archive"],
  research: ["classify world", "structure"],
  game: ["experience concept", "simulation"],
  service: ["connect pain", "relation"],
};

const stage = document.querySelector(".zoom-stage");
const orbit = document.querySelector("#activeLink");
const activeCategory = document.querySelector("#activeCategory");
const activeAxis = document.querySelector("#activeAxis");
const activeTitle = document.querySelector("#activeTitle");
const activeDescription = document.querySelector("#activeDescription");
const activeQuestion = document.querySelector("#activeQuestion");
const counter = document.querySelector("#counter");
const rail = document.querySelector("#rail");
const appList = document.querySelector("#appList");
const noteLeft = document.querySelector("#noteLeft");
const noteRight = document.querySelector("#noteRight");
const particleCanvas = document.querySelector("#particles");
const particleContext = particleCanvas.getContext("2d");

let currentIndex = 0;
let lastScrollY = window.scrollY;
let scrollForce = 0;
let particles = [];

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function setActiveApp(index, zoom = 0) {
  const app = apps[index];
  if (!app) return;

  currentIndex = index;
  activeCategory.textContent = categories[app.category];
  activeAxis.textContent = app.axis;
  activeTitle.textContent = app.title;
  activeDescription.textContent = app.description;
  activeQuestion.textContent = app.question;
  orbit.href = app.url;
  orbit.style.setProperty("--zoom", zoom.toFixed(3));
  counter.textContent = `${formatNumber(index + 1)} / ${formatNumber(apps.length)}`;

  const notes = categoryNotes[app.category];
  noteLeft.textContent = notes[0];
  noteRight.textContent = notes[1];

  rail.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === index);
  });
}

function updateFromScroll() {
  const scrollDelta = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
  scrollForce = Math.min(90, Math.abs(scrollDelta));

  const rect = stage.getBoundingClientRect();
  const travel = stage.offsetHeight - window.innerHeight;
  const raw = Math.min(Math.max(-rect.top / travel, 0), 1);
  const exact = raw * apps.length;
  const index = Math.min(apps.length - 1, Math.floor(exact));
  const localZoom = exact - index;
  setActiveApp(index, localZoom);
}

function renderRail() {
  rail.innerHTML = apps
    .map((app, index) => {
      const label = `${formatNumber(index + 1)} ${app.title}`;
      return `<button type="button" aria-label="${label}" data-index="${index}"></button>`;
    })
    .join("");
}

function renderList() {
  appList.innerHTML = apps
    .map((app, index) => {
      return `
        <a class="list-item" href="${app.url}" target="_blank" rel="noreferrer">
          <span class="list-number">${formatNumber(index + 1)}</span>
          <span>
            <span class="list-category">${categories[app.category]}</span>
            <span class="list-title">${app.title}</span>
            <span class="list-axis">${app.axis}</span>
          </span>
          <span class="list-description">${app.question}</span>
          <span class="list-open">Open</span>
        </a>
      `;
    })
    .join("");
}

function edgeWeightedPosition() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const side = Math.floor(Math.random() * 4);
  const depth = Math.pow(Math.random(), 2.1);
  const insetX = width * (0.02 + depth * 0.18);
  const insetY = height * (0.02 + depth * 0.18);

  if (side === 0) return { x: Math.random() * width, y: insetY };
  if (side === 1) return { x: width - insetX, y: Math.random() * height };
  if (side === 2) return { x: Math.random() * width, y: height - insetY };
  return { x: insetX, y: Math.random() * height };
}

function createParticle() {
  const position = edgeWeightedPosition();
  const size = 0.7 + Math.random() * 2.8;
  return {
    x: position.x,
    y: position.y,
    size,
    baseAlpha: 0.16 + Math.random() * 0.5,
    life: Math.random() * Math.PI * 2,
    speed: 0.12 + Math.random() * 0.75,
    driftX: (Math.random() - 0.5) * 0.22,
    driftY: (Math.random() - 0.5) * 0.22,
    pulse: 0.006 + Math.random() * 0.018,
  };
}

function resizeParticles() {
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  particleCanvas.width = window.innerWidth * ratio;
  particleCanvas.height = window.innerHeight * ratio;
  particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);

  const amount = Math.min(96, Math.max(56, Math.floor(window.innerWidth / 15)));
  particles = Array.from({ length: amount }, createParticle);
}

function drawParticles() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const centerClearRadius = Math.min(width, height) * 0.25;
  const force = scrollForce / 90;

  particleContext.clearRect(0, 0, width, height);
  particleContext.globalCompositeOperation = "lighter";

  particles.forEach((particle, index) => {
    particle.life += particle.pulse + force * 0.024;
    particle.x += particle.driftX * particle.speed + particle.driftX * force * 8;
    particle.y += particle.driftY * particle.speed + (0.25 + particle.speed) * force * 3;

    const distanceFromCenter = Math.hypot(particle.x - centerX, particle.y - centerY);
    if (distanceFromCenter < centerClearRadius) {
      const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
      particle.x += Math.cos(angle) * (1.8 + force * 5);
      particle.y += Math.sin(angle) * (1.8 + force * 5);
    }

    const shouldRespawn =
      particle.x < -40 ||
      particle.x > width + 40 ||
      particle.y < -40 ||
      particle.y > height + 40 ||
      Math.random() < 0.0008 + force * 0.003;

    if (shouldRespawn) {
      particles[index] = createParticle();
      return;
    }

    const flicker = 0.45 + Math.sin(particle.life) * 0.36 + Math.random() * 0.08;
    const alpha = Math.max(0, Math.min(0.86, particle.baseAlpha * flicker * (0.8 + force)));
    const glow = particle.size * (2.4 + force * 3.2);

    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.size + force * 0.9, 0, Math.PI * 2);
    particleContext.fillStyle = `rgba(245, 245, 245, ${alpha})`;
    particleContext.shadowBlur = glow;
    particleContext.shadowColor = `rgba(255, 255, 255, ${alpha * 0.5})`;
    particleContext.fill();
    particleContext.shadowBlur = 0;
  });

  scrollForce *= 0.9;
  requestAnimationFrame(drawParticles);
}

rail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const progress = index / apps.length;
  const top = stage.offsetTop + progress * (stage.offsetHeight - window.innerHeight);
  window.scrollTo({ top, behavior: "smooth" });
});

renderRail();
renderList();
setActiveApp(0, 0);
resizeParticles();
updateFromScroll();
drawParticles();

window.addEventListener("scroll", updateFromScroll, { passive: true });
window.addEventListener("resize", () => {
  resizeParticles();
  updateFromScroll();
});
