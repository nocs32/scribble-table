import { defineKeyframes } from '@pandacss/dev';

// A corner of the board folding over (the fold trick, 7 s): the paper loses the corner, and the
// flap lies over the drawing next to it. The legs are 37.5 % of the width and 50 % of the height,
// the same length on 4:3 paper, so the flap is the corner mirrored over the crease.
// [unfolded, folded] clip polygons for each corner, for the paper and for the flap.
const folds = {
  Nw: { paper: ['0 0, 100% 0, 100% 100%, 0 100%, 0 0', '37.5% 0, 100% 0, 100% 100%, 0 100%, 0 50%'], flap: ['0 0, 0 0, 0 0', '37.5% 0, 0 50%, 37.5% 50%'] },
  Ne: { paper: ['0 0, 100% 0, 100% 0, 100% 100%, 0 100%', '0 0, 62.5% 0, 100% 50%, 100% 100%, 0 100%'], flap: ['100% 0, 100% 0, 100% 0', '62.5% 0, 100% 50%, 62.5% 50%'] },
  Se: { paper: ['0 0, 100% 0, 100% 100%, 100% 100%, 0 100%', '0 0, 100% 0, 100% 50%, 62.5% 100%, 0 100%'], flap: ['100% 100%, 100% 100%, 100% 100%', '100% 50%, 62.5% 100%, 62.5% 50%'] },
  Sw: { paper: ['0 0, 100% 0, 100% 100%, 0 100%, 0 100%', '0 0, 100% 0, 100% 100%, 37.5% 100%, 0 50%'], flap: ['0 100%, 0 100%, 0 100%', '0 50%, 37.5% 100%, 37.5% 50%'] },
};

const foldFrames = ([unfolded, folded]: string[]): Record<string, { clipPath: string }> => ({
  '0%, 100%': { clipPath: `polygon(${unfolded})` },
  '7%, 90%': { clipPath: `polygon(${folded})` },
});

const foldKeyframes = Object.fromEntries(
  Object.entries(folds).flatMap(([corner, { paper, flap }]) => [
    [`foldPaper${corner}`, foldFrames(paper)],
    [`foldFlap${corner}`, foldFrames(flap)],
  ]),
);

export const keyframes = defineKeyframes({
  ...foldKeyframes,
  // Paint hitting the board (the splat trick, 6 s): it lands, sits, then slides off as it fades.
  splat: {
    '0%': { transform: 'scale(0.2)', opacity: '0' },
    '4%': { transform: 'scale(1.08)', opacity: '0.95' },
    '8%': { transform: 'scale(1)', opacity: '0.95' },
    '80%': { transform: 'translateY(0)', opacity: '0.95' },
    '100%': { transform: 'translateY(8%)', opacity: '0' },
  },
  emojiRise: {
    '0%': { transform: 'translate(-50%, 0) scale(0.5)', opacity: '0' },
    '8%': { transform: 'translate(-50%, -28px) scale(1)', opacity: '1' },
    '70%': { opacity: '1' },
    '100%': { transform: 'translate(-50%, calc(-100cqh + 160px)) scale(1.3)', opacity: '0' },
  },
  emojiPop: {
    '0%': { transform: 'translate(-50%, 0) scale(0.6)', opacity: '0' },
    '20%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '1' },
    '100%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '0' },
  },
  swayGentle: {
    from: { transform: 'translateX(-8px) rotate(-5deg)' },
    to: { transform: 'translateX(8px) rotate(5deg)' },
  },
  swayWide: {
    from: { transform: 'translateX(-18px) rotate(-8deg)' },
    to: { transform: 'translateX(18px) rotate(8deg)' },
  },
  swayWobbly: {
    from: { transform: 'translateX(-10px) rotate(-12deg)' },
    to: { transform: 'translateX(10px) rotate(12deg)' },
  },
  // A score or a letter that just changed.
  pop: {
    '0%': { transform: 'scale(1)' },
    '40%': { transform: 'scale(1.25)' },
    '100%': { transform: 'scale(1)' },
  },
  // The last seconds of the clock.
  urgent: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.08)' },
    '100%': { transform: 'scale(1)' },
  },
  podiumRise: {
    from: { transform: 'translateY(24px)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  dialogIn: {
    from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  shimmer: {
    '0%': { opacity: '0.55' },
    '50%': { opacity: '0.85' },
    '100%': { opacity: '0.55' },
  },
});
