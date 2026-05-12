// Verified MASL team logos pulled directly from stlambush.com on the public CDN.
// These are hotlinked at runtime so we always show whatever the league/team has live.
// Keys match the last word of the opponent name (e.g. "Sockers" from "San Diego Sockers").

export const teamLogos = {
  Ambush: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-84288-ambush-1606244017657345008-medium.png',
  Blast: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-32588-blast-1537208922755343725-medium.svg',
  FC: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-557360-city-fc-1768233976285207294-medium.png',
  Comets: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-12768-comets-1476316749353623007-medium.png',
  Sockers: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-557366-sockers-1777575495840419237-medium.png',
  Stars: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-557367-stars-1764107881394382243-medium.png',
  Strykers: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-214529-strykers-1663790864878505113-medium.png',
  Wave: 'https://digitalshift-stats.us-lax-1.linodeobjects.com/bfbdcb2a-4f27-40fd-8e9d-0c31cbc1b1f6/team-logo_url-281783-wave-1701965813395335762-medium.png',
};

// Official Ambush primary logo and responsive variant from stlambush.com
export const ambushLogo = 'https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/f6f8a8f7-869b-457d-b9fb-14cc859f6e4d/logo-1607527624243987861.png';
export const ambushLogoResponsive = 'https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/f6f8a8f7-869b-457d-b9fb-14cc859f6e4d/responsive-logo-1689730814336769127.png';

// Lookup helper — pass a full opponent name like "San Diego Sockers" and get the right URL.
// Falls back to null if no match (UI should hide the image gracefully when null).
export function logoFor(opponentFullName) {
  if (!opponentFullName) return null;
  const last = opponentFullName.trim().split(/\s+/).slice(-1)[0];
  // Special case: "Utica City FC" — the last word is "FC"
  if (last === 'FC') return teamLogos.FC;
  return teamLogos[last] || null;
}
