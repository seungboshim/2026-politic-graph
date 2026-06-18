// src/components/ui/PixelAvatar.tsx
import { avatarInnerSvg, AVATAR_VIEWBOX, type AvatarOpts } from '@/lib/avatar';

export default function PixelAvatar({ size = 48, className, ...opts }: AvatarOpts & { size?: number; className?: string }) {
  return (
    <svg
      className={`pg-pixel${className ? ` ${className}` : ''}`}
      width={size} height={size} viewBox={AVATAR_VIEWBOX} aria-hidden
    >
      <g filter="url(#pg-avatar-outline)" dangerouslySetInnerHTML={{ __html: avatarInnerSvg(opts) }} />
    </svg>
  );
}
