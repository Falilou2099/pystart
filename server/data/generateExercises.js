/**
 * Génère 300 exercices : 9 modules (34+34+34+33×6).
 * Types en rotation : mcq, truefalse, fill, findError.
 */

const MODULE_COUNTS = [34, 34, 34, 33, 33, 33, 33, 33, 33];

const MODULE_META = [
  { name: 'Premier contact', emoji: '👋', tag: 'débuter avec Python et la console' },
  { name: 'Variables & types', emoji: '📦', tag: 'noms, valeurs, int, str, float, bool' },
  { name: 'Conditions', emoji: '🔀', tag: 'if, else, elif, comparaisons' },
  { name: 'Boucles', emoji: '🔄', tag: 'for, while, range, break, continue' },
  { name: 'Listes & tuples', emoji: '📋', tag: 'index, slices, méthodes de liste' },
  { name: 'Fonctions', emoji: '🧩', tag: 'def, return, paramètres, portée' },
  { name: 'Dictionnaires & ensembles', emoji: '📖', tag: 'clés, valeurs, set' },
  { name: 'Fichiers & modules', emoji: '📁', tag: 'open, read, import' },
  { name: 'Projets & synthèse', emoji: '🚀', tag: 'mettre tout ensemble' },
];

const KINDS = ['mcq', 'truefalse', 'fill', 'findError'];

function mix(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function pick(rng, arr) {
  return arr[rng() % arr.length];
}

const ANALOGIES = [
  'Comme étiqueter des boîtes dans un grenier : le nom retrouve vite le contenu.',
  'Comme une recette de cuisine : les étapes dans l’ordre donnent le bon résultat.',
  'Comme un feu tricolore : selon la condition, tu choisis la branche à suivre.',
  'Comme une piste de danse répétée : la boucle rejoue le même pas jusqu’à la fin.',
  'Comme un carnet de contacts : une clé (nom) pointe vers une valeur (numéro).',
  'Comme des Lego : une fonction est un bloc que tu clipses où tu veux.',
];

// Banques QCM par thème (module 1..9) — indices 0..8
const MCQ_BANK = [
  [
    ['Que fait la fonction print() en Python ?', ['Écrit sur le disque dur', 'Affiche du texte dans la console', 'Compile le programme', 'Supprime des fichiers'], 1],
    ['Comment écrit-on un commentaire sur une ligne ?', ['// texte', '/* texte */', '# texte', '-- texte'], 2],
    ['Python est un langage…', ['uniquement compilé', 'interprété (avec une machine virtuelle)', 'uniquement bas niveau', 'réservé au web'], 1],
    ['Quel symbole délimite en général une chaîne de caractères ?', ['Accolades { }', 'Guillemets ou apostrophes', 'Crochets [ ]', 'Barres verticales | |'], 1],
    ['Que se passe-t-il si tu oublies une parenthèse fermante sur print(...) ?', ['Rien', 'Un SyntaxError', 'Un Warning seulement', 'Python corrige tout seul'], 1],
  ],
  [
    ['Quel mot-clé crée une variable en Python ?', ['var', 'let', 'Aucun mot-clé dédié — on assigne avec =', 'dim'], 2],
    ['Le type de 42 (sans guillemets) est…', ['str', 'float', 'int', 'bool'], 2],
    ['Le type de "42" (avec guillemets) est…', ['int', 'str', 'float', 'list'], 1],
    ['Quelle opération donne le reste de la division entière ?', ['/', '//', '%', '**'], 2],
    ['x += 3 équivaut à…', ['x = x + 3', 'x = 3', 'x = x - 3', 'x = x * 3'], 0],
  ],
  [
    ['Quel mot-clé introduit une condition ?', ['loop', 'if', 'when', 'check'], 1],
    ['elif signifie…', ['sinon si', 'fin du if', 'boucle sinon', 'erreur de syntaxe'], 0],
    ['Quelle comparaison teste l’égalité de valeurs ?', ['=', '==', '===', 'eq'], 1],
    ['not True vaut…', ['True', 'False', 'None', 'Erreur'], 1],
    ['Quelle structure permet plusieurs branches exclusives ?', ['if / if / if', 'if / elif / else', 'while / for', 'try / pass'], 1],
  ],
  [
    ['range(3) produit combien de valeurs ?', ['2', '3', '4', '0'], 1],
    ['while s’exécute tant que…', ['la condition est fausse', 'la condition est vraie', 'une seule fois', 'jamais'], 1],
    ['break dans une boucle…', ['passe à l’itération suivante', 'sort de la boucle', 'redémarre le programme', 'ignore le else du for'], 1],
    ['continue dans une boucle…', ['arrête tout', 'passe directement à l’itération suivante', 'efface la variable', 'crée une erreur'], 1],
    ['for i in range(2, 5) : i prend les valeurs…', ['2,3,4,5', '2,3,4', '3,4,5', '0,1,2'], 1],
  ],
  [
    ['L’indice du premier élément d’une liste est…', ['1', '0', '-1', 'first'], 1],
    ['Quelle méthode ajoute un élément à la fin d’une liste ?', ['push()', 'append()', 'add_end()', 'insert_last()'], 1],
    ['Quelle syntaxe donne une sous-liste (slice) ?', ['liste(a,b)', 'liste[a:b]', 'liste{a,b}', 'slice(liste)'], 1],
    ['len([1,2,3]) vaut…', ['2', '3', '4', '6'], 1],
    ['[1,2] + [3] donne…', ['[1,2,3]', '[4]', 'Erreur', '[1,2,[3]]'], 0],
  ],
  [
    ['Comment définit-on une fonction ?', ['function nom():', 'def nom():', 'fn nom():', 'fun nom():'], 1],
    ['return sans valeur explicite équivaut à renvoyer…', ['0', 'False', 'None', '""'], 2],
    ['Les arguments passés à l’appel s’appellent…', ['paramètres', 'arguments', 'tokens', 'slots'], 1],
    ['Une variable définie uniquement dans une fonction est…', ['globale', 'locale à la fonction', 'constante système', 'importée'], 1],
    ['def f(a, b=2) : b est…', ['obligatoire à l’appel', 'un paramètre avec valeur par défaut', 'interdit', 'global'], 1],
  ],
  [
    ['Un dictionnaire associe…', ['index → valeur', 'clé → valeur', 'bit → octet', 'fichier → ligne'], 1],
    ['Quelle syntaxe accède à la clé "nom" dans d ?', ['d.nom', 'd("nom")', 'd["nom"]', 'd{nom}'], 2],
    ['Un set en Python…', ['garde les doublons', 'ne garde pas les doublons', 'est toujours trié', 'n’existe pas'], 1],
    ['"a" in {"a":1, "b":2} teste…', ['la valeur 1', 'la présence de la clé "a"', 'la longueur', 'une erreur'], 1],
    ['dict.get("x", 0) si "x" absent…', ['lève KeyError', 'renvoie 0', 'renvoie None seulement', 'supprime la clé'], 1],
  ],
  [
    ['open("f.txt", "r") ouvre en…', ['écriture seule', 'lecture', 'binaire forcé', 'append interdit'], 1],
    ['with open(...) as f : garantit surtout…', ['plus de vitesse', 'une fermeture propre du fichier', 'le cryptage', 'la compilation'], 1],
    ['import math permet…', ['d’utiliser math.sqrt', 'de supprimer math', 'de créer un fichier math', 'rien'], 0],
    ['f.read() sans argument lit…', ['une ligne', 'le fichier entier (attention à la taille)', 'un octet', 'rien'], 1],
    ['Pour ajouter à la fin d’un fichier texte, on ouvre souvent en mode…', ['"r"', '"w"', '"a"', '"x" seulement'], 2],
  ],
  [
    ['Pour réutiliser du code proprement, on privilégie…', ['copier-coller massif', 'les fonctions et modules', 'une seule ligne géante', 'les variables globales uniquement'], 1],
    ['Un bon découpage d’un petit projet…', ['un seul fichier de 10 000 lignes', 'plusieurs fonctions claires', 'aucune fonction', 'tout en commentaires'], 1],
    ['Tester son code petit à petit permet…', ['de ralentir inutilement', 'de repérer les bugs plus tôt', "d'éviter Python", 'de supprimer les erreurs'], 1],
    ['La lisibilité du code…', ["n'aide personne", 'aide toi et les autres', 'est interdite en Python', 'est réservée aux experts'], 1],
    ['À la fin du parcours, l’objectif est surtout de…', ['mémoriser tout par cœur', 'comprendre les idées pour continuer à apprendre', 'abandonner', 'ne plus jamais coder'], 1],
  ],
];

const TF_BANK = [
  ['Python distingue majuscules et minuscules pour les noms de variables.', true],
  ['On peut nommer une variable 2x en Python.', false],
  ['Une chaîne vide "" est considérée comme False dans un booléen.', false],
  ['else peut être utilisé avec for ou while en Python.', true],
  ['list.append modifie la liste sur place.', true],
  ['Une fonction peut ne rien return explicite.', true],
  ['Les clés de dict doivent toujours être des chaînes.', false],
  ['with open(...) est une bonne pratique pour les fichiers.', true],
  ['import this est une blague cachée dans Python.', true],
  ['range(5) inclut le nombre 5.', false],
];

const FILL_BANK = [
  { mod: [0, 1], tpl: 'Affiche Bonjour : ___("Bonjour")', ans: 'print', alts: ['print'] },
  { mod: [0, 1], tpl: 'Commentaire : ___ Ceci est ignoré', ans: '#', alts: ['#'] },
  { mod: [1], tpl: 'x = 5\ny = 2\nprint(x ___ y)', ans: '+', alts: ['+', '-', '*', '/'] },
  { mod: [1], tpl: 'n = 10\nprint(n ___ 2 == 0)', ans: '%', alts: ['%'] },
  { mod: [2], tpl: 'if x > 0:\n    print("ok")\n___:\n    print("non")', ans: 'else', alts: ['else'] },
  { mod: [2], tpl: 'if a == b:\n    print("égal")\n___ a < b:\n    print("plus petit")', ans: 'elif', alts: ['elif'] },
  { mod: [3], tpl: 'for i in ___(3):\n    print(i)', ans: 'range', alts: ['range'] },
  { mod: [3], tpl: '___ compteur > 0:\n    compteur -= 1', ans: 'while', alts: ['while'] },
  { mod: [4], tpl: 'nums = [1,2,3]\nprint(nums___)', ans: '[0]', alts: ['[0]', '[-1]'] },
  { mod: [4], tpl: 't = [1,2]\nt.___(3)', ans: 'append', alts: ['append'] },
  { mod: [5], tpl: '___ carre(x):\n    return x*x', ans: 'def', alts: ['def'] },
  { mod: [5], tpl: 'def f():\n    ___ 42', ans: 'return', alts: ['return'] },
  { mod: [6], tpl: 'd = {}\nd["a"] = 1\nprint(d___)', ans: '["a"]', alts: ['["a"]', "['a']"] },
  { mod: [6], tpl: 's = {1,2,2,3}\nprint(___(s))', ans: 'len', alts: ['len'] },
  { mod: [7], tpl: 'f = ___("data.txt", "r", encoding="utf-8")', ans: 'open', alts: ['open'] },
  { mod: [7], tpl: '___ os\nprint(os.name)', ans: 'import', alts: ['import'] },
  { mod: [8], tpl: 'notes = [12,14,16]\nm = sum(notes)/___(notes)', ans: 'len', alts: ['len'] },
];

const FIND_ERR_BANK = [
  { mod: [0], wrong: 'print("Salut"', fixed: 'print("Salut")', expl: 'Il manque une parenthèse ou un guillemet fermant.' },
  { mod: [0], wrong: 'Print("hi")', fixed: 'print("hi")', expl: 'Python est sensible à la casse : print en minuscules.' },
  { mod: [1], wrong: '3nom = 1', fixed: 'nom3 = 1', expl: 'Un identifiant ne peut pas commencer par un chiffre.' },
  { mod: [1], wrong: 'a = 5\nb = "2"\nprint(a + b)', fixed: 'print(str(a) + b)', expl: 'Sans conversion, int + str provoque TypeError.' },
  { mod: [2], wrong: 'if x = 3:\n    pass', fixed: 'if x == 3:\n    pass', expl: 'Pour comparer, utilise == et non =.' },
  { mod: [3], wrong: 'for i in range(3)\n    print(i)', fixed: 'for i in range(3):\n    print(i)', expl: 'Il manque le deux-points à la fin du for.' },
  { mod: [4], wrong: 'L = [1,2,3]\nprint(L[3])', fixed: 'print(L[2])', expl: 'Les indices valides vont de 0 à len-1.' },
  { mod: [5], wrong: 'def f x:\n    return x', fixed: 'def f(x):\n    return x', expl: 'Les paramètres doivent être entre parenthèses.' },
  { mod: [6], wrong: 'd = {1: "a"}\nprint(d.1)', fixed: 'print(d[1])', expl: 'On accède aux clés avec des crochets, pas un point + nombre.' },
  { mod: [7], wrong: 'f = open("x.txt")\ndata = f.read()', fixed: 'with open("x.txt") as f:', expl: 'Utilise with open(...) as f: pour ouvrir et fermer le fichier proprement.' },
  { mod: [8], wrong: 'def moy(L):\n    return sum(L)/0', fixed: 'def moy(L):\n    return sum(L)/len(L)', expl: 'Diviser par zéro ou par une constante fausse la moyenne.' },
];

function buildMcq(mod, seed, rng, idxInMod) {
  const bank = MCQ_BANK[mod - 1];
  const row = bank[(idxInMod - 1 + seed) % bank.length];
  const [q0, opts0, c0] = row;
  const q = `${q0} (ex. ${idxInMod})`;
  return {
    kind: 'mcq',
    prompt: q,
    options: [...opts0],
    correctIndex: c0,
    explanation: 'Exact. La régularité sur 300 exercices, c’est ce qui ancre les bases.',
  };
}

function buildTf(seed, rng, idxInMod) {
  const row = TF_BANK[(seed + idxInMod) % TF_BANK.length];
  const [stmt, truth] = row;
  return {
    kind: 'truefalse',
    prompt: `${stmt} (ex. ${idxInMod})`,
    correctTrueFalse: truth,
    explanation: truth
      ? 'Oui, cette affirmation est vraie en Python.'
      : 'Non : en Python cette affirmation est fausse ou inexacte.',
  };
}

function buildFill(mod, seed, rng, idxInMod) {
  const candidates = FILL_BANK.filter((f) => f.mod.includes(mod - 1));
  const pool = candidates.length ? candidates : FILL_BANK;
  const f = pool[(seed + idxInMod) % pool.length];
  return {
    kind: 'fill',
    prompt: `Complète le code (module ${mod}, ex. ${idxInMod}) :`,
    codeTemplate: f.tpl.replace('___', '___'),
    blankAnswer: f.ans,
    acceptableAnswers: f.alts,
    explanation: `La réponse attendue est « ${f.ans} ». Relis la syntaxe du chapitre correspondant.`,
  };
}

function buildFindErr(mod, seed, rng, idxInMod) {
  const candidates = FIND_ERR_BANK.filter((f) => f.mod.includes(mod - 1));
  const pool = candidates.length ? candidates : FIND_ERR_BANK;
  const f = pool[(seed + idxInMod) % pool.length];
  return {
    kind: 'findError',
    prompt: 'Quelle ligne corrigée résout le problème ? (écris la ligne entière corrigée)',
    wrongCode: f.wrong,
    errorLineIndex: f.wrong.split('\n').length - 1,
    fixedLine: f.fixed.split('\n').pop() || f.fixed,
    explanation: f.expl,
  };
}

function buildOne({ mod, i, globalIdx, seed, kind }) {
  const rng = mix(seed);
  const meta = MODULE_META[mod - 1];
  const id = `m${mod}-e${String(i).padStart(3, '0')}`;
  const analogy = pick(rng, ANALOGIES);
  const encouragementWrong =
    'Ce n’est pas grave du tout : chaque essai compte. Relis l’énoncé calmement, tu progresses à chaque fois.';
  const hints = [
    `Pense au thème du module : ${meta.tag}.`,
    'Souvent la réponse tient en un mot-clé ou un symbole précis.',
    'En cas de doute, teste mentalement avec un petit exemple numérique.',
  ];

  let body;
  if (kind === 'mcq') body = buildMcq(mod, seed, rng, i);
  else if (kind === 'truefalse') body = buildTf(seed, rng, i);
  else if (kind === 'fill') body = buildFill(mod, seed, rng, i);
  else body = buildFindErr(mod, seed, rng, i);

  const title = `${meta.name} · Exercice ${i}`;
  const visualEmoji = meta.emoji;

  return Object.assign(
    {
      id,
      module: mod,
      order: i,
      title,
      analogy,
      visualEmoji,
      hints,
      encouragementWrong,
    },
    body
  );
}

function buildAll() {
  const out = [];
  let globalIdx = 0;
  for (let mod = 1; mod <= 9; mod++) {
    const n = MODULE_COUNTS[mod - 1];
    for (let i = 1; i <= n; i++) {
      const seed = globalIdx * 1103 + mod * 97 + i * 17;
      const kind = KINDS[globalIdx % 4];
      out.push(buildOne({ mod, i, globalIdx, seed, kind }));
      globalIdx++;
    }
  }
  return out;
}

const EXERCISES = buildAll();

module.exports = {
  EXERCISES,
  MODULE_META,
  MODULE_COUNTS,
  TOTAL_EXERCISES: EXERCISES.length,
};
