export interface DesignerCommand {
  /** The exact slash command, e.g. "/new-prototype". */
  command: string
  title: string
  summary: string
  whenToUse: string[]
  /** Sent via the AI-tool deep link when a designer clicks "Open in...". */
  prompt: string
}

// Copy here is drawn directly from each command's own .claude/commands/*.md —
// keep these in sync if those files change meaningfully.
export const DESIGNER_COMMANDS: DesignerCommand[] = [
  {
    command: '/new-prototype',
    title: 'New Prototype',
    summary:
      'Scaffolds a new prototype from a text description — collects your name, a prototype name, a description, and tags one at a time, then generates the folder and files using only JH components.',
    whenToUse: [
      'Starting a brand-new prototype from an idea, with no existing Figma design to build from.',
      'Your designer name is only asked once and remembered afterward (see Settings) — everything else is asked one question at a time so it never feels like a form.',
      'The generated prototype is interactive from the start: real states, not a placeholder skeleton.',
    ],
    prompt: 'Please run /new-prototype to scaffold a new prototype.',
  },
  {
    command: '/figma-to-prototype',
    title: 'Figma to Prototype',
    summary:
      'Rebuilds an existing Figma frame as a prototype, mapping every layer to the closest real JH component and resolving colors/spacing to JH tokens instead of starting from a blank description.',
    whenToUse: [
      'You already have a Figma design and want it rebuilt faithfully with real, interactive JH components.',
      'Requires a Figma frame URL that includes a node-id, and the Figma MCP server authorized once per machine.',
      'Will stop and ask before writing any markup for something with no JH component equivalent — never invents custom HTML silently.',
    ],
    prompt: 'Please run /figma-to-prototype to rebuild a Figma design as a prototype.',
  },
  {
    command: '/use-jh-component',
    title: 'Use a JH Component',
    summary:
      "Finds the right JH component for a UI pattern you're building and shows you exactly how to use it — the import, a working example, key props, and common gotchas.",
    whenToUse: [
      'Not sure which component fits — e.g. "what should I use for a table?" or "how do I show an error message?"',
      "You know the component but not how to read its value or listen for changes.",
      "There's no JH equivalent for what you need — it'll say so plainly instead of guessing, and suggest the closest fit.",
    ],
    prompt: 'Please run /use-jh-component to help me find the right JH component for what I need.',
  },
  {
    command: '/document-component',
    title: 'Document a Component',
    summary:
      'Scaffolds or updates the "when to use it" documentation for a JH component in the Components page above — props/events/slots are always auto-derived, this only captures the intent a manifest can\'t.',
    whenToUse: [
      "A component's when-to-use guidance, anti-patterns, or gotchas are missing or out of date in the Components page.",
      "You just learned a real gotcha (a token name, a slotted-vs-attribute quirk) worth saving for the next person who reaches for that component.",
    ],
    prompt: 'Please run /document-component to help me document a JH component.',
  },
]
