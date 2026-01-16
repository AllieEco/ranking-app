export type SheetFieldType = 'text' | 'rating';

export interface SheetField {
  id: string;
  label: string;
  helper?: string;
  type?: SheetFieldType;
  placeholder?: string;
}

export const ESSAI_FIELDS: SheetField[] = [
  {
    id: 'pourquoi_lu',
    label: 'Pourquoi j’ai lu ce livre',
    helper: 'Contexte perso, pro, intellectuel.',
  },
  {
    id: 'probleme_traite',
    label: 'Problème traité',
    helper: 'La question centrale que l’auteur adresse.',
  },
  {
    id: 'these_auteur',
    label: 'Thèse / position de l’auteur',
    helper: 'Ce qu’il défend réellement (pas le résumé marketing).',
  },
  {
    id: 'idees_cles',
    label: 'Idées ou concepts clés',
    helper: '3 à 5 max, nommés clairement.',
  },
  {
    id: 'resume_structure',
    label: 'Résumé structuré',
    helper: 'Comment l’argumentation se déroule.',
  },
  {
    id: 'ce_que_je_garde',
    label: 'Ce que je garde',
    helper: 'Ce que tu intègres à ta pensée.',
  },
  {
    id: 'ce_que_je_conteste',
    label: 'Ce que je conteste / nuance',
    helper: 'Limites, angles morts, désaccords.',
  },
  {
    id: 'questions_ouvertes',
    label: 'Questions ouvertes',
    helper: 'Ce que le livre laisse irrésolu.',
  },
  {
    id: 'note_globale',
    label: 'Note globale',
    helper: 'Sur 5.',
    type: 'rating',
  },
  {
    id: 'recommandation',
    label: 'Recommandation',
    helper: 'À qui, dans quel contexte.',
  },
];

export const ROMAN_FIELDS: SheetField[] = [
  {
    id: 'pourquoi_choisi',
    label: 'Pourquoi j’ai choisi ce livre',
    helper: 'Hasard, conseil, envie précise, moment de vie.',
  },
  {
    id: 'resume_sans_spoiler',
    label: 'Résumé sans spoiler',
    helper: 'L’essentiel de l’intrigue, sans trahir l’expérience.',
  },
  {
    id: 'themes_principaux',
    label: 'Thèmes principaux',
    helper: 'Ce dont le livre parle vraiment (au-delà de l’histoire).',
  },
  {
    id: 'personnages_marquants',
    label: 'Personnages marquants',
    helper: 'Un ou deux, pas une liste Wikipédia.',
  },
  {
    id: 'atmosphere_ton',
    label: 'Atmosphère / ton',
    helper: 'Ce que le livre dégage : rythme, ambiance, style.',
  },
  {
    id: 'ce_qui_ma_touche',
    label: 'Ce qui m’a touchée',
    helper: 'Scènes, émotions, résonances personnelles.',
  },
  {
    id: 'ce_qui_ma_moins_convaincue',
    label: 'Ce qui m’a moins convaincue',
    helper: 'Longueurs, choix narratifs, style, fin, etc.',
  },
  {
    id: 'images_ou_idees',
    label: 'Images ou idées qui restent',
    helper: 'Ce qui continue de vivre après la lecture.',
  },
  {
    id: 'relire_pourquoi',
    label: 'Est-ce que je le relirais ?',
    helper: 'Pourquoi / quand.',
  },
];
