'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Pilcrow,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  MessageSquare,
} from 'lucide-react'

// The WhatsApp CTA the "Insert Button" toolbar action drops into the content.
// Every utility class here is safelisted in tailwind.config.ts so it survives
// purging on the public pages, where this HTML is rendered from the database.
// `not-prose` opts the button out of the @tailwindcss/typography link styling
// (prose-a:text-emerald-400 / hover:prose-a:underline) that otherwise wins on
// the public pages and turns the label emerald with a hover underline.
const CTA_BUTTON_CLASS =
  'not-prose inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg my-4 no-underline'

const CTA_BUTTON_HREF =
  'https://wa.me/971566625302?text=Hi%2C%20I%20want%20to%20book%20a%20seat'

type RichTextEditorProps = {
  content: string
  onChange: (content: string) => void
}

const COLORS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Gray', value: '#9CA3AF' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Red', value: '#EF4444' },
]

// TipTap only keeps mark attributes declared in the schema, so anything not
// listed here is dropped when the inserted button HTML is parsed. `class` is
// what makes the CTA render as a button rather than a plain link.
const StyledLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: { default: null },
      style: { default: null },
    }
  },
})

function ToolbarButton({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={
        'p-1.5 rounded transition-colors ' +
        (active
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'text-gray-500 hover:text-white hover:bg-white/5')
      }
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px self-stretch bg-white/5 mx-1" />
}

function Toolbar({ editor }: { editor: Editor }) {
  function handleAddLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', previous ?? 'https://')

    if (url === null) return

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="bg-white/[0.03] border-b border-white/5 p-2 flex flex-wrap gap-1 items-center">
      {/* Group 1: Text */}
      <ToolbarButton
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <Divider />

      {/* Group 2: Headings */}
      <ToolbarButton
        title="Paragraph"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <Divider />

      {/* Group 3: Lists */}
      <ToolbarButton
        title="Bullet List"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered List"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <Divider />

      {/* Group 4: Alignment */}
      <ToolbarButton
        title="Align Left"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align Center"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align Right"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight size={16} />
      </ToolbarButton>

      <Divider />

      {/* Group 5: Colors */}
      <div className="flex items-center gap-1.5 px-1">
        {COLORS.map((color) => {
          const active = editor.isActive('textStyle', { color: color.value })
          return (
            <button
              key={color.value}
              type="button"
              title={color.label}
              aria-label={`Text color ${color.label}`}
              aria-pressed={active}
              onClick={() => editor.chain().focus().setColor(color.value).run()}
              style={{ backgroundColor: color.value }}
              className={
                'w-4 h-4 rounded-full transition-transform hover:scale-110 ' +
                (active ? 'ring-2 ring-offset-1 ring-offset-[#030712] ring-emerald-400' : 'ring-1 ring-white/20')
              }
            />
          )
        })}
      </div>

      <Divider />

      {/* Group 6: Links */}
      <ToolbarButton title="Add Link" active={editor.isActive('link')} onClick={handleAddLink}>
        <Link2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Remove Link"
        onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
      >
        <Unlink size={16} />
      </ToolbarButton>
      <button
        type="button"
        onClick={() => {
          const text = window.prompt('Enter button text:', 'Book Your Seat Now')
          if (text) {
            editor
              .chain()
              .focus()
              .insertContent(
                `<a href="${CTA_BUTTON_HREF}" class="${CTA_BUTTON_CLASS}" target="_blank">${text}</a><p></p>`
              )
              .run()
          }
        }}
        className="p-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        title="Insert WhatsApp Button"
      >
        <MessageSquare size={16} />
      </button>
    </div>
  )
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    // StarterKit v3 already bundles Link and Underline; disable them here so the
    // explicitly configured versions below don't register twice.
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      StyledLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Start writing your blog post here...' }),
    ],
    content,
    // Next.js renders this on the server first; rendering immediately causes a hydration mismatch.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror p-4 min-h-[350px] text-gray-300 text-sm focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Pull in content changes that come from outside the editor (e.g. loading a
  // different post into the form) without clobbering what the user is typing.
  useEffect(() => {
    if (!editor) return
    if (content === editor.getHTML()) return
    editor.commands.setContent(content, { emitUpdate: false })
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="bg-[#030712] border border-white/5 rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
