// Tiny dictionary-based i18n for the static pages. The active language
// lives in the URL (?lang=es) so shared links open in the sender's language;
// localStorage remembers it for direct visits.

import { ROUTES } from './routes';

export type Lang = 'en' | 'es';

const STORAGE_KEY = 'ftree-lang';
const DEFAULT_LANG: Lang = 'en';

type Entry = { en: string; es: string };

const MESSAGES: Record<string, Entry> = {
  // ── Shared chrome ────────────────────────────────────────────────
  'nav.why': { en: 'Why?', es: '¿Por qué?' },
  'nav.learn': { en: 'How?', es: '¿Cómo?' },
  'nav.generator': { en: 'Create!', es: '¡Crear!' },
  'nav.snowflake': { en: 'Snowflake', es: 'Copo' },
  'nav.create': { en: 'Your rule', es: 'Tu regla' },
  'footer.text': {
    en: 'Built with a single recursive rule · Open source on',
    es: 'Hecho con una sola regla recursiva · Código abierto en',
  },
  'theme.toLight': { en: 'Switch to light mode', es: 'Cambiar a modo claro' },
  'theme.toDark': { en: 'Switch to dark mode', es: 'Cambiar a modo oscuro' },
  'pager.next': { en: 'Next', es: 'Siguiente' },
  'pager.back': { en: 'Back', es: 'Atrás' },
  'pager.why': {
    en: 'Why is nature so beautiful?',
    es: '¿Por qué la naturaleza es tan bella?',
  },
  'pager.how': { en: 'How fractals work', es: 'Cómo funcionan los fractales' },
  'pager.tree': { en: 'Grow your own tree', es: 'Cultiva tu propio árbol' },
  'pager.snowflake': { en: 'Craft a snowflake', es: 'Crea un copo de nieve' },
  'pager.create': { en: 'Create your own fractal', es: 'Crea tu propio fractal' },
  'chapter.badge': {
    en: 'Chapter {n} of {total} · {label}',
    es: 'Capítulo {n} de {total} · {label}',
  },
  'chapter.why': { en: 'The wonder', es: 'El asombro' },
  'chapter.learn': { en: 'The trick', es: 'El truco' },
  'chapter.tree': { en: 'Your turn', es: 'Tu turno' },
  'chapter.snowflake': { en: 'The crystal', es: 'El cristal' },
  'chapter.create': { en: 'Your rule', es: 'Tu regla' },

  // ── Chapter 1: the wonder (index.html) ───────────────────────────
  'story.title': {
    en: 'Why Is Nature So Beautiful? · Fractal Tree Studio',
    es: '¿Por qué la naturaleza es tan bella? · Estudio de Árboles Fractales',
  },
  'story.hero.title': {
    en: 'Why is nature so <span class="text-accent">beautiful</span>?',
    es: '¿Por qué la naturaleza es tan <span class="text-accent">bella</span>?',
  },
  'story.hero.body': {
    en: 'Look closely at a tree. At a river seen from an airplane. At a tiny seashell. Nobody drew them — yet they capture our eyes like the finest works of art. <strong>Why?</strong>',
    es: 'Mira de cerca un árbol. Un río visto desde un avión. Una pequeña caracola. Nadie los dibujó — y aun así atrapan nuestra mirada como las mejores obras de arte. <strong>¿Por qué?</strong>',
  },
  'story.gallery.title': { en: 'Stop and look closely…', es: 'Detente y mira de cerca…' },
  'nature.shell': { en: 'Seashell spirals', es: 'Espirales de caracola' },
  'nature.fern': { en: 'Fern fronds', es: 'Hojas de helecho' },
  'nature.rivers': { en: 'Rivers & coastlines', es: 'Ríos y costas' },
  'nature.lightning': { en: 'Lightning bolts', es: 'Rayos' },
  'nature.snow': { en: 'Snowflakes', es: 'Copos de nieve' },
  'nature.broccoli': { en: 'Broccoli florets', es: 'Ramitos de brócoli' },
  'story.secret.title': { en: 'They all share a secret', es: 'Todas comparten un secreto' },
  'story.secret.body': {
    en: 'Every one of them is built from <strong>smaller copies of itself</strong>. A branch looks like a little tree. A side stream looks like a little river. Each broccoli floret is a mini broccoli. <strong>The part looks like the whole!</strong>',
    es: 'Cada una está construida con <strong>copias más pequeñas de sí misma</strong>. Una rama parece un arbolito. Un arroyo parece un pequeño río. Cada ramito de brócoli es un mini brócoli. <strong>¡La parte se parece al todo!</strong>',
  },
  'story.demo.caption': {
    en: "This tree is pure math — drawn by one tiny rule you'll learn in the next chapter.",
    es: 'Este árbol es pura matemática — dibujado por una reglita que aprenderás en el siguiente capítulo.',
  },
  'story.demo.regrow': { en: '🎲 Grow another one', es: '🎲 Cultivar otro' },
  'story.history.title': {
    en: 'The scientist who named the pattern',
    es: 'El científico que nombró el patrón',
  },
  'story.history.body1': {
    en: 'For centuries, math loved smooth shapes: circles, squares, triangles. But nature is not smooth — <strong>clouds are not circles, mountains are not triangles</strong>, and trees are definitely not squares.',
    es: 'Durante siglos, a las matemáticas les encantaron las formas lisas: círculos, cuadrados, triángulos. Pero la naturaleza no es lisa — <strong>las nubes no son círculos, las montañas no son triángulos</strong>, y los árboles desde luego no son cuadrados.',
  },
  'story.history.body2': {
    en: 'In <strong>1975</strong>, the mathematician <strong>Benoît Mandelbrot</strong> finally gave nature\'s rough, repeating shapes a name: <strong>fractals</strong>, from the Latin word <em>fractus</em> — "broken".',
    es: 'En <strong>1975</strong>, el matemático <strong>Benoît Mandelbrot</strong> por fin dio nombre a las formas rugosas y repetitivas de la naturaleza: <strong>fractales</strong>, de la palabra latina <em>fractus</em> — «roto».',
  },
  'story.def.title': { en: 'So, what is a fractal?', es: 'Entonces, ¿qué es un fractal?' },
  'story.def.body': {
    en: 'A fractal is <strong>a shape made of smaller copies of itself</strong>. Zoom into any piece and you find the same pattern again — smaller, but the same.',
    es: 'Un fractal es <strong>una forma hecha de copias más pequeñas de sí misma</strong>. Acércate a cualquier parte y encontrarás el mismo patrón otra vez — más pequeño, pero igual.',
  },
  'story.cta.title': { en: 'Ready to see the trick? ✨', es: '¿Listo para ver el truco? ✨' },
  'story.cta.body': {
    en: "It takes just one rule. Let's learn it — and then you'll grow trees of your own.",
    es: 'Basta una sola regla. Aprendámosla — y después cultivarás tus propios árboles.',
  },

  // ── Chapter 3: generator page ────────────────────────────────────
  'generator.title': {
    en: 'Grow Your Own Tree · Fractal Tree Studio',
    es: 'Cultiva tu propio árbol · Estudio de Árboles Fractales',
  },
  'conclusion.title': {
    en: 'So… why are trees so beautiful?',
    es: 'Entonces… ¿por qué los árboles son tan bellos?',
  },
  'conclusion.body1': {
    en: 'Because they follow a <strong>fractal rule</strong> — one simple pattern, repeated over and over — with <strong>a pinch of chaos</strong> sprinkled on top. The rule makes the pattern; the wildness makes it alive.',
    es: 'Porque siguen una <strong>regla fractal</strong> — un patrón sencillo, repetido una y otra vez — con <strong>una pizca de caos</strong> espolvoreada encima. La regla crea el patrón; la rebeldía lo hace vivir.',
  },
  'conclusion.body2': {
    en: "That's the beauty of math: from one tiny rule, endless one-of-a-kind trees. Next time you pass a tree, a river or a seashell, you'll see the secret pattern hiding inside. 🌳",
    es: 'Esa es la belleza de las matemáticas: de una reglita, infinitos árboles irrepetibles. La próxima vez que pases junto a un árbol, un río o una caracola, verás el patrón secreto que esconden. 🌳',
  },
  'conclusion.bridge': {
    en: "And trees are just the beginning. Take the very same rule, copy it <strong>six times around a center</strong>, and something much colder starts to grow — that's the next chapter.",
    es: 'Y los árboles son solo el principio. Toma la misma regla, cópiala <strong>seis veces alrededor de un centro</strong>, y algo mucho más frío empieza a crecer: ese es el próximo capítulo.',
  },
  'conclusion.restart': { en: '← Start the journey again', es: '← Empezar el viaje de nuevo' },
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

  // ── Chapter 4: snowflake page ────────────────────────────────────
  'snowflake.title': {
    en: 'Craft a Snowflake · Fractal Tree Studio',
    es: 'Crea un copo de nieve · Estudio de Árboles Fractales',
  },
  'snowflake.hero.title': {
    en: 'Craft your own <span class="text-accent">snowflake</span>',
    es: 'Crea tu propio <span class="text-accent">copo de nieve</span>',
  },
  'snowflake.hero.body': {
    en: 'The very trick that grows trees also grows snow: one rule, repeated six times around a center. Real crystals are almost perfectly symmetric, so this one needs barely any chaos — just a pinch of frost.',
    es: 'El mismo truco que cultiva árboles también cultiva nieve: una regla, repetida seis veces alrededor de un centro. Los cristales reales son casi perfectamente simétricos, así que este apenas necesita caos — solo una pizca de escarcha.',
  },
  'snowflake.outro.title': { en: 'One rule, six arms ❄️', es: 'Una regla, seis brazos ❄️' },
  'snowflake.outro.body': {
    en: 'Every flake here is a single recursive rule — <strong>grow a spike pair, keep going, shrink</strong> — copied six times around the middle. And the same trick draws far more than trees and snowflakes: <strong>ferns, bushes, crystals, even spirals</strong>. In the final chapter, <strong>you</strong> write the rule — and invent fractals nobody has ever seen.',
    es: 'Cada copo es una sola regla recursiva — <strong>brota un par de púas, sigue, encoge</strong> — copiada seis veces alrededor del centro. Y el mismo truco dibuja mucho más que árboles y copos: <strong>helechos, arbustos, cristales e incluso espirales</strong>. En el último capítulo, la regla la escribes <strong>tú</strong> — e inventas fractales que nadie ha visto.',
  },
  'section.sf.shape.note': {
    en: 'Six identical arms grow from the center; these knobs shape every arm at once.',
    es: 'Seis brazos idénticos crecen desde el centro; estos controles moldean todos los brazos a la vez.',
  },
  'control.sf.depth': { en: 'Generations', es: 'Generaciones' },
  'control.sf.branchAngle': { en: 'Spike angle', es: 'Ángulo de púas' },
  'control.sf.sideScale': { en: 'Spike size', es: 'Tamaño de púas' },
  'control.sf.spineScale': { en: 'Arm taper', es: 'Afinado del brazo' },
  'control.sf.size': { en: 'Flake size', es: 'Tamaño del copo' },
  'control.sf.jitter': { en: 'Frost', es: 'Escarcha' },
  'control.sf.animationSpeed': { en: 'Growth delay', es: 'Pausa de crecimiento' },
  'help.sf.depth': {
    en: 'How many generations of spikes each arm grows. Every extra generation puts smaller spikes on the previous ones — real crystals rarely need more than five.',
    es: 'Cuántas generaciones de púas crecen en cada brazo. Cada generación extra añade púas más pequeñas sobre las anteriores — los cristales reales rara vez necesitan más de cinco.',
  },
  'help.sf.branchAngle': {
    en: 'The angle between an arm and its side spikes. Real snow crystals branch at about 60°, thanks to the hexagonal shape of ice molecules.',
    es: 'El ángulo entre un brazo y sus púas laterales. Los cristales de nieve reales se ramifican a unos 60°, gracias a la forma hexagonal de las moléculas de hielo.',
  },
  'help.sf.sideScale': {
    en: 'How long each side spike is compared to the arm segment it grows from. Small values give delicate needles; large ones give feathery, fern-like arms.',
    es: 'Qué tan larga es cada púa lateral comparada con el segmento del que brota. Valores pequeños dan agujas delicadas; valores grandes, brazos plumosos como helechos.',
  },
  'help.sf.spineScale': {
    en: 'How much each arm shrinks as it grows outward. Lower values make compact, star-like flakes; higher ones make long, elegant arms.',
    es: 'Cuánto se encoge cada brazo al crecer hacia afuera. Valores bajos dan copos compactos como estrellas; valores altos, brazos largos y elegantes.',
  },
  'help.sf.size': {
    en: 'The length of the first segment of each arm, in pixels. Everything else scales from it.',
    es: 'El largo del primer segmento de cada brazo, en píxeles. Todo lo demás se escala a partir de él.',
  },
  'help.sf.jitter': {
    en: 'A tiny random wobble on every angle and length. Real flakes are almost — but never exactly — symmetric, so a few percent is all it takes to look natural.',
    es: 'Un pequeño temblor aleatorio en cada ángulo y largo. Los copos reales son casi — pero nunca exactamente — simétricos, así que unos pocos por ciento bastan para que parezca natural.',
  },
  'help.sf.animationSpeed': {
    en: 'A pause between segments while the crystal is drawn, so you can watch it grow spike by spike. Set it to 0 to draw instantly.',
    es: 'Una pausa entre segmentos mientras se dibuja el cristal, para verlo crecer púa a púa. Ponla en 0 para dibujarlo al instante.',
  },
  'color.arm': { en: 'Arms', es: 'Brazos' },
  'color.tip': { en: 'Tips', es: 'Puntas' },
  'btn.crystallize': { en: '❄️ Crystallize', es: '❄️ Cristalizar' },

  // ── Chapter 5: create-your-own page ──────────────────────────────
  'create.title': {
    en: 'Create Your Own Fractal · Fractal Tree Studio',
    es: 'Crea tu propio fractal · Estudio de Árboles Fractales',
  },
  'create.hero.title': {
    en: 'Create your <span class="text-accent">own fractal</span>',
    es: 'Crea tu <span class="text-accent">propio fractal</span>',
  },
  'create.hero.body': {
    en: "You've grown trees and snowflakes from ready-made rules — now write the rule yourself. Move the turtle, turn it, branch it, and let it call itself. Start from a known fractal below, or from a blank line.",
    es: 'Has cultivado árboles y copos con reglas ya hechas — ahora escribe tú la regla. Mueve la tortuga, gírala, ramifícala y deja que se llame a sí misma. Empieza desde un fractal conocido, o desde una línea en blanco.',
  },
  'create.formula.title': { en: 'The formula', es: 'La fórmula' },
  'create.presets': { en: 'Load a known fractal:', es: 'Carga un fractal conocido:' },
  'create.preset.custom': { en: '— your own —', es: '— el tuyo —' },
  'create.preset.tree': { en: '🌳 Tree', es: '🌳 Árbol' },
  'create.preset.snowflake': { en: '❄️ Snowflake', es: '❄️ Copo de nieve' },
  'create.preset.fern': { en: '🌿 Fern', es: '🌿 Helecho' },
  'create.preset.crystal': { en: '💠 Crystal', es: '💠 Cristal' },
  'create.preset.spiral': { en: '🌀 Spiral galaxy', es: '🌀 Galaxia espiral' },
  'create.preset.bush': { en: '🌱 Bush', es: '🌱 Arbusto' },
  'create.builder.title': { en: 'Build it step by step', es: 'Constrúyela paso a paso' },
  'create.builder.note': {
    en: 'The very same rule, as editable steps — change one side and the formula follows.',
    es: 'La misma regla, como pasos editables — cambia un lado y la fórmula lo sigue.',
  },
  'create.estimate': { en: '≈ {n} sticks will be drawn', es: '≈ se dibujarán {n} palitos' },
  'create.estimate.trim': {
    en: 'that is a lot! drawing stops at {max}',
    es: '¡son muchísimos! el dibujo se detiene en {max}',
  },
  'create.step.draw': { en: 'Draw a stick', es: 'Dibuja un palito' },
  'create.step.move': { en: 'Move (pen up)', es: 'Muévete (sin pintar)' },
  'create.step.turn': { en: 'Turn (+ left / − right)', es: 'Gira (+ izquierda / − derecha)' },
  'create.step.recurse': { en: 'Do it all again at…', es: 'Hazlo todo otra vez a…' },
  'create.step.branch': { en: 'Branch (side trip)', es: 'Rama (desvío)' },
  'create.step.ofLength': { en: 'of the size', es: 'del tamaño' },
  'create.step.remove': { en: 'Remove step', es: 'Quitar paso' },
  'create.step.moveUp': { en: 'Move step up', es: 'Subir el paso' },
  'create.step.moveDown': { en: 'Move step down', es: 'Bajar el paso' },
  'create.addStep': { en: '＋ Add a step…', es: '＋ Añadir un paso…' },
  'create.add.draw': { en: '✏️ Draw a stick', es: '✏️ Dibuja un palito' },
  'create.add.move': { en: '👣 Move without drawing', es: '👣 Muévete sin pintar' },
  'create.add.turnLeft': { en: '↰ Turn left 45°', es: '↰ Gira 45° a la izquierda' },
  'create.add.turnRight': { en: '↱ Turn right 45°', es: '↱ Gira 45° a la derecha' },
  'create.add.faceLeft': {
    en: '⬅️ Quarter turn left (90°)',
    es: '⬅️ Cuarto de giro a la izquierda (90°)',
  },
  'create.add.faceRight': {
    en: '➡️ Quarter turn right (90°)',
    es: '➡️ Cuarto de giro a la derecha (90°)',
  },
  'create.add.recurse': {
    en: '🔁 Do it all again (self-call)',
    es: '🔁 Hazlo todo otra vez (auto-llamada)',
  },
  'create.add.branch': { en: '🌿 Branch: turn + self-call', es: '🌿 Rama: giro + auto-llamada' },
  'control.cf.depth': { en: 'Repetitions', es: 'Repeticiones' },
  'control.cf.symmetry': { en: 'Symmetry', es: 'Simetría' },
  'control.cf.size': { en: 'Starting size', es: 'Tamaño inicial' },
  'control.cf.jitter': { en: 'Wildness', es: 'Rebeldía' },
  'control.cf.animationSpeed': { en: 'Growth delay', es: 'Pausa de crecimiento' },
  'control.cf.origin': { en: 'Grow from', es: 'Crece desde' },
  'create.origin.bottom': { en: 'the bottom, upward', es: 'abajo, hacia arriba' },
  'create.origin.center': { en: 'the center, outward', es: 'el centro, hacia afuera' },
  'help.cf.depth': {
    en: 'How many times the self-call (T) is allowed to happen. Each repetition runs your whole formula again, smaller — more repetitions, more detail, many more sticks.',
    es: 'Cuántas veces puede ocurrir la auto-llamada (T). Cada repetición ejecuta toda tu fórmula otra vez, más pequeña — más repeticiones, más detalle y muchos más palitos.',
  },
  'help.cf.symmetry': {
    en: 'Draws your whole formula this many times, rotated evenly around the starting point. 6 turns a single arm into a snowflake; 1 draws it just once.',
    es: 'Dibuja toda tu fórmula este número de veces, rotada uniformemente alrededor del punto de partida. Con 6, un solo brazo se vuelve un copo de nieve; con 1 se dibuja una sola vez.',
  },
  'help.cf.size': {
    en: 'The turtle&apos;s starting stick length in pixels. F1 draws exactly this long; every self-call shrinks it.',
    es: 'El largo inicial del palito de la tortuga, en píxeles. F1 dibuja exactamente este largo; cada auto-llamada lo encoge.',
  },
  'help.cf.jitter': {
    en: 'A random wobble on every turn and length, so the rule stops being perfect and starts looking alive — same idea as the tree generator.',
    es: 'Un temblor aleatorio en cada giro y largo, para que la regla deje de ser perfecta y empiece a parecer viva — la misma idea que en el generador de árboles.',
  },
  'help.cf.animationSpeed': {
    en: 'A pause between sticks while your fractal is drawn, so you can watch the turtle work. Set it to 0 to draw instantly.',
    es: 'Una pausa entre palitos mientras se dibuja tu fractal, para ver trabajar a la tortuga. Ponla en 0 para dibujarlo al instante.',
  },
  'help.cf.origin': {
    en: 'Where the turtle starts: at the bottom pointing up (good for trees) or in the middle (good for snowflakes, stars and spirals).',
    es: 'Dónde empieza la tortuga: abajo apuntando hacia arriba (ideal para árboles) o en el centro (ideal para copos, estrellas y espirales).',
  },
  'color.cf.main': { en: 'Lines', es: 'Líneas' },
  'btn.draw': { en: '✨ Draw it', es: '✨ Dibujar' },
  'dsl.err.unexpectedChar': {
    en: 'I don&apos;t know this symbol — use F, M, +, -, [, ] or T',
    es: 'No conozco este símbolo — usa F, M, +, -, [, ] o T',
  },
  'dsl.err.expectedNumber': {
    en: 'A turn needs a number of degrees, like +25 or -90',
    es: 'Un giro necesita un número de grados, como +25 o -90',
  },
  'dsl.err.unclosedBracket': {
    en: 'This [ never gets its closing ]',
    es: 'A este [ le falta su ] de cierre',
  },
  'dsl.err.unexpectedClose': {
    en: 'This ] has no matching [ before it',
    es: 'Este ] no tiene un [ que lo abra',
  },
  'dsl.err.emptyProgram': {
    en: 'The formula is empty — try F1 to draw a stick',
    es: 'La fórmula está vacía — prueba F1 para dibujar un palito',
  },
  'dsl.err.emptyBranch': {
    en: 'This branch [ ] is empty — put some steps inside',
    es: 'Esta rama [ ] está vacía — pon algunos pasos dentro',
  },
  'dsl.err.tooManyBranches': {
    en: 'Too many self-calls — a formula may use at most 5 T&apos;s',
    es: 'Demasiadas auto-llamadas — una fórmula puede usar como mucho 5 T',
  },
  'dsl.err.scaleOutOfRange': {
    en: 'This size factor is out of range (T needs 0.1–0.95, F and M need 0.05–3)',
    es: 'Este factor de tamaño está fuera de rango (T necesita 0.1–0.95; F y M, 0.05–3)',
  },
  'dsl.err.turnOutOfRange': {
    en: 'Turns must stay between -360 and +360 degrees',
    es: 'Los giros deben quedar entre -360 y +360 grados',
  },
  'dsl.err.tooDeepNesting': {
    en: 'Too many brackets inside brackets (4 levels max)',
    es: 'Demasiados corchetes dentro de corchetes (máximo 4 niveles)',
  },
  'dsl.err.noDraw': {
    en: 'The turtle never draws — add an F somewhere',
    es: 'La tortuga nunca dibuja — añade una F en alguna parte',
  },
  'section.cf.shape.note': {
    en: 'These knobs apply to the whole drawing; the formula decides its shape.',
    es: 'Estos controles afectan a todo el dibujo; la fórmula decide su forma.',
  },
  'create.guide.title': { en: 'How to write a formula', es: 'Cómo escribir una fórmula' },
  'create.guide.intro': {
    en: 'A formula is a list of orders for a <strong>turtle</strong> holding a pen. It starts pointing <strong>up</strong>, walks where you tell it, and the magic order <strong>T</strong> makes it run the whole formula again — smaller. That self-call is the recursion you met in chapter 2.',
    es: 'Una fórmula es una lista de órdenes para una <strong>tortuga</strong> que sostiene un lápiz. Empieza apuntando <strong>hacia arriba</strong>, camina adonde le digas, y la orden mágica <strong>T</strong> le hace ejecutar toda la fórmula otra vez — más pequeña. Esa auto-llamada es la recursión que conociste en el capítulo 2.',
  },
  'create.guide.f.title': { en: '✏️ Draw a stick', es: '✏️ Dibuja un palito' },
  'create.guide.f.body': {
    en: 'Walk forward drawing a line. The number is the length: <strong>1</strong> = the full current size, <strong>0.5</strong> = half of it.',
    es: 'Camina hacia adelante dibujando una línea. El número es el largo: <strong>1</strong> = el tamaño actual completo, <strong>0.5</strong> = la mitad.',
  },
  'create.guide.m.title': { en: '👣 Move without drawing', es: '👣 Muévete sin pintar' },
  'create.guide.m.body': {
    en: 'Same walk, but with the pen lifted — handy to leave gaps.',
    es: 'La misma caminata, pero con el lápiz levantado — útil para dejar huecos.',
  },
  'create.guide.turn.title': { en: '↪️ Turn', es: '↪️ Gira' },
  'create.guide.turn.body': {
    en: 'Rotate on the spot: <strong>+</strong> turns left, <strong>−</strong> turns right, the number is degrees. The turtle starts pointing up, so <strong>+90</strong> faces it left and <strong>-90</strong> faces it right.',
    es: 'Rota en el sitio: <strong>+</strong> gira a la izquierda, <strong>−</strong> a la derecha, el número son grados. La tortuga empieza apuntando hacia arriba, así que <strong>+90</strong> la deja mirando a la izquierda y <strong>-90</strong> a la derecha.',
  },
  'create.guide.branch.title': { en: '🌿 Branch', es: '🌿 Rama' },
  'create.guide.branch.body': {
    en: 'Everything inside brackets is a side trip: the turtle remembers where it was, does the trip, and <strong>snaps back</strong> to keep going from the same spot.',
    es: 'Todo lo que va entre corchetes es un desvío: la tortuga recuerda dónde estaba, hace el desvío y <strong>vuelve de golpe</strong> para seguir desde el mismo punto.',
  },
  'create.guide.t.title': { en: '🔁 The self-call', es: '🔁 La auto-llamada' },
  'create.guide.t.body': {
    en: 'Run the <strong>whole formula again</strong> from here, at 0.7× the size. This is what makes it a fractal! You can use up to <strong>five</strong> per formula — the tree uses two, the snowflake three.',
    es: 'Ejecuta <strong>toda la fórmula otra vez</strong> desde aquí, a 0.7× del tamaño. ¡Esto es lo que la hace un fractal! Puedes usar hasta <strong>cinco</strong> por fórmula — el árbol usa dos, el copo tres.',
  },
  'create.guide.comment.title': { en: '💬 Notes', es: '💬 Notas' },
  'create.guide.comment.body': {
    en: 'Anything after a <strong>#</strong> is ignored — leave yourself notes. Spaces and upper/lower case don&apos;t matter either.',
    es: 'Todo lo que va después de un <strong>#</strong> se ignora — déjate notas. Los espacios y las mayúsculas/minúsculas tampoco importan.',
  },
  'create.guide.example.title': {
    en: 'Read the tree formula aloud',
    es: 'Lee la fórmula del árbol en voz alta',
  },
  'create.guide.example.body': {
    en: '"<strong>Draw a stick</strong>. Side trip: <strong>turn left 25°</strong> and <strong>do all of this again at 70% size</strong>. Snap back. Side trip: <strong>turn right 25°</strong> and <strong>do it all again at 70%</strong>." That&apos;s the exact rule from chapter 2 — two self-calls, so the sticks double every generation.',
    es: '«<strong>Dibuja un palito</strong>. Desvío: <strong>gira 25° a la izquierda</strong> y <strong>haz todo esto otra vez al 70% del tamaño</strong>. Vuelve. Desvío: <strong>gira 25° a la derecha</strong> y <strong>hazlo todo otra vez al 70%</strong>.» Es exactamente la regla del capítulo 2 — dos auto-llamadas, así que los palitos se duplican en cada generación.',
  },
  'create.outro.title': {
    en: 'You made it to the last chapter 🎉',
    es: '¡Llegaste al último capítulo! 🎉',
  },
  'create.outro.body': {
    en: 'You started by wondering why trees are beautiful — and now you write the rules that grow them. Every fractal you invent here is yours: save it, share it, or walk the journey again with new eyes.',
    es: 'Empezaste preguntándote por qué los árboles son bellos — y ahora escribes las reglas que los hacen crecer. Cada fractal que inventes aquí es tuyo: guárdalo, compártelo o recorre el viaje otra vez con otros ojos.',
  },

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

  'learn.cta.title': { en: 'Now you know the secret 🤫', es: 'Ya conoces el secreto 🤫' },
  'learn.cta.body': {
    en: "One rule. Many repeats. Infinite trees. Go make one that's never existed before!",
    es: 'Una regla. Muchas repeticiones. Árboles infinitos. ¡Ve y crea uno que nunca haya existido!',
  },
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

export function t(key: string, params?: Record<string, string | number>): string {
  const entry = MESSAGES[key];
  if (!entry) return key;
  const text = entry[currentLang];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
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
export function localizeInternalLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    ROUTES.map((route) => `a[href^="./${route.file}"]`).join(', ')
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
