export interface Resource {
  title: string
  url: string
  description: string
}

export const RESOURCES: Resource[] = [
  {
    title: 'Jack Henry Design',
    url: 'https://jackhenry.design',
    description: 'Design system guidelines, tokens, and component documentation',
  },
  {
    title: 'Jack Henry Dev',
    url: 'https://jackhenry.dev',
    description: 'Developer documentation and API references',
  },
]
