import { Mark, markInputRule, markPasteRule, mergeAttributes } from "@tiptap/core";
export interface BoldOptions {
  HTMLAttributes: Record<string, any>,
}
export const Revise = Mark.create<BoldOptions>({
  name: 'revise',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'strong',
      },
      {
        tag: 'b',
        getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setBold: () => ({ commands }) => {
        return commands.setMark(this.name)
      },
      toggleBold: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
      unsetBold: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    }
  },

  addInputRules() {
    return [
      markInputRule({
        find: starInputRegex,
        type: this.type,
      }),
      markInputRule({
        find: underscoreInputRegex,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: starPasteRegex,
        type: this.type,
      }),
      markPasteRule({
        find: underscorePasteRegex,
        type: this.type,
      }),
    ]
  },
})