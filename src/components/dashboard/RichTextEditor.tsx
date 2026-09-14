'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  ImagePlus,
  Table as TableIcon,
  Loader2,
} from 'lucide-react'
import { tableExtensions } from '@/components/dashboard/extensions/table'
import { Image, type ImageAlign } from '@/components/dashboard/extensions/image'
import { uploadImage } from '@/lib/actions/upload'

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

// Kept under the Server Action body cap configured in next.config.mjs.
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

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

const IMAGE_WIDTHS = [
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: 'Full', value: '100%' },
  { label: 'Original', value: null },
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Spreadsheets put a real `<table>` on the clipboard as text/html, which
// ProseMirror now parses on its own. Some sources (terminals, plain-text
// exports, "copy as values") only offer tab-separated text though, and that
// used to land as a wall of unformatted lines — rebuild a table from it.
function tsvToTableHtml(text: string): string | null {
  const lines = text.replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n')
  if (lines.length < 2) return null
  if (!lines.every((line) => line.includes('\t'))) return null

  const rows = lines.map((line) => line.split('\t'))
  const columnCount = Math.max(...rows.map((row) => row.length))
  if (columnCount < 2) return null

  const renderRow = (cells: string[], tag: 'td' | 'th') => {
    const padded = Array.from({ length: columnCount }, (_, i) => cells[i] ?? '')
    return `<tr>${padded
      .map((cell) => `<${tag}><p>${escapeHtml(cell.trim())}</p></${tag}>`)
      .join('')}</tr>`
  }

  const [header, ...body] = rows
  return `<table>${renderRow(header, 'th')}${body.map((row) => renderRow(row, 'td')).join('')}</table>`
}

// "dubai-airport-transfer-map.png" -> "dubai airport transfer map", a usable
// default alt text for SEO that the author can still overwrite.
function altFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={
        'p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ' +
        (active
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'text-gray-500 hover:text-white hover:bg-white/5')
      }
    >
      {children}
    </button>
  )
}

// The table and image controls need labels rather than icons — "Row above" and
// "Column left" are not worth guessing at from a glyph.
function ChipButton({
  onClick,
  active = false,
  danger = false,
  children,
}: {
  onClick: () => void
  active?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'text-xs px-2 py-1 rounded border transition-colors ' +
        (active
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          : danger
            ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
            : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5')
      }
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px self-stretch bg-white/5 mx-1" />
}

function TableControls({ editor }: { editor: Editor }) {
  return (
    <div className="bg-emerald-500/[0.04] border-b border-white/5 px-2 py-1.5 flex flex-wrap gap-1.5 items-center">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 mr-1">Table</span>
      <ChipButton onClick={() => editor.chain().focus().addRowBefore().run()}>Row above</ChipButton>
      <ChipButton onClick={() => editor.chain().focus().addRowAfter().run()}>Row below</ChipButton>
      <ChipButton onClick={() => editor.chain().focus().addColumnBefore().run()}>Column left</ChipButton>
      <ChipButton onClick={() => editor.chain().focus().addColumnAfter().run()}>Column right</ChipButton>
      <Divider />
      <ChipButton onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header row</ChipButton>
      <ChipButton onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge / Split</ChipButton>
      <Divider />
      <ChipButton danger onClick={() => editor.chain().focus().deleteRow().run()}>
        Delete row
      </ChipButton>
      <ChipButton danger onClick={() => editor.chain().focus().deleteColumn().run()}>
        Delete column
      </ChipButton>
      <ChipButton danger onClick={() => editor.chain().focus().deleteTable().run()}>
        Delete table
      </ChipButton>
    </div>
  )
}

function ImageControls({ editor }: { editor: Editor }) {
  const { width, align, alt } = editor.getAttributes('image') as {
    width?: string | null
    align?: ImageAlign | null
    alt?: string | null
  }

  function setAttribute(attributes: Record<string, unknown>) {
    editor.chain().focus().updateAttributes('image', attributes).run()
  }

  function handleAltText() {
    const value = window.prompt('Describe this image (alt text, used by search engines)', alt ?? '')
    if (value === null) return
    setAttribute({ alt: value.trim() || null })
  }

  return (
    <div className="bg-emerald-500/[0.04] border-b border-white/5 px-2 py-1.5 flex flex-wrap gap-1.5 items-center">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 mr-1">Image</span>
      {IMAGE_WIDTHS.map((option) => (
        <ChipButton
          key={option.label}
          active={(width ?? null) === option.value}
          onClick={() => setAttribute({ width: option.value })}
        >
          {option.label}
        </ChipButton>
      ))}
      <Divider />
      <ToolbarButton
        title="Align image left"
        active={align === 'left'}
        onClick={() => setAttribute({ align: 'left' })}
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align image center"
        active={align === 'center'}
        onClick={() => setAttribute({ align: 'center' })}
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align image right"
        active={align === 'right'}
        onClick={() => setAttribute({ align: 'right' })}
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <Divider />
      <ChipButton onClick={handleAltText}>Alt text</ChipButton>
      <ChipButton danger onClick={() => editor.chain().focus().deleteSelection().run()}>
        Remove image
      </ChipButton>
    </div>
  )
}

function Toolbar({
  editor,
  onInsertImage,
  uploading,
}: {
  editor: Editor
  onInsertImage: () => void
  uploading: boolean
}) {
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
    <>
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

        {/* Group 6: Blocks */}
        <ToolbarButton
          title={uploading ? 'Uploading image...' : 'Insert image'}
          disabled={uploading}
          onClick={onInsertImage}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </ToolbarButton>
        <ToolbarButton
          title="Insert table"
          active={editor.isActive('table')}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon size={16} />
        </ToolbarButton>

        <Divider />

        {/* Group 7: Links */}
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

      {/* Contextual rows — only the one matching the current selection shows. */}
      {editor.isActive('image') ? (
        <ImageControls editor={editor} />
      ) : editor.isActive('table') ? (
        <TableControls editor={editor} />
      ) : null}
    </>
  )
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // The paste/drop handlers below are created once, when the editor is built,
  // so they reach the editor through a ref instead of a captured variable.
  const editorRef = useRef<Editor | null>(null)

  // Uploads each file to Supabase storage and drops it in at the cursor, so a
  // post can carry as many infographics as it needs.
  const insertImageFiles = useCallback(async (files: File[]) => {
    const editor = editorRef.current
    const images = files.filter((file) => file.type.startsWith('image/'))
    if (!editor || images.length === 0) return

    setUploading(true)
    try {
      for (const file of images) {
        if (file.size > MAX_IMAGE_BYTES) {
          window.alert(`"${file.name}" is larger than 8 MB. Please compress it and try again.`)
          continue
        }

        let url: string | null = null
        try {
          url = await uploadImage(file)
        } catch (error) {
          // Most often an expired dashboard session, which uploadImage reports
          // by throwing.
          console.error(error)
          window.alert(
            error instanceof Error ? error.message : `Upload failed for "${file.name}".`
          )
          continue
        }

        if (!url) {
          window.alert(`Upload failed for "${file.name}". Please try again.`)
          continue
        }

        editor.chain().focus().setImage({ src: url, alt: altFromFileName(file.name) }).run()
      }
    } finally {
      setUploading(false)
    }
  }, [])

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
      Image,
      ...tableExtensions,
      Placeholder.configure({ placeholder: 'Start writing your blog post here...' }),
    ],
    content,
    // Next.js renders this on the server first; rendering immediately causes a hydration mismatch.
    immediatelyRender: false,
    // The toolbar reads `isActive` for its button states and shows a different
    // contextual row inside tables and on images, so it has to re-render as the
    // selection moves — which TipTap v3 does not do by default.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: 'ProseMirror p-4 min-h-[350px] text-gray-300 text-sm focus:outline-none',
      },
      handlePaste(view, event) {
        const clipboard = event.clipboardData
        if (!clipboard) return false

        const html = clipboard.getData('text/html')
        const files = Array.from(clipboard.files ?? [])

        // A copied screenshot or image file arrives as a file on the clipboard
        // and gets uploaded. Excel also likes to attach a bitmap of the copied
        // range alongside the real markup, so anything carrying a table is left
        // to the branch below rather than pasted as a picture of a table.
        if (files.some((file) => file.type.startsWith('image/')) && !/<table[\s>]/i.test(html)) {
          event.preventDefault()
          void insertImageFiles(files)
          return true
        }

        // Anything with an HTML flavour — including tables copied out of Excel,
        // Google Sheets, Word or a web page — is left to ProseMirror, which can
        // parse it now that the table nodes are part of the schema.
        if (html) return false

        const tableHtml = tsvToTableHtml(clipboard.getData('text/plain'))
        if (!tableHtml) return false

        event.preventDefault()
        view.pasteHTML(tableHtml)
        return true
      },
      handleDrop(view, event) {
        const dropped = Array.from(event.dataTransfer?.files ?? [])
        const images = dropped.filter((file) => file.type.startsWith('image/'))
        if (images.length === 0) return false

        event.preventDefault()
        // Drop the images where they were dropped, not wherever the cursor was.
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })
        if (position) {
          editorRef.current?.commands.setTextSelection(position.pos)
        }
        void insertImageFiles(images)
        return true
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // Pull in content changes that come from outside the editor (e.g. loading a
  // different post into the form) without clobbering what the user is typing.
  useEffect(() => {
    if (!editor) return
    if (content === editor.getHTML()) return
    editor.commands.setContent(content, { emitUpdate: false })
  }, [content, editor])

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // Reset first so picking the same file twice in a row still fires onChange.
    event.target.value = ''
    void insertImageFiles(files)
  }

  if (!editor) return null

  return (
    <div className="bg-[#030712] border border-white/5 rounded-lg overflow-hidden">
      <Toolbar
        editor={editor}
        uploading={uploading}
        onInsertImage={() => fileInputRef.current?.click()}
      />
      <EditorContent editor={editor} />
      {/* Never focused directly — the toolbar button opens it — but it still
          needs a name for the accessibility tree. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        aria-label="Insert images into the editor"
        tabIndex={-1}
        className="hidden"
      />
      <p className="border-t border-white/5 px-4 py-2 text-[11px] text-gray-600">
        Tip: paste a table straight from Excel or Google Sheets, and drag images into the text to
        place them.
      </p>
    </div>
  )
}
