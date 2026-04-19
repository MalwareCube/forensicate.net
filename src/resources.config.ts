export interface ResourceEntry {
  title: string;
  url: string;
  category: string;
  description?: string;
  badge?: string;
}

export const page = {
  title: 'Resources',
  description: 'Bookmarks, cheatsheets, books, and references I keep coming back to.',
  intro: 'A non-exhaustive list of resources worth checking out.',
  empty: 'Nothing here yet.',
};

export const resources: ResourceEntry[] = [
  {
    title: 'PowerShell Incident Response Cheatsheet',
    url: '/posts/powershell-incident-response-cheatsheet/',
    category: 'Cheatsheets',
    description: 'Quick-reference PowerShell commands for triage and evidence collection during live-response investigations.',
  },
  {
    title: 'Windows Event IDs for Incident Response',
    url: '/posts/windows-event-ids-for-incident-response/',
    category: 'Cheatsheets',
    description: 'Windows event IDs of interest during triage, grouped by the investigative question they answer.',
  },
  {
    title: 'SANS Hunt Evil: Lateral Movement Poster',
    url: 'https://www.sans.org/posters/hunt-evil/',
    category: 'Cheatsheets',
    badge: 'PDF',
    description: 'Execution artifacts left by common lateral movement techniques on Windows.',
  },
  {
    title: 'SANS Network Forensics Poster',
    url: 'https://www.sans.org/posters/network-forensics-poster',
    category: 'Cheatsheets',
    badge: 'PDF',
    description: 'Overview of network forensic analysis techniques for IR, threat hunting, and traditional investigations.',
  },
  {
    title: 'SANS Ransomware and Cyber Extortion Poster',
    url: 'https://www.sans.org/posters/ransomware-and-cyber-extortion',
    category: 'Cheatsheets',
    badge: 'PDF',
    description: 'The ransomware business ecosystem and each phase of a typical extortion attack.',
  },
  {
    title: 'SANS Windows Forensic Analysis Poster',
    url: 'https://www.sans.org/posters/windows-forensic-analysis',
    category: 'Cheatsheets',
    badge: 'PDF',
    description: 'The "Evidence of..." artifact-to-question map. Where on Windows to look for execution, file access, account usage, etc.',
  },
  {
    title: 'Applied Incident Response',
    url: 'https://www.amazon.com/Applied-Incident-Response-Steve-Anson/dp/1119560268',
    category: 'Books',
    description: 'Steve Anson. End-to-end IR framework covering triage, acquisition, log analysis, malware analysis, threat hunting, etc.',
  },
  {
    title: 'The Art of Memory Forensics',
    url: 'https://www.amazon.com/Art-Memory-Forensics-Detecting-Malware/dp/1118825098',
    category: 'Books',
    description: 'Ligh, Case, Levy, and Walters. The definitive guide to volatile memory analysis across Windows, Linux, and Mac.',
  },
  {
    title: 'The DFIR Investigative Mindset',
    url: 'https://www.amazon.com/Placing-Suspect-Behind-Keyboard-Investigative/dp/B0CZPJF23Q',
    category: 'Books',
    description: 'Brett Shavers. On investigative methodology and how to think like an examiner, regardless of tools.',
  },
  {
    title: 'File System Forensic Analysis',
    url: 'https://www.amazon.com/System-Forensic-Analysis-Brian-Carrier/dp/0321268172',
    category: 'Books',
    description: 'Brian Carrier. The definitive reference on volume and file system internals.',
  },
  {
    title: 'Windows Registry Forensics',
    url: 'https://www.amazon.com/Windows-Registry-Forensics-Advanced-Forensic/dp/012803291X',
    category: 'Books',
    description: 'Harlan Carvey. The most in-depth guide to forensic investigations involving Windows Registry.',
  },
  {
    title: 'SIFT Workstation',
    url: 'https://www.sans.org/tools/sift-workstation/',
    category: 'Tooling',
    description: 'SANS-curated Ubuntu distribution preloaded with open-source incident response and forensic tools.',
  },
  {
    title: 'Sysinternals',
    url: 'https://learn.microsoft.com/en-us/sysinternals/',
    category: 'Tooling',
    description: "Microsoft's suite of Windows internals utilities, including Process Explorer, Autoruns, Sysmon, etc.",
  },
  {
    title: 'Velociraptor',
    url: 'https://docs.velociraptor.app/',
    category: 'Tooling',
    description: 'Endpoint visibility and DFIR platform.',
  },
  {
    title: 'FTK Imager',
    url: 'https://www.exterro.com/digital-forensics-software/ftk-imager',
    category: 'Tooling',
    description: 'Free disk imaging and evidence preview utility from Exterro.',
  },
  {
    title: 'Arsenal Recon',
    url: 'https://arsenalrecon.com/',
    category: 'Tooling',
    description: 'Arsenal Image Mounter and other utilities for mounting forensic images, shadow copies, and accessing registry artifacts.',
  },
  {
    title: 'Magnet Forensics',
    url: 'https://www.magnetforensics.com/',
    category: 'Tooling',
    description: 'Commercial forensics vendor with a range of free utilities (like Encrypted Disk Detector, RAM capture, etc.) alongside its paid platform.',
  },
  {
    title: 'KAPE',
    url: 'https://www.kroll.com/en/services/cyber/incident-response-recovery/kroll-artifact-parser-and-extractor-kape',
    category: 'Tooling',
    description: "Kroll Artifact Parser and Extractor. Targeted collection and parsing of forensic artifacts, built on Eric Zimmerman's tools.",
  },
  {
    title: "Eric Zimmerman's Tools",
    url: 'https://ericzimmerman.github.io/',
    category: 'Tooling',
    description: 'Windows artifact parsing at scale (Registry, Prefetch, Jump Lists, etc.).',
  },
  {
    title: 'Plaso',
    url: 'https://github.com/log2timeline/plaso',
    category: 'Tooling',
    description: 'Python backend behind log2timeline for building super timelines from many artifact sources.',
  },
  {
    title: 'Chainsaw',
    url: 'https://github.com/WithSecureLabs/chainsaw',
    category: 'Tooling',
    description: 'Fast Windows event log hunting using Sigma rules and built-in detection signatures.',
  },
  {
    title: 'Hayabusa',
    url: 'https://github.com/Yamato-Security/hayabusa',
    category: 'Tooling',
    description: 'Windows event log fast-forensics and threat hunting tool with Sigma rule support.',
  },
  {
    title: 'Didier Stevens Suite',
    url: 'https://blog.didierstevens.com/didier-stevens-suite/',
    category: 'Tooling',
    description: 'Python tools for analyzing PDFs, Office documents, OLE streams, shellcode, and suspicious binaries.',
  },
  {
    title: 'The DFIR Report',
    url: 'https://thedfirreport.com/',
    category: 'Threat intelligence',
    description: 'Detailed intrusion case studies with full attack chains, TTPs, and artifacts observed in the wild.',
  },
  {
    title: 'Palo Alto Unit 42',
    url: 'https://unit42.paloaltonetworks.com/',
    category: 'Threat intelligence',
    description: 'Threat research covering APT reporting, ransomware analysis, and novel vulnerabilities.',
  },
  {
    title: 'CISA Known Exploited Vulnerabilities',
    url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    category: 'Threat intelligence',
    description: 'Authoritative catalog of vulnerabilities known to be actively exploited in the wild.',
  },
  {
    title: 'LOLBAS',
    url: 'https://lolbas-project.github.io/',
    category: 'Threat intelligence',
    badge: 'LOTL',
    description: 'Windows binaries, scripts, and libraries that attackers abuse for living-off-the-land techniques.',
  },
  {
    title: 'GTFOBins',
    url: 'https://gtfobins.github.io/',
    category: 'Threat intelligence',
    badge: 'LOTL',
    description: 'Unix binaries that can be abused to bypass local security restrictions, escalate privileges, or spawn shells.',
  },
  {
    title: 'LOOBins',
    url: 'https://www.loobins.io/',
    category: 'Threat intelligence',
    badge: 'LOTL',
    description: 'macOS counterpart to LOLBAS, cataloging built-in binaries attackers use for stealthy operations.',
  },
  {
    title: 'LOTS Project',
    url: 'https://lots-project.com/',
    category: 'Threat intelligence',
    badge: 'LOTL',
    description: 'Catalog of legitimate trusted sites abused for C2, phishing, exfiltration, and payload hosting.',
  },
  {
    title: 'Windows Incident Response',
    url: 'https://windowsir.blogspot.com/',
    category: 'Blogs',
    description: "Harlan Carvey's long-running blog on Windows incident response, registry forensics, and analyst methodology.",
  },
  {
    title: 'OSDFIR',
    url: 'https://osdfir.blogspot.com/',
    category: 'Blogs',
    description: 'Open source DFIR tooling updates and guidance, covering Plaso, Timesketch, GRR, Turbinia, and related projects.',
  },
  {
    title: "Brett Shavers' Blog",
    url: 'https://brettshavers.com/brett-s-blog',
    category: 'Blogs',
    description: 'Commentary on investigative methodology, digital forensics practice, and career development from the author of several DFIR books.',
  },
  {
    title: 'DFIR Philosophy',
    url: 'https://dfirphilosophy.blogspot.com/',
    category: 'Blogs',
    description: 'Posts on investigative mindset, analyst development, and the craft of DFIR.',
  },
  {
    title: 'Forensic IT Guy',
    url: 'https://forensicitguy.github.io/about/',
    category: 'Blogs',
    description: "Tony Lambert's blog on malware analysis, reverse engineering, and threat research.",
  },
];
