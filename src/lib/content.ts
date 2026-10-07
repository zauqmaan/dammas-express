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

/**
 * Estimated reading time in whole minutes, at 200 words per minute.
 *
 * Counts the words a reader actually sees: `<script>`/`<style>` blocks, tags
 * and HTML entities are removed first, so markup never inflates the count.
 * Never returns less than 1.
 */
export function readingMinutes(html: string | null | undefined): number {
  if (!html) return 1

  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ')

  // A token counts only if it contains a letter or digit, so stray "–", "|"
  // or bullet characters left between tags are not counted as words.
  const words = text.split(/\s+/).filter((word) => /[a-z0-9À-￿]/i.test(word)).length
  return Math.max(1, Math.ceil(words / 200))
}
