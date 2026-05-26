/**
 * Split a weekly entry's markdown body into Plan + Reflection sections.
 *
 * Cadence (Pete, 2026-05-26):
 *   - During the week, the entry holds the PLAN (forward-looking).
 *   - At end of week, Pete appends a `## Reflection` heading and writes the
 *     reflection on the week just lived. Then the plan for the NEXT week
 *     goes in next week's entry.
 *
 * Parsing strategy:
 *   - If a top-level `## Reflection` heading is present, everything after it
 *     (until the next `## ` heading) is the reflection. Everything before it
 *     is the plan.
 *   - If no `## Reflection` heading, the whole body is treated as the plan
 *     and reflection is null.
 */
export interface WeekEntrySplit {
  plan: string | null;
  reflection: string | null;
}

const REFLECTION_RE = /^## Reflection(?:\s+on\s+the\s+week)?\s*$/im;

export function splitWeekEntry(body: string): WeekEntrySplit {
  const m = REFLECTION_RE.exec(body);
  if (!m) return { plan: body.trim() || null, reflection: null };

  const cutHead = m.index;
  const headingEnd = cutHead + m[0].length;
  const after = body.slice(headingEnd);

  // Reflection runs until the next H2-or-shallower heading, or end of file.
  const nextH2 = after.search(/\n## (?!Reflection)/);
  const reflection = (nextH2 === -1 ? after : after.slice(0, nextH2)).trim();

  const plan = body.slice(0, cutHead).trim();

  return {
    plan: plan.length > 0 ? plan : null,
    reflection: reflection.length > 0 ? reflection : null,
  };
}
