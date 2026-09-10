import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  fixTables,
  goToNextCell,
  mergeCells,
  splitCell,
  tableEditing,
  toggleHeaderColumn,
  toggleHeaderRow,
} from '@tiptap/pm/tables'

// TipTap ships table support as a separate package, but the ProseMirror table
// implementation it wraps (`prosemirror-tables`) is already installed as part of
// `@tiptap/pm`. These four nodes are the schema half of that; the behaviour half
// (cell selection, resizing, clipboard handling for pasted tables) comes from
// the two plugins registered on the Table node below.
//
// Registering these is what makes pasting a table from Excel / Google Sheets /
// Word / a web page work at all: ProseMirror silently drops `<table>` markup
// when the schema has no node that can hold it, which is why pasted tables used
// to arrive as a run of unformatted text.

// prosemirror-tables locates the table nodes by reading `tableRole` off the node
// spec, so every node here has to carry one. `extendNodeSchema` on the Table
// extension is what writes it into the compiled schema.
const TABLE_ROLE_BY_NAME: Record<string, string> = {
  table: 'table',
  tableRow: 'row',
  tableCell: 'cell',
  tableHeader: 'header_cell',
}

function spanAttribute(name: 'colspan' | 'rowspan') {
  return {
    default: 1,
    parseHTML: (element: HTMLElement) => {
      const value = Number(element.getAttribute(name))
      return Number.isFinite(value) && value > 0 ? value : 1
    },
    // Keep the stored HTML tidy — only merged cells need the attribute.
    renderHTML: (attributes: Record<string, number>) =>
      attributes[name] > 1 ? { [name]: attributes[name] } : {},
  }
}

const cellAttributes = {
  colspan: spanAttribute('colspan'),
  rowspan: spanAttribute('rowspan'),
  // Column widths live on the cells as an array of pixel widths (one entry per
  // spanned column). The resize plugin reads the array; the inline `width` style
  // is what carries the sizing over to the public page, which renders the stored
  // HTML without any of the editor's plugins.
  colwidth: {
    default: null as number[] | null,
    parseHTML: (element: HTMLElement) => {
      const raw = element.getAttribute('data-colwidth')
      if (!raw) return null
      const widths = raw
        .split(',')
        .map((value) => parseInt(value, 10))
        .filter((value) => Number.isFinite(value) && value > 0)
      return widths.length ? widths : null
    },
    renderHTML: (attributes: { colwidth?: number[] | null }) => {
      const widths = attributes.colwidth
      if (!widths?.length) return {}
      const total = widths.reduce((sum, width) => sum + width, 0)
      return { 'data-colwidth': widths.join(','), style: `width: ${total}px` }
    },
  },
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    table: {
      insertTable: (options?: { rows?: number; cols?: number; withHeaderRow?: boolean }) => ReturnType
      deleteTable: () => ReturnType
      addColumnBefore: () => ReturnType
      addColumnAfter: () => ReturnType
      deleteColumn: () => ReturnType
      addRowBefore: () => ReturnType
      addRowAfter: () => ReturnType
      deleteRow: () => ReturnType
      /** Merges the selected cells, or splits the current one when nothing is spanned. */
      mergeOrSplit: () => ReturnType
      toggleHeaderRow: () => ReturnType
      toggleHeaderColumn: () => ReturnType
    }
  }
}

export const Table = Node.create({
  name: 'table',
  group: 'block',
  content: 'tableRow+',
  isolating: true,

  // Runs for every node extension in the editor, not just this one, so it is the
  // single place the `tableRole` specs are injected from.
  extendNodeSchema(extension) {
    const role = TABLE_ROLE_BY_NAME[extension.name]
    return role ? { tableRole: role } : {}
  },

  parseHTML() {
    return [{ tag: 'table' }]
  },

  renderHTML({ HTMLAttributes }) {
    // `<thead>`/`<tbody>` from pasted markup carry no meaning in the schema —
    // rows are parsed straight through — so everything is written back as tbody.
    return ['table', mergeAttributes(HTMLAttributes), ['tbody', 0]]
  },

  addProseMirrorPlugins() {
    return [
      columnResizing({ cellMinWidth: 48, defaultCellMinWidth: 100 }),
      tableEditing({ allowTableNodeSelection: false }),
      // Tables pasted from Word and from web pages are routinely ragged — rows
      // with a missing trailing cell, spans that overrun the table. fixTables
      // pads them out so the editing commands have a rectangular grid to work
      // with; it returns nothing when there is nothing to fix.
      new Plugin({
        appendTransaction: (_transactions, oldState, newState) => fixTables(newState, oldState),
      }),
    ]
  },

  addCommands() {
    return {
      insertTable:
        ({ rows = 3, cols = 3, withHeaderRow = true } = {}) =>
        ({ commands }) => {
          const columnCount = Math.max(1, cols)
          const bodyRowCount = Math.max(withHeaderRow ? 1 : 0, withHeaderRow ? rows - 1 : rows)
          const headerRow = withHeaderRow ? `<tr>${'<th><p></p></th>'.repeat(columnCount)}</tr>` : ''
          const bodyRow = `<tr>${'<td><p></p></td>'.repeat(columnCount)}</tr>`

          // The trailing paragraph gives the cursor somewhere to go when the
          // table is the last block in the document.
          return commands.insertContent(
            `<table>${headerRow}${bodyRow.repeat(bodyRowCount)}</table><p></p>`
          )
        },
      deleteTable:
        () =>
        ({ state, dispatch }) =>
          deleteTable(state, dispatch),
      addColumnBefore:
        () =>
        ({ state, dispatch }) =>
          addColumnBefore(state, dispatch),
      addColumnAfter:
        () =>
        ({ state, dispatch }) =>
          addColumnAfter(state, dispatch),
      deleteColumn:
        () =>
        ({ state, dispatch }) =>
          deleteColumn(state, dispatch),
      addRowBefore:
        () =>
        ({ state, dispatch }) =>
          addRowBefore(state, dispatch),
      addRowAfter:
        () =>
        ({ state, dispatch }) =>
          addRowAfter(state, dispatch),
      deleteRow:
        () =>
        ({ state, dispatch }) =>
          deleteRow(state, dispatch),
      mergeOrSplit:
        () =>
        ({ state, dispatch }) =>
          mergeCells(state, dispatch) || splitCell(state, dispatch),
      toggleHeaderRow:
        () =>
        ({ state, dispatch }) =>
          toggleHeaderRow(state, dispatch),
      toggleHeaderColumn:
        () =>
        ({ state, dispatch }) =>
          toggleHeaderColumn(state, dispatch),
    }
  },

  addKeyboardShortcuts() {
    // Both return false outside a table, so Tab keeps its list-indent behaviour
    // everywhere else in the document. `dispatch` is wrapped rather than passed
    // by reference because EditorView#dispatch relies on its receiver.
    const goToCell = (direction: 1 | -1) => () =>
      goToNextCell(direction)(this.editor.state, (tr) => this.editor.view.dispatch(tr))

    return {
      Tab: goToCell(1),
      'Shift-Tab': goToCell(-1),
    }
  },
})

export const TableRow = Node.create({
  name: 'tableRow',
  content: '(tableCell | tableHeader)*',

  parseHTML() {
    return [{ tag: 'tr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(HTMLAttributes), 0]
  },
})

export const TableCell = Node.create({
  name: 'tableCell',
  content: 'block+',
  isolating: true,

  addAttributes() {
    return cellAttributes
  },

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(HTMLAttributes), 0]
  },
})

export const TableHeader = Node.create({
  name: 'tableHeader',
  content: 'block+',
  isolating: true,

  addAttributes() {
    return cellAttributes
  },

  parseHTML() {
    return [{ tag: 'th' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['th', mergeAttributes(HTMLAttributes), 0]
  },
})

export const tableExtensions = [Table, TableRow, TableCell, TableHeader]
