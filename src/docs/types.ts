export interface AttributeDoc {
  name: string
  description: string
  type: string
  default?: string
  options?: string[]
}

export interface SlotDoc {
  name: string
  description: string
}

export interface CssPropDoc {
  name: string
  description: string
  default?: string
}

export interface ComponentDoc {
  name: string
  tagName: string
  importPath: string
  description: string
  attributes: AttributeDoc[]
  slots: SlotDoc[]
  cssProperties: CssPropDoc[]
  examples: { label: string; code: string }[]
}
