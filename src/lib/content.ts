// Content written in the dashboard editor is stored as raw HTML and rendered on
// the public pages with `dangerouslySetInnerHTML`, so any structural tweak has to
// happen on the HTML string itself.

/**
 * Wraps every `<table>` in a horizontally scrollable container.
 *
 * A pasted spreadsheet is routinely wider than a phone screen. Without the
 * wrapper the table either forces the whole article to scroll sideways or gets
 * squeezed into unreadable columns; with it, only the table scrolls.
 * `.table-scroll` is styled in globals.css.
 */
export function prepareContentHtml(html: string | null | undefined): string {
  if (!html) return ''

  return html
    .replace(/<table(\s|>)/gi, '<div class="table-scroll"><table$1')
    .replace(/<\/table>/gi, '</table></div>')
}
