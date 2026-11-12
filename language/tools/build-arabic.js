// Usage: node language/tools/build-arabic.js [--show]   (--show prints every romanization)
// Builds language/data/arabic.json. Arabic is written fully vowelled; | marks a clitic
// boundary for the romanization (وَ|سَهْلًا → wa-sahlan) and is removed from the Arabic.
// A `tr` field is stored only where it differs from what the app would compute itself.
const fs = require('fs');
const A = require('../arabic.js');
const OUT = require('path').join(__dirname, '../data/arabic.json');

const C = A.clean;
const trOf = (src, explicit) => {
  const t = explicit || A.romanize(src);
  return t !== A.romanize(C(src)) ? t : undefined;
};
const T = (src, extra = {}, explicit) => {
  const o = { it: C(src) };
  const tr = trOf(src, explicit);
  if (tr) o.tr = tr;
  return Object.assign(o, extra);
};

// ---------------- persons and tenses ----------------
const persons = ['ana', 'anta', 'anti', 'huwa', 'hiya', 'nahnu', 'antum', 'hum'];
const personOptions = [
  { id: 'ana', label: 'I (anā)', en: 'I', pronoun: 'أَنَا' },
  { id: 'anta', label: 'you, m. (anta)', en: 'you (to a man)', pronoun: 'أَنْتَ' },
  { id: 'anti', label: 'you, f. (anti)', en: 'you (to a woman)', pronoun: 'أَنْتِ' },
  { id: 'huwa', label: 'he (huwa)', en: 'he / it', pronoun: 'هُوَ' },
  { id: 'hiya', label: 'she (hiya)', en: 'she / it', pronoun: 'هِيَ' },
  { id: 'nahnu', label: 'we (naḥnu)', en: 'we', pronoun: 'نَحْنُ' },
  { id: 'antum', label: 'you all (antum)', en: 'you all', pronoun: 'أَنْتُمْ' },
  { id: 'hum', label: 'they (hum)', en: 'they', pronoun: 'هُمْ' },
];
const tenseOptions = [
  { id: 'past', label: 'Past', title: 'Past (al-māḍī)', description: 'Finished actions: katabtu = I wrote. Endings show the person: -tu I, -ta you (m.), -ti you (f.), -a he, -at she, -nā we, -tum you all, -ū they.' },
  { id: 'present', label: 'Present', title: 'Present (al-muḍāriʿ)', description: 'Now or usually: aktubu = I write / I am writing. Prefixes show the person: a- I, ta- you or she, ya- he, na- we; -īna marks you (f.), -ūna you all and they.' },
  { id: 'future', label: 'Future', title: 'Future (sa- + present)', description: 'Put sa- in front of the present: sa-aktubu = I will write. To say “will not”, use lan + the verb: lan aktuba.' },
];

// ---------------- verbs ----------------
// pc: past stem before -tu/-nā, p3: stem for he/she/they, pv: present prefix vowel, ps: present stem
const SUK = 'ْ';
function conj(v) {
  const past = {
    ana: v.pc + SUK + 'تُ', anta: v.pc + SUK + 'تَ', anti: v.pc + SUK + 'تِ',
    huwa: v.p3 + 'َ', hiya: v.p3 + 'َتْ', nahnu: v.pc + SUK + 'نَا', antum: v.pc + SUK + 'تُمْ', hum: v.p3 + 'ُوا',
  };
  const pv = v.pv || 'َ';
  const pre = (p) => p + pv + v.ps;
  const present = v.ps ? {
    ana: pre('أ') + 'ُ', anta: pre('ت') + 'ُ', anti: pre('ت') + 'ِينَ', huwa: pre('ي') + 'ُ',
    hiya: pre('ت') + 'ُ', nahnu: pre('ن') + 'ُ', antum: pre('ت') + 'ُونَ', hum: pre('ي') + 'ُونَ',
  } : {};
  if (v.pastList) persons.forEach((p, i) => { past[p] = v.pastList[i]; });
  if (v.presList) persons.forEach((p, i) => { present[p] = v.presList[i]; });
  Object.assign(past, v.past || {});
  Object.assign(present, v.pres || {});
  const future = Object.fromEntries(persons.map((p) => [p, 'سَ' + present[p]]));
  return { past, present, future };
}
const L = (s) => s.split(' ');
const VERBS = [
  { id: 'kataba', it: 'كَتَبَ', en: 'to write', root: 'ك ت ب', pc: 'كَتَب', ps: 'كْتُب', ex: ['أَكْتُبُ رِسَالَة لِ|أُمِّي.', 'I’m writing a letter to my mother.'] },
  { id: 'dhahaba', it: 'ذَهَبَ', en: 'to go', root: 'ذ ه ب', pc: 'ذَهَب', ps: 'ذْهَب', ex: ['أَذْهَبُ إِلَى الْعَمَل بِالْقِطَار.', 'I go to work by train.'] },
  { id: 'darasa', it: 'دَرَسَ', en: 'to study', root: 'د ر س', pc: 'دَرَس', ps: 'دْرُس', ex: ['تَدْرُسُ أُخْتِي فِي الْجَامِعَة.', 'My sister studies at the university.'] },
  { id: 'shariba', it: 'شَرِبَ', en: 'to drink', root: 'ش ر ب', pc: 'شَرِب', ps: 'شْرَب', ex: ['أَشْرَبُ الشَّاي كُلّ صَبَاح.', 'I drink tea every morning.'] },
  { id: 'akala', it: 'أَكَلَ', en: 'to eat', root: 'ء ك ل', pc: 'أَكَل', ps: 'أْكُل', pres: { ana: 'آكُلُ' }, irregular: true, ex: ['لَا آكُلُ اللَّحْم.', 'I don’t eat meat.'] },
  { id: 'fahima', it: 'فَهِمَ', en: 'to understand', root: 'ف ه م', pc: 'فَهِم', ps: 'فْهَم', ex: ['هَلْ تَفْهَمُ؟', 'Do you understand?'] },
  { id: 'arada', it: 'أَرَادَ', en: 'to want', root: 'ر و د', pc: 'أَرَد', p3: 'أَرَاد', pv: 'ُ', ps: 'رِيد', irregular: true, ex: ['أُرِيدُ قَهْوَة، مِنْ فَضْلِكَ.', 'I’d like a coffee, please.'] },
  { id: 'ahabba', it: 'أَحَبَّ', en: 'to like / to love', root: 'ح ب ب', pc: 'أَحْبَب', p3: 'أَحَبّ', pv: 'ُ', ps: 'حِبّ', irregular: true, ex: ['أُحِبُّ الْقَهْوَة.', 'I like coffee.'] },
  { id: 'kana', it: 'كَانَ', en: 'to be (past)', root: 'ك و ن', pc: 'كُن', p3: 'كَان', ps: 'كُون', past: { nahnu: 'كُنَّا' }, irregular: true, ex: ['يَكُونُ الْجَوّ حَارًّا فِي الصَّيْف.', 'The weather is (usually) hot in summer.'], noEx: true },
  { id: 'qala', it: 'قَالَ', en: 'to say', root: 'ق و ل', pc: 'قُل', p3: 'قَال', ps: 'قُول', irregular: true },
  { id: 'sakana', it: 'سَكَنَ', en: 'to live (somewhere)', root: 'س ك ن', pc: 'سَكَن', ps: 'سْكُن', past: { nahnu: 'سَكَنَّا' }, ex: ['أَسْكُنُ فِي الْقَاهِرَة.', 'I live in Cairo.'] },
  { id: 'amila', it: 'عَمِلَ', en: 'to work', root: 'ع م ل', pc: 'عَمِل', ps: 'عْمَل', ex: ['تَعْمَلُ فِي مُسْتَشْفَى.', 'She works in a hospital.'] },
  { id: 'arafa', it: 'عَرَفَ', en: 'to know', root: 'ع ر ف', pc: 'عَرَف', ps: 'عْرِف', ex: ['لَا أَعْرِفُ.', 'I don’t know.'] },
  { id: 'takallama', it: 'تَكَلَّمَ', en: 'to speak', root: 'ك ل م', pc: 'تَكَلَّم', ps: 'تَكَلَّم', ex: ['هَلْ تَتَكَلَّمُ الْعَرَبِيَّة؟', 'Do you speak Arabic?'] },
  { id: 'taallama', it: 'تَعَلَّمَ', en: 'to learn', root: 'ع ل م', pc: 'تَعَلَّم', ps: 'تَعَلَّم', ex: ['أَتَعَلَّمُ الْعَرَبِيَّة.', 'I’m learning Arabic.'] },
  { id: 'qaraa', it: 'قَرَأَ', en: 'to read', root: 'ق ر ء', pc: 'قَرَأ', ps: 'قْرَأ', past: { hum: 'قَرَؤُوا' }, pres: { anti: 'تَقْرَئِينَ', antum: 'تَقْرَؤُونَ', hum: 'يَقْرَؤُونَ' }, irregular: true, ex: ['أَقْرَأُ كِتَابًا جَدِيدًا.', 'I’m reading a new book.'], noEx: true },
  { id: 'saala', it: 'سَأَلَ', en: 'to ask', root: 'س ء ل', pc: 'سَأَل', ps: 'سْأَل' },
  { id: 'jalasa', it: 'جَلَسَ', en: 'to sit', root: 'ج ل س', pc: 'جَلَس', ps: 'جْلِس' },
  { id: 'samia', it: 'سَمِعَ', en: 'to hear', root: 'س م ع', pc: 'سَمِع', ps: 'سْمَع' },
  { id: 'fataha', it: 'فَتَحَ', en: 'to open', root: 'ف ت ح', pc: 'فَتَح', ps: 'فْتَح' },
  { id: 'dakhala', it: 'دَخَلَ', en: 'to enter', root: 'د خ ل', pc: 'دَخَل', ps: 'دْخُل' },
  { id: 'kharaja', it: 'خَرَجَ', en: 'to go out / to leave', root: 'خ ر ج', pc: 'خَرَج', ps: 'خْرُج' },
  { id: 'laiba', it: 'لَعِبَ', en: 'to play', root: 'ل ع ب', pc: 'لَعِب', ps: 'لْعَب' },
  { id: 'tabakha', it: 'طَبَخَ', en: 'to cook', root: 'ط ب خ', pc: 'طَبَخ', ps: 'طْبُخ' },
  { id: 'rakiba', it: 'رَكِبَ', en: 'to ride / to take (a bus, train)', root: 'ر ك ب', pc: 'رَكِب', ps: 'رْكَب' },
  { id: 'akhadha', it: 'أَخَذَ', en: 'to take', root: 'ء خ ذ', pc: 'أَخَذ', ps: 'أْخُذ', pres: { ana: 'آخُذُ' }, irregular: true },
  { id: 'wajada', it: 'وَجَدَ', en: 'to find', root: 'و ج د', pc: 'وَجَد', ps: 'جِد', irregular: true },
  { id: 'wasala', it: 'وَصَلَ', en: 'to arrive', root: 'و ص ل', pc: 'وَصَل', ps: 'صِل', irregular: true },
  { id: 'zara', it: 'زَارَ', en: 'to visit', root: 'ز و ر', pc: 'زُر', p3: 'زَار', ps: 'زُور', irregular: true },
  { id: 'nama', it: 'نَامَ', en: 'to sleep', root: 'ن و م', pc: 'نِم', p3: 'نَام', ps: 'نَام', irregular: true },
  { id: 'baa', it: 'بَاعَ', en: 'to sell', root: 'ب ي ع', pc: 'بِع', p3: 'بَاع', ps: 'بِيع', irregular: true },
  { id: 'masha', it: 'مَشَى', en: 'to walk', root: 'م ش ي', pc: 'مَشَي', past: { huwa: 'مَشَى', hiya: 'مَشَتْ', hum: 'مَشَوْا' },
    presList: L('أَمْشِي تَمْشِي تَمْشِينَ يَمْشِي تَمْشِي نَمْشِي تَمْشُونَ يَمْشُونَ'), irregular: true },
  { id: 'ishtara', it: 'اِشْتَرَى', en: 'to buy', root: 'ش ر ي', pc: 'اِشْتَرَي', past: { huwa: 'اِشْتَرَى', hiya: 'اِشْتَرَتْ', hum: 'اِشْتَرَوْا' },
    presList: L('أَشْتَرِي تَشْتَرِي تَشْتَرِينَ يَشْتَرِي تَشْتَرِي نَشْتَرِي تَشْتَرُونَ يَشْتَرُونَ'), irregular: true },
  { id: 'jaa', it: 'جَاءَ', en: 'to come', root: 'ج ي ء', pastList: L('جِئْتُ جِئْتَ جِئْتِ جَاءَ جَاءَتْ جِئْنَا جِئْتُمْ جَاؤُوا'),
    presList: L('أَجِيءُ تَجِيءُ تَجِيئِينَ يَجِيءُ تَجِيءُ نَجِيءُ تَجِيئُونَ يَجِيئُونَ'), irregular: true },
  { id: 'raa', it: 'رَأَى', en: 'to see', root: 'ر ء ي', pastList: L('رَأَيْتُ رَأَيْتَ رَأَيْتِ رَأَى رَأَتْ رَأَيْنَا رَأَيْتُمْ رَأَوْا'),
    presList: L('أَرَى تَرَى تَرَيْنَ يَرَى تَرَى نَرَى تَرَوْنَ يَرَوْنَ'), irregular: true },
  { id: 'nasiya', it: 'نَسِيَ', en: 'to forget', root: 'ن س ي', pastList: L('نَسِيتُ نَسِيتَ نَسِيتِ نَسِيَ نَسِيَتْ نَسِينَا نَسِيتُمْ نَسُوا'),
    presList: L('أَنْسَى تَنْسَى تَنْسَيْنَ يَنْسَى تَنْسَى نَنْسَى تَنْسَوْنَ يَنْسَوْنَ'), irregular: true },
  { id: 'safara', it: 'سَافَرَ', en: 'to travel', root: 'س ف ر', pc: 'سَافَر', pv: 'ُ', ps: 'سَافِر' },
  { id: 'saada', it: 'سَاعَدَ', en: 'to help', root: 'س ع د', pc: 'سَاعَد', pv: 'ُ', ps: 'سَاعِد' },
  { id: 'intazara', it: 'اِنْتَظَرَ', en: 'to wait (for)', root: 'ن ظ ر', pc: 'اِنْتَظَر', ps: 'نْتَظِر' },
];
const verbs = VERBS.map((v, i) => {
  v.p3 = v.p3 || v.pc;
  const tenses = conj(v);
  const examples = v.ex && !v.noEx ? [{ tense: 'present', ...T(v.ex[0]), en: v.ex[1] }] : [];
  const present3 = tenses.present.huwa;
  return {
    id: v.id, it: v.it, cite: `${v.it} / ${present3}`, en: v.en, rank: i + 1, root: v.root,
    irregular: !!v.irregular, tenses, examples,
  };
});

// ---------------- nouns ----------------
// [id, arabic, english, gender, plural or null, topic, root or null, feminine form]
const NOUNS = [
  ['rajul', 'رَجُل', 'man', 'm', 'رِجَال', 'social', 'ر ج ل'],
  ['imraa', 'اِمْرَأَة', 'woman', 'f', 'نِسَاء', 'social', 'م ر ء'],
  ['walad', 'وَلَد', 'boy / child', 'm', 'أَوْلَاد', 'social', 'و ل د'],
  ['bint', 'بِنْت', 'girl / daughter', 'f', 'بَنَات', 'social', null],
  ['tifl', 'طِفْل', 'child', 'm', 'أَطْفَال', 'social', 'ط ف ل'],
  ['ab', 'أَب', 'father', 'm', 'آبَاء', 'social', null],
  ['umm', 'أُمّ', 'mother', 'f', 'أُمَّهَات', 'social', null],
  ['akh', 'أَخ', 'brother', 'm', 'إِخْوَة', 'social', null],
  ['ukht', 'أُخْت', 'sister', 'f', 'أَخَوَات', 'social', null],
  ['zawj', 'زَوْج', 'husband', 'm', 'أَزْوَاج', 'social', 'ز و ج'],
  ['zawja', 'زَوْجَة', 'wife', 'f', 'زَوْجَات', 'social', 'ز و ج'],
  ['aila', 'عَائِلَة', 'family', 'f', 'عَائِلَات', 'social', 'ع و ل'],
  ['sadiq', 'صَدِيق', 'friend', 'm', 'أَصْدِقَاء', 'social', 'ص د ق', 'صَدِيقَة'],
  ['talib', 'طَالِب', 'student', 'm', 'طُلَّاب', 'social', 'ط ل ب', 'طَالِبَة'],
  ['muallim', 'مُعَلِّم', 'teacher', 'm', 'مُعَلِّمُون', 'social', 'ع ل م', 'مُعَلِّمَة'],
  ['tabib', 'طَبِيب', 'doctor', 'm', 'أَطِبَّاء', 'social', 'ط ب ب', 'طَبِيبَة'],
  ['dayf', 'ضَيْف', 'guest', 'm', 'ضُيُوف', 'social', 'ض ي ف'],
  ['ism', 'اِسْم', 'name', 'm', 'أَسْمَاء', 'social', 'س م و'],
  ['umr', 'عُمْر', 'age', 'm', 'أَعْمَار', 'social', 'ع م ر'],
  ['bayt', 'بَيْت', 'house / home', 'm', 'بُيُوت', 'everyday', 'ب ي ت'],
  ['kitab', 'كِتَاب', 'book', 'm', 'كُتُب', 'everyday', 'ك ت ب'],
  ['qalam', 'قَلَم', 'pen', 'm', 'أَقْلَام', 'everyday', 'ق ل م'],
  ['risala', 'رِسَالَة', 'letter / message', 'f', 'رَسَائِل', 'everyday', 'ر س ل'],
  ['bab', 'بَاب', 'door', 'm', 'أَبْوَاب', 'everyday', 'ب و ب'],
  ['nafidha', 'نَافِذَة', 'window', 'f', 'نَوَافِذ', 'everyday', 'ن ف ذ'],
  ['ghurfa', 'غُرْفَة', 'room', 'f', 'غُرَف', 'everyday', 'غ ر ف'],
  ['sayyara', 'سَيَّارَة', 'car', 'f', 'سَيَّارَات', 'everyday', 'س ي ر'],
  ['hatif', 'هَاتِف', 'phone', 'm', 'هَوَاتِف', 'everyday', 'ه ت ف'],
  ['miftah', 'مِفْتَاح', 'key', 'm', 'مَفَاتِيح', 'everyday', 'ف ت ح'],
  ['kursi', 'كُرْسِيّ', 'chair', 'm', 'كَرَاسِيّ', 'everyday', 'ك ر س'],
  ['tawila', 'طَاوِلَة', 'table', 'f', 'طَاوِلَات', 'everyday', 'ط و ل'],
  ['sarir', 'سَرِير', 'bed', 'm', 'أَسِرَّة', 'everyday', 'س ر ر'],
  ['lugha', 'لُغَة', 'language', 'f', 'لُغَات', 'everyday', null],
  ['amal', 'عَمَل', 'work / job', 'm', 'أَعْمَال', 'everyday', 'ع م ل'],
  ['dars', 'دَرْس', 'lesson', 'm', 'دُرُوس', 'everyday', 'د ر س'],
  ['sual', 'سُؤَال', 'question', 'm', 'أَسْئِلَة', 'everyday', 'س ء ل'],
  ['kalb', 'كَلْب', 'dog', 'm', 'كِلَاب', 'everyday', 'ك ل ب'],
  ['qitta', 'قِطَّة', 'cat', 'f', 'قِطَط', 'everyday', 'ق ط ط'],
  ['shams', 'شَمْس', 'sun', 'f', 'شُمُوس', 'everyday', 'ش م س'],
  ['qamar', 'قَمَر', 'moon', 'm', 'أَقْمَار', 'everyday', 'ق م ر'],
  ['ayn', 'عَيْن', 'eye', 'f', 'عُيُون', 'everyday', 'ع ي ن'],
  ['mal', 'مَال', 'money', 'm', 'أَمْوَال', 'everyday', 'م و ل'],
  ['dinar', 'دِينَار', 'dinar', 'm', 'دَنَانِير', 'everyday', null],
  ['maa', 'مَاء', 'water', 'm', 'مِيَاه', 'food', null],
  ['khubz', 'خُبْز', 'bread', 'm', null, 'food', 'خ ب ز'],
  ['qahwa', 'قَهْوَة', 'coffee', 'f', null, 'food', null],
  ['shay', 'شَاي', 'tea', 'm', null, 'food', null],
  ['halib', 'حَلِيب', 'milk', 'm', null, 'food', 'ح ل ب'],
  ['lahm', 'لَحْم', 'meat', 'm', 'لُحُوم', 'food', 'ل ح م'],
  ['dajaj', 'دَجَاج', 'chicken', 'm', null, 'food', null],
  ['samak', 'سَمَك', 'fish', 'm', 'أَسْمَاك', 'food', null],
  ['tuffaha', 'تُفَّاحَة', 'apple', 'f', 'تُفَّاحَات', 'food', null],
  ['aruzz', 'أَرُزّ', 'rice', 'm', null, 'food', null],
  ['sukkar', 'سُكَّر', 'sugar', 'm', null, 'food', null],
  ['milh', 'مِلْح', 'salt', 'm', null, 'food', 'م ل ح'],
  ['asir', 'عَصِير', 'juice', 'm', null, 'food', 'ع ص ر'],
  ['jubn', 'جُبْن', 'cheese', 'm', null, 'food', null],
  ['bayda', 'بَيْضَة', 'egg', 'f', 'بَيْض', 'food', 'ب ي ض'],
  ['taam', 'طَعَام', 'food', 'm', null, 'food', 'ط ع م'],
  ['futur', 'فُطُور', 'breakfast', 'm', null, 'food', 'ف ط ر'],
  ['ghada', 'غَدَاء', 'lunch', 'm', null, 'food', null],
  ['asha', 'عَشَاء', 'dinner', 'm', null, 'food', null],
  ['kub', 'كُوب', 'cup / glass', 'm', 'أَكْوَاب', 'food', null],
  ['hisab', 'حِسَاب', 'bill / account', 'm', 'حِسَابَات', 'food', 'ح س ب'],
  ['matam', 'مَطْعَم', 'restaurant', 'm', 'مَطَاعِم', 'food', 'ط ع م'],
  ['maqha', 'مَقْهَى', 'café', 'm', 'مَقَاهٍ', 'food', null],
  ['madina', 'مَدِينَة', 'city', 'f', 'مُدُن', 'directions', null],
  ['madrasa', 'مَدْرَسَة', 'school', 'f', 'مَدَارِس', 'directions', 'د ر س'],
  ['jamia', 'جَامِعَة', 'university', 'f', 'جَامِعَات', 'directions', 'ج م ع'],
  ['suq', 'سُوق', 'market', 'm', 'أَسْوَاق', 'directions', 'س و ق'],
  ['sharia', 'شَارِع', 'street', 'm', 'شَوَارِع', 'directions', 'ش ر ع'],
  ['funduq', 'فُنْدُق', 'hotel', 'm', 'فَنَادِق', 'directions', null],
  ['maktab', 'مَكْتَب', 'office / desk', 'm', 'مَكَاتِب', 'directions', 'ك ت ب'],
  ['maktaba', 'مَكْتَبَة', 'library / bookshop', 'f', 'مَكْتَبَات', 'directions', 'ك ت ب'],
  ['mustashfa', 'مُسْتَشْفَى', 'hospital', 'm', 'مُسْتَشْفَيَات', 'directions', 'ش ف ي'],
  ['matar', 'مَطَار', 'airport', 'm', 'مَطَارَات', 'directions', 'ط ي ر'],
  ['mahatta', 'مَحَطَّة', 'station', 'f', 'مَحَطَّات', 'directions', null],
  ['masjid', 'مَسْجِد', 'mosque', 'm', 'مَسَاجِد', 'directions', 'س ج د'],
  ['bank', 'بَنْك', 'bank', 'm', 'بُنُوك', 'directions', null],
  ['balad', 'بَلَد', 'country', 'm', 'بِلَاد', 'directions', 'ب ل د'],
  ['bahr', 'بَحْر', 'sea', 'm', 'بِحَار', 'directions', 'ب ح ر'],
  ['qitar', 'قِطَار', 'train', 'm', 'قِطَارَات', 'directions', 'ق ط ر'],
  ['taira', 'طَائِرَة', 'plane', 'f', 'طَائِرَات', 'directions', 'ط ي ر'],
  ['yawm', 'يَوْم', 'day', 'm', 'أَيَّام', 'time', 'ي و م'],
  ['layl', 'لَيْل', 'night', 'm', null, 'time', 'ل ي ل'],
  ['sabah', 'صَبَاح', 'morning', 'm', null, 'time', 'ص ب ح'],
  ['masa', 'مَسَاء', 'evening', 'm', null, 'time', null],
  ['usbu', 'أُسْبُوع', 'week', 'm', 'أَسَابِيع', 'time', 'س ب ع'],
  ['shahr', 'شَهْر', 'month', 'm', 'أَشْهُر', 'time', 'ش ه ر'],
  ['sana', 'سَنَة', 'year', 'f', 'سَنَوَات', 'time', null],
  ['saa', 'سَاعَة', 'hour / clock', 'f', 'سَاعَات', 'time', null],
  ['daqiqa', 'دَقِيقَة', 'minute', 'f', 'دَقَائِق', 'time', 'د ق ق'],
  ['waqt', 'وَقْت', 'time', 'm', 'أَوْقَات', 'time', 'و ق ت'],
];
const nouns = NOUNS.map(([id, it, en, gender, plural, topic, root, fem], i) => {
  const n = { id, it, en, rank: i + 1, topic, gender, plural };
  if (root) n.root = root;
  if (fem) n.fem = fem;
  return n;
});

// ---------------- adjectives ----------------
const ADJ = [
  ['kabir', 'big / old (age)', 'كَبِير كَبِيرَة كِبَار كَبِيرَات'],
  ['saghir', 'small / young', 'صَغِير صَغِيرَة صِغَار صَغِيرَات'],
  ['jadid', 'new', 'جَدِيد جَدِيدَة جُدُد جَدِيدَات'],
  ['qadim', 'old (things)', 'قَدِيم قَدِيمَة قُدَمَاء قَدِيمَات'],
  ['jamil', 'beautiful / nice', 'جَمِيل جَمِيلَة جَمِيلُون جَمِيلَات'],
  ['tawil', 'tall / long', 'طَوِيل طَوِيلَة طِوَال طَوِيلَات'],
  ['qasir', 'short', 'قَصِير قَصِيرَة قِصَار قَصِيرَات'],
  ['kathir', 'many / a lot', 'كَثِير كَثِيرَة كَثِيرُون كَثِيرَات'],
  ['qalil', 'few / little', 'قَلِيل قَلِيلَة قَلِيلُون قَلِيلَات'],
  ['harr', 'hot', 'حَارّ حَارَّة حَارُّون حَارَّات'],
  ['barid', 'cold', 'بَارِد بَارِدَة بَارِدُون بَارِدَات'],
  ['sahl', 'easy', 'سَهْل سَهْلَة سَهْلُون سَهْلَات'],
  ['sab', 'difficult', 'صَعْب صَعْبَة صِعَاب صَعْبَات'],
  ['jayyid', 'good', 'جَيِّد جَيِّدَة جَيِّدُون جَيِّدَات'],
  ['latif', 'kind / pleasant', 'لَطِيف لَطِيفَة لُطَفَاء لَطِيفَات'],
  ['said', 'happy', 'سَعِيد سَعِيدَة سُعَدَاء سَعِيدَات'],
  ['mutab', 'tired', 'مُتْعَب مُتْعَبَة مُتْعَبُون مُتْعَبَات'],
  ['jaii', 'hungry', 'جَائِع جَائِعَة جِيَاع جَائِعَات'],
  ['ladhidh', 'delicious', 'لَذِيذ لَذِيذَة لَذِيذُون لَذِيذَات'],
  ['qarib', 'near', 'قَرِيب قَرِيبَة قَرِيبُون قَرِيبَات'],
  ['baid', 'far', 'بَعِيد بَعِيدَة بَعِيدُون بَعِيدَات'],
  ['mashghul', 'busy', 'مَشْغُول مَشْغُولَة مَشْغُولُون مَشْغُولَات'],
  ['maftuh', 'open', 'مَفْتُوح مَفْتُوحَة مَفْتُوحُون مَفْتُوحَات'],
  ['mughlaq', 'closed', 'مُغْلَق مُغْلَقَة مُغْلَقُون مُغْلَقَات'],
  ['arabi', 'Arab / Arabic', 'عَرَبِيّ عَرَبِيَّة عَرَب عَرَبِيَّات'],
  ['amriki', 'American', 'أَمْرِيكِيّ أَمْرِيكِيَّة أَمْرِيكِيُّون أَمْرِيكِيَّات'],
];
const adjectives = ADJ.map(([id, en, f], i) => {
  const [ms, fs, mp, fp] = L(f);
  return { id, en, rank: i + 1, forms: { ms, fs, mp, fp } };
});

// ---------------- numbers ----------------
const UNITS = ['', 'وَاحِد', 'اِثْنَان', 'ثَلَاثَة', 'أَرْبَعَة', 'خَمْسَة', 'سِتَّة', 'سَبْعَة', 'ثَمَانِيَة', 'تِسْعَة', 'عَشَرَة'];
const TEENS = { 11: 'أَحَدَ عَشَر', 12: 'اِثْنَا عَشَر', 13: 'ثَلَاثَةَ عَشَر', 14: 'أَرْبَعَةَ عَشَر', 15: 'خَمْسَةَ عَشَر', 16: 'سِتَّةَ عَشَر', 17: 'سَبْعَةَ عَشَر', 18: 'ثَمَانِيَةَ عَشَر', 19: 'تِسْعَةَ عَشَر' };
const TENS = ['', '', 'عِشْرُون', 'ثَلَاثُون', 'أَرْبَعُون', 'خَمْسُون', 'سِتُّون', 'سَبْعُون', 'ثَمَانُون', 'تِسْعُون'];
const numbers = [];
for (let v = 1; v <= 100; v++) {
  let src;
  if (v <= 10) src = UNITS[v];
  else if (v < 20) src = TEENS[v];
  else if (v === 100) src = 'مِئَة';
  else if (v % 10 === 0) src = TENS[v / 10];
  else src = `${UNITS[v % 10]} وَ|${TENS[Math.floor(v / 10)]}`;
  numbers.push({ value: v, ...T(src), rank: v });
}

// ---------------- function words ----------------
const P = (src, en, type, note) => ({ ...T(src), en, type, note });
const prepositions = [
  P('فِي', 'in / at', 'simple', 'fī al-bayt = in the house.'),
  P('عَلَى', 'on', 'simple', 'ʿalā aṭ-ṭāwila = on the table.'),
  P('مِنْ', 'from / of', 'simple', 'Before al- it becomes mina: mina al-bayt.'),
  P('إِلَى', 'to (towards)', 'simple', 'ilā al-madrasa = to school.'),
  P('مَعَ', 'with (together with)', 'simple', 'maʿa ṣadīqī = with my friend.'),
  P('عِنْدَ', 'at / with (someone)', 'simple', 'With an ending it means “have”: ʿindī = I have.'),
  P('عَنْ', 'about / from', 'simple', 'ʿan al-ʿamal = about work.'),
  P('بِ', 'with / by / in', 'attached', 'Written joined to the next word: bi-s-sayyāra = by car.'),
  P('لِ', 'for / to', 'attached', 'Written joined to the next word; li + al- = lil-: li-l-bayt.'),
  P('تَحْتَ', 'under', 'simple', 'taḥta as-sarīr = under the bed.'),
  P('فَوْقَ', 'above', 'simple', 'fawqa al-bāb = above the door.'),
  P('أَمَامَ', 'in front of', 'simple', 'amāma al-funduq = in front of the hotel.'),
  P('وَرَاءَ', 'behind', 'simple', 'warāʾa al-bayt = behind the house.'),
  P('بَيْنَ', 'between', 'simple', 'bayna al-bank wa-l-madrasa = between the bank and the school.'),
  P('قَبْلَ', 'before', 'simple', 'qabla al-ghadāʾ = before lunch.'),
  P('بَعْدَ', 'after / in (time)', 'simple', 'baʿda sāʿa = in an hour.'),
];
const conjunctions = [
  P('وَ', 'and', 'coordinating', 'Written joined to the next word: kitāb wa-qalam.'),
  P('فَ', 'so / and then', 'coordinating', 'Written joined to the next word.'),
  P('أَوْ', 'or', 'coordinating', 'shāy aw qahwa? = tea or coffee?'),
  P('لٰكِنْ', 'but', 'coordinating', 'Spelled with a small (dagger) alif: lākin.'),
  P('ثُمَّ', 'then', 'coordinating', 'One thing after another.'),
  P('لِأَنَّ', 'because', 'subordinating', 'Followed by a noun or a pronoun ending: li-anna-hu = because he…'),
  P('إِذَا', 'if', 'subordinating', 'idhā kāna ʿindaka waqt = if you have time.'),
];
const G = (src, en, pos, explicit) => ({ ...T(src, {}, explicit), en, pos });
const glossary = [
  G('أَنَا', 'I', 'pronoun'), G('أَنْتَ', 'you (to a man)', 'pronoun'), G('أَنْتِ', 'you (to a woman)', 'pronoun'),
  G('هُوَ', 'he / it', 'pronoun'), G('هِيَ', 'she / it', 'pronoun'), G('نَحْنُ', 'we', 'pronoun'),
  G('أَنْتُمْ', 'you all', 'pronoun'), G('هُمْ', 'they', 'pronoun'),
  G('هٰذَا', 'this (m.)', 'demonstrative'), G('هٰذِهِ', 'this (f.)', 'demonstrative'),
  G('ذٰلِكَ', 'that (m.)', 'demonstrative'), G('تِلْكَ', 'that (f.)', 'demonstrative'),
  G('مَا', 'what', 'question word'), G('مَاذَا', 'what (with a verb)', 'question word'), G('مَنْ', 'who', 'question word'),
  G('أَيْنَ', 'where', 'question word'), G('مَتَى', 'when', 'question word'), G('كَيْفَ', 'how', 'question word'),
  G('كَمْ', 'how many / how much', 'question word'), G('بِ|كَمْ', 'how much (price)', 'question word'),
  G('لِمَاذَا', 'why', 'question word'), G('هَلْ', '(yes/no question)', 'question word'),
  G('لَا', 'no / not (present)', 'negation'), G('لَمْ', 'did not (+ verb)', 'negation'), G('لَنْ', 'will not (+ verb)', 'negation'),
  G('لَيْسَ', 'is not (he)', 'negation'), G('لَيْسَتْ', 'is not (she)', 'negation'), G('لَسْتُ', 'am not', 'negation'),
  G('نَعَمْ', 'yes', 'adverb'), G('هُنَا', 'here', 'adverb'), G('هُنَاكَ', 'there / there is', 'adverb'),
  G('الْآن', 'now', 'adverb'), G('الْيَوْم', 'today', 'adverb'), G('غَدًا', 'tomorrow', 'adverb'), G('أَمْسِ', 'yesterday', 'adverb'),
  G('جِدًّا', 'very', 'adverb'), G('أَيْضًا', 'also', 'adverb'), G('كُلّ', 'every / all', 'adverb'),
  G('قَلِيلًا', 'a little', 'adverb'), G('كَثِيرًا', 'a lot', 'adverb'), G('دَائِمًا', 'always', 'adverb'),
  G('جَيِّدًا', 'well', 'adverb'), G('أَنْ', 'to (before a verb)', 'particle'), G('يَا', 'O (when calling someone)', 'particle'),
  G('يُمْكِنُ', 'it is possible / can', 'verb'), G('اِذْهَبْ', 'go! (to a man)', 'verb'),
  G('الْيَمِين', 'the right', 'noun'), G('الْيَسَار', 'the left', 'noun'), G('خَيْر', 'good / well-being', 'noun'), G('حَال', 'state / how someone is', 'noun'),
  G('الْعَرَبِيَّة', 'Arabic (the language)', 'noun'), G('ثَلَاث', 'three (with feminine nouns)', 'number'),
  G('ثَالِثَة', 'third (f.)', 'number'),
  G('مَرْحَبًا', 'hello', 'phrase'), G('أَهْلًا', 'welcome / hi', 'phrase'), G('أَهْلًا وَ|سَهْلًا', 'welcome', 'phrase'),
  G('السَّلَامُ عَلَيْكُمْ', 'peace be upon you (hello)', 'phrase'),
  G('وَعَلَيْكُمُ السَّلَام', 'and upon you peace (reply)', 'phrase', 'wa-ʿalaykum as-salām'),
  G('صَبَاح الْخَيْر', 'good morning', 'phrase'), G('صَبَاح النُّور', 'good morning (reply)', 'phrase'),
  G('مَسَاء الْخَيْر', 'good evening', 'phrase'), G('مَسَاء النُّور', 'good evening (reply)', 'phrase'),
  G('شُكْرًا', 'thank you', 'phrase'), G('شُكْرًا جَزِيلًا', 'thank you very much', 'phrase'),
  G('عَفْوًا', 'you’re welcome / excuse me', 'phrase'), G('مِنْ فَضْلِكَ', 'please', 'phrase'),
  G('مَعَ السَّلَامَة', 'goodbye', 'phrase'), G('تَشَرَّفْنَا', 'nice to meet you', 'phrase'),
  G('بِ|خَيْر', 'fine / well', 'phrase'), G('كَيْفَ الْحَال', 'how are things?', 'phrase'),
  G('سَارَة', 'Sara', 'name'), G('لَيْلَى', 'Layla', 'name'), G('مُحَمَّد', 'Muhammad', 'name'), G('مِصْر', 'Egypt', 'name'),
  G('أَمْرِيكَا', 'America', 'name'), G('الْقَاهِرَة', 'Cairo', 'name'), G('دِمَشْق', 'Damascus', 'name'),
];

// ---------------- sentences ----------------
const S = [
  // [arabic, english, topic, type, function, explicit romanization]
  ['مَرْحَبًا، أَنَا سَارَة.', 'Hello, I’m Sara.', 'social', 'statement', null],
  ['أَهْلًا وَ|سَهْلًا!', 'Welcome!', 'social', 'statement', null],
  ['السَّلَامُ عَلَيْكُمْ.', 'Peace be upon you (hello).', 'social', 'statement', null],
  ['وَعَلَيْكُمُ السَّلَام.', 'And upon you be peace (the reply).', 'social', 'statement', null, 'wa-ʿalaykum as-salām.'],
  ['صَبَاح الْخَيْر.', 'Good morning.', 'social', 'statement', null],
  ['مَسَاء الْخَيْر.', 'Good evening.', 'social', 'statement', null],
  ['شُكْرًا جَزِيلًا.', 'Thank you very much.', 'social', 'statement', null],
  ['أَنَا بِ|خَيْر، شُكْرًا.', 'I’m fine, thanks.', 'social', 'statement', 'nominal'],
  ['تَشَرَّفْنَا يَا سَارَة.', 'Nice to meet you, Sara.', 'social', 'statement', null],
  ['مَعَ السَّلَامَة.', 'Goodbye.', 'social', 'statement', null],
  ['اِسْمِي مُحَمَّد.', 'My name is Muhammad.', 'social', 'statement', 'pronoun_suffix'],
  ['أَنَا طَالِب.', 'I am a student.', 'social', 'statement', 'nominal'],
  ['هِيَ مُعَلِّمَة.', 'She is a teacher.', 'social', 'statement', 'nominal'],
  ['نَحْنُ مِنْ مِصْر.', 'We are from Egypt.', 'social', 'statement', 'nominal'],
  ['هُوَ أَخِي الْكَبِير.', 'He is my older brother.', 'social', 'statement', 'pronoun_suffix'],
  ['أُمِّي طَبِيبَة.', 'My mother is a doctor.', 'social', 'statement', 'pronoun_suffix'],
  ['عِنْدِي أَخ وَ|أُخْت.', 'I have a brother and a sister.', 'social', 'statement', 'possession'],
  ['زَوْجِي مُعَلِّم.', 'My husband is a teacher.', 'social', 'statement', 'pronoun_suffix'],
  ['عَائِلَتِي كَبِيرَة.', 'My family is big.', 'social', 'statement', 'pronoun_suffix'],
  ['عِنْدَهُمْ ثَلَاثَة أَطْفَال.', 'They have three children.', 'social', 'statement', 'possession', 'ʿindahum thalāthat aṭfāl.'],
  ['هٰذِهِ صَدِيقَتِي لَيْلَى.', 'This is my friend Layla.', 'social', 'statement', 'pronoun_suffix'],
  ['أَتَكَلَّمُ الْعَرَبِيَّة قَلِيلًا.', 'I speak a little Arabic.', 'social', 'statement', null],
  ['أَتَعَلَّمُ اللُّغَة الْعَرَبِيَّة.', 'I’m learning Arabic.', 'social', 'statement', 'agreement'],
  ['لَا أَفْهَمُ.', 'I don’t understand.', 'social', 'negative', null],
  ['لَمْ أَفْهَمْ.', 'I didn’t understand.', 'social', 'negative', null],
  ['لَا أَعْرِفُ.', 'I don’t know.', 'social', 'negative', null],
  ['هُمْ سُعَدَاء جِدًّا.', 'They are very happy.', 'social', 'statement', 'nominal'],
  ['هَلْ يُمْكِنُ أَنْ تُسَاعِدَنِي؟', 'Can you help me?', 'social', 'request', 'ability'],
  ['عِنْدِي سُؤَال.', 'I have a question.', 'social', 'statement', 'possession'],
  ['هُوَ لَيْسَ هُنَا.', 'He isn’t here.', 'social', 'negative', 'nominal'],
  ['هِيَ لَيْسَتْ فِي الْبَيْت.', 'She isn’t at home.', 'social', 'negative', 'nominal'],
  ['أَنَا جَائِع.', 'I’m hungry.', 'food', 'statement', 'nominal'],
  ['نَحْنُ مُتْعَبُون.', 'We are tired.', 'everyday', 'statement', 'nominal'],
  ['هٰذَا بَيْت كَبِير.', 'This is a big house.', 'everyday', 'statement', 'agreement'],
  ['الْبَيْت كَبِير.', 'The house is big.', 'everyday', 'statement', 'nominal'],
  ['السَّيَّارَة الْجَدِيدَة جَمِيلَة.', 'The new car is beautiful.', 'everyday', 'statement', 'agreement'],
  ['هٰذِهِ مَدْرَسَة قَدِيمَة.', 'This is an old school.', 'directions', 'statement', 'agreement'],
  ['الْكِتَاب عَلَى الطَّاوِلَة.', 'The book is on the table.', 'everyday', 'statement', 'nominal'],
  ['الْقِطَّة تَحْتَ السَّرِير.', 'The cat is under the bed.', 'everyday', 'statement', 'nominal'],
  ['الْمِفْتَاح فِي الْغُرْفَة.', 'The key is in the room.', 'everyday', 'statement', 'nominal'],
  ['هُنَاكَ قَلَم عَلَى الْكُرْسِيّ.', 'There is a pen on the chair.', 'everyday', 'statement', 'existence'],
  ['بَيْت الطَّالِب صَغِير.', 'The student’s house is small.', 'everyday', 'statement', 'idafa'],
  ['سَيَّارَة الْمُعَلِّم جَدِيدَة.', 'The teacher’s car is new.', 'everyday', 'statement', 'idafa'],
  ['بَاب الْبَيْت مَفْتُوح.', 'The door of the house is open.', 'everyday', 'statement', 'idafa'],
  ['أَكْتُبُ رِسَالَة.', 'I’m writing a letter.', 'everyday', 'statement', null],
  ['هُوَ يَدْرُسُ فِي الْجَامِعَة.', 'He studies at the university.', 'everyday', 'statement', null],
  ['هِيَ تَعْمَلُ فِي مُسْتَشْفَى.', 'She works in a hospital.', 'everyday', 'statement', null],
  ['نَحْنُ نَسْكُنُ فِي مَدِينَة كَبِيرَة.', 'We live in a big city.', 'everyday', 'statement', 'agreement'],
  ['هُمْ يَلْعَبُونَ فِي الشَّارِع.', 'They are playing in the street.', 'everyday', 'statement', null],
  ['أَيْنَ هَاتِفِي؟', 'Where is my phone?', 'everyday', 'question', 'pronoun_suffix'],
  ['أَخِي يَتَكَلَّمُ ثَلَاث لُغَات.', 'My brother speaks three languages.', 'everyday', 'statement', null],
  ['أَقْرَأُ كُلّ يَوْم.', 'I read every day.', 'everyday', 'statement', null],
  ['هٰذِهِ الْغُرْفَة صَغِيرَة.', 'This room is small.', 'everyday', 'statement', 'agreement'],
  ['رَأَيْتُ قِطَّة فِي الشَّارِع.', 'I saw a cat in the street.', 'everyday', 'statement', null],
  ['اِشْتَرَيْتُ سَيَّارَة جَدِيدَة.', 'I bought a new car.', 'everyday', 'statement', 'agreement'],
  ['الْوَلَد يَلْعَبُ مَعَ الْكَلْب.', 'The boy is playing with the dog.', 'everyday', 'statement', null],
  ['وَجَدْتُ الْمِفْتَاح.', 'I found the key.', 'everyday', 'statement', null],
  ['نَسِيتُ الْمِفْتَاح فِي السَّيَّارَة.', 'I left the key in the car.', 'everyday', 'statement', null],
  ['كَتَبَ الطَّالِب الدَّرْس.', 'The student wrote the lesson.', 'everyday', 'statement', 'word_order'],
  ['ذَهَبَ الْأَوْلَاد إِلَى الْمَدْرَسَة.', 'The boys went to school.', 'everyday', 'statement', 'word_order'],
  ['جَاءَ الْمُعَلِّم.', 'The teacher came.', 'everyday', 'statement', 'word_order'],
  ['خَرَجَتْ أُمِّي مِنَ الْبَيْت.', 'My mother left the house.', 'everyday', 'statement', 'word_order'],
  ['فَتَحَ الْوَلَد الْبَاب.', 'The boy opened the door.', 'everyday', 'statement', 'word_order'],
  ['بَاعَ أَبِي سَيَّارَتَهُ.', 'My father sold his car.', 'everyday', 'statement', 'word_order'],
  ['أَخَذْتُ الْكِتَاب مِنَ الْمَكْتَبَة.', 'I took the book from the library.', 'everyday', 'statement', null],
  ['سَأَلْتُ الْمُعَلِّم سُؤَال.', 'I asked the teacher a question.', 'everyday', 'statement', null],
  ['فَهِمْتُ الدَّرْس.', 'I understood the lesson.', 'everyday', 'statement', null],
  ['كُنْتُ فِي الْبَيْت.', 'I was at home.', 'everyday', 'statement', null],
  ['دَخَلْنَا الْغُرْفَة.', 'We went into the room.', 'everyday', 'statement', null],
  ['أَشْرَبُ الْقَهْوَة كُلّ صَبَاح.', 'I drink coffee every morning.', 'food', 'statement', null],
  ['أُرِيدُ كُوب شَاي، مِنْ فَضْلِكَ.', 'I’d like a cup of tea, please.', 'food', 'request', 'desire'],
  ['أُرِيدُ مَاء بَارِد.', 'I want cold water.', 'food', 'request', 'desire'],
  ['هَلْ عِنْدَكُمْ دَجَاج؟', 'Do you have chicken?', 'food', 'question', 'possession'],
  ['الطَّعَام لَذِيذ جِدًّا.', 'The food is very good.', 'food', 'statement', 'nominal'],
  ['لَا آكُلُ اللَّحْم.', 'I don’t eat meat.', 'food', 'negative', null],
  ['أُحِبُّ الْقَهْوَة.', 'I like coffee.', 'food', 'statement', 'preference'],
  ['هِيَ تُحِبُّ الشَّاي مَعَ الْحَلِيب.', 'She likes tea with milk.', 'food', 'statement', 'preference'],
  ['لَا أُحِبُّ السَّمَك.', 'I don’t like fish.', 'food', 'negative', 'preference'],
  ['أَكَلْنَا فِي مَطْعَم جَمِيل.', 'We ate at a nice restaurant.', 'food', 'statement', 'agreement'],
  ['الْعَصِير بَارِد.', 'The juice is cold.', 'food', 'statement', 'nominal'],
  ['الْحِسَاب، مِنْ فَضْلِكَ.', 'The bill, please.', 'food', 'request', null],
  ['أُرِيدُ خُبْز وَ|جُبْن.', 'I want bread and cheese.', 'food', 'request', 'desire'],
  ['الْأَرُزّ مَعَ الدَّجَاج لَذِيذ.', 'Rice with chicken is delicious.', 'food', 'statement', 'nominal'],
  ['هَلْ تُرِيدُ سُكَّر؟', 'Do you want sugar?', 'food', 'question', 'desire'],
  ['الْقَهْوَة حَارَّة.', 'The coffee is hot.', 'food', 'statement', 'nominal'],
  ['طَبَخَ أَبِي الْعَشَاء.', 'My father cooked dinner.', 'food', 'statement', 'word_order'],
  ['جَلَسْنَا فِي الْمَقْهَى.', 'We sat in the café.', 'food', 'statement', null],
  ['الْمَطَار بَعِيد.', 'The airport is far.', 'directions', 'statement', 'nominal'],
  ['الْبَنْك أَمَامَ الْفُنْدُق.', 'The bank is in front of the hotel.', 'directions', 'statement', 'nominal'],
  ['الْمَسْجِد بَيْنَ الْبَنْك وَالْمَدْرَسَة.', 'The mosque is between the bank and the school.', 'directions', 'statement', 'nominal'],
  ['اِذْهَبْ إِلَى الْيَمِين.', 'Go right.', 'directions', 'request', null],
  ['الْفُنْدُق عَلَى الْيَسَار.', 'The hotel is on the left.', 'directions', 'statement', 'nominal'],
  ['أُرِيدُ أَنْ أَذْهَبَ إِلَى الْمَطَار.', 'I want to go to the airport.', 'directions', 'statement', 'desire'],
  ['سَافَرْتُ إِلَى مِصْر بِالطَّائِرَة.', 'I traveled to Egypt by plane.', 'directions', 'statement', null],
  ['نَذْهَبُ إِلَى الْمَدْرَسَة بِالسَّيَّارَة.', 'We go to school by car.', 'directions', 'statement', null],
  ['هُنَاكَ مَطْعَم قَرِيب.', 'There is a restaurant nearby.', 'directions', 'statement', 'existence'],
  ['لَيْسَ هُنَاكَ بَنْك هُنَا.', 'There is no bank here.', 'directions', 'negative', 'existence'],
  ['الْمَكْتَبَة فِي هٰذَا الشَّارِع.', 'The bookshop is on this street.', 'directions', 'statement', 'nominal'],
  ['السُّوق مُغْلَق الْيَوْم.', 'The market is closed today.', 'directions', 'statement', 'nominal'],
  ['الْفُنْدُق قَرِيب مِنَ الْبَحْر.', 'The hotel is close to the sea.', 'directions', 'statement', 'nominal'],
  ['وَصَلْنَا إِلَى الْمَطَار.', 'We arrived at the airport.', 'directions', 'statement', null],
  ['أَنْتَظِرُ الْقِطَار.', 'I’m waiting for the train.', 'directions', 'statement', null],
  ['يَرْكَبُ الْقِطَار إِلَى الْعَمَل.', 'He takes the train to work.', 'directions', 'statement', null],
  ['يَمْشِي إِلَى الْعَمَل كُلّ يَوْم.', 'He walks to work every day.', 'directions', 'statement', null],
  ['الْيَوْم يَوْم جَمِيل.', 'Today is a beautiful day.', 'time', 'statement', 'nominal'],
  ['سَأَذْهَبُ إِلَى السُّوق غَدًا.', 'I’ll go to the market tomorrow.', 'time', 'statement', 'future_plans'],
  ['سَنُسَافِرُ بَعْدَ أُسْبُوع.', 'We’ll travel in a week.', 'time', 'statement', 'future_plans'],
  ['سَأَزُورُ صَدِيقِي غَدًا.', 'I’ll visit my friend tomorrow.', 'time', 'statement', 'future_plans'],
  ['ذَهَبْتُ إِلَى الْبَنْك أَمْسِ.', 'I went to the bank yesterday.', 'time', 'statement', null],
  ['أَعْمَلُ مِنَ الصَّبَاح إِلَى الْمَسَاء.', 'I work from morning to evening.', 'time', 'statement', null],
  ['الدَّرْس بَعْدَ سَاعَة.', 'The lesson is in an hour.', 'time', 'statement', 'nominal'],
  ['أَنَامُ فِي اللَّيْل.', 'I sleep at night.', 'time', 'statement', null],
  ['لَنْ أَذْهَبَ إِلَى الْعَمَل غَدًا.', 'I won’t go to work tomorrow.', 'time', 'negative', 'future_plans'],
  ['نِمْتُ جَيِّدًا.', 'I slept well.', 'time', 'statement', null],
];
const sentences = S.map(([src, en, topic, type, fn, tr], i) => ({
  id: `s${i + 1}`, rank: i + 1, topic, type, function: fn, ...T(src, {}, tr), en, accepted: [],
}));

const Q = [
  ['كَيْفَ حَالُكَ؟', 'How are you? (to a man)', 'social', 'كَيْفَ', ['بِ|خَيْر، شُكْرًا.', 'Fine, thanks.']],
  ['مَا اِسْمُكَ؟', 'What’s your name?', 'social', 'مَا', ['اِسْمِي سَارَة.', 'My name is Sara.']],
  ['مِنْ أَيْنَ أَنْتَ؟', 'Where are you from?', 'social', 'أَيْنَ', ['أَنَا مِنْ أَمْرِيكَا.', 'I’m from America.']],
  ['هَلْ تَتَكَلَّمُ الْعَرَبِيَّة؟', 'Do you speak Arabic?', 'social', 'هَلْ', ['نَعَمْ، قَلِيلًا.', 'Yes, a little.']],
  ['كَمْ عُمْرُكَ؟', 'How old are you?', 'social', 'كَمْ', ['عُمْرِي ثَلَاثُون سَنَة.', 'I’m thirty.']],
  ['مَنْ هٰذَا؟', 'Who is this?', 'social', 'مَنْ', ['هٰذَا أَخِي.', 'This is my brother.']],
  ['أَيْنَ تَسْكُنُ؟', 'Where do you live?', 'everyday', 'أَيْنَ', ['أَسْكُنُ فِي الْقَاهِرَة.', 'I live in Cairo.']],
  ['مَا هٰذَا؟', 'What is this?', 'everyday', 'مَا', ['هٰذَا كِتَاب.', 'This is a book.']],
  ['هَلْ عِنْدَكَ سَيَّارَة؟', 'Do you have a car?', 'everyday', 'هَلْ', ['لَا، لَيْسَ عِنْدِي سَيَّارَة.', 'No, I don’t have a car.']],
  ['مَاذَا تُرِيدُ؟', 'What would you like?', 'food', 'مَاذَا', ['أُرِيدُ قَهْوَة، مِنْ فَضْلِكَ.', 'A coffee, please.']],
  ['بِ|كَمْ هٰذَا؟', 'How much is this?', 'food', 'بِكَمْ', ['هٰذَا بِ|خَمْسَة دَنَانِير.', 'This is five dinars.']],
  ['أَيْنَ الْمَحَطَّة؟', 'Where is the station?', 'directions', 'أَيْنَ', ['الْمَحَطَّة قَرِيبَة مِنْ هُنَا.', 'The station is close to here.']],
  ['كَيْفَ أَذْهَبُ إِلَى السُّوق؟', 'How do I get to the market?', 'directions', 'كَيْفَ', ['اِذْهَبْ إِلَى الْيَمِين.', 'Go right.']],
  ['مَتَى تَذْهَبُ إِلَى الْعَمَل؟', 'When do you go to work?', 'time', 'مَتَى', ['أَذْهَبُ فِي الصَّبَاح.', 'I go in the morning.']],
  ['كَمِ السَّاعَة؟', 'What time is it?', 'time', 'كَمْ', ['السَّاعَة الثَّالِثَة.', 'It’s three o’clock.'], 'kami s-sāʿa?'],
];
const questions = Q.map(([src, en, topic, word, [a, aen], tr], i) => ({
  id: `q${i + 1}`, rank: i + 1, topic, type: 'question', function: null, ...T(src, {}, tr), en, word,
  answers: [{ ...T(a), en: aen }],
}));

// ---------------- alphabet ----------------
const groups = [
  { id: 'g1', label: '1 · ا ب ت ث ن ي', title: 'ا ب ت ث ن ي and short vowels' },
  { id: 'g2', label: '2 · ج ح خ د ذ ر ز و', title: 'ج ح خ د ذ ر ز و' },
  { id: 'g3', label: '3 · س ش ص ض ط ظ', title: 'س ش ص ض ط ظ' },
  { id: 'g4', label: '4 · ع غ ف ق ك ل م ه', title: 'ع غ ف ق ك ل م ه' },
  { id: 'g5', label: '5 · ء ة ى لا ّ ً', title: 'hamza, tāʾ marbūṭa, alif maqṣūra, lām-alif, shadda, tanwīn' },
];
const J = ['i', 'm', 'f'];
// [id, char, name, sound, group, positions, similar, tip, example [arabic, english]]
const LETTERS = [
  ['alif', 'ا', 'أَلِف', 'ā', 'g1', ['f'], 'lam lam_alif alif_maqsura', 'A single upright stroke. Usually the long vowel ā; at the start of a word it carries a short vowel. Never joins the letter after it.', ['بَاب', 'door']],
  ['ba', 'ب', 'بَاء', 'b', 'g1', J, 'ta tha nun ya', 'One dot below. Like English b.', ['بَيْت', 'house']],
  ['ta', 'ت', 'تَاء', 't', 'g1', J, 'ba tha nun taa', 'Two dots above. Like English t.', ['تِين', 'figs']],
  ['tha', 'ث', 'ثَاء', 'th', 'g1', J, 'ta ba nun shin', 'Three dots above. th as in “think”, never as in “this”.', ['ثَلَاثَة', 'three']],
  ['nun', 'ن', 'نُون', 'n', 'g1', J, 'ba ta ya', 'One dot above, with a deeper bowl at the end of a word. Like English n.', ['نُور', 'light']],
  ['ya', 'ي', 'يَاء', 'y / ī', 'g1', J, 'ba nun alif_maqsura', 'Two dots below. A consonant y, or the long vowel ī after kasra.', ['يَوْم', 'day']],
  ['jim', 'ج', 'جِيم', 'j', 'g2', J, 'ha kha', 'A dot inside the bowl. Like j in “jam”.', ['جَمِيل', 'beautiful']],
  ['ha', 'ح', 'حَاء', 'ḥ', 'g2', J, 'jim kha haa', 'No dot. A strong, breathy h from deep in the throat, like breathing on glasses to clean them.', ['حَلِيب', 'milk']],
  ['kha', 'خ', 'خَاء', 'kh', 'g2', J, 'ha jim ghayn', 'One dot above. Like ch in Scottish “loch” or German “Bach”.', ['خُبْز', 'bread']],
  ['dal', 'د', 'دَال', 'd', 'g2', ['f'], 'dhal ra dad', 'Like English d. Never joins the letter after it.', ['دَرْس', 'lesson']],
  ['dhal', 'ذ', 'ذَال', 'dh', 'g2', ['f'], 'dal zay zaa', 'dāl with a dot. th as in “this”. Never joins the letter after it.', ['ذَهَبَ', 'he went']],
  ['ra', 'ر', 'رَاء', 'r', 'g2', ['f'], 'zay dal waw', 'Dips below the line. A tapped r, like in Spanish “pero”. Never joins the letter after it.', ['رَجُل', 'man']],
  ['zay', 'ز', 'زَاي', 'z', 'g2', ['f'], 'ra dhal', 'rāʾ with a dot. Like English z. Never joins the letter after it.', ['زَوْج', 'husband']],
  ['waw', 'و', 'وَاو', 'w / ū', 'g2', ['f'], 'ra mim qaf', 'A consonant w, or the long vowel ū after ḍamma. Never joins the letter after it.', ['وَلَد', 'boy']],
  ['sin', 'س', 'سِين', 's', 'g3', J, 'shin sad', 'Three small teeth. Like English s.', ['سَمَك', 'fish']],
  ['shin', 'ش', 'شِين', 'sh', 'g3', J, 'sin sad tha', 'sīn with three dots above. Like English sh.', ['شَمْس', 'sun']],
  ['sad', 'ص', 'صَاد', 'ṣ', 'g3', J, 'dad sin', 'Heavy s: pull the back of the tongue up. Vowels next to it sound darker.', ['صَدِيق', 'friend']],
  ['dad', 'ض', 'ضَاد', 'ḍ', 'g3', J, 'sad dal', 'Heavy d. So typical of Arabic that it’s called “the language of ḍād”.', ['ضَيْف', 'guest']],
  ['taa', 'ط', 'طَاء', 'ṭ', 'g3', J, 'zaa ta', 'Heavy t.', ['طَالِب', 'student']],
  ['zaa', 'ظ', 'ظَاء', 'ẓ', 'g3', J, 'taa dhal', 'Heavy dh (as in “this”); many speakers say a heavy z.', ['ظُهْر', 'noon']],
  ['ayn', 'ع', 'عَيْن', 'ʿ', 'g4', J, 'ghayn hamza ha', 'A voiced squeeze in the middle of the throat. No English equivalent: say “ah” while tightening your throat.', ['عَيْن', 'eye']],
  ['ghayn', 'غ', 'غَيْن', 'gh', 'g4', J, 'ayn kha', 'ʿayn with a dot. A gargled sound, like a French r.', ['غُرْفَة', 'room']],
  ['fa', 'ف', 'فَاء', 'f', 'g4', J, 'qaf waw', 'One dot above a small loop. Like English f.', ['فُنْدُق', 'hotel']],
  ['qaf', 'ق', 'قَاف', 'q', 'g4', J, 'fa kaf', 'Two dots above and a deep tail. A k made far back in the throat.', ['قَلَم', 'pen']],
  ['kaf', 'ك', 'كَاف', 'k', 'g4', J, 'lam qaf', 'Like English k. At the start or in the middle it looks like كـ.', ['كِتَاب', 'book']],
  ['lam', 'ل', 'لَام', 'l', 'g4', J, 'kaf alif', 'Tall, with a hook below at the end of a word. Like English l.', ['لَيْل', 'night']],
  ['mim', 'م', 'مِيم', 'm', 'g4', J, 'waw haa', 'A small round loop. Like English m.', ['مَاء', 'water']],
  ['haa', 'ه', 'هَاء', 'h', 'g4', J, 'ta_marbuta ha', 'A light h, as in “hat”. Its shape changes more than any other letter’s.', ['هُنَا', 'here']],
  ['hamza', 'ء', 'هَمْزَة', 'ʾ', 'g5', [], 'ayn alif', 'The catch in “uh-oh”. Often sits on a seat: أ إ ؤ ئ. Not written in romanization at the start of a word.', ['سُؤَال', 'question']],
  ['ta_marbuta', 'ة', 'تَاء مَرْبُوطَة', '-a / -at', 'g5', ['f'], 'haa ta', 'Only at the end of a word, mostly feminine nouns. Said -a at the end of a phrase, -at when linked to the next word.', ['مَدْرَسَة', 'school']],
  ['alif_maqsura', 'ى', 'أَلِف مَقْصُورَة', 'ā', 'g5', ['f'], 'ya alif', 'A yāʾ without dots, only at the end of a word. Sounds like alif: ā.', ['عَلَى', 'on']],
  ['lam_alif', 'لا', 'لَام أَلِف', 'lā', 'g5', ['f'], 'lam alif', 'lām + alif always join into this one shape. Also the word for “no”.', ['لَا', 'no']],
];
const NOT_CONSONANT = new Set(['alif', 'hamza', 'ta_marbuta', 'alif_maqsura', 'lam_alif']);
const letters = LETTERS.map(([id, ch, name, sound, group, positions, similar, tip, [ex, exEn]]) => ({
  id, ch, name, sound, group, positions, joins: positions.includes('m'), consonant: !NOT_CONSONANT.has(id),
  sun: NOT_CONSONANT.has(id) ? null : A.SUN.has(ch), similar: similar.split(' '), tip, example: { ...T(ex), en: exEn },
}));
const marks = [
  { id: 'fatha', name: 'فَتْحَة', tpl: 'Cَ', group: 'g1', set: 'short', en: 'fatḥa: a short a. A small stroke above the letter.' },
  { id: 'kasra', name: 'كَسْرَة', tpl: 'Cِ', group: 'g1', set: 'short', en: 'kasra: a short i. A small stroke below the letter.' },
  { id: 'damma', name: 'ضَمَّة', tpl: 'Cُ', group: 'g1', set: 'short', en: 'ḍamma: a short u. A tiny wāw above the letter.' },
  { id: 'sukun', name: 'سُكُون', tpl: 'CَDْ', group: 'g1', set: 'short', en: 'sukūn: no vowel. A small circle above; the letter closes the syllable.' },
  { id: 'long_a', name: 'أَلِف مَدّ', tpl: 'Cَا', group: 'g1', set: 'long', en: 'fatḥa + alif = long ā.' },
  { id: 'long_i', name: 'يَاء مَدّ', tpl: 'Cِي', group: 'g1', set: 'long', en: 'kasra + yāʾ = long ī.' },
  { id: 'long_u', name: 'وَاو مَدّ', tpl: 'Cُو', group: 'g2', set: 'long', en: 'ḍamma + wāw = long ū.' },
  { id: 'shadda', name: 'شَدَّة', tpl: 'CَDَّ', group: 'g5', set: 'extra', en: 'shadda: a doubled consonant. A small w-shape above; hold the sound twice as long.' },
  { id: 'tanwin_a', name: 'تَنْوِين فَتْح', tpl: 'Cًا', group: 'g5', set: 'extra', en: 'tanwīn fatḥ: a doubled fatḥa adds -an. The alif after it is silent.' },
  { id: 'tanwin_i', name: 'تَنْوِين كَسْر', tpl: 'Cٍ', group: 'g5', set: 'extra', en: 'tanwīn kasr: a doubled kasra adds -in.' },
  { id: 'tanwin_u', name: 'تَنْوِين ضَمّ', tpl: 'Cٌ', group: 'g5', set: 'extra', en: 'tanwīn ḍamm: a doubled ḍamma adds -un.' },
];

// ---------------- alphabet lessons ----------------
const H = (text) => ({ type: 'heading', text });
const Pp = (text) => ({ type: 'text', text });
const W = (src, en, note, say) => ({ type: 'word', ...T(src), en, ...(note ? { note } : {}), ...(say ? { say } : {}) });
const X = (src, en) => ({ type: 'example', ...T(src), en });
const N = (label, text) => ({ type: 'note', label, text });
const Ls = (title, items) => ({ type: 'list', title, items: items.map(([src, en]) => ({ ...T(src), en })) });
const Ck = (prompt, options, why) => ({ type: 'check', prompt, options, answer: 0, why });
const sounds = (chs) => chs.split(' ').map((ch) => [ch, letters.find((l) => l.ch === ch).sound]);

const lessons = [
  {
    id: 'alphabet-1', order: 1, unit: 1, title: 'Dots make the difference', subtitle: 'ا ب ت ث ن ي and short vowels',
    goals: ['Read the five letters that share one shape: *ب ت ث ن ي*', 'Read the short vowels a, i, u and the no-vowel mark', 'Read your first words: *بَاب*, *بِنْت*, *بَيْت*'],
    practice: ['ab:alif', 'ab:ba', 'ab:ta', 'ab:tha', 'ab:nun', 'ab:ya', 'ab:ba:i', 'ab:ta:i', 'ab:nun:i', 'ab:ya:i', 'ab:mark:fatha', 'ab:mark:kasra', 'ab:mark:damma', 'ab:mark:sukun', 'ab:mark:long_a', 'ab:mark:long_i'],
    steps: [
      H('Right to left, no capitals'),
      Pp('Arabic is written and read from right to left. The alphabet has 28 letters and no capital letters. Inside a word most letters join the next one, so a letter’s shape changes a little depending on whether it comes at the start, in the middle or at the end of a word.'),
      Pp('Short vowels aren’t letters. They are small marks above or below a letter. Newspapers and street signs leave them out; beginners’ books include them, and so does this app. When you’re ready, turn off Vowel marks at the top of the page.'),
      H('Five letters, one shape'),
      Pp('These five letters share one basic shape. Only the dots tell them apart: how many, and whether they sit above or below.'),
      W('ب', 'bāʾ', 'One dot below. Like English b.', 'بَاء'),
      W('ت', 'tāʾ', 'Two dots above. Like English t.', 'تَاء'),
      W('ث', 'thāʾ', 'Three dots above. th as in “think”, never as in “this”.', 'ثَاء'),
      W('ن', 'nūn', 'One dot above, with a deeper, rounder bowl. Like English n.', 'نُون'),
      W('ي', 'yāʾ', 'Two dots below. A consonant y as in “yes”, or the long vowel ī.', 'يَاء'),
      Ck('Which letter has three dots above?', ['*ث*', '*ت*', '*ن*'], 'Three dots above is *ث* (th). Two dots above is *ت*, and one is *ن*.'),
      H('Shapes inside a word'),
      Pp('At the start or in the middle of a word, these letters shrink to a small tooth with dots, and only the dots tell them apart. At the end of a word they keep their full shape. The line ـ shows where a letter joins its neighbours; it isn’t a letter.'),
      Ls('ب in each position (read right to left)', [['بـ', 'start'], ['ـبـ', 'middle'], ['ـب', 'end'], ['ب', 'alone']]),
      Ls('The five letters at the start of a word', [['بـ', 'b'], ['تـ', 't'], ['ثـ', 'th'], ['نـ', 'n'], ['يـ', 'y']]),
      W('ا', 'alif', 'A single upright stroke, usually the long vowel ā. Alif never joins the letter after it.', 'أَلِف'),
      H('Short vowels'),
      W('بَ', 'fatḥa: short a', 'A small stroke above the letter.'),
      W('بِ', 'kasra: short i', 'A small stroke below the letter.'),
      W('بُ', 'ḍamma: short u', 'A tiny wāw above the letter.'),
      W('بَتْ', 'sukūn: no vowel', 'A small circle above a letter means no vowel follows it. Here it closes the syllable: bat.'),
      Ck('How do you read *تُ*?', ['tu', 'ta', 'ti'], 'The tiny wāw above the letter is ḍamma, a short u.'),
      H('Long vowels'),
      Pp('A short vowel followed by the letter that matches it makes a long vowel: fatḥa + alif = ā, and kasra + yāʾ = ī. ḍamma + wāw = ū comes in the next lesson.'),
      X('بَاب', 'door'),
      X('تِين', 'figs'),
      X('بِنْت', 'girl'),
      X('بَيْت', 'house'),
      N('ay and aw', 'In *بَيْت* the yāʾ has a sukūn, so it doesn’t make a long ī. Fatḥa + yāʾ with sukūn sounds like “ay”: bayt. Fatḥa + wāw with sukūn is “aw”: *يَوْم* (yawm, day).'),
      Ck('How do you read *بِنْت*?', ['bint', 'bant', 'bunt'], 'kasra under the bāʾ, sukūn on the nūn: bint, “girl”.'),
    ],
  },
  {
    id: 'alphabet-2', order: 2, unit: 1, title: 'Letters that stand apart', subtitle: 'ج ح خ د ذ ر ز و',
    goals: ['Tell *ج ح خ* apart, including the throat sound ḥ', 'Know the six letters that never join the next letter', 'Read long ū'],
    practice: ['ab:jim', 'ab:ha', 'ab:kha', 'ab:dal', 'ab:dhal', 'ab:ra', 'ab:zay', 'ab:waw', 'ab:jim:i', 'ab:ha:i', 'ab:kha:m', 'ab:dal:f', 'ab:ra:f', 'ab:mark:long_u'],
    steps: [
      H('Three letters, one bowl'),
      Pp('Like the dot family, these three share a shape: a hook with a bowl underneath.'),
      W('ج', 'jīm', 'A dot inside the bowl. Like j in “jam”.', 'جِيم'),
      W('ح', 'ḥāʾ', 'No dot. A strong, breathy h from deep in the throat, like breathing on glasses to clean them. Romanized ḥ, with a dot below.', 'حَاء'),
      W('خ', 'khāʾ', 'One dot above. Like ch in Scottish “loch” or German “Bach”.', 'خَاء'),
      Ck('Which letter makes the sound in “Bach”?', ['*خ*', '*ح*', '*ج*'], 'One dot above: *خ* (kh).'),
      H('Letters that never join forward'),
      Pp('Six letters join the letter before them but never the letter after: alif and the five below. After one of them, the next letter starts again in its starting shape. That’s why Arabic words have small gaps inside them.'),
      W('د', 'dāl', 'Like English d.', 'دَال'),
      W('ذ', 'dhāl', 'One dot above. th as in “this”.', 'ذَال'),
      W('ر', 'rāʾ', 'Dips below the line. A tapped r, like the r in Spanish “pero”.', 'رَاء'),
      W('ز', 'zāy', 'rāʾ with a dot. Like English z.', 'زَاي'),
      W('و', 'wāw', 'A consonant w, or the long vowel ū.', 'وَاو'),
      Ls('The six letters that don’t join the next one', sounds('ا د ذ ر ز و')),
      Ck('In *وَرْد* (roses), how many letters join the letter after them?', ['None', 'One', 'Two'], 'wāw, rāʾ and dāl are all non-joiners, so every letter in *وَرْد* stands on its own.'),
      H('Long ū'),
      Pp('ḍamma followed by wāw makes a long ū.'),
      X('نُور', 'light'),
      X('خُبْز', 'bread'),
      X('بَحْر', 'sea'),
      X('دَجَاج', 'chicken'),
      X('جَدِيد', 'new'),
      X('وَزِير', 'minister'),
      Ck('How do you read *خُبْز*?', ['khubz', 'ḥubz', 'jubz'], 'One dot above is *خ* (kh). Then ḍamma, bāʾ with sukūn, and zāy: khubz, “bread”.'),
    ],
  },
  {
    id: 'alphabet-3', order: 3, unit: 1, title: 'S, sh and the heavy letters', subtitle: 'س ش ص ض ط ظ',
    goals: ['Read *س* and *ش*', 'Hear and say the four heavy (emphatic) letters', 'Read the dot under ṣ ḍ ṭ ẓ in romanization'],
    practice: ['ab:sin', 'ab:shin', 'ab:sad', 'ab:dad', 'ab:taa', 'ab:zaa', 'ab:sin:i', 'ab:shin:m', 'ab:sad:i', 'ab:taa:m'],
    steps: [
      H('Teeth'),
      W('س', 'sīn', 'Three small teeth. Like English s.', 'سِين'),
      W('ش', 'shīn', 'sīn with three dots above. Like English sh.', 'شِين'),
      H('The heavy letters'),
      Pp('Four letters are “heavy” (emphatic) partners of lighter sounds. To say them, pull the back of your tongue up and back, as if starting to say “oo”. The vowels next to them sound darker: the a in *صَبَاح* is closer to the a in “father” than in “cat”.'),
      W('ص', 'ṣād', 'Heavy s.', 'صَاد'),
      W('ض', 'ḍād', 'Heavy d. Arabic is sometimes called “the language of ḍād”, because the sound is so rare elsewhere.', 'ضَاد'),
      W('ط', 'ṭāʾ', 'Heavy t.', 'طَاء'),
      W('ظ', 'ẓāʾ', 'Heavy dh (as in “this”). Many speakers say it as a heavy z.', 'ظَاء'),
      N('Romanization', 'A dot under a Latin letter marks a heavy sound: ṣ ḍ ṭ ẓ. The ḥ of *ح* has the same dot but is a throat sound, not a heavy one.'),
      Ls('Light and heavy pairs', [['س', 's'], ['ص', 'ṣ (heavy)'], ['ت', 't'], ['ط', 'ṭ (heavy)'], ['د', 'd'], ['ض', 'ḍ (heavy)'], ['ذ', 'dh'], ['ظ', 'ẓ (heavy)']]),
      Ck('Which letter is the heavy s?', ['*ص*', '*س*', '*ش*'], '*ص* (ṣād) is the heavy partner of *س* (sīn).'),
      H('Reading practice'),
      X('شَاي', 'tea'),
      X('سَرِير', 'bed'),
      X('صَبَاح', 'morning'),
      X('طَبِيب', 'doctor'),
      X('ضَبَاب', 'fog'),
      Ck('How do you read *طَبِيب*?', ['ṭabīb', 'tabīb', 'ṭabab'], 'Heavy ṭ, then kasra + yāʾ for a long ī: ṭabīb, “doctor”.'),
    ],
  },
  {
    id: 'alphabet-4', order: 4, unit: 1, title: 'The last eight letters', subtitle: 'ع غ ف ق ك ل م ه',
    goals: ['Say ʿayn and ghayn', 'Tell *ف* from *ق* and *ك*', 'Recognise hāʾ in all its shapes'],
    practice: ['ab:ayn', 'ab:ghayn', 'ab:fa', 'ab:qaf', 'ab:kaf', 'ab:lam', 'ab:mim', 'ab:haa', 'ab:ayn:m', 'ab:kaf:i', 'ab:haa:i', 'ab:haa:m', 'ab:haa:f'],
    steps: [
      H('Two throat sounds'),
      W('ع', 'ʿayn', 'The hardest sound for English speakers: a tight squeeze in the middle of the throat, with the voice on. Romanized ʿ. Practise by saying “ah” while tightening your throat.', 'عَيْن'),
      W('غ', 'ghayn', 'ʿayn with a dot. A gargled sound, like a French r.', 'غَيْن'),
      Ck('Which letter is ʿayn?', ['*ع*', '*غ*', '*ح*'], 'No dot: *ع* (ʿayn). With a dot it’s *غ* (gh).'),
      H('f, q and k'),
      W('ف', 'fāʾ', 'One dot above a small loop. Like English f.', 'فَاء'),
      W('ق', 'qāf', 'Two dots above and a deeper tail. A k made far back in the throat.', 'قَاف'),
      W('ك', 'kāf', 'Like English k. At the start or in the middle of a word it looks quite different: كـ.', 'كَاف'),
      H('l, m and h'),
      W('ل', 'lām', 'Tall, with a hook below at the end of a word. Like English l.', 'لَام'),
      W('م', 'mīm', 'A small round loop. Like English m.', 'مِيم'),
      W('ه', 'hāʾ', 'A light h, as in “hat”. Its shape changes more than any other letter’s.', 'هَاء'),
      Ls('hāʾ in each position', [['هـ', 'start'], ['ـهـ', 'middle'], ['ـه', 'end'], ['ه', 'alone']]),
      N('Two h’s', '*ه* is a light h, as in “hat”. *ح* is the strong, breathy ḥ from the throat. Mixing them up changes the word.'),
      H('Reading practice'),
      X('كِتَاب', 'book'),
      X('قَلَم', 'pen'),
      X('عَيْن', 'eye'),
      X('لَيْل', 'night'),
      X('كَلْب', 'dog'),
      X('فِيل', 'elephant'),
      Ck('How do you read *قَلَم*?', ['qalam', 'kalam', 'qalām'], 'qāf, lām and mīm, with fatḥa on the first two: qalam, “pen”.'),
    ],
  },
  {
    id: 'alphabet-5', order: 5, unit: 1, title: 'Hamza, tāʾ marbūṭa and doubled letters', subtitle: 'ء ة ى لا  ّ  ً',
    goals: ['Read hamza on its different seats', 'Say tāʾ marbūṭa and alif maqṣūra at the end of a word', 'Read shadda (doubling) and tanwīn (-an)'],
    practice: ['ab:hamza', 'ab:ta_marbuta', 'ab:alif_maqsura', 'ab:lam_alif', 'ab:ta_marbuta:f', 'ab:mark:shadda', 'ab:mark:tanwin_a', 'ab:mark:tanwin_i', 'ab:mark:tanwin_u'],
    steps: [
      H('Hamza: the catch in the throat'),
      W('ء', 'hamza', 'The catch in “uh-oh”. It often sits on a seat: alif, wāw or a dotless yāʾ. Romanized ʾ, and not written at all at the start of a word.', 'هَمْزَة'),
      Ls('Hamza and its seats', [['أ', 'on alif'], ['إ', 'under alif (i)'], ['ؤ', 'on wāw'], ['ئ', 'on yāʾ'], ['ء', 'alone']]),
      X('أَنَا', 'I'),
      X('سُؤَال', 'question'),
      X('مَاء', 'water'),
      H('Letters only found at the end'),
      W('ة', 'tāʾ marbūṭa', 'Only at the end of a word, mostly on feminine nouns. It looks like hāʾ with two dots. At the end of a phrase it’s said -a; when the word is linked to the next one, -at.', 'تَاء مَرْبُوطَة'),
      X('مَدْرَسَة', 'school'),
      X('سَيَّارَة الْمُعَلِّم', 'the teacher’s car'),
      W('ى', 'alif maqṣūra', 'A yāʾ without dots, only at the end of a word. It sounds like alif: ā.', 'أَلِف مَقْصُورَة'),
      X('عَلَى', 'on'),
      X('مُسْتَشْفَى', 'hospital'),
      W('لا', 'lām-alif', 'lām followed by alif always join into this special shape. On its own it’s the word for “no”.', 'لَا'),
      Ck('How does *ة* sound at the end of *مَدِينَة* (city), said on its own?', ['-a: madīna', '-at: madīnat', '-h: madīnah'], 'At the end of a phrase tāʾ marbūṭa is just -a. It becomes -at when the word is linked to the next one: *مَدِينَة الْقَاهِرَة* (the city of Cairo).'),
      H('Doubling and the -n ending'),
      W('بَبَّ', 'shadda: a doubled letter', 'A small w-shape above a letter means say it twice as long, as in “book-case”. Here: babba.'),
      X('سَيَّارَة', 'car'),
      X('مُعَلِّم', 'teacher'),
      W('بًا', 'tanwīn: -an', 'A doubled vowel mark adds -n. You’ll mostly see -an, written with an extra silent alif, in set phrases.'),
      X('شُكْرًا', 'thank you'),
      X('أَهْلًا', 'welcome'),
      X('جِدًّا', 'very'),
      Ck('How do you read *مُعَلِّم*?', ['muʿallim', 'muʿalim', 'maʿlim'], 'The shadda doubles the lām: muʿallim, “teacher”.'),
    ],
  },
  {
    id: 'alphabet-6', order: 6, unit: 1, title: 'Sun and moon letters', subtitle: 'al- (“the”) and how it’s said',
    goals: ['Say “the” in Arabic', 'Know when the l of al- is silent', 'Read any vowelled word'],
    practice: ['ab:w:n:shams', 'ab:w:n:qamar', 'ab:w:n:kitab', 'ab:w:n:sayyara', 'ab:w:n:talib', 'ab:w:n:walad'],
    steps: [
      H('al- means “the”'),
      Pp('Arabic has no word for “a”: *كِتَاب* is “a book”. For “the”, add *ال* (al-) to the front of the word, written joined to it.'),
      X('كِتَاب', 'a book'),
      X('الْكِتَاب', 'the book'),
      H('Moon letters and sun letters'),
      Pp('Before 14 letters, the l of al- isn’t said. It merges into the next letter, which is doubled instead and gets a shadda. These are the sun letters, named after *الشَّمْس* (the sun). Before the other 14, the moon letters, you say the l, as in *الْقَمَر* (the moon).'),
      X('الشَّمْس', 'the sun'),
      X('الْقَمَر', 'the moon'),
      Ls('The 14 sun letters', sounds('ت ث د ذ ر ز س ش ص ض ط ظ ل ن')),
      N('Tip', 'Sun letters are all made with the tip of the tongue near the teeth, like t, d, s, n and l. The l would get in the way, so it merges.'),
      X('الطَّالِب', 'the student'),
      X('السَّيَّارَة', 'the car'),
      X('الْبَيْت', 'the house'),
      X('الْوَلَد', 'the boy'),
      Ck('How do you say *الرَّجُل* (the man)?', ['ar-rajul', 'al-rajul', 'a-rajul'], 'rāʾ is a sun letter, so the l merges into it. The shadda on the rāʾ shows that.'),
      Ck('And *الْبِنْت* (the girl)?', ['al-bint', 'ab-bint', 'a-bint'], 'bāʾ is a moon letter: the l is said, and it carries a sukūn.'),
      H('You can read Arabic'),
      Pp('That’s the whole alphabet. You can now read any word written with vowel marks. Practise in the Alphabet tab (Read words uses real words from the app), then try Nouns and Sentences. When reading feels easy, turn off Vowel marks at the top of the page and read the way Arabic speakers do, from memory and context.'),
    ],
  },
];

// ---------------- assemble ----------------
const data = {
  language: 'ar', name: 'Arabic', script: 'arabic', speechLang: 'ar-SA',
  ui: {
    accents: ['ā', 'ī', 'ū', 'ḥ', 'ṣ', 'ḍ', 'ṭ', 'ẓ', 'ʿ', 'ʾ'],
    inputHint: 'Arabic or romanized…',
    familyExample: 'kataba, yaktubu and katabtu',
    modeDesc: {
      verbs: 'Conjugate common verbs in the past, present and future. Type in Arabic or in romanization (katabtu; macrons and dots are optional), or pick from four.',
      nouns: 'Pick the Arabic for an English word, read an Arabic word, or find its plural. Many plurals are “broken”: the vowels inside the word change (kitāb → kutub).',
      numbers: 'Numbers 1–100 in their counting forms. Type the Arabic or its romanization, or pick the digits.',
      sentences: 'Translate by tapping the Arabic words into order. Arabic runs right to left, so the first word goes on the right.',
      listening: 'Dictation: listen to a word or a sentence and type it, in Arabic or in romanization.',
    },
    tableNotes: {
      verbs: 'Pick a tense. Weak and irregular verbs are highlighted in blue. The root is the three consonants that related words share.',
      nouns: 'Singular, plural and the three-letter root. “Broken” plurals change the vowels inside the word.',
      adjectives: 'Adjectives follow the noun and agree with it in gender, number and definiteness. Plurals of things take the feminine singular.',
      prepositions: 'Most prepositions are separate words; bi- and li- are written joined to the next word.',
      conjunctions: 'wa- (and) and fa- (so) are written joined to the next word.',
      numbers: 'Counting forms, 1–100. Compound numbers say the unit first: wāḥid wa-ʿishrūn = “one and twenty”.',
    },
  },
  grammar: {
    numberNotes: [
      { from: 1, to: 2, text: 'One and two follow the noun like adjectives (kitāb wāḥid) and are often left out: kitāb = a book; two books has its own ending, kitābān.' },
      { from: 3, to: 10, text: '3–10 take the opposite gender of the noun they count: thalāthat kutub (books, masc.), thalāth banāt (girls, fem.). The noun is plural.' },
      { from: 11, to: 19, text: '11–19 are two words, unit then ten: thalāthata ʿashar = “three-ten”. The counted noun is singular.' },
      { from: 20, to: 90, lastDigit: 0, text: 'The tens end in -ūn: ʿishrūn, thalāthūn, arbaʿūn… The counted noun is singular.' },
      { from: 21, to: 99, text: 'Say the unit first, then wa- (and), then the ten: khamsa wa-ʿishrūn = “five and twenty”.' },
      { from: 100, to: 100, text: 'miʾa is also spelled مائة, with a silent alif, in many texts.' },
    ],
  },
  persons, personOptions, tenseOptions,
  functions: [
    { id: 'nominal', label: 'No “is” (nominal)', description: 'In the present, Arabic has no verb “to be”: al-bayt kabīr = the house (is) big. A definite noun followed by an indefinite word makes a sentence. To negate it, use laysa (is not).' },
    { id: 'agreement', label: 'Adjective agreement', description: 'Adjectives come after the noun and match it in gender and in definiteness: bayt kabīr (a big house), al-bayt al-kabīr (the big house), sayyāra jadīda (a new car).' },
    { id: 'idafa', label: 'X of Y (iḍāfa)', description: 'Two nouns side by side mean “X of Y”: bayt aṭ-ṭālib = the student’s house. Only the second noun can take al-, and a final -a on the first is said -at: sayyārat al-muʿallim.' },
    { id: 'pronoun_suffix', label: 'Possessive endings', description: 'Endings for “my, your, his…”: -ī my, -ka / -ki your, -hu his, -hā her, -nā our, -kum your (pl.), -hum their. kitābī = my book. A final -a becomes -at first: sayyāratī.' },
    { id: 'possession', label: 'Having (ʿinda)', description: 'There is no verb “to have”. Use ʿinda (at, with) + an ending: ʿindī = I have, ʿindaka = you have, ʿindahum = they have.' },
    { id: 'existence', label: 'There is (hunāka)', description: 'hunāka = there is / there are. Negative: laysa hunāka.' },
    { id: 'word_order', label: 'Verb first', description: 'Formal Arabic often puts the verb first: kataba aṭ-ṭālib ad-dars = the student wrote the lesson. A verb that comes first stays singular even with a plural subject: dhahaba al-awlād = the boys went.' },
    { id: 'desire', label: 'Wanting (urīdu)', description: 'urīdu = I want / I’d like. Before another verb, add an: urīdu an adhhaba = I want to go.' },
    { id: 'preference', label: 'Likes (uḥibbu)', description: 'uḥibbu = I like / I love. The thing you like takes al-: uḥibbu al-qahwa = I like coffee.' },
    { id: 'future_plans', label: 'Future (sa-)', description: 'Put sa- in front of the present for the future: sa-adhhabu = I will go. For “will not”, use lan: lan adhhaba.' },
    { id: 'ability', label: 'Can (yumkinu)', description: 'hal yumkinu an … ? = is it possible to … ? A polite way to ask for help.' },
  ],
  topics: [
    { id: 'everyday', label: 'Everyday' }, { id: 'food', label: 'Food & drink' }, { id: 'directions', label: 'Places & directions' },
    { id: 'social', label: 'Meeting people' }, { id: 'time', label: 'Time' },
  ],
  sentenceTypes: [
    { id: 'statement', label: 'Statement', description: 'A plain affirmative sentence.' },
    { id: 'negative', label: 'Negative', description: 'Negated with lā (present), lam (past), lan (future) or laysa (sentences without a verb).' },
    { id: 'question', label: 'Question', description: 'A yes/no question starts with hal; others start with a question word.' },
    { id: 'request', label: 'Request / command', description: 'Asks for something or tells someone what to do.' },
  ],
  progress: {
    coverage: { ready: 95, comfortable: 98 },
    levels: [
      { id: 'A1', label: 'A1 · Beginner', families: 500, hours: 200 },
      { id: 'A2', label: 'A2 · Elementary', families: 1000, hours: 400 },
      { id: 'B1', label: 'B1 · Intermediate', families: 2000, hours: 750 },
      { id: 'B2', label: 'B2 · Upper intermediate', families: 4000, hours: 1100 },
      { id: 'C1', label: 'C1 · Advanced', families: 8000, hours: 1600 },
    ],
    sourceNote: 'Rough guides only. Word-family targets follow vocabulary-size research (Nation, Laufer). Hours are scaled up from the European estimates: the US Foreign Service Institute puts Arabic in its hardest group for English speakers (about 2,200 class hours to professional level).',
  },
  verbs, nouns, adjectives, numbers, prepositions, conjunctions, glossary, questions, sentences,
  alphabet: { groups, letters, marks },
  lessonUnits: [{ id: 1, title: 'The alphabet' }],
  lessons,
};

// ---------------- checks ----------------
const errors = [];
const letterIds = new Set(letters.map((l) => l.id));
letters.forEach((l) => l.similar.forEach((s) => letterIds.has(s) || errors.push(`letter ${l.id}: unknown similar ${s}`)));
const ids = new Set([
  ...letters.map((l) => `ab:${l.id}`), ...letters.flatMap((l) => l.positions.map((p) => `ab:${l.id}:${p}`)),
  ...marks.map((m) => `ab:mark:${m.id}`), ...nouns.map((n) => `ab:w:n:${n.id}`),
]);
lessons.forEach((l) => l.practice.forEach((p) => ids.has(p) || errors.push(`lesson ${l.id}: unknown practice id ${p}`)));
// Every Arabic word in a sentence must be known, directly or with clitics split off
const known = new Set();
const addK = (s) => s && known.add(A.fold(s));
nouns.forEach((n) => [n.it, n.plural, n.fem].forEach(addK));
adjectives.forEach((a) => Object.values(a.forms).forEach(addK));
verbs.forEach((v) => { addK(v.it); Object.values(v.tenses).forEach((t) => Object.values(t).forEach(addK)); });
numbers.forEach((n) => { addK(n.it); n.it.split(' ').forEach(addK); });
[...prepositions, ...conjunctions, ...glossary].forEach((g) => addK(g.it));
const knownWord = (w) => known.has(A.fold(w)) || A.splits(w).some((s) => known.has(s.stem));
const phrases = glossary.filter((g) => / /.test(g.it)).map((g) => A.fold(g.it));
[...sentences, ...questions, ...questions.map((q) => q.answers[0])].forEach((s) => {
  let text = A.fold(s.it);
  phrases.forEach((p) => { text = text.split(p).join(' '); });
  text.split(' ').filter(Boolean).forEach((w) => knownWord(w) || errors.push(`unknown word ${w} in “${s.it}”`));
});
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(`wrote ${OUT}: ${verbs.length} verbs, ${nouns.length} nouns, ${adjectives.length} adjectives, ${numbers.length} numbers, ${sentences.length} sentences, ${questions.length} questions, ${glossary.length} glossary, ${letters.length} letters, ${lessons.length} lessons`);
if (process.argv.includes('--show')) {
  const show = (a) => console.log(a.it, ' | ', a.tr || A.romanize(a.it));
  [...sentences, ...questions].forEach(show);
  verbs.forEach((v) => console.log(v.id, Object.entries(v.tenses).map(([t, f]) => t + ': ' + persons.map((p) => A.romanize(f[p])).join(', ')).join(' | ')));
  nouns.forEach((n) => console.log(n.id, A.romanize(n.it), n.plural ? A.romanize(n.plural) : ''));
  numbers.filter((n) => [1, 2, 11, 12, 13, 20, 21, 35, 99, 100].includes(n.value)).forEach(show);
}
