import ReactMarkdown from "react-markdown";

/** Render vault markdown, stripping Obsidian wikilinks (no internal nav on the public site). */
function stripWikilinks(md: string): string {
  return md
    .replace(/!\[\[[^\]]+\]\]/g, "") // embeds
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2") // [[target|alias]] -> alias
    .replace(/\[\[([^\]]+)\]\]/g, "$1"); // [[target]] -> target
}

export function MarkdownPanel({ body }: { body: string }) {
  return (
    <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:text-base prose-h3:text-sm">
      <ReactMarkdown>{stripWikilinks(body)}</ReactMarkdown>
    </div>
  );
}
