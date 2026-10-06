import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
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
