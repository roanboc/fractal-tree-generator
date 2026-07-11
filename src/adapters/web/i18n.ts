// Tiny dictionary-based i18n for the two static pages. The active language
// lives in the URL (?lang=es) so shared links open in the sender's language;
// localStorage remembers it for direct visits.

export type Lang = 'en' | 'es';

const STORAGE_KEY = 'ftree-lang';
const DEFAULT_LANG: Lang = 'en';

type Entry = { en: string; es: string };

const MESSAGES: Record<string, Entry> = {
  // ── Shared chrome ────────────────────────────────────────────────
  'nav.generator': { en: 'Generator', es: 'Generador' },
  'nav.learn': { en: 'Learn', es: 'Aprender' },
  'footer.text': {
    en: 'Built with a single recursive rule · Open source on',
    es: 'Hecho con una sola regla recursiva · Código abierto en',
  },
  'theme.toLight': { en: 'Switch to light mode', es: 'Cambiar a modo claro' },
  'theme.toDark': { en: 'Switch to dark mode', es: 'Cambiar a modo oscuro' },

  // ── Generator page ───────────────────────────────────────────────
  'index.title': { en: 'Fractal Tree Studio', es: 'Estudio de Árboles Fractales' },
  'hero.title': {
    en: 'Grow your own <span class="text-accent">fractal tree</span>',
    es: 'Cultiva tu propio <span class="text-accent">árbol fractal</span>',
  },
  'hero.body': {
    en: 'Every tree here is drawn from one simple rule, repeated over and over. Tune the sliders, hit <span class="font-semibold text-strong">Generate</span>, and watch a unique tree appear. New here? <a href="./learn.html" class="font-medium text-accent underline-offset-4 hover:underline">See how fractals work →</a>',
    es: 'Cada árbol se dibuja con una sola regla sencilla, repetida una y otra vez. Ajusta los controles, pulsa <span class="font-semibold text-strong">Generar</span> y mira aparecer un árbol único. ¿Primera vez? <a href="./learn.html" class="font-medium text-accent underline-offset-4 hover:underline">Mira cómo funcionan los fractales →</a>',
  },

  'section.shape': { en: 'Shape', es: 'Forma' },
  'section.style': { en: 'Style', es: 'Estilo' },
  'section.life': { en: 'Life', es: 'Vida' },
  'section.shape.note': {
    en: 'These are ranges: Wildness (below) decides where inside each range every branch lands.',
    es: 'Son rangos: la Rebeldía (abajo) decide en qué punto de cada rango cae cada rama.',
  },

  'control.depth': { en: 'Iterations', es: 'Iteraciones' },
  'control.angle': { en: 'Branch angle', es: 'Ángulo de rama' },
  'control.lengthFactor': { en: 'Shrink per level', es: 'Encogimiento por nivel' },
  'control.trunkLength': { en: 'Trunk length', es: 'Largo del tronco' },
  'control.lineWidth': { en: 'Trunk thickness', es: 'Grosor del tronco' },
  'control.randomness': { en: 'Wildness', es: 'Rebeldía' },
  'control.animationSpeed': { en: 'Growth delay', es: 'Pausa de crecimiento' },
  'control.colors': { en: 'Colors', es: 'Colores' },
  'color.trunk': { en: 'Trunk', es: 'Tronco' },
  'color.leaf': { en: 'Leaves', es: 'Hojas' },

  'help.depth': {
    en: 'How many times the branching rule repeats. Each branch tip stops growing somewhere inside this range, so a wide range gives an uneven, natural crown. More iterations means many more sticks: each extra one roughly doubles the tree.',
    es: 'Cuántas veces se repite la regla de ramificación. Cada punta deja de crecer en algún punto dentro de este rango, así que un rango amplio da una copa irregular y natural. Más iteraciones significa muchos más palitos: cada una extra casi duplica el árbol.',
  },
  'help.angle': {
    en: 'How far each new pair of branches opens away from its parent. Every split picks its own angle inside this range, so the left and right sides are never perfect mirrors — just like a real tree.',
    es: 'Cuánto se abren las nuevas ramas respecto a su rama madre. Cada bifurcación elige su propio ángulo dentro de este rango, así que el lado izquierdo y el derecho nunca son espejos perfectos — igual que en un árbol real.',
  },
  'help.lengthFactor': {
    en: 'How long each new branch is compared to its parent (×0.70 = 70% of the parent). Every branch picks its own value inside this range: low values give compact, bushy trees; high values give tall, lanky ones.',
    es: 'Qué tan larga es cada rama nueva comparada con su rama madre (×0.70 = 70% de la madre). Cada rama elige su propio valor dentro de este rango: valores bajos dan árboles compactos y tupidos; valores altos, árboles altos y desgarbados.',
  },
  'help.trunkLength': {
    en: 'The length of the very first stick, in pixels. Every other branch scales down from it, so this sets the overall size of the tree.',
    es: 'El largo del primer palito, en píxeles. Todas las demás ramas se reducen a partir de él, así que define el tamaño general del árbol.',
  },
  'help.lineWidth': {
    en: 'How thick the trunk is drawn. Branches automatically get thinner toward the tips, like real wood.',
    es: 'El grosor con que se dibuja el tronco. Las ramas se van afinando automáticamente hacia las puntas, como la madera de verdad.',
  },
  'help.randomness': {
    en: 'Wildness is how freely nature roams inside the ranges you set above. At 0% every branch uses the exact middle of each range, giving a perfectly regular tree. As you raise it, branches may land further from the middle — at 100% they can land anywhere in the ranges, so every tree is unique and wonderfully messy, like a real one.',
    es: 'La Rebeldía es la libertad con que la naturaleza se mueve dentro de los rangos que definiste arriba. Al 0% cada rama usa exactamente el centro de cada rango y el árbol sale perfectamente regular. Al subirla, las ramas pueden caer más lejos del centro — al 100% pueden caer en cualquier punto de los rangos, y cada árbol sale único y maravillosamente desordenado, como uno de verdad.',
  },
  'help.animationSpeed': {
    en: 'A pause between sticks while the tree is drawn, so you can watch it grow branch by branch. Set it to 0 to draw instantly.',
    es: 'Una pausa entre palitos mientras se dibuja el árbol, para verlo crecer rama a rama. Ponla en 0 para dibujarlo al instante.',
  },
  'help.colors': {
    en: 'Trunk paints the branches; Leaves paints the youngest sticks near the tips.',
    es: 'Tronco pinta las ramas; Hojas pinta los palitos más jóvenes, cerca de las puntas.',
  },

  'btn.generate': { en: '🌱 Generate', es: '🌱 Generar' },
  'btn.reset': { en: '↺ Reset to defaults', es: '↺ Restablecer valores' },
  'btn.clear': { en: 'Clear', es: 'Borrar' },
  'btn.download': { en: 'Save PNG', es: 'Guardar PNG' },
  'value.instant': { en: 'instant', es: 'al instante' },
  'info.show': { en: 'What does this do?', es: '¿Qué hace esto?' },

  // ── Learn page ───────────────────────────────────────────────────
  'learn.title': {
    en: 'How Fractals Work · Fractal Tree Studio',
    es: 'Cómo funcionan los fractales · Estudio de Árboles Fractales',
  },
  'learn.hero.title': { en: 'How do fractals work?', es: '¿Cómo funcionan los fractales?' },
  'learn.hero.body': {
    en: "A fractal is a picture made by following <strong>one simple rule</strong>, again and again and again. Each time you repeat the rule, the picture gets richer — that's called an <strong>iteration</strong>. Let's grow a tree, one iteration at a time!",
    es: 'Un fractal es un dibujo que se hace siguiendo <strong>una sola regla sencilla</strong>, una y otra y otra vez. Cada vez que repites la regla, el dibujo se enriquece — eso se llama una <strong>iteración</strong>. ¡Vamos a cultivar un árbol, iteración a iteración!',
  },
  'learn.rule.title': { en: 'The one and only rule', es: 'La única regla' },
  'learn.rule.step1.title': { en: '1. Draw a stick', es: '1. Dibuja un palito' },
  'learn.rule.step1.body': {
    en: 'Just one straight line. Easy!',
    es: 'Solo una línea recta. ¡Fácil!',
  },
  'learn.rule.step2.title': { en: '2. Split the top', es: '2. Divide la punta' },
  'learn.rule.step2.body': {
    en: 'At the tip, draw <strong>two smaller sticks</strong>, one leaning left and one leaning right.',
    es: 'En la punta, dibuja <strong>dos palitos más pequeños</strong>, uno inclinado a la izquierda y otro a la derecha.',
  },
  'learn.rule.step3.title': { en: '3. Repeat!', es: '3. ¡Repite!' },
  'learn.rule.step3.body': {
    en: "Do the same thing on <strong>every new stick</strong>. That's it. That's the whole trick.",
    es: 'Haz lo mismo en <strong>cada palito nuevo</strong>. Ya está. Ese es todo el truco.',
  },

  'learn.formula.title': {
    en: 'The rule, written as a formula',
    es: 'La regla, escrita como fórmula',
  },
  'learn.formula.intro': {
    en: 'Here is the entire recipe the computer follows — a rule that uses itself. That self-call is what mathematicians call <strong>recursion</strong>:',
    es: 'Esta es toda la receta que sigue el ordenador — una regla que se usa a sí misma. A esa auto-llamada los matemáticos la llaman <strong>recursión</strong>:',
  },
  'learn.formula.code': {
    en: 'tree(size) =\n  draw a stick of length size\n  tree(size × shrink)  ↖ tilted left\n  tree(size × shrink)  ↗ tilted right',
    es: 'árbol(tamaño) =\n  dibuja un palito de largo tamaño\n  árbol(tamaño × encogimiento)  ↖ inclinado a la izquierda\n  árbol(tamaño × encogimiento)  ↗ inclinado a la derecha',
  },
  'learn.formula.outro': {
    en: "That's all! <strong>tree</strong> calls <strong>tree</strong> twice, each time with a smaller size, until the sticks get tiny. And since every stick makes two more, after <strong>n</strong> rounds you have drawn <strong>2ⁿ − 1</strong> sticks in total.",
    es: '¡Eso es todo! <strong>árbol</strong> llama a <strong>árbol</strong> dos veces, cada vez con un tamaño más pequeño, hasta que los palitos quedan diminutos. Y como cada palito crea dos más, tras <strong>n</strong> rondas habrás dibujado <strong>2ⁿ − 1</strong> palitos en total.',
  },

  'learn.steps.title': { en: 'Watch it happen, step by step', es: 'Míralo pasar, paso a paso' },
  'learn.steps.intro': {
    en: 'These five little trees are drawn by the <strong>exact same code</strong> as the big generator — we just stop it earlier or later.',
    es: 'Estos cinco arbolitos los dibuja <strong>exactamente el mismo código</strong> que el generador grande — solo lo detenemos antes o después.',
  },
  'learn.steps.card1': { en: 'One little stick. 🌱', es: 'Un palito. 🌱' },
  'learn.steps.card2': { en: 'Split the top into two.', es: 'Divide la punta en dos.' },
  'learn.steps.card3': {
    en: 'Split every new tip again.',
    es: 'Divide otra vez cada punta nueva.',
  },
  'learn.steps.card4': { en: "Again! It's becoming a tree…", es: '¡Otra vez! Ya parece un árbol…' },
  'learn.steps.card5': {
    en: "Five rounds and it's fluffy! 🌳",
    es: '¡Cinco rondas y quedó frondoso! 🌳',
  },
  'learn.steps.count1': { en: '1 stick', es: '1 palito' },
  'learn.steps.count2': { en: '3 sticks', es: '3 palitos' },
  'learn.steps.count3': { en: '7 sticks', es: '7 palitos' },
  'learn.steps.count4': { en: '15 sticks', es: '15 palitos' },
  'learn.steps.count5': { en: '31 sticks', es: '31 palitos' },
  'learn.steps.pattern': {
    en: "Did you spot the pattern? Every round, the number of new tips <strong>doubles</strong>: 1, 2, 4, 8, 16… After just 12 rounds you'd have <strong>4,095 sticks</strong> — from one tiny rule!",
    es: '¿Viste el patrón? En cada ronda, el número de puntas nuevas <strong>se duplica</strong>: 1, 2, 4, 8, 16… ¡Tras solo 12 rondas tendrías <strong>4.095 palitos</strong> — a partir de una reglita!',
  },

  'learn.playground.title': { en: 'Try it yourself 🎮', es: 'Pruébalo tú 🎮' },
  'learn.playground.body': {
    en: 'Slide to choose how many times the rule repeats. Turn on <strong>watch it grow</strong> to see every stick drawn slowly, like a hand holding the pen.',
    es: 'Desliza para elegir cuántas veces se repite la regla. Activa <strong>verlo crecer</strong> para ver cada palito dibujarse despacio, como si una mano llevara el lápiz.',
  },
  'learn.playground.iterations': { en: 'Iterations', es: 'Iteraciones' },
  'learn.playground.watch': {
    en: 'Watch it grow, stick by stick 🐢',
    es: 'Verlo crecer, palito a palito 🐢',
  },
  'learn.playground.grow': { en: '🌱 Grow!', es: '🌱 ¡Crecer!' },
  'learn.playground.count': {
    en: 'That tree has <strong id="playground-count">31</strong> sticks — drawn by repeating the rule <strong id="playground-rounds">5</strong> times.',
    es: 'Ese árbol tiene <strong id="playground-count">31</strong> palitos — dibujados repitiendo la regla <strong id="playground-rounds">5</strong> veces.',
  },

  'learn.random.title': {
    en: 'Why do real trees look messy?',
    es: '¿Por qué los árboles reales se ven desordenados?',
  },
  'learn.random.body': {
    en: "Nature never repeats the rule <em>perfectly</em>. If we let every stick pick its own angle and size from a small range, the same rule grows a tree that looks alive — and <strong>no two are ever the same</strong>. That's exactly what the <strong>Wildness</strong> slider does in the generator.",
    es: 'La naturaleza nunca repite la regla <em>a la perfección</em>. Si dejamos que cada palito elija su propio ángulo y tamaño dentro de un pequeño rango, la misma regla produce un árbol que parece vivo — y <strong>no hay dos iguales</strong>. Eso es exactamente lo que hace el control de <strong>Rebeldía</strong> en el generador.',
  },
  'learn.random.tidy.title': { en: 'Perfect rule 🤖', es: 'Regla perfecta 🤖' },
  'learn.random.tidy.body': {
    en: 'Every split is exactly the same.',
    es: 'Cada bifurcación es exactamente igual.',
  },
  'learn.random.wild.title': {
    en: 'Rule + a little wiggle 🍃',
    es: 'Regla + un poco de vaivén 🍃',
  },
  'learn.random.wild.body': {
    en: 'Same rule, tiny random nudges.',
    es: 'La misma regla, con empujoncitos al azar.',
  },
  'learn.random.regrow': { en: '🎲 Grow two new trees', es: '🎲 Cultivar dos árboles nuevos' },

  'learn.everywhere.title': {
    en: 'Fractals hide everywhere',
    es: 'Los fractales se esconden en todas partes',
  },
  'learn.everywhere.broccoli': { en: 'Broccoli florets', es: 'Ramitos de brócoli' },
  'learn.everywhere.lightning': { en: 'Lightning bolts', es: 'Rayos' },
  'learn.everywhere.snow': { en: 'Snowflakes', es: 'Copos de nieve' },
  'learn.everywhere.lungs': { en: 'Your lungs!', es: '¡Tus pulmones!' },
  'learn.everywhere.rivers': { en: 'Rivers & coastlines', es: 'Ríos y costas' },
  'learn.everywhere.body': {
    en: "Next time you eat broccoli, look closely: each little floret looks like a tiny copy of the whole thing. That's the fractal secret — <strong>the part looks like the whole</strong>.",
    es: 'La próxima vez que comas brócoli, míralo de cerca: cada ramito parece una copia diminuta del brócoli entero. Ese es el secreto fractal — <strong>la parte se parece al todo</strong>.',
  },

  'learn.cta.title': { en: 'Now you know the secret 🤫', es: 'Ya conoces el secreto 🤫' },
  'learn.cta.body': {
    en: "One rule. Many repeats. Infinite trees. Go make one that's never existed before!",
    es: 'Una regla. Muchas repeticiones. Árboles infinitos. ¡Ve y crea uno que nunca haya existido!',
  },
  'learn.cta.button': { en: '🌳 Open the generator', es: '🌳 Abrir el generador' },
};

let currentLang: Lang = DEFAULT_LANG;

function readLangFromUrl(): Lang | null {
  const value = new URLSearchParams(window.location.search).get('lang');
  return value === 'en' || value === 'es' ? value : null;
}

/** Resolve the active language: URL beats localStorage beats default. */
export function initI18n(): Lang {
  const fromUrl = readLangFromUrl();
  const stored = localStorage.getItem(STORAGE_KEY);
  currentLang = fromUrl ?? (stored === 'en' || stored === 'es' ? stored : DEFAULT_LANG);
  syncLangArtifacts();
  return currentLang;
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  syncLangArtifacts();
  translatePage();
  window.dispatchEvent(new CustomEvent('ftree:langchange', { detail: { lang } }));
}

export function t(key: string): string {
  const entry = MESSAGES[key];
  if (!entry) return key;
  return entry[currentLang];
}

/** Keep <html lang> and the shareable URL (?lang=es) in sync. */
function syncLangArtifacts(): void {
  document.documentElement.lang = currentLang;
  const url = new URL(window.location.href);
  if (currentLang === DEFAULT_LANG) {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', currentLang);
  }
  window.history.replaceState(null, '', url);
}

/** Append the current language to internal page links so navigation keeps it. */
function localizeInternalLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a[href^="./index.html"], a[href^="./learn.html"]'
  );
  links.forEach((link) => {
    const url = new URL(link.getAttribute('href')!, window.location.href);
    if (currentLang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', currentLang);
    }
    link.href = `./${url.pathname.split('/').pop()}${url.search}`;
  });
}

/**
 * Translate every element tagged with data-i18n (text) or data-i18n-html
 * (dictionary-controlled markup), including the <title>.
 */
export function translatePage(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n!);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml!);
  });
  localizeInternalLinks();
}
