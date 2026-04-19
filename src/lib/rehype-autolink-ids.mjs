import { visit, SKIP } from 'unist-util-visit';

const PATTERN = /\b(T[AaPp]?\d{4}(?:\.\d{3})?|G\d{4}|S\d{4}|CVE-\d{4}-\d{4,7}|KB\d{5,7})\b/g;

function urlFor(token) {
  if (token.startsWith('CVE-')) {
    return `https://www.cve.org/CVERecord?id=${token}`;
  }
  if (token.startsWith('KB')) {
    return `https://support.microsoft.com/help/${token.slice(2)}`;
  }
  // MITRE: T#### or T####.### (technique), TA#### (tactic), G#### (group), S#### (software)
  if (/^TA\d{4}$/i.test(token)) {
    return `https://attack.mitre.org/tactics/${token.toUpperCase()}/`;
  }
  if (/^T\d{4}(\.\d{3})?$/i.test(token)) {
    const up = token.toUpperCase();
    const path = up.includes('.') ? up.replace('.', '/') : up;
    return `https://attack.mitre.org/techniques/${path}/`;
  }
  if (/^G\d{4}$/i.test(token)) {
    return `https://attack.mitre.org/groups/${token.toUpperCase()}/`;
  }
  if (/^S\d{4}$/i.test(token)) {
    return `https://attack.mitre.org/software/${token.toUpperCase()}/`;
  }
  return null;
}

function shouldSkip(ancestors) {
  for (const a of ancestors) {
    if (!a || a.type !== 'element') continue;
    const t = a.tagName;
    if (t === 'a' || t === 'code' || t === 'pre') return true;
  }
  return false;
}

export default function rehypeAutolinkIds() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null) return;
      const ancestors = tree === parent ? [] : findAncestors(tree, parent);
      if (shouldSkip([...ancestors, parent])) return;
      const value = node.value;
      if (!value || !PATTERN.test(value)) return;
      PATTERN.lastIndex = 0;

      const newNodes = [];
      let lastIndex = 0;
      let m;
      while ((m = PATTERN.exec(value)) !== null) {
        const token = m[1];
        const url = urlFor(token);
        if (!url) continue;
        if (m.index > lastIndex) {
          newNodes.push({ type: 'text', value: value.slice(lastIndex, m.index) });
        }
        newNodes.push({
          type: 'element',
          tagName: 'a',
          properties: {
            href: url,
            className: ['auto-id-link'],
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          children: [{ type: 'text', value: token }],
        });
        lastIndex = m.index + token.length;
      }
      if (newNodes.length === 0) return;
      if (lastIndex < value.length) {
        newNodes.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...newNodes);
      return [SKIP, index + newNodes.length];
    });
  };
}

function findAncestors(tree, target) {
  const path = [];
  function walk(node, trail) {
    if (node === target) { path.push(...trail); return true; }
    if (node.children) {
      for (const c of node.children) {
        if (walk(c, [...trail, node])) return true;
      }
    }
    return false;
  }
  walk(tree, []);
  return path;
}
