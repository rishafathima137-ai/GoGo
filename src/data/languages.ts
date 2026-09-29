import type { Language } from '../types'

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '\ud83c\uddec\ud83c\udde7' },
  { code: 'es', name: 'Spanish', nativeName: 'Espa\u00f1ol', flag: '\ud83c\uddea\ud83c\uddf8' },
  { code: 'fr', name: 'French', nativeName: 'Fran\u00e7ais', flag: '\ud83c\uddeb\ud83c\uddf7' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '\ud83c\udde9\ud83c\uddea' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '\ud83c\uddee\ud83c\uddf9' },
  { code: 'ja', name: 'Japanese', nativeName: '\u65e5\u672c\u8a9e', flag: '\ud83c\uddef\ud83c\uddf5' },
  { code: 'ko', name: 'Korean', nativeName: '\ud55c\uad6d\uc5b4', flag: '\ud83c\uddf0\ud83c\uddf7' },
  { code: 'zh', name: 'Chinese', nativeName: '\u4e2d\u6587', flag: '\ud83c\udde8\ud83c\uddf3' },
  { code: 'ar', name: 'Arabic', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', flag: '\ud83c\uddf8\ud83c\udde6' },
  { code: 'tr', name: 'Turkish', nativeName: 'T\u00fcrk\u00e7e', flag: '\ud83c\uddf9\ud83c\uddf7' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '\ud83c\uddee\ud83c\uddf9' },
  { code: 'th', name: 'Thai', nativeName: '\u0e44\u0e17\u0e22', flag: '\ud83c\uddf9\ud83c\uddf7' },
  { code: 'hi', name: 'Hindi', nativeName: '\u0939\u093f\u0928\u094d\u0926\u0940', flag: '\ud83c\uddee\ud83c\uddf3' },
  { code: 'el', name: 'Greek', nativeName: '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac', flag: '\ud83c\uddec\ud83c\uddf7' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '\ud83c\udde9\ud83c\uddf3' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugu\u00eas', flag: '\ud83c\uddf5\ud83c\uddf9' },
  { code: 'is', name: 'Icelandic', nativeName: '\u00cdslenska', flag: '\ud83c\udde8\ud83c\uddef' },
  { code: 'ms', name: 'Malayalam', nativeName: '\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02', flag: '\ud83c\uddf3\ud83c\uddf5' },
]

export const languageByCode = new Map(languages.map((l) => [l.code, l]))

export function getLanguage(code: string): Language {
  return languageByCode.get(code) ?? languages[0]
}
