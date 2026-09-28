/** CSS property names in kebab-case, e.g. `transform` or `border-radius`, mapped to their values. */
export type Styles = Record<string, string>;

type Original = { value: string; priority: string };

// The inline value each property had before Vaul first overwrote it, so restoring is per property and exact.
const originals = new WeakMap<HTMLElement, Map<string, Original>>();

export function setStyles(element: Element | null | undefined, styles: Styles) {
  if (!(element instanceof HTMLElement)) return;
  let saved = originals.get(element);
  if (!saved) {
    saved = new Map();
    originals.set(element, saved);
  }

  for (const [property, value] of Object.entries(styles)) {
    if (!saved.has(property)) {
      saved.set(property, {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      });
    }
    element.style.setProperty(property, value);
  }
}

/** Puts back the inline values `setStyles` replaced: the given properties, or every one when omitted. */
export function restoreStyles(element: Element | null | undefined, properties?: readonly string[]) {
  if (!(element instanceof HTMLElement)) return;
  const saved = originals.get(element);
  if (!saved) return;

  for (const property of properties ?? [...saved.keys()]) {
    const original = saved.get(property);
    if (!original) continue;
    if (original.value) element.style.setProperty(property, original.value, original.priority);
    else element.style.removeProperty(property);
    saved.delete(property);
  }
}
