// `navigator.platform` is deprecated and `userAgentData` is missing in Safari, so the user agent is the signal left.

function userAgent() {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent;
}

export function isIOS() {
  const agent = userAgent();
  // iPadOS reports a desktop Mac user agent; only touch support tells it apart.
  return /iPhone|iPad|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1);
}

/** True for every browser on iOS as well, since they all run WebKit. */
export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(userAgent());
}
