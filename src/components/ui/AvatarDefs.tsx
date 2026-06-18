// src/components/ui/AvatarDefs.tsx — 모든 PixelAvatar가 참조하는 공유 흰 아웃라인 필터.
export default function AvatarDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        <filter id="pg-avatar-outline" x="-25%" y="-25%" width="150%" height="150%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="d" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="d" operator="in" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
