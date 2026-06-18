// src/lib/avatar.ts — 픽셀 아바타 빌더(순수). 흰 아웃라인은 공유 SVG 필터(AvatarDefs)가 담당.
import { partyColor, shade } from './parties';

export interface AvatarOpts {
  sex: 'm' | 'f';
  hair: 'up' | 'down' | 'bob';
  hairColor: 'black' | 'silver';
  glasses: boolean;
  party: string;
}

export const AVATAR_VIEWBOX = '-1 -1 22 22';

const SK = '#ecbf8a', SKS = '#cf9460', MOUTH = '#a8623f', LIP = '#cc6f68', EYE = '#13131a',
  FRAME = '#15151c', SHIRT = '#eef2f8', SUIT = '#222b38', LAPEL = '#33414f';
const HAIR = { black: { b: '#1c1c24', h: '#3a3a46' }, silver: { b: '#c2c8d0', h: '#e8ecf0' } };

const px = (x: number, y: number, w: number, h: number, f: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" shape-rendering="crispEdges"/>`;

export function avatarInnerSvg(o: AvatarOpts): string {
  const tie = partyColor(o.party), tieD = shade(tie, -40);
  const H = HAIR[o.hairColor], hb = H.b, hh = H.h;
  const fx = o.sex === 'f' ? 6 : 5, fw = o.sex === 'f' ? 8 : 10, fc = 10;
  const faceH = o.sex === 'f' ? 8 : 9, li = fx - 1, ri = fx + fw;
  const femaleSide = o.sex === 'f' && o.hair !== 'up';
  let k = px(1, 16, 18, 4, SUIT) + px(fc - 4, 16, 2, 1, LAPEL) + px(fc - 3, 17, 1, 3, LAPEL)
    + px(fc + 2, 16, 2, 1, LAPEL) + px(fc + 2, 17, 1, 3, LAPEL) + px(fc - 3, 16, 6, 1, SHIRT) + px(fc - 1, 17, 2, 1, SHIRT);
  const nT = 5 + faceH + 1; k += px(fc - 1, nT, 2, 16 - nT, SKS);
  if (o.hair === 'bob') {
    k += px(li, 2, fw + 2, 3, hb) + px(li - 1, 4, 2, 10, hb) + px(ri, 4, 2, 10, hb)
      + px(li - 2, 7, 1, 5, hb) + px(ri + 1, 7, 1, 5, hb) + px(fx, 13, 1, 1, hb) + px(fx + fw - 1, 13, 1, 1, hb);
  } else if (o.hair === 'down') {
    if (o.sex === 'f') {
      k += px(li, 3, fw + 2, 3, hb) + px(li, 5, 1, 13, hb) + px(ri, 5, 1, 13, hb)
        + px(li - 1, 6, 1, 9, hb) + px(ri + 1, 6, 1, 9, hb) + px(fx, 14, 3, 3, hb) + px(fc + 1, 14, 3, 3, hb);
    } else {
      k += px(fx, 3, fw, 3, hb) + px(li, 5, 1, 7, hb) + px(ri, 5, 1, 7, hb);
    }
  } else {
    k += px(fx + 1, 2, fw - 2, 1, hb) + px(fx, 3, fw, 2, hb) + px(li, 5, 1, 3, hb) + px(ri, 5, 1, 3, hb);
  }
  k += px(fx, 5, fw, faceH, SK) + px(fx + 1, 5 + faceH, fw - 2, 1, SK);
  if (!femaleSide) k += px(fx - 1, 9, 1, 2, SK) + px(fx + fw, 9, 1, 2, SK);
  if (o.hair !== 'up') k += px(fx, 4, fw, 1, hb) + px(fx, 5, fw, 1, hb) + px(fx + 1, 4, fw - 2, 1, hh);
  else k += px(fx + 1, 5, fw - 2, 1, hb) + px(fx + 1, 2, fw - 3, 1, hh);
  k += px(fc - 1, 11, 1, 1, SKS) + px(fc - 2, 12, 4, 1, o.sex === 'f' ? LIP : MOUTH);
  if (o.glasses) {
    k += px(6, 8, 4, 1, FRAME) + px(6, 11, 4, 1, FRAME) + px(6, 9, 1, 2, FRAME) + px(9, 9, 1, 2, FRAME)
      + px(11, 8, 4, 1, FRAME) + px(11, 11, 4, 1, FRAME) + px(11, 9, 1, 2, FRAME) + px(14, 9, 1, 2, FRAME)
      + px(10, 9, 1, 1, FRAME) + px(5, 9, 1, 1, FRAME) + px(15, 9, 1, 1, FRAME)
      + px(8, 10, 1, 1, EYE) + px(12, 10, 1, 1, EYE);
  } else {
    k += px(7, 9, 1, 2, EYE) + px(12, 9, 1, 2, EYE);
  }
  k += px(fc - 1, 16, 2, 1, tieD) + px(fc - 1, 17, 2, 3, tie) + px(fc, 19, 1, 1, tieD);
  return k;
}
