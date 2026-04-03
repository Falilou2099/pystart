/**
 * Génère 300 exercices bilingues (fr / en) : 9 modules.
 */

const MODULE_COUNTS = [34, 34, 34, 33, 33, 33, 33, 33, 33];

const MODULE_META = [
  { emoji: '👋', fr: { name: 'Premier contact', tag: 'débuter avec Python et la console' }, en: { name: 'Getting started', tag: 'Python basics and the console' } },
  { emoji: '📦', fr: { name: 'Variables & types', tag: 'noms, valeurs, int, str, float, bool' }, en: { name: 'Variables & types', tag: 'names, values, int, str, float, bool' } },
  { emoji: '🔀', fr: { name: 'Conditions', tag: 'if, else, elif, comparaisons' }, en: { name: 'Conditionals', tag: 'if, else, elif, comparisons' } },
  { emoji: '🔄', fr: { name: 'Boucles', tag: 'for, while, range, break, continue' }, en: { name: 'Loops', tag: 'for, while, range, break, continue' } },
  { emoji: '📋', fr: { name: 'Listes & tuples', tag: 'index, slices, méthodes de liste' }, en: { name: 'Lists & tuples', tag: 'index, slices, list methods' } },
  { emoji: '🧩', fr: { name: 'Fonctions', tag: 'def, return, paramètres, portée' }, en: { name: 'Functions', tag: 'def, return, parameters, scope' } },
  { emoji: '📖', fr: { name: 'Dictionnaires & ensembles', tag: 'clés, valeurs, set' }, en: { name: 'Dictionaries & sets', tag: 'keys, values, set' } },
  { emoji: '📁', fr: { name: 'Fichiers & modules', tag: 'open, read, import' }, en: { name: 'Files & modules', tag: 'open, read, import' } },
  { emoji: '🚀', fr: { name: 'Projets & synthèse', tag: 'mettre tout ensemble' }, en: { name: 'Projects & recap', tag: 'putting it all together' } },
];

/** Libellés de segment (tous modules) : contexte → exemple → vrai/faux → guidé → pratique → debug + synthèse. */
const SEGMENT_TITLES = {
  intro: { fr: 'Contexte', en: 'Context' },
  example: { fr: 'Exemple commenté', en: 'Worked example' },
  practice: { fr: 'Mise en pratique', en: 'Practice' },
  basics: { fr: 'Vrai ou faux', en: 'True or false' },
  guided: { fr: 'Consigne guidée', en: 'Guided task' },
  debug: { fr: 'Corrige le code', en: 'Fix the code' },
  recap: { fr: 'Synthèse du module', en: 'Module recap' },
};

const PEDAGOGY_CYCLE = [
  { kind: 'mcq', segment: 'intro' },
  { kind: 'mcq', segment: 'example' },
  { kind: 'truefalse', segment: 'basics' },
  { kind: 'fill', segment: 'guided' },
  { kind: 'mcq', segment: 'practice' },
  { kind: 'findError', segment: 'debug' },
];

/** Même proportion de QCM de synthèse que l’ancien module 1 (~5 sur 34). */
function recapCountForModuleSize(n) {
  return Math.max(4, Math.min(8, Math.round((n * 5) / 34)));
}

function buildPedagogyPlan(n) {
  const recapN = recapCountForModuleSize(n);
  const plan = [];
  for (let i = 0; i < n - recapN; i++) {
    plan.push(PEDAGOGY_CYCLE[i % PEDAGOGY_CYCLE.length]);
  }
  for (let j = 0; j < recapN; j++) {
    plan.push({ kind: 'mcq', segment: 'recap' });
  }
  if (plan.length !== n) throw new Error(`pedagogy plan length ${plan.length} != ${n}`);
  return plan;
}

const MODULE_PEDAGOGY_PLANS = MODULE_COUNTS.map((count) => buildPedagogyPlan(count));

function introPrefixesForMod(mod) {
  const m = MODULE_META[mod - 1];
  return [
    {
      fr: `Ce module porte sur : ${m.fr.tag}. Prends le temps de relier chaque notion à un petit exemple concret.\n\n`,
      en: `This module focuses on: ${m.en.tag}. Take time to connect each idea to a small concrete example.\n\n`,
    },
    {
      fr: `Objectif « ${m.fr.name} » : ${m.fr.tag}. Les questions d’introduction posent le vocabulaire et les repères.\n\n`,
      en: `Goal "${m.en.name}": ${m.en.tag}. Intro questions set vocabulary and landmarks.\n\n`,
    },
    {
      fr: `Avant les exercices plus techniques, assure-toi de comprendre le pourquoi : ${m.fr.tag}.\n\n`,
      en: `Before more technical tasks, grasp the why: ${m.en.tag}.\n\n`,
    },
    {
      fr: `Contexte : on travaille ${m.fr.tag}. Tente de formuler avec tes mots ce que tu dois maîtriser.\n\n`,
      en: `Context: we work on ${m.en.tag}. Try to state in your own words what you must master.\n\n`,
    },
    {
      fr: `Pense au module comme à une carte : ${m.fr.tag}. Chaque QCM d’introduction ajoute une couche de lecture.\n\n`,
      en: `Think of the module as a map: ${m.en.tag}. Each intro MCQ adds a layer of reading skills.\n\n`,
    },
  ];
}

function introPrefix(mod, idxInMod) {
  const arr = introPrefixesForMod(mod);
  return arr[(idxInMod - 1) % arr.length];
}

function recapPrefix(mod) {
  const m = MODULE_META[mod - 1];
  return {
    fr: `— Synthèse du module ${mod} (${m.fr.name}) —\nAvant de continuer, vérifie que les idées clés sont claires. Choisis la meilleure réponse.\n\n`,
    en: `— Module ${mod} recap (${m.en.name}) —\nBefore you continue, check that key ideas are clear. Pick the best answer.\n\n`,
  };
}

const PEDAGOGY_GUIDED_FILL_PREFIXES = [
  {
    fr: 'Lis toute la consigne avant de répondre. Tu dois compléter le code pour qu’il soit valide en Python 3.\n\n',
    en: 'Read the whole task before answering. Complete the code so it is valid Python 3.\n\n',
  },
  {
    fr: 'Travail guidé : imagine que tu expliques ton raisonnement à un camarade. Une seule réponse courte suffit (mot-clé ou symbole).\n\n',
    en: 'Guided work: imagine explaining your reasoning to a peer. One short answer is enough (keyword or symbol).\n\n',
  },
  {
    fr: 'Cet exercice est un peu plus long : le but est de relier la syntaxe à l’effet concret dans la console.\n\n',
    en: 'This task is a bit longer: connect the syntax to what actually happens in the console.\n\n',
  },
];

/** QCM « avec code dans l’énoncé » — module 1 uniquement (indices corrects alignés fr/en). */
const MODULE1_EXAMPLE_MCQ = [
  {
    fr: [
      'Observe cette session dans l’interpréteur interactif :\n\n>>> 7 + 3\n10\n\nQue représente la ligne « 10 » affichée ?',
      ['Une erreur bloquante', 'Le résultat renvoyé par Python après le calcul', 'Un commentaire ignoré', 'Le nom d’une variable créée automatiquement'],
      1,
    ],
    en: [
      'Look at this REPL session:\n\n>>> 7 + 3\n10\n\nWhat does the printed line “10” represent?',
      ['A fatal error', 'The value Python produced after evaluating the expression', 'A comment Python skipped', 'An auto-created variable name'],
      1,
    ],
  },
  {
    fr: [
      'Voici un petit programme sauvegardé dans hello.py :\n\nprint("Salut")\n\nQue verras-tu dans la console quand tu l’exécutes ?',
      ['Rien du tout', 'Salut (sans guillemets)', 'La ligne print("Salut") recopiée telle quelle', 'Une erreur car Salut n’est pas défini'],
      1,
    ],
    en: [
      'Here is a tiny script hello.py:\n\nprint("Hi")\n\nWhat will you see in the console when you run it?',
      ['Nothing', 'Hi (without quotes)', 'The line print("Hi") copied verbatim', 'An error because Hi is undefined'],
      1,
    ],
  },
  {
    fr: [
      'Code suivant :\n\n# -*- coding: utf-8 -*-\nx = 12\nprint(x)\n\nQue fait la première ligne commençant par # ?',
      ['Elle affiche du texte à l’écran', 'Elle est ignorée par Python (commentaire / métadonnée)', 'Elle définit une variable nommée utf-8', 'Elle est obligatoire dans tout fichier Python'],
      1,
    ],
    en: [
      'Code:\n\n# -*- coding: utf-8 -*-\nx = 12\nprint(x)\n\nWhat does the first line starting with # do?',
      ['It prints to the screen', 'Python ignores it (comment / metadata)', 'It defines a variable named utf-8', 'It is required in every Python file'],
      1,
    ],
  },
  {
    fr: [
      'Session interactive :\n\n>>> mot = "python"\n>>> len(mot)\n6\n\nPourquoi obtient-on 6 ?',
      ['Parce que "python" contient 6 caractères', 'Parce que len compte toujours jusqu’à 10', 'Parce que 6 est la valeur par défaut de mot', 'Parce que len additionne les lettres'],
      0,
    ],
    en: [
      'REPL session:\n\n>>> word = "python"\n>>> len(word)\n6\n\nWhy is the result 6?',
      ['Because "python" has 6 characters', 'Because len always counts up to 10', 'Because 6 is the default for word', 'Because len adds letters together'],
      0,
    ],
  },
  {
    fr: [
      'Deux instructions :\n\nprint("A")\nprint("B")\n\nQue se passe-t-il à l’exécution ?',
      ['Une seule ligne A', 'Deux lignes : A puis B', 'Une erreur : on ne peut pas enchaîner deux print', 'Python n’affiche que B'],
      1,
    ],
    en: [
      'Two statements:\n\nprint("A")\nprint("B")\n\nWhat happens when you run this?',
      ['Only one line A', 'Two lines: A then B', 'An error: two print calls are forbidden', 'Python prints only B'],
      1,
    ],
  },
  {
    fr: [
      'Erreur volontaire :\n\n>>> print("ok"\n  File "<stdin>", line 1\n    print("ok"\n              ^\nSyntaxError: unexpected EOF while parsing\n\nQuelle est la cause la plus probable ?',
      ['La chaîne "ok" est interdite', 'Il manque une parenthèse fermante', 'print n’existe pas en Python 3', 'Le terminal est hors ligne'],
      1,
    ],
    en: [
      'Deliberate error:\n\n>>> print("ok"\n  File "<stdin>", line 1\n    print("ok"\n              ^\nSyntaxError: unexpected EOF while parsing\n\nWhat is the most likely cause?',
      ['The string "ok" is forbidden', 'A closing parenthesis is missing', 'print does not exist in Python 3', 'The terminal is offline'],
      1,
    ],
  },
];

const MODULE2_EXAMPLE_MCQ = [
  {
    fr: [
      'Session :\n\n>>> a = 7\n>>> b = 2\n>>> print(a // b)\n3\n\nQue fait l’opérateur // ici ?',
      ['Division décimale habituelle', 'Division entière (quotient sans partie décimale)', 'Reste de la division', 'Puissance'],
      1,
    ],
    en: [
      'Session:\n\n>>> a = 7\n>>> b = 2\n>>> print(a // b)\n3\n\nWhat does // do here?',
      ['Normal decimal division', 'Floor division (integer quotient)', 'Modulo remainder', 'Exponentiation'],
      1,
    ],
  },
  {
    fr: [
      'Code :\n\nx = 3.0\nprint(type(x))\n\nQuel type affiche Python en général ?',
      ['int', 'float', 'str', 'bool'],
      1,
    ],
    en: [
      'Code:\n\nx = 3.0\nprint(type(x))\n\nWhat type does Python usually show?',
      ['int', 'float', 'str', 'bool'],
      1,
    ],
  },
  {
    fr: [
      '>>> s = "ha"\n>>> print(s * 3)\nhahaha\n\nQue modélise * entre une chaîne et un entier ?',
      ['Une erreur', 'La répétition de la chaîne', 'La concaténation avec un seul caractère', 'La conversion en liste'],
      1,
    ],
    en: [
      '>>> s = "ha"\n>>> print(s * 3)\nhahaha\n\nWhat does * between a string and an int mean?',
      ['An error', 'Repeat the string', 'Concatenate one character', 'Convert to a list'],
      1,
    ],
  },
  {
    fr: [
      '>>> bool([])\nFalse\n\nPourquoi une liste vide est-elle « fausse » en booléen ?',
      ['Python refuse les listes', 'Les conteneurs vides sont considérés comme False', 'C’est une erreur', 'True et False sont inversés'],
      1,
    ],
    en: [
      '>>> bool([])\nFalse\n\nWhy is an empty list "false" in boolean context?',
      ['Python rejects lists', 'Empty containers are treated as False', 'It is an error', 'True and False are swapped'],
      1,
    ],
  },
  {
    fr: [
      '>>> int("12")\n12\n\nQue fait int(...) sur une chaîne numérique valide ?',
      ['Affiche du texte', 'Convertit la chaîne en entier', 'Crée une liste', 'Supprime les guillemets sans changer le type'],
      1,
    ],
    en: [
      '>>> int("12")\n12\n\nWhat does int(...) do on a valid numeric string?',
      ['Prints text', 'Converts the string to int', 'Builds a list', 'Removes quotes but keeps str'],
      1,
    ],
  },
  {
    fr: [
      '>>> a, b = 1, 2\n>>> print(a, b)\n1 2\n\nComment appelle-t-on a, b = 1, 2 ?',
      ['Une erreur de syntaxe', 'Un déballage (unpacking) / affectation multiple', 'Une fonction', 'Un commentaire'],
      1,
    ],
    en: [
      '>>> a, b = 1, 2\n>>> print(a, b)\n1 2\n\nWhat is a, b = 1, 2 called?',
      ['A syntax error', 'Multiple assignment / unpacking', 'A function', 'A comment'],
      1,
    ],
  },
];

const MODULE3_EXAMPLE_MCQ = [
  {
    fr: [
      '>>> x = 4\n>>> x > 2\nTrue\n\nQue représente True ici ?',
      ['Une chaîne de caractères', 'Le résultat booléen de la comparaison', 'Une erreur', 'La valeur de x'],
      1,
    ],
    en: [
      '>>> x = 4\n>>> x > 2\nTrue\n\nWhat does True represent here?',
      ['A string', 'The boolean result of the comparison', 'An error', 'The value of x'],
      1,
    ],
  },
  {
    fr: [
      'Code :\n\nif score >= 10:\n    print("ok")\nelse:\n    print("retry")\n\nQue se passe-t-il si score vaut 10 ?',
      ['retry', 'ok', 'Rien', 'Erreur'],
      1,
    ],
    en: [
      'Code:\n\nif score >= 10:\n    print("ok")\nelse:\n    print("retry")\n\nWhat prints if score is 10?',
      ['retry', 'ok', 'Nothing', 'Error'],
      1,
    ],
  },
  {
    fr: [
      '>>> a = 5\n>>> b = 5\n>>> a == b\nTrue\n\n== compare…',
      ['Les identités mémoire uniquement', 'Les valeurs', 'Les types seulement', 'Les longueurs de chaîne seulement'],
      1,
    ],
    en: [
      '>>> a = 5\n>>> b = 5\n>>> a == b\nTrue\n\n== compares…',
      ['Memory identity only', 'Values', 'Types only', 'String lengths only'],
      1,
    ],
  },
  {
    fr: [
      '>>> x = 0\n>>> if x:\n...     print("yes")\n... else:\n...     print("no")\nno\n\nPourquoi "no" ?',
      ['0 est considéré comme faux en booléen', 'else est interdit', 'x n’existe pas', 'if ne fonctionne qu’avec des str'],
      0,
    ],
    en: [
      '>>> x = 0\n>>> if x:\n...     print("yes")\n... else:\n...     print("no")\nno\n\nWhy "no"?',
      ['0 is falsy in boolean context', 'else is forbidden', 'x does not exist', 'if only works with str'],
      0,
    ],
  },
  {
    fr: [
      'Chaînage :\n\nif a < 0:\n    print("neg")\nelif a == 0:\n    print("zero")\nelse:\n    print("pos")\n\nSi a est 0, que s’affiche ?',
      ['neg', 'zero', 'pos', 'Les trois lignes'],
      1,
    ],
    en: [
      'Chained:\n\nif a < 0:\n    print("neg")\nelif a == 0:\n    print("zero")\nelse:\n    print("pos")\n\nIf a is 0, what prints?',
      ['neg', 'zero', 'pos', 'All three'],
      1,
    ],
  },
  {
    fr: [
      '>>> not (True and False)\nTrue\n\nCar and donne False, puis not…',
      ['inverse le booléen', 'supprime la variable', 'lève une erreur', 'renvoie toujours False'],
      0,
    ],
    en: [
      '>>> not (True and False)\nTrue\n\nBecause and yields False, then not…',
      ['negates the boolean', 'deletes the variable', 'raises an error', 'always returns False'],
      0,
    ],
  },
];

const MODULE4_EXAMPLE_MCQ = [
  {
    fr: [
      'Code :\n\nfor i in range(3):\n    print(i)\n\nQuelle sortie (une ligne par nombre) ?',
      ['1 puis 2 puis 3', '0 puis 1 puis 2', '3 fois "i"', 'Erreur : range interdit'],
      1,
    ],
    en: [
      'Code:\n\nfor i in range(3):\n    print(i)\n\nWhat is printed (one number per line)?',
      ['1 then 2 then 3', '0 then 1 then 2', 'the letter i three times', 'Error: range forbidden'],
      1,
    ],
  },
  {
    fr: [
      '>>> list(range(2, 5))\n[2, 3, 4]\n\nLa borne droite de range(2, 5) est…',
      ['incluse (5 apparaît)', 'exclue (s’arrête avant 5)', 'toujours 0', 'ignorée'],
      1,
    ],
    en: [
      '>>> list(range(2, 5))\n[2, 3, 4]\n\nThe right end of range(2, 5) is…',
      ['inclusive (5 appears)', 'exclusive (stops before 5)', 'always 0', 'ignored'],
      1,
    ],
  },
  {
    fr: [
      'n = 2\nwhile n > 0:\n    print(n)\n    n -= 1\n\nCombien de lignes numériques s’affichent ?',
      ['0', '1', '2', '3'],
      2,
    ],
    en: [
      'n = 2\nwhile n > 0:\n    print(n)\n    n -= 1\n\nHow many numeric lines print?',
      ['0', '1', '2', '3'],
      2,
    ],
  },
  {
    fr: [
      'for i in [10, 20]:\n    if i == 10:\n        continue\n    print(i)\n\nQue vois-tu ?',
      ['10 puis 20', 'seulement 20', 'seulement 10', 'rien'],
      1,
    ],
    en: [
      'for i in [10, 20]:\n    if i == 10:\n        continue\n    print(i)\n\nWhat do you see?',
      ['10 then 20', 'only 20', 'only 10', 'nothing'],
      1,
    ],
  },
  {
    fr: [
      'for i in range(1):\n    break\nelse:\n    print("done")\n\nQue s’affiche ?',
      ['done', 'Rien (else du for ignoré après break)', 'Erreur', '0'],
      1,
    ],
    en: [
      'for i in range(1):\n    break\nelse:\n    print("done")\n\nWhat prints?',
      ['done', 'Nothing (for-else skipped after break)', 'Error', '0'],
      1,
    ],
  },
  {
    fr: [
      'Quelle boucle est adaptée quand on ne connaît pas d’avance le nombre d’itérations mais une condition d’arrêt ?',
      ['for uniquement', 'while', 'if', 'def'],
      1,
    ],
    en: [
      'Which loop fits when you do not know the iteration count upfront but have a stop condition?',
      ['for only', 'while', 'if', 'def'],
      1,
    ],
  },
];

const MODULE5_EXAMPLE_MCQ = [
  {
    fr: [
      '>>> nums = [5, 6, 7]\n>>> nums[1]\n6\n\nPourquoi l’indice 1 donne 6 ?',
      ['Les indices commencent à 1', 'Les indices commencent à 0', '6 est la longueur', 'Erreur'],
      1,
    ],
    en: [
      '>>> nums = [5, 6, 7]\n>>> nums[1]\n6\n\nWhy does index 1 yield 6?',
      ['Indices start at 1', 'Indices start at 0', '6 is the length', 'Error'],
      1,
    ],
  },
  {
    fr: [
      '>>> t = [1, 2, 3]\n>>> t[-1]\n3\n\n-1 désigne…',
      ['une erreur', 'le dernier élément', 'le premier', 'la longueur'],
      1,
    ],
    en: [
      '>>> t = [1, 2, 3]\n>>> t[-1]\n3\n\n-1 means…',
      ['an error', 'the last element', 'the first', 'the length'],
      1,
    ],
  },
  {
    fr: [
      '>>> [10, 20, 30][1:3]\n[20, 30]\n\nLe slice [1:3]…',
      ['inclut l’indice 3', 's’arrête avant l’indice 3', 'inverse la liste', 'supprime la liste'],
      1,
    ],
    en: [
      '>>> [10, 20, 30][1:3]\n[20, 30]\n\nThe slice [1:3]…',
      ['includes index 3', 'stops before index 3', 'reverses the list', 'deletes the list'],
      1,
    ],
  },
  {
    fr: [
      'L = []\nL.append(4)\nprint(L)\n\nRésultat ?',
      ['[]', '[4]', '4', 'Erreur'],
      1,
    ],
    en: [
      'L = []\nL.append(4)\nprint(L)\n\nResult?',
      ['[]', '[4]', '4', 'Error'],
      1,
    ],
  },
  {
    fr: [
      'a = (1, 2)\n# a[0] = 9\n\nPourquoi commenter cette ligne est souvent nécessaire ?',
      ['Les tuples sont immuables : on ne change pas un élément sur place', 'Les tuples n’existent pas', 'tuple n’a pas d’indices', 'Python interdit 1 et 2'],
      0,
    ],
    en: [
      'a = (1, 2)\n# a[0] = 9\n\nWhy is commenting this line often necessary?',
      ['Tuples are immutable: you cannot assign to an element in place', 'Tuples do not exist', 'tuple has no indices', 'Python forbids 1 and 2'],
      0,
    ],
  },
  {
    fr: [
      '>>> len([1, [2, 3]])\n2\n\nPourquoi 2 ?',
      ['Parce que la liste a deux éléments de premier niveau', 'Parce que 2+3=5 puis erreur', 'len compte les caractères', 'Erreur'],
      0,
    ],
    en: [
      '>>> len([1, [2, 3]])\n2\n\nWhy 2?',
      ['Because the outer list has two top-level items', 'Because 2+3=5 then error', 'len counts characters', 'Error'],
      0,
    ],
  },
];

const MODULE6_EXAMPLE_MCQ = [
  {
    fr: [
      'Code :\n\ndef carre(n):\n    return n * n\n\nprint(carre(3))\n\nSortie ?',
      ['3', '9', 'carre', 'None'],
      1,
    ],
    en: [
      'Code:\n\ndef square(n):\n    return n * n\n\nprint(square(3))\n\nOutput?',
      ['3', '9', 'square', 'None'],
      1,
    ],
  },
  {
    fr: [
      'def f():\n    pass\nprint(f())\n\nQue affiche print ?',
      ['pass', 'None', 'Erreur', 'f'],
      1,
    ],
    en: [
      'def f():\n    pass\nprint(f())\n\nWhat does print show?',
      ['pass', 'None', 'Error', 'f'],
      1,
    ],
  },
  {
    fr: [
      'def add(a, b=1):\n    return a + b\n\nprint(add(5))\n\nRésultat ?',
      ['5', '6', '1', 'Erreur'],
      1,
    ],
    en: [
      'def add(a, b=1):\n    return a + b\n\nprint(add(5))\n\nResult?',
      ['5', '6', '1', 'Error'],
      1,
    ],
  },
  {
    fr: [
      'x = 1\ndef g():\n    x = 2\n    return x\nprint(g(), x)\n\nSortie typique ?',
      ['2 1', '2 2', '1 1', 'Erreur'],
      0,
    ],
    en: [
      'x = 1\ndef g():\n    x = 2\n    return x\nprint(g(), x)\n\nTypical output?',
      ['2 1', '2 2', '1 1', 'Error'],
      0,
    ],
  },
  {
    fr: [
      'def h(a, b):\n    return a - b\n\nprint(h(b=1, a=3))\n\nValeur ?',
      ['2', '-2', 'Erreur', '1'],
      0,
    ],
    en: [
      'def h(a, b):\n    return a - b\n\nprint(h(b=1, a=3))\n\nValue?',
      ['2', '-2', 'Error', '1'],
      0,
    ],
  },
  {
    fr: [
      'Un return à l’intérieur d’une fonction…',
      ['termine la fonction et renvoie une valeur au point d’appel', 'efface le fichier', 'redémarre Python', 'est interdit avec def'],
      0,
    ],
    en: [
      'A return inside a function…',
      ['ends the function and sends a value back to the caller', 'deletes the file', 'restarts Python', 'is forbidden with def'],
      0,
    ],
  },
];

const MODULE7_EXAMPLE_MCQ = [
  {
    fr: [
      '>>> d = {"a": 1, "b": 2}\n>>> d["a"]\n1\n\nComment accède-t-on à la valeur de la clé "a" ?',
      ['d.a', 'd["a"]', 'd(a)', 'd{a}'],
      1,
    ],
    en: [
      '>>> d = {"a": 1, "b": 2}\n>>> d["a"]\n1\n\nHow do you read the value for key "a"?',
      ['d.a', 'd["a"]', 'd(a)', 'd{a}'],
      1,
    ],
  },
  {
    fr: [
      '>>> "b" in {"a":1, "b":2}\nTrue\n\nLe test in sur un dict vérifie…',
      ['la présence d’une valeur', 'la présence d’une clé', 'la longueur', 'le type'],
      1,
    ],
    en: [
      '>>> "b" in {"a":1, "b":2}\nTrue\n\nin on a dict checks…',
      ['a value exists', 'a key exists', 'length', 'type'],
      1,
    ],
  },
  {
    fr: [
      '>>> d = {}\n>>> d.get("x", 0)\n0\n\nPourquoi pas d’erreur ?',
      ['get renvoie la valeur par défaut si la clé manque', 'Python crée toujours "x"', 'get est interdit', 'dict vide interdit'],
      0,
    ],
    en: [
      '>>> d = {}\n>>> d.get("x", 0)\n0\n\nWhy no error?',
      ['get returns the default if the key is missing', 'Python always creates "x"', 'get is forbidden', 'empty dict forbidden'],
      0,
    ],
  },
  {
    fr: [
      '>>> s = {1, 2, 2, 3}\n>>> len(s)\n3\n\nPourquoi 3 éléments ?',
      ['Le set supprime les doublons', '2 compte double', 'len est cassé', 'Erreur'],
      0,
    ],
    en: [
      '>>> s = {1, 2, 2, 3}\n>>> len(s)\n3\n\nWhy 3 elements?',
      ['A set removes duplicates', '2 counts twice', 'len is broken', 'Error'],
      0,
    ],
  },
  {
    fr: [
      '>>> {k: k*2 for k in [1,2]}\n{1: 2, 2: 4}\n\nCette syntaxe est…',
      ['une dict comprehension', 'une liste', 'une erreur', 'un set'],
      0,
    ],
    en: [
      '>>> {k: k*2 for k in [1,2]}\n{1: 2, 2: 4}\n\nThis syntax is…',
      ['a dict comprehension', 'a list', 'an error', 'a set'],
      0,
    ],
  },
  {
    fr: [
      'Clés de dictionnaire : lesquelles sont en général interdites ?',
      ['Les chaînes', 'Les objets mutables non hashables (ex. liste comme clé)', 'Les entiers', 'Les tuples immuables'],
      1,
    ],
    en: [
      'Dict keys: which are usually forbidden?',
      ['Strings', 'Mutable unhashable objects (e.g. list as key)', 'Ints', 'Immutable tuples'],
      1,
    ],
  },
];

const MODULE8_EXAMPLE_MCQ = [
  {
    fr: [
      'Code :\n\nwith open("data.txt", "r", encoding="utf-8") as f:\n    texte = f.read()\n\nwith garantit surtout…',
      ['d’accélérer la lecture', 'une fermeture propre du fichier même en cas d’erreur', 'de crypter le fichier', 'd’écrire sans lire'],
      1,
    ],
    en: [
      'Code:\n\nwith open("data.txt", "r", encoding="utf-8") as f:\n    text = f.read()\n\nwith mainly ensures…',
      ['faster reading', 'the file is closed cleanly even on error', 'encryption', 'writing without reading'],
      1,
    ],
  },
  {
    fr: [
      'open("out.txt", "w") ouvre en écriture : que se passe-t-il souvent si le fichier existait ?',
      ['On ajoute à la fin sans effacer', 'Le contenu est en général écrasé', 'Python refuse', 'Lecture seule'],
      1,
    ],
    en: [
      'open("out.txt", "w") opens for write: if the file already exists, what usually happens?',
      ['Append without wiping', 'Content is usually overwritten', 'Python refuses', 'Read-only'],
      1,
    ],
  },
  {
    fr: [
      'import math\nprint(math.sqrt(9))\n\nPourquoi le préfixe math. ?',
      ['sqrt est dans le module math', 'sqrt est un mot-clé', 'math est optionnel', 'Erreur'],
      0,
    ],
    en: [
      'import math\nprint(math.sqrt(9))\n\nWhy the math. prefix?',
      ['sqrt lives in module math', 'sqrt is a keyword', 'math is optional', 'Error'],
      0,
    ],
  },
  {
    fr: [
      'from pathlib import Path\np = Path("a.txt")\n\nPath sert à…',
      ['remplacer Python', 'représenter des chemins de fichiers de façon pratique', 'compiler', 'supprimer le disque'],
      1,
    ],
    en: [
      'from pathlib import Path\np = Path("a.txt")\n\nPath is for…',
      ['replacing Python', 'handling file paths conveniently', 'compiling', 'wiping the disk'],
      1,
    ],
  },
  {
    fr: [
      'f = open("x.txt", "r", encoding="utf-8")\n\nPourquoi préciser encoding="utf-8" ?',
      ['Pour lire correctement du texte Unicode (accents, etc.)', 'C’est obligatoire pour tous les binaires', 'Pour interdire la lecture', 'Sans effet'],
      0,
    ],
    en: [
      'f = open("x.txt", "r", encoding="utf-8")\n\nWhy specify encoding="utf-8"?',
      ['To read Unicode text correctly (accents, etc.)', 'Required for all binary files', 'To forbid reading', 'No effect'],
      0,
    ],
  },
  {
    fr: [
      'Mode "a" sur open signifie souvent…',
      ['lecture seule', 'écriture en ajoutant à la fin', 'effacement du disque', 'exécution'],
      1,
    ],
    en: [
      'Mode "a" on open usually means…',
      ['read only', 'write by appending at the end', 'disk wipe', 'execution'],
      1,
    ],
  },
];

const MODULE9_EXAMPLE_MCQ = [
  {
    fr: [
      'def moyenne(notes):\n    return sum(notes) / len(notes)\nprint(moyenne([10, 20, 30]))\n\nRésultat ?',
      ['10', '20', '60', 'Erreur'],
      1,
    ],
    en: [
      'def average(scores):\n    return sum(scores) / len(scores)\nprint(average([10, 20, 30]))\n\nResult?',
      ['10', '20', '60', 'Error'],
      1,
    ],
  },
  {
    fr: [
      'Pour découper un petit projet Python, bon réflexe :',
      ['un seul fichier de 20 000 lignes', 'plusieurs fonctions / petits modules avec des responsabilités claires', 'zéro fonction', 'tout en variables globales'],
      1,
    ],
    en: [
      'To structure a small Python project, a good habit is:',
      ['one 20,000-line file', 'several functions / small modules with clear roles', 'no functions', 'everything global'],
      1,
    ],
  },
  {
    fr: [
      'def normaliser(mots):\n    return [m.strip().lower() for m in mots]\n\nnormaliser(["  A ", "B"]) donne…',
      ['["a", "b"]', '["A", "B"]', 'Erreur', '[]'],
      0,
    ],
    en: [
      'def normalize(words):\n    return [w.strip().lower() for w in words]\n\nnormalize(["  A ", "B"]) yields…',
      ['["a", "b"]', '["A", "B"]', 'Error', '[]'],
      0,
    ],
  },
  {
    fr: [
      'Avant d’ajouter une grosse fonctionnalité, il est souvent sage de…',
      ['coder sans tester', 'tester sur de petits exemples et relire les erreurs', 'supprimer les messages d’erreur', 'copier 50 pages sans lire'],
      1,
    ],
    en: [
      'Before adding a big feature, it is often wise to…',
      ['code without testing', 'test on small examples and read errors', 'delete error messages', 'paste 50 pages unread'],
      1,
    ],
  },
  {
    fr: [
      'if __name__ == "__main__": dans un script sert souvent à…',
      ['désactiver Python', 'n’exécuter du code que lorsque le fichier est lancé directement', 'importer tout le web', 'créer une variable interdite'],
      1,
    ],
    en: [
      'if __name__ == "__main__": in a script often…',
      ['disables Python', 'runs code only when the file is executed directly', 'imports the whole web', 'creates a forbidden variable'],
      1,
    ],
  },
  {
    fr: [
      'Lisibilité : un nom de fonction calculer_moyenne est préférable à…',
      ['f', 'x123', 'Les deux sont équivalents', 'def sans nom'],
      0,
    ],
    en: [
      'Readability: a name like compute_average is preferable to…',
      ['f', 'x123', 'they are equivalent', 'def with no name'],
      0,
    ],
  },
];

const EXAMPLE_MCQ_BY_MODULE = [
  MODULE1_EXAMPLE_MCQ,
  MODULE2_EXAMPLE_MCQ,
  MODULE3_EXAMPLE_MCQ,
  MODULE4_EXAMPLE_MCQ,
  MODULE5_EXAMPLE_MCQ,
  MODULE6_EXAMPLE_MCQ,
  MODULE7_EXAMPLE_MCQ,
  MODULE8_EXAMPLE_MCQ,
  MODULE9_EXAMPLE_MCQ,
];

/** QCM supplémentaires module 1 (en plus de MCQ_BANK_FR[0] / EN[0]). */
const MODULE1_MCQ_EXTRA = [
  {
    fr: ['Quelle extension de fichier est la plus courante pour un script Python ?', ['.js', '.py', '.java', '.txt'], 1],
    en: ['Which file extension is most common for a Python script?', ['.js', '.py', '.java', '.txt'], 1],
  },
  {
    fr: ['Dans un terminal, la commande typique pour lancer Python 3 est souvent…', ['java', 'node', 'python3 ou py -3', 'gcc'], 2],
    en: ['In a terminal, a typical command to start Python 3 is…', ['java', 'node', 'python3 or py -3', 'gcc'], 2],
  },
  {
    fr: ['Le symbole >>> dans la console interactive signifie en général…', ['que Python a planté', "que l'interpréteur attend ta prochaine instruction", 'qu’il faut redémarrer l’ordinateur', 'que le programme est compilé'], 1],
    en: ['The >>> prompt in the interactive console usually means…', ['Python has crashed', 'the interpreter is waiting for your next input', 'you must reboot', 'the program is compiled'], 1],
  },
  {
    fr: ['Un script .py exécuté depuis le terminal est lu…', ['ligne par ligne par un navigateur', 'par l’interpréteur Python du haut vers le bas (en sautant les commentaires)', 'uniquement s’il s’appelle main.py', 'par le processeur graphique'], 1],
    en: ['A .py script run from the terminal is executed…', ['line by line in a browser', 'by the Python interpreter top to bottom (skipping comments)', 'only if it is named main.py', 'by the GPU'], 1],
  },
  {
    fr: ['Après avoir défini x = 5 en console, que vaut x + 1 ?', ['51', '6', 'x1', 'Erreur car + interdit'], 1],
    en: ['After x = 5 in the REPL, what is x + 1?', ['51', '6', 'x1', 'Error because + is forbidden'], 1],
  },
  {
    fr: ['Que produit print("a" + "b") ?', ['ab', 'a b', 'Erreur', '2'], 0],
    en: ['What does print("a" + "b") output?', ['ab', 'a b', 'Error', '2'], 0],
  },
  {
    fr: ['La fonction type(42) sert à…', ['convertir en texte', 'afficher la valeur 42', 'connaître le type de la valeur', 'supprimer la variable'], 2],
    en: ['type(42) is used to…', ['convert to text', 'display the value 42', 'know the value’s type', 'delete the variable'], 2],
  },
  {
    fr: ['En Python, le point-virgule à la fin des instructions est…', ['obligatoire', 'interdit', 'autorisé mais rarement utilisé', 'réservé aux boucles'], 2],
    en: ['In Python, a semicolon at the end of a statement is…', ['required', 'forbidden', 'allowed but rarely used', 'only for loops'], 2],
  },
  {
    fr: ['input("Nom ? ") renvoie toujours une valeur de type…', ['int', 'str', 'bool', 'float'], 1],
    en: ['input("Name? ") always returns a value of type…', ['int', 'str', 'bool', 'float'], 1],
  },
  {
    fr: ['Un bloc if doit être indenté par rapport au if parce que…', ['c’est une décoration', 'Python utilise l’indentation pour délimiter les blocs', 'sinon le programme est plus rapide', 'c’est optionnel en Python 3'], 1],
    en: ['An if block must be indented under if because…', ['it is decorative', 'Python uses indentation to delimit blocks', 'otherwise it runs faster', 'it is optional in Python 3'], 1],
  },
  {
    fr: ['Que signifie écrire # TODO revoir plus tard dans le code ?', ['Python exécutera cette phrase', 'C’est un commentaire pour l’humain, ignoré par Python', 'C’est une erreur de syntaxe', 'Cela crée une variable TODO'], 1],
    en: ['What does writing # TODO fix later mean in code?', ['Python will run that text', 'A human comment ignored by Python', 'A syntax error', 'It creates a variable TODO'], 1],
  },
  {
    fr: ['Si tu oublies les guillemets : print(salut), que risque-t-il d’arriver ?', ['Python affiche salut', 'NameError : salut est traité comme un nom de variable', 'Rien', 'SyntaxError obligatoirement sur print'], 1],
    en: ['If you forget quotes: print(hi), what is likely to happen?', ['Python prints hi', 'NameError: hi is treated as a variable name', 'Nothing', 'SyntaxError on print always'], 1],
  },
  {
    fr: ['Le shebang #!/usr/bin/env python3 en première ligne d’un script sert surtout…', ['à afficher du texte', 'à indiquer au système quel interpréteur utiliser (sur Unix/macOS)', 'à compiler le fichier', 'à créer une variable env'], 1],
    en: ['A #!/usr/bin/env python3 shebang on line 1 mainly…', ['prints text', 'tells the OS which interpreter to use (Unix/macOS)', 'compiles the file', 'creates an env variable'], 1],
  },
  {
    fr: ['Comparer "5" == 5 donne…', ['True', 'False', 'Erreur SyntaxError', '5'], 1],
    en: ['"5" == 5 evaluates to…', ['True', 'False', 'SyntaxError', '5'], 1],
  },
  {
    fr: ['Après print(1); print(2) (deux instructions sur une ligne avec ;), que vois-tu ?', ['1 puis 2 sur deux lignes en général', 'Une erreur car ; est interdit', 'Seulement 2', 'Rien'], 0],
    en: ['After print(1); print(2) on one line with ;, you usually see…', ['1 then 2 on two lines', 'An error because ; is forbidden', 'Only 2', 'Nothing'], 0],
  },
];

function getModule1McqBanks() {
  const fr = [...MCQ_BANK_FR[0]];
  const en = [...MCQ_BANK_EN[0]];
  for (const row of MODULE1_MCQ_EXTRA) {
    if (row.fr[2] !== row.en[2]) throw new Error('MODULE1_MCQ_EXTRA index mismatch');
    fr.push(row.fr);
    en.push(row.en);
  }
  return { fr, en };
}

let _module1McqBanks;
function module1McqBanks() {
  if (!_module1McqBanks) _module1McqBanks = getModule1McqBanks();
  return _module1McqBanks;
}

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
  {
    fr: 'Comme étiqueter des boîtes dans un grenier : le nom retrouve vite le contenu.',
    en: 'Like labelling boxes in an attic: the name helps you find what’s inside.',
  },
  {
    fr: 'Comme une recette de cuisine : les étapes dans l’ordre donnent le bon résultat.',
    en: 'Like a recipe: steps in order give the right result.',
  },
  {
    fr: 'Comme un feu tricolore : selon la condition, tu choisis la branche à suivre.',
    en: 'Like a traffic light: depending on the condition, you pick a branch.',
  },
  {
    fr: 'Comme une piste de danse répétée : la boucle rejoue le même pas jusqu’à la fin.',
    en: 'Like a dance drill: the loop repeats the same move until the end.',
  },
  {
    fr: 'Comme un carnet de contacts : une clé (nom) pointe vers une valeur (numéro).',
    en: 'Like an address book: a key (name) maps to a value (number).',
  },
  {
    fr: 'Comme des Lego : une fonction est un bloc que tu clipses où tu veux.',
    en: 'Like LEGO: a function is a block you snap in where you need it.',
  },
];

/** QCM : même indice correct pour fr / en */
const MCQ_BANK_FR = [
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

const MCQ_BANK_EN = [
  [
    ['What does the print() function do in Python?', ['Writes to the hard drive', 'Displays text in the console', 'Compiles the program', 'Deletes files'], 1],
    ['How do you write a one-line comment?', ['// text', '/* text */', '# text', '-- text'], 2],
    ['Python is a language that is…', ['compiled only', 'interpreted (with a virtual machine)', 'low-level only', 'web-only'], 1],
    ['What usually delimits a string?', ['Braces { }', 'Quotes (single or double)', 'Square brackets [ ]', 'Vertical bars | |'], 1],
    ['What happens if you forget a closing parenthesis in print(...)?', ['Nothing', 'A SyntaxError', 'Only a warning', 'Python fixes it'], 1],
  ],
  [
    ['Which keyword creates a variable in Python?', ['var', 'let', 'No dedicated keyword — you assign with =', 'dim'], 2],
    ['The type of 42 (without quotes) is…', ['str', 'float', 'int', 'bool'], 2],
    ['The type of "42" (with quotes) is…', ['int', 'str', 'float', 'list'], 1],
    ['Which operator gives the remainder of integer division?', ['/', '//', '%', '**'], 2],
    ['x += 3 is equivalent to…', ['x = x + 3', 'x = 3', 'x = x - 3', 'x = x * 3'], 0],
  ],
  [
    ['Which keyword starts a condition?', ['loop', 'if', 'when', 'check'], 1],
    ['elif means…', ['else if', 'end of if', 'loop else', 'syntax error'], 0],
    ['Which comparison tests value equality?', ['=', '==', '===', 'eq'], 1],
    ['not True evaluates to…', ['True', 'False', 'None', 'Error'], 1],
    ['Which pattern gives several exclusive branches?', ['if / if / if', 'if / elif / else', 'while / for', 'try / pass'], 1],
  ],
  [
    ['How many values does range(3) produce?', ['2', '3', '4', '0'], 1],
    ['while runs as long as…', ['the condition is false', 'the condition is true', 'once', 'never'], 1],
    ['break in a loop…', ['goes to the next iteration', 'exits the loop', 'restarts the program', 'skips the for-else'], 1],
    ['continue in a loop…', ['stops everything', 'jumps to the next iteration', 'clears the variable', 'raises an error'], 1],
    ['for i in range(2, 5): i takes values…', ['2,3,4,5', '2,3,4', '3,4,5', '0,1,2'], 1],
  ],
  [
    ['The index of the first list element is…', ['1', '0', '-1', 'first'], 1],
    ['Which method adds an item at the end of a list?', ['push()', 'append()', 'add_end()', 'insert_last()'], 1],
    ['Which syntax produces a sub-list (slice)?', ['list(a,b)', 'list[a:b]', 'list{a,b}', 'slice(list)'], 1],
    ['len([1,2,3]) equals…', ['2', '3', '4', '6'], 1],
    ['[1,2] + [3] gives…', ['[1,2,3]', '[4]', 'Error', '[1,2,[3]]'], 0],
  ],
  [
    ['How do you define a function?', ['function name():', 'def name():', 'fn name():', 'fun name():'], 1],
    ['return with no explicit value returns…', ['0', 'False', 'None', '""'], 2],
    ['Values passed at call time are called…', ['parameters', 'arguments', 'tokens', 'slots'], 1],
    ['A variable defined only inside a function is…', ['global', 'local to the function', 'a system constant', 'imported'], 1],
    ['In def f(a, b=2): b is…', ['required at call', 'a parameter with a default', 'forbidden', 'global'], 1],
  ],
  [
    ['A dictionary maps…', ['index → value', 'key → value', 'bit → byte', 'file → line'], 1],
    ['Which syntax accesses key "name" in d?', ['d.name', 'd("name")', 'd["name"]', 'd{name}'], 2],
    ['A set in Python…', ['keeps duplicates', 'does not keep duplicates', 'is always sorted', 'does not exist'], 1],
    ['"a" in {"a":1, "b":2} tests…', ['the value 1', 'whether key "a" exists', 'the length', 'an error'], 1],
    ['dict.get("x", 0) when "x" is missing…', ['raises KeyError', 'returns 0', 'returns None only', 'deletes the key'], 1],
  ],
  [
    ['open("f.txt", "r") opens for…', ['write only', 'read', 'forced binary', 'append forbidden'], 1],
    ['with open(...) as f mainly ensures…', ['more speed', 'the file is closed properly', 'encryption', 'compilation'], 1],
    ['import math lets you…', ['use math.sqrt', 'delete math', 'create a math file', 'nothing'], 0],
    ['f.read() with no argument reads…', ['one line', 'the whole file (watch size)', 'one byte', 'nothing'], 1],
    ['To append to a text file you often open in mode…', ['"r"', '"w"', '"a"', '"x" only'], 2],
  ],
  [
    ['To reuse code cleanly you prefer…', ['huge copy-paste', 'functions and modules', 'one giant line', 'globals only'], 1],
    ['Good structure for a small project…', ['one 10,000-line file', 'several clear functions', 'no functions', 'everything in comments'], 1],
    ['Testing code step by step helps…', ['slow you down for no reason', 'find bugs earlier', 'avoid Python', 'remove errors'], 1],
    ['Code readability…', ['helps nobody', 'helps you and others', 'is forbidden in Python', 'is for experts only'], 1],
    ['At the end of the path the goal is mainly to…', ['memorise everything', 'understand ideas so you can keep learning', 'give up', 'never code again'], 1],
  ],
];

const TF_BANK = [
  { fr: ['Python distingue majuscules et minuscules pour les noms de variables.', true], en: ['Python is case-sensitive for variable names.', true] },
  { fr: ['On peut nommer une variable 2x en Python.', false], en: ['You can name a variable 2x in Python.', false] },
  { fr: ['Une chaîne vide "" est considérée comme False dans un booléen.', false], en: ['An empty string "" is False in a boolean.', false] },
  { fr: ['else peut être utilisé avec for ou while en Python.', true], en: ['else can be used with for or while in Python.', true] },
  { fr: ['list.append modifie la liste sur place.', true], en: ['list.append changes the list in place.', true] },
  { fr: ['Une fonction peut ne rien return explicite.', true], en: ['A function may have no explicit return.', true] },
  { fr: ['Les clés de dict doivent toujours être des chaînes.', false], en: ['Dict keys must always be strings.', false] },
  { fr: ['with open(...) est une bonne pratique pour les fichiers.', true], en: ['with open(...) is good practice for files.', true] },
  { fr: ['import this est une blague cachée dans Python.', true], en: ['import this is an Easter egg in Python.', true] },
  { fr: ['range(5) inclut le nombre 5.', false], en: ['range(5) includes the number 5.', false] },
];

const FILL_BANK = [
  { mod: [0, 1], tpl: 'print("Hello")\n# use ___ for a one-line comment', frPrompt: 'Complète : commentaire sur une ligne avant print', enPrompt: 'Complete: one-line comment before print', ans: '#', alts: ['#'] },
  { mod: [0, 1], tpl: '___("Hello")', frPrompt: 'Affiche Hello :', enPrompt: 'Print Hello:', ans: 'print', alts: ['print'] },
  { mod: [0], tpl: 'message = "Python"\nprint(___)', frPrompt: 'Complète pour afficher la longueur de la chaîne (nombre de caractères) :', enPrompt: 'Complete to print the length of the string (number of characters):', ans: 'len(message)', alts: ['len(message)', 'len( message )'] },
  { mod: [0], tpl: 'a = 3\nb = 4\nprint(a ___ b)', frPrompt: 'Complète l’opérateur pour afficher la somme de a et b :', enPrompt: 'Complete the operator to print the sum of a and b:', ans: '+', alts: ['+'] },
  { mod: [0], tpl: 'print(___ * 3)', frPrompt: 'Complète pour afficher "hahaha" (répétition de chaîne) :', enPrompt: 'Complete to print "hahaha" (string repetition):', ans: '"ha"', alts: ['"ha"', "'ha'"] },
  { mod: [0], tpl: 'x = 10\nprint(type(x) is ___)', frPrompt: 'Complète avec le nom du type de l’entier 10 :', enPrompt: 'Complete with the type name of integer 10:', ans: 'int', alts: ['int'] },
  { mod: [1], tpl: 'x = 5\ny = 2\nprint(x ___ y)', frPrompt: 'Complète l’opération pour afficher la somme :', enPrompt: 'Complete the operator to print the sum:', ans: '+', alts: ['+', '-', '*', '/'] },
  { mod: [1], tpl: 'n = 10\nprint(n ___ 2 == 0)', frPrompt: 'Complète pour tester la parité :', enPrompt: 'Complete to test even/odd:', ans: '%', alts: ['%'] },
  { mod: [2], tpl: 'if x > 0:\n    print("ok")\n___:\n    print("no")', frPrompt: 'Complète la branche alternative :', enPrompt: 'Complete the alternative branch:', ans: 'else', alts: ['else'] },
  { mod: [2], tpl: 'if a == b:\n    print("eq")\n___ a < b:\n    print("lt")', frPrompt: 'Complète (deuxième test) :', enPrompt: 'Complete (second test):', ans: 'elif', alts: ['elif'] },
  { mod: [3], tpl: 'for i in ___(3):\n    print(i)', frPrompt: 'Complète pour boucler 3 fois :', enPrompt: 'Complete to loop 3 times:', ans: 'range', alts: ['range'] },
  { mod: [3], tpl: '___ count > 0:\n    count -= 1', frPrompt: 'Complète la boucle conditionnelle :', enPrompt: 'Complete the conditional loop:', ans: 'while', alts: ['while'] },
  { mod: [4], tpl: 'nums = [1,2,3]\nprint(nums___)', frPrompt: 'Complète pour afficher le premier élément :', enPrompt: 'Complete to print the first element:', ans: '[0]', alts: ['[0]', '[-1]'] },
  { mod: [4], tpl: 't = [1,2]\nt.___(3)', frPrompt: 'Complète pour ajouter 3 à la fin :', enPrompt: 'Complete to append 3:', ans: 'append', alts: ['append'] },
  { mod: [5], tpl: '___ square(x):\n    return x*x', frPrompt: 'Complète pour définir une fonction :', enPrompt: 'Complete to define a function:', ans: 'def', alts: ['def'] },
  { mod: [5], tpl: 'def f():\n    ___ 42', frPrompt: 'Complète pour renvoyer 42 :', enPrompt: 'Complete to return 42:', ans: 'return', alts: ['return'] },
  { mod: [6], tpl: 'd = {}\nd["a"] = 1\nprint(d___)', frPrompt: 'Complète pour lire la clé "a" :', enPrompt: 'Complete to read key "a":', ans: '["a"]', alts: ['["a"]', "['a']"] },
  { mod: [6], tpl: 's = {1,2,2,3}\nprint(___(s))', frPrompt: 'Complète pour afficher la taille du set :', enPrompt: 'Complete to print the set size:', ans: 'len', alts: ['len'] },
  { mod: [7], tpl: 'f = ___("data.txt", "r", encoding="utf-8")', frPrompt: 'Complète pour ouvrir le fichier :', enPrompt: 'Complete to open the file:', ans: 'open', alts: ['open'] },
  { mod: [7], tpl: '___ os\nprint(os.name)', frPrompt: 'Complète pour importer os :', enPrompt: 'Complete to import os:', ans: 'import', alts: ['import'] },
  { mod: [8], tpl: 'grades = [12,14,16]\nm = sum(grades)/___(grades)', frPrompt: 'Complète pour la moyenne :', enPrompt: 'Complete for the average:', ans: 'len', alts: ['len'] },
];

const FIND_ERR_BANK = [
  { mod: [0], wrong: 'print("Hi"', fixed: 'print("Hi")', frExpl: 'Il manque une parenthèse ou un guillemet fermant.', enExpl: 'A closing parenthesis or quote is missing.', frPrompt: 'Écris la ligne corrigée (ligne entière) :', enPrompt: 'Type the corrected full line:' },
  { mod: [0], wrong: 'Print("hi")', fixed: 'print("hi")', frExpl: 'Python est sensible à la casse : print en minuscules.', enExpl: 'Python is case-sensitive: use lowercase print.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [0], wrong: "print('hello\")", fixed: 'print("hello")', frExpl: 'Utilise le même type de guillemets au début et à la fin de la chaîne.', enExpl: 'Use matching quote characters at the start and end of the string.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [0], wrong: 'nom = Ada', fixed: 'nom = "Ada"', frExpl: 'Une chaîne littérale doit être entourée de guillemets (ou apostrophes).', enExpl: 'A string literal must be wrapped in quotes.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [0], wrong: '>>> print(1)', fixed: 'print(1)', frExpl: 'Ne colle pas le prompt >>> : ce n’est pas du code Python, seulement l’invite de l’interpréteur interactif.', enExpl: 'Do not paste the >>> prompt — it is the REPL prompt, not Python code.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [1], wrong: '3name = 1', fixed: 'name3 = 1', frExpl: 'Un identifiant ne peut pas commencer par un chiffre.', enExpl: 'An identifier cannot start with a digit.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [1], wrong: 'a = 5\nb = "2"\nprint(a + b)', fixed: 'print(str(a) + b)', frExpl: 'Sans conversion, int + str provoque TypeError.', enExpl: 'Without conversion, int + str raises TypeError.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [2], wrong: 'if x = 3:\n    pass', fixed: 'if x == 3:\n    pass', frExpl: 'Pour comparer, utilise == et non =.', enExpl: 'Use == to compare, not =.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [3], wrong: 'for i in range(3)\n    print(i)', fixed: 'for i in range(3):\n    print(i)', frExpl: 'Il manque le deux-points à la fin du for.', enExpl: 'The for line needs a trailing colon.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [4], wrong: 'L = [1,2,3]\nprint(L[3])', fixed: 'print(L[2])', frExpl: 'Les indices valides vont de 0 à len-1.', enExpl: 'Valid indices run from 0 to len-1.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [5], wrong: 'def f x:\n    return x', fixed: 'def f(x):\n    return x', frExpl: 'Les paramètres doivent être entre parenthèses.', enExpl: 'Parameters must be inside parentheses.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [6], wrong: 'd = {1: "a"}\nprint(d.1)', fixed: 'print(d[1])', frExpl: 'On accède aux clés avec des crochets.', enExpl: 'Use brackets to access keys.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [7], wrong: 'f = open("x.txt")\ndata = f.read()', fixed: 'with open("x.txt") as f:', frExpl: 'Utilise with open(...) as f: pour une fermeture propre.', enExpl: 'Use with open(...) as f: for safe closing.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
  { mod: [8], wrong: 'def avg(L):\n    return sum(L)/0', fixed: 'def avg(L):\n    return sum(L)/len(L)', frExpl: 'La moyenne utilise la somme divisée par le nombre d’éléments.', enExpl: 'The average is sum divided by the number of items.', frPrompt: 'Écris la ligne corrigée :', enPrompt: 'Type the corrected line:' },
];

const ENCOURAGEMENT = {
  fr: 'Ce n’est pas grave : chaque essai compte. Relis l’énoncé calmement.',
  en: "No worries: every try counts. Reread the question calmly.",
};

const HINTS_TEMPLATE = (tagFr, tagEn) => ({
  fr: [
    `Pense au thème du module : ${tagFr}.`,
    'Souvent la réponse tient en un mot-clé ou un symbole précis.',
    'En cas de doute, teste mentalement avec un petit exemple.',
  ],
  en: [
    `Think about the module theme: ${tagEn}.`,
    'Often the answer is one keyword or symbol.',
    'If unsure, try a small mental example.',
  ],
});

function buildMcq(mod, seed, idxInMod, opts = {}) {
  const { segment, useModule1Bank } = opts;
  const meta = MODULE_META[mod - 1];
  let bankF;
  let bankE;
  if (useModule1Bank) {
    const b = module1McqBanks();
    bankF = b.fr;
    bankE = b.en;
  } else {
    bankF = MCQ_BANK_FR[mod - 1];
    bankE = MCQ_BANK_EN[mod - 1];
  }
  const spread =
    segment === 'recap' ? seed * 3 + idxInMod * 19 : seed * 7 + idxInMod * 11 + (segment === 'practice' ? 5 : 0);
  const idx = spread % bankF.length;
  const rowF = bankF[idx];
  const rowE = bankE[idx];
  const [q0f, optsF, c0] = rowF;
  const [q0e, optsE, c1] = rowE;
  const c = c0;
  if (c0 !== c1) throw new Error(`MCQ index mismatch mod ${mod} idx ${idx}`);
  let qf = q0f;
  let qe = q0e;
  if (segment === 'intro') {
    const pre = introPrefix(mod, idxInMod);
    qf = pre.fr + qf;
    qe = pre.en + qe;
  } else if (segment === 'recap') {
    const pre = recapPrefix(mod);
    qf = pre.fr + qf;
    qe = pre.en + qe;
  } else if (segment === 'practice') {
    qf = 'Question directe (sans texte d’introduction) :\n\n' + qf;
    qe = 'Straight question (no long intro):\n\n' + qe;
  }
  return {
    fr: {
      prompt: qf,
      options: [...optsF],
      correctIndex: c,
      explanation:
        segment === 'recap'
          ? `Bonne réponse — passe au module suivant quand tu te sens à l’aise sur « ${meta.fr.name} ».`
          : 'Exact. La régularité ancre les bases.',
    },
    en: {
      prompt: qe,
      options: [...optsE],
      correctIndex: c,
      explanation:
        segment === 'recap'
          ? `Nice — move on when you feel solid on "${meta.en.name}".`
          : 'Correct. Consistency builds solid foundations.',
    },
  };
}

function buildExampleMcq(mod, seed, idxInMod) {
  const bank = EXAMPLE_MCQ_BY_MODULE[mod - 1];
  const idx = (seed + idxInMod * 7) % bank.length;
  const row = bank[idx];
  const [q0f, optsF, c0] = row.fr;
  const [q0e, optsE, c1] = row.en;
  if (c0 !== c1) throw new Error(`EXAMPLE_MCQ mod ${mod} index mismatch`);
  return {
    fr: {
      prompt:
        'Exemple à lire attentivement (comme dans un cours), puis réponds au QCM.\n\n' + q0f,
      options: [...optsF],
      correctIndex: c0,
      explanation: 'Bien vu : relier le code affiché au comportement réel est la compétence clé ici.',
    },
    en: {
      prompt: 'Read the example carefully (like in a lesson), then answer the MCQ.\n\n' + q0e,
      options: [...optsE],
      correctIndex: c1,
      explanation: 'Good job: linking displayed code to real behaviour is the key skill here.',
    },
  };
}

function buildTf(seed, idxInMod, opts = {}) {
  const { mod, segment } = opts;
  const tfIdx =
    segment === 'basics' ? (seed + idxInMod * 3) % TF_BANK.length : (seed + idxInMod) % TF_BANK.length;
  const row = TF_BANK[tfIdx];
  const truth = row.fr[1];
  let pf = `${row.fr[0]}`;
  let pe = `${row.en[0]}`;
  if (segment === 'basics' && mod >= 1) {
    const m = MODULE_META[mod - 1];
    const pre = {
      fr: `Question courte : thème du module — ${m.fr.tag}.\n\n`,
      en: `Quick check: module theme — ${m.en.tag}.\n\n`,
    };
    pf = pre.fr + pf;
    pe = pre.en + pe;
  }
  return {
    fr: {
      prompt: pf,
      correctTrueFalse: truth,
      explanation: truth
        ? 'Oui, cette affirmation est vraie en Python.'
        : 'Non : cette affirmation est fausse ou inexacte.',
    },
    en: {
      prompt: pe,
      correctTrueFalse: truth,
      explanation: truth
        ? 'Yes, this statement is true in Python.'
        : 'No: this statement is false or inaccurate.',
    },
  };
}

function buildFill(mod, seed, idxInMod, opts = {}) {
  const { guidedLong } = opts;
  const candidates = FILL_BANK.filter((f) => f.mod.includes(mod - 1));
  const pool = candidates.length ? candidates : FILL_BANK;
  const f = pool[(seed + idxInMod * 5) % pool.length];
  const tpl = f.tpl.replace('___', '___');
  const tag = guidedLong ? '' : ` (module ${mod}, ex. ${idxInMod})`;
  let promptFr = `${f.frPrompt}${tag}`;
  let promptEn = `${f.enPrompt}${tag}`;
  if (guidedLong) {
    const pre = PEDAGOGY_GUIDED_FILL_PREFIXES[(idxInMod - 1) % PEDAGOGY_GUIDED_FILL_PREFIXES.length];
    promptFr = pre.fr + f.frPrompt;
    promptEn = pre.en + f.enPrompt;
  }
  return {
    fr: {
      prompt: promptFr,
      codeTemplate: tpl,
      blankAnswer: f.ans,
      acceptableAnswers: f.alts,
      explanation: `La réponse attendue est « ${f.ans} ».`,
    },
    en: {
      prompt: promptEn,
      codeTemplate: tpl,
      blankAnswer: f.ans,
      acceptableAnswers: f.alts,
      explanation: `The expected answer is "${f.ans}".`,
    },
  };
}

function buildFindErr(mod, seed, idxInMod, opts = {}) {
  const { guidedDebug } = opts;
  const candidates = FIND_ERR_BANK.filter((f) => f.mod.includes(mod - 1));
  const pool = candidates.length ? candidates : FIND_ERR_BANK;
  const f = pool[(seed + idxInMod * 7) % pool.length];
  const fixedLine = f.fixed.split('\n').pop() || f.fixed;
  let frPrompt = f.frPrompt;
  let enPrompt = f.enPrompt;
  if (guidedDebug) {
    frPrompt =
      'Le programme suivant est invalide ou affichera une erreur. Trouve la ligne à corriger et recopie la version corrigée demandée.\n\n' +
      frPrompt;
    enPrompt =
      'The following program is invalid or will error. Find the line to fix and type the corrected line as instructed.\n\n' +
      enPrompt;
  }
  return {
    fr: {
      prompt: frPrompt,
      wrongCode: f.wrong,
      errorLineIndex: f.wrong.split('\n').length - 1,
      fixedLine,
      explanation: f.frExpl,
    },
    en: {
      prompt: enPrompt,
      wrongCode: f.wrong,
      errorLineIndex: f.wrong.split('\n').length - 1,
      fixedLine,
      explanation: f.enExpl,
    },
  };
}

function buildOne({ mod, i, globalIdx, seed, kind, segment }) {
  const rng = mix(seed);
  const meta = MODULE_META[mod - 1];
  const nInMod = MODULE_COUNTS[mod - 1];
  const id = `m${mod}-e${String(i).padStart(3, '0')}`;
  const analogyPick = pick(rng, ANALOGIES);
  const hints = HINTS_TEMPLATE(meta.fr.tag, meta.en.tag);

  let bodyFr;
  let bodyEn;
  if (segment === 'example' && kind === 'mcq') {
    const p = buildExampleMcq(mod, seed, i);
    bodyFr = { kind: 'mcq', ...p.fr };
    bodyEn = { kind: 'mcq', ...p.en };
  } else if (kind === 'mcq') {
    const p = buildMcq(mod, seed, i, {
      segment,
      useModule1Bank: mod === 1,
    });
    bodyFr = { kind, ...p.fr };
    bodyEn = { kind, ...p.en };
  } else if (kind === 'truefalse') {
    const p = buildTf(seed, i, { mod, segment });
    bodyFr = { kind, ...p.fr };
    bodyEn = { kind, ...p.en };
  } else if (kind === 'fill') {
    const p = buildFill(mod, seed, i, { guidedLong: segment === 'guided' });
    bodyFr = { kind, ...p.fr };
    bodyEn = { kind, ...p.en };
  } else {
    const p = buildFindErr(mod, seed, i, { guidedDebug: segment === 'debug' });
    bodyFr = { kind, ...p.fr };
    bodyEn = { kind, ...p.en };
  }

  const segTitle = segment ? SEGMENT_TITLES[segment] : null;
  const titleFr = segTitle
    ? `${segTitle.fr} · ${meta.fr.name} (${i}/${nInMod})`
    : `${meta.fr.name} · Exercice ${i}`;
  const titleEn = segTitle
    ? `${segTitle.en} · ${meta.en.name} (${i}/${nInMod})`
    : `${meta.en.name} · Exercise ${i}`;

  return {
    id,
    module: mod,
    order: i,
    visualEmoji: meta.emoji,
    fr: {
      title: titleFr,
      analogy: analogyPick.fr,
      hints: hints.fr,
      encouragementWrong: ENCOURAGEMENT.fr,
      ...bodyFr,
    },
    en: {
      title: titleEn,
      analogy: analogyPick.en,
      hints: hints.en,
      encouragementWrong: ENCOURAGEMENT.en,
      ...bodyEn,
    },
  };
}

function buildAll() {
  const out = [];
  let globalIdx = 0;
  for (let mod = 1; mod <= 9; mod++) {
    const n = MODULE_COUNTS[mod - 1];
    const plan = MODULE_PEDAGOGY_PLANS[mod - 1];
    for (let i = 1; i <= n; i++) {
      const seed = globalIdx * 1103 + mod * 97 + i * 17;
      const p = plan[i - 1];
      out.push(buildOne({ mod, i, globalIdx, seed, kind: p.kind, segment: p.segment }));
      globalIdx++;
    }
  }
  return out;
}

const EXERCISES = buildAll();

/** Aplatit un exercice pour l’API (lang = fr | en) */
function localizeExercise(ex, lang) {
  const L = lang === 'en' ? 'en' : 'fr';
  const loc = ex[L] || ex.fr;
  return {
    id: ex.id,
    module: ex.module,
    order: ex.order,
    kind: loc.kind,
    visualEmoji: ex.visualEmoji,
    title: loc.title,
    analogy: loc.analogy,
    hints: loc.hints,
    encouragementWrong: loc.encouragementWrong,
    prompt: loc.prompt,
    options: loc.options,
    correctIndex: loc.correctIndex,
    explanation: loc.explanation,
    correctTrueFalse: loc.correctTrueFalse,
    codeTemplate: loc.codeTemplate,
    blankAnswer: loc.blankAnswer,
    acceptableAnswers: loc.acceptableAnswers,
    wrongCode: loc.wrongCode,
    errorLineIndex: loc.errorLineIndex,
    fixedLine: loc.fixedLine,
  };
}

module.exports = {
  EXERCISES,
  MODULE_META,
  MODULE_COUNTS,
  TOTAL_EXERCISES: EXERCISES.length,
  localizeExercise,
};
