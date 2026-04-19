import { site } from '~/site.config';

/**
 * A tool has exactly one destination, picked by `link`:
 * - `{ kind: 'external', url }`: opens an external URL (GitHub, GitLab, any site).
 * - `{ kind: 'internal', path }`: a page hosted on this site, such as a browser
 *   utility, a post writeup, or anything else under the same domain.
 */
export const page = {
  title: 'Tools',
  description: `DFIR tools and utilities by ${site.author}.`,
  intro: 'Scripts, parsers, and browser-based utilities. In-browser tools run entirely client-side, so anything you paste stays on your machine.',
  empty: 'No tools listed yet.',
};

export type ToolLink =
  | { kind: 'external'; url: string }
  | { kind: 'internal'; path: string };

export interface ToolEntry {
  slug: string;
  name: string;
  description: string;
  category: string;
  link: ToolLink;
  featured?: boolean;
}

export const tools: ToolEntry[] = [
  {
    slug: 'cbs-parser',
    name: 'CBS Forensic Toolkit',
    category: 'Forensics',
    description:
      "Parser for the Windows 11 Start Menu's CBS subsystem. Extracts forensic artifacts from the MicrosoftWindows.Client.CBS package: Start Menu search history, cached Bing queries, and application launch counts.",
    link: { kind: 'internal', path: '/posts/cbs-forensic-toolkit/' },
    featured: true,
  },
  {
    slug: 'file-entropy',
    name: 'File Entropy Calculator',
    category: 'Malware',
    description:
      'Drop a file to compute Shannon entropy. High-entropy regions suggest compression or encryption. Useful for spotting packed sections or encrypted payloads inside documents.',
    link: { kind: 'internal', path: '/tools/file-entropy/' },
    featured: true,
  },
  {
    slug: 'file-hex',
    name: 'File Hex Viewer',
    category: 'Malware',
    description:
      'Drop a file into your browser and view it as a classic offset, hex, and ASCII dump.',
    link: { kind: 'internal', path: '/tools/file-hex/' },
    featured: false,
  },
  {
    slug: 'indicator-parser',
    name: 'Indicator Parser',
    category: 'Malware',
    description:
      'Paste a blob of text (log lines, email body, report) and extract IPs, domains, URLs, email addresses, and common file hashes. Defanged indicators are refanged automatically.',
    link: { kind: 'internal', path: '/tools/indicator-parser/' },
    featured: true,
  },
  {
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    category: 'Forensics',
    description:
      'Convert between Unix, Windows FILETIME, Chrome/WebKit, Mac Cocoa, HFS+, OLE, DOS, and ISO 8601 timestamps. Bidirectional and timezone-aware.',
    link: { kind: 'internal', path: '/tools/timestamp-converter/' },
    featured: true,
  },
  {
    slug: 'url-decomposer',
    name: 'URL Decomposer',
    category: 'Web',
    description:
      'Break a URL into scheme, host, path, query parameters, and fragment. Decodes percent-encoding per part and refangs defanged forms automatically.',
    link: { kind: 'internal', path: '/tools/url-decomposer/' },
    featured: true,
  },
];
