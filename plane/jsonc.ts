// just enough jsonc to read a head manifest.
//
// the plane is an orphan branch and does not vendor the head, so it carries the
// smallest reader that gets comments and trailing commas out of the way. the
// alternative is importing the head's loader, which would make the plane a
// second copy of the thing it is supposed to be checking against.

// strip // and /* */ comments outside strings, then trailing commas.
export function stripJsonc(src: string): string {
  let out = "";
  let i = 0;
  let inString = false;
  let escape = false;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inString) {
      out += ch;
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      i++;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

export interface HeadManifest {
  id: string;
  surfaces: string[];
  // platforms the persona actually registers a voice for
  platforms: string[];
}

export function parseHeadManifest(src: string): HeadManifest {
  const parsed = JSON.parse(stripJsonc(src)) as {
    id: string;
    surfaces: string[];
    voice?: { register_by_platform?: Record<string, unknown> };
  };
  return {
    id: parsed.id,
    surfaces: parsed.surfaces ?? [],
    platforms: Object.keys(parsed.voice?.register_by_platform ?? {}),
  };
}
