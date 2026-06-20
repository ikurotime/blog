export const languages = {
  en: 'EN',
  es: 'ES'
}

export const defaultLang = 'en'

export const ui = {
  en: {
    'hero.role': 'Software Engineer',
    'hero.location': 'Valencia, Spain',
    'hero.status': 'Available for work',
    'hero.bio':
      "I'm a software engineer with {years}+ years of experience building things on the web. I care about open source, great UX/UI, and a good napolitan pizza. Also a vim user, btw.",
    'section.projects': 'Selected work',
    'section.writing': 'Writing',
    'section.connect': 'Elsewhere',
    'cta.allWriting': 'All posts',
    'cta.viewProject': 'View'
  },
  es: {
    'hero.role': 'Software Engineer',
    'hero.location': 'Valencia, España',
    'hero.status': 'Disponible para trabajar',
    'hero.bio':
      'Soy un ingeniero de software con +{years} años de experiencia construyendo cosas en la web. Me gusta el código abierto, el buen diseño UX/UI y una buena pizza napolitana. Vim user, por cierto.',
    'section.projects': 'Trabajos seleccionados',
    'section.writing': 'Blog',
    'section.connect': 'En otros sitios',
    'cta.allWriting': 'Todos los posts',
    'cta.viewProject': 'Ver'
  }
} as const
