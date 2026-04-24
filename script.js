// Middle English Translator (Web)
// rule-based only (no API)

const PREPOSITIONS = new Set([
  'to','for','with','at','of','from','by','about','as','into','through','after','over',
  'between','out','against','during','without','before','under','around','among','toward',
  'upon','beneath','behind','within','near','than'
]);

const TRANSITIVE_VERBS = new Set([
  'love','hate','tell','give','show','help','ask','see','hear','let','make','send','bring',
  'call','keep','need','want','like','miss','join','follow','find','meet','teach','trust',
  'thank','forgive','greet'
]);

// Modern → Middle dictionary (limited set; add more as needed)
const MODERN_TO_MIDDLE = new Map([
  ['hello','hail'],
  ['hi','hail'],
  ['please','prithee'],
  ['thanks','gramercy'],
  ['thank','gramercy'],
  ['yes','aye'],
  ['no','nay'],
  ['nothing','naught'],
  ['anything','aught'],
  ['maybe','perchance'],
  ['perhaps','perchance'],
  ['very','ful'],
  ['really','truly'],
  ['also','eek'],
  ['well','wel'],
  ['not','nat'],
  ['must','moot'],
  ['woman','maid'],
  ['boy','lad'],
  ['girl','lass'],
  ['knight','knyght'],
  ['king','kyng'],
  ['queen','queene'],
  ['friend','freend'],
  ['people','folk'],
  ['son','sone'],
  ['daughter','doghter'],
  ['mother','moder'],
  ['father','fader'],
  ['him','hym'],
  ['her','hire'],
  ['them','hem'],
  ['their','hir'],
  ['our','oure'],
  ['mine','myn'],
  ['does','dooth'],
  ['has','hath'],
  ['have','haven'],
  ['shall','shal'],
  ['will','wol'],
  ['can','kan'],
  ['should','sholde'],
  ['would','wolde'],
  ['could','koude'],
  ['are','been'],
  ['were','weren'],
  ['be','been'],
  ['do','doon'],
  ['go','goon'],
  ['say','seyn'],
  ['says','seith'],
  ['said','seyde'],
  ['tell','tellen'],
  ['told','tolde'],
  ['know','knouen'],
  ['thought','thoughte'],
  ['love','loven'],
  ['hate','haten'],
  ['drink','quaffen'],
  ['come','comen'],
  ['came','cam'],
  ['went','wente'],
  ['see','seen'],
  ['saw','saugh'],
  ['find','finden'],
  ['make','maken'],
  ['helped','holpen'],
  ['had','hadde'],
  ['good','goode'],
  ['strong','stronge'],
  ['old','olde'],
  ['little','litel'],
  ['much','muche'],
  ['more','moore'],
  ['less','lasse'],
  ['holy','hooly'],
  ['sweet','soote'],
  ['tender','tendre'],
  ['ready','redy'],
  ['heart','herte'],
  ['world','worlde'],
  ['time','tyme'],
  ['life','lyf'],
  ['death','deeth'],
  ['country','contree'],
  ['city','citee'],
  ['house','hous'],
  ['street','strete'],
  ['church','chirche'],
  ['priest','preest'],
  ['when','whan'],
  ['nonetheless','nathelees'],
  ['further','ferther'],
  ['early','erly'],
  ['england','engelond'],
  ['canterbury','caunterbury'],
  ['southwark','southwerk'],
]);

const MIDDLE_TO_MODERN = new Map([
  ['hail','hello'],
  ['prithee','please'],
  ['gramercy','thanks'],
  ['aye','yes'],
  ['nay','no'],
  ['naught','nothing'],
  ['aught','anything'],
  ['perchance','perhaps'],
  ['hym','him'],
  ['hire','her'],
  ['hem','them'],
  ['hir','their'],
  ['oure','our'],
  ['myn','mine'],
  ['moore','more'],
  ['lasse','less'],
  ['muche','much'],
  ['litel','little'],
  ['grete','great'],
  ['hadde','had'],
  ['saugh','saw'],
  ['cam','came'],
  ['koude','could'],
  ['wolde','would'],
  ['sholde','should'],
  ['weren','were'],
  ['hath','has'],
  ['dooth','does'],
  ['folk','people'],
  ['lyf','life'],
  ['deeth','death'],
  ['herte','heart'],
  ['soule','soul'],
  ['tyme','time'],
  ['worlde','world'],
  ['lond','land'],
  ['contree','country'],
  ['citee','city'],
  ['hous','house'],
  ['chirche','church'],
  ['preest','priest'],
  ['freend','friend'],
  ['kyng','king'],
  ['queene','queen'],
  ['knyght','knight'],
  ['squier','squire'],
  ['wel','well'],
  ['nat','not'],
  ['moot','must'],
  ['certes','certainly'],
  ['eek','also'],
  ['ful','very'],
  ['whan','when'],
  ['art','are'],
  ['hast','have'],
  ['dost','do'],
  ['shalt','shall'],
  ['wolt','will'],
  ['kanst','can'],
  ['mayst','may'],
  ['sholdest','should'],
  ['woldest','would'],
  ['knowest','know'],
  ['lovest','love'],
  ['goost','go'],
  ['comest','come'],
  ['seest','see'],
]);

function translate(text, modernToMiddle) {
  const ruleResult = modernToMiddle ? applyModernToMiddle(text) : applyMiddleToModern(text);
  if (ruleResult != null) return ruleResult;
  return text + '  [no dictionary match]';
}

function applyModernToMiddle(line) {
  line = phrasePreReplace(line);
  const tokens = tokenize(line);
  let anyHit = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t.isWord) continue;
    const lower = t.text.toLowerCase();
    const prevWord = prevWordLower(tokens, i);
    const nextWord = nextWordLower(tokens, i);

    if (lower === 'you') {
      const repl = isObjectPosition(prevWord) ? 'thee' : 'thou';
      t.text = matchCase(t.text, repl);
      anyHit = true;
      continue;
    }
    if (lower === 'your') {
      const repl = startsWithVowel(nextWord) ? 'thine' : 'thy';
      t.text = matchCase(t.text, repl);
      anyHit = true;
      continue;
    }
    if (prevWord === 'thou') {
      const repl = thouVerbForm(lower);
      if (repl) { t.text = matchCase(t.text, repl); anyHit = true; continue; }
    }
    if (prevWord === 'he' || prevWord === 'she' || prevWord === 'it') {
      const eth = tryMakeEth(lower);
      if (eth) { t.text = matchCase(t.text, eth); anyHit = true; continue; }
    }

    const dictResult = MODERN_TO_MIDDLE.get(lower);
    if (dictResult) { t.text = matchCase(t.text, dictResult); anyHit = true; }
  }
  return anyHit ? rebuild(tokens) : null;
}

function applyMiddleToModern(line) {
  line = phrasePreReplace(line, true);
  const tokens = tokenize(line);
  let anyHit = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t.isWord) continue;
    const lower = t.text.toLowerCase();
    const prevWord = prevWordLower(tokens, i);

    if (lower === 'thou' || lower === 'thee' || lower === 'ye') {
      t.text = matchCase(t.text, 'you'); anyHit = true; continue;
    }
    if (lower === 'thy' || lower === 'thine') {
      t.text = matchCase(t.text, 'your'); anyHit = true; continue;
    }
    if (prevWord === 'you' || prevWord === 'thou') {
      const repl = fromThouVerbForm(lower);
      if (repl) { t.text = matchCase(t.text, repl); anyHit = true; continue; }
    }

    const dictResult = MIDDLE_TO_MODERN.get(lower);
    if (dictResult) { t.text = matchCase(t.text, dictResult); anyHit = true; }
  }
  return anyHit ? rebuild(tokens) : null;
}

function phrasePreReplace(line, reverse=false) {
  // handle multi-word phrases quickly
  if (!reverse) {
    line = line.replace(/\bgoodbye\b/gi, m => matchCase(m,'fare thee well'));
    line = line.replace(/\bbye\b/gi, m => matchCase(m,'fare thee well'));
  } else {
    line = line.replace(/\bfare thee well\b/gi, m => matchCase(m,'goodbye'));
  }
  return line;
}

function tokenize(s) {
  const out=[]; let cur=''; let inWord=false;
  for (const ch of s) {
    if (/^[A-Za-z']$/.test(ch)) {
      if (!inWord) { if (cur) { out.push({text:cur,isWord:false}); cur=''; } inWord=true; }
      cur+=ch;
    } else {
      if (inWord) { out.push({text:cur,isWord:true}); cur=''; inWord=false; }
      cur+=ch;
    }
  }
  if (cur) out.push({text:cur,isWord:inWord});
  return out;
}

function prevWordLower(tokens, idx) {
  for (let i=idx-1;i>=0;i--) if (tokens[i].isWord) return tokens[i].text.toLowerCase();
  return null;
}
function nextWordLower(tokens, idx) {
  for (let i=idx+1;i<tokens.length;i++) if (tokens[i].isWord) return tokens[i].text.toLowerCase();
  return null;
}

function rebuild(tokens) { return tokens.map(t=>t.text).join(''); }

function matchCase(src, repl) {
  if (!repl) return repl;
  if (src === src.toUpperCase()) return repl.toUpperCase();
  if (/^[A-Z]/.test(src)) return repl.charAt(0).toUpperCase()+repl.slice(1);
  return repl;
}

function isObjectPosition(prevWord) {
  if (!prevWord) return false;
  return PREPOSITIONS.has(prevWord) || TRANSITIVE_VERBS.has(prevWord);
}

function startsWithVowel(word) {
  if (!word) return false;
  return /^[aeiou]/.test(word);
}

function thouVerbForm(lower) {
  switch (lower) {
    case 'are': case 'were': return 'art';
    case 'have': case 'has': return 'hast';
    case 'do': case 'does': return 'dost';
    case 'shall': return 'shalt';
    case 'will': return 'wolt';
    case 'can': return 'kanst';
    case 'may': return 'mayst';
    case 'should': return 'sholdest';
    case 'would': return 'woldest';
    case 'know': return 'knowest';
    case 'love': return 'lovest';
    case 'go': return 'goost';
    case 'come': return 'comest';
    case 'see': return 'seest';
    default: return null;
  }
}

function fromThouVerbForm(lower) {
  switch (lower) {
    case 'art': return 'are';
    case 'hast': return 'have';
    case 'dost': return 'do';
    case 'shalt': return 'shall';
    case 'wolt': return 'will';
    case 'kanst': return 'can';
    case 'mayst': return 'may';
    case 'sholdest': return 'should';
    case 'woldest': return 'would';
    case 'knowest': return 'know';
    case 'lovest': return 'love';
    case 'goost': return 'go';
    case 'comest': return 'come';
    case 'seest': return 'see';
    default: return null;
  }
}

function tryMakeEth(w) {
  if (!w || w.length<=2) return null;
  if (MODERN_TO_MIDDLE.has(w)) return null;
  if (/^(ss|us|is)$/i.test(w.slice(-2))) return null;
  if (w.endsWith('oes')) return w.slice(0,-3)+'eth';
  if (w.endsWith('es')) return w.slice(0,-2)+'eth';
  if (w.endsWith('s')) return w.slice(0,-1)+'eth';
  return null;
}

function main() {
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const translateBtn = document.getElementById('translate');

  translateBtn.addEventListener('click', () => {
    const dir = document.querySelector('input[name="dir"]:checked').value;
    const modernToMiddle = dir === 'm2me';
    outputEl.textContent = translate(inputEl.value, modernToMiddle);
  });

  document.querySelectorAll('.ex').forEach(btn => {
    btn.addEventListener('click', () => {
      inputEl.value = btn.textContent.trim();
      translateBtn.click();
    });
  });
}

main();
