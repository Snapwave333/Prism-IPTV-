export const RELIGIOUS_KEYWORDS = [
  'religion', 'religious', 'god', 'jesus', 'church', 'mosque', 'temple', 'bible', 'quran', 'torah', 'christ', 'christian', 'catholic', 
  'baptist', 'pentecostal', 'lutheran', 'methodist', 'presbyterian', 'muslim', 'islamic', 'jewish', 'judaism', 'hindu', 'buddhist', 
  'sikh', 'mormon', 'spiritual', 'faith', 'ministry', 'gospel', 'worship', 'prayer', 'sermon', 'pastor', 'priest', 'imam', 'rabbi', 
  'pope', 'holy', 'sacred', 'divine', 'prophecy', 'scripture', 'theology', 'evangelical', 'missionary', 'apostolic', 'prophet', 
  'allah', 'yahweh', 'krishna', 'buddha', 'dharma', 'nirvana', 'zen', 'karma', 'reincarnation', 'theology', 'dogma', 'liturgy', 
  'sacrament', 'baptism', 'communion', 'eucharist', 'mass', 'hajj', 'ramadan', 'lent', 'easter', 'christmas', 'hannukah', 'passover', 
  'diwali', 'holi', 'vesak', 'eid', 'sabbath', 'heaven', 'hell', 'purgatory', 'angel', 'demon', 'satan', 'devil', 'hellfire', 
  'salvation', 'redemption', 'grace', 'faith-based', 'biblical', 'tvn', 'vatican', 'tbn', 'daystar', 'ewtn', 'byutv', 'hillsong', 
  'hope channel', '3abn', 'itbn', 'god tv', 'inspiring', 'enlightenment'
];

export class ContentFilter {
  static isReligious(text: string): boolean {
    if (!text) return false;
    const lowerText = String(text).toLowerCase();
    return RELIGIOUS_KEYWORDS.some(keyword => {
      // Use word boundaries to avoid false positives (e.g., "messenger" contains "eng")
      // Wait, "jesus" in a word is fine, but "god" in "good" is bad. 
      // Let's use simple contains first, and refine if needed.
      // Refinement: Regex with word boundaries for short keywords.
      if (keyword.length <= 3) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(lowerText);
      }
      return lowerText.includes(keyword);
    });
  }

  static filterItems<T>(items: T[], textSelector: (item: T) => string[]): T[] {
    return items.filter(item => {
      const texts = textSelector(item);
      return !texts.some(text => this.isReligious(text));
    });
  }
}
