import { Node, mergeAttributes } from '@tiptap/core'

// A block-level image node so infographics can be dropped between paragraphs
// anywhere in a post or route description. Width and alignment are stored on the
// element itself (inline `style` + `data-align`) rather than as Tailwind classes,
// so the public pages render them correctly straight out of the database without
// anything needing to be safelisted.

export type ImageAlign = 'left' | 'center' | 'right'

export type ImageAttributes = {
  src: string
  alt?: string | null
  title?: string | null
  /** Any CSS length — the toolbar sets percentages ('50%', '75%', '100%'). */
  width?: string | null
  align?: ImageAlign | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (attributes: ImageAttributes) => ReturnType
    }
  }
}

export const Image = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          if (element.style.width) return element.style.width
          // A bare `width="600"` on pasted markup is pixels, and needs the unit
          // back before it can be used as a CSS length.
          const attribute = element.getAttribute('width')
          if (!attribute) return null
          return /^\d+$/.test(attribute) ? `${attribute}px` : attribute
        },
        renderHTML: (attributes: { width?: string | null }) =>
          attributes.width ? { style: `width: ${attributes.width}` } : {},
      },
      align: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-align'),
        renderHTML: (attributes: { align?: ImageAlign | null }) =>
          attributes.align ? { 'data-align': attributes.align } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    // `loading="lazy"` matters here: posts can carry several full-width
    // infographics and they are all below the fold on the public page.
    return ['img', mergeAttributes({ loading: 'lazy' }, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    }
  },
})
