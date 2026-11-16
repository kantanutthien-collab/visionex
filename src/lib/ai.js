// "What does this mean?" — reads the daily record and explains it in plain words.
// With a Claude API key (entered by an admin, kept only in this browser) it asks Claude; otherwise built-in rules answer.
import Anthropic from '@anthropic-ai/sdk';
import { avg6, pctOf, statusOf } from './analysis.js';

export const AI_KEY = 'visionex-ai-key';
export const loadAiKey = () => { try { return localStorage.getItem(AI_KEY) || ''; } catch { return ''; } };
export const saveAiKey = k => { try { k ? localStorage.setItem(AI_KEY, k) : localStorage.removeItem(AI_KEY); } catch { /* ignore */ } };

export const tableText = rows => ['date,eating(min),drinking(min),resting(hrs),playing(min),activity(index 0-100),pacing(times),health(0-100)',
  ...rows.map(r => [r.date, r.eating, r.drinking, r.resting, r.playing, r.activity, r.pacing, r.health].join(','))].join('\n');

export async function analyseWithClaude({ apiKey, animal, rows, L }) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const res = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium' },
    system: `You help zookeepers read a daily behaviour record produced by camera AI. Explain it in plain words a trainee keeper understands.
Compare the latest day with the animal's own usual (the average of the earlier days). Cover: 1) what is normal, 2) what changed and since when, 3) what the keeper should check or do today.
Describe behaviour only; never claim to know the animal's feelings. Reply in ${L === 'th' ? 'Thai' : 'English'}, at most 120 words, as 3 to 5 short bullet points that each start with "•".`,
    messages: [{ role: 'user', content: `Animal: ${animal}\nDaily record (oldest first):\n${tableText(rows)}` }],
  });
  if (res.stop_reason === 'refusal') throw new Error('refused');
  return res.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

// Built-in rules (no key needed): same questions, answered from the 7-day arrays
export function localAnalysis({ a, L }) {
  const th = L === 'th', out = [];
  const line = (key, thName, enName, goodUp) => {
    const p = pctOf(a[key] || [0, 0, 0, 0, 0, 0, 0]); const sign = p > 0 ? '+' : '';
    const bad = goodUp === null ? Math.abs(p) >= 20 : Math.abs(p) >= 8 && (p > 0) !== goodUp;
    if (Math.abs(p) < 8) out.push(th ? `• ${thName}ใกล้เคียงปกติ (${sign}${p}%)` : `• ${enName} is close to usual (${sign}${p}%).`);
    else out.push(th ? `• ${thName}${p > 0 ? 'มากกว่า' : 'น้อยกว่า'}ปกติ ${Math.abs(p)}%${bad ? ' ← ควรจับตา' : ''}` : `• ${enName} is ${p > 0 ? 'up' : 'down'} ${Math.abs(p)}% vs usual${bad ? ' ← worth watching.' : '.'}`);
  };
  line('eating', 'เวลากินอาหาร', 'Eating time', true); line('drinking', 'เวลาดื่มน้ำ', 'Drinking time', true);
  line('resting', 'เวลานอนพัก', 'Sleep & rest', null); line('playing', 'เวลาเล่น', 'Playing time', true);
  const pa = avg6(a.pacing || [0]), today = (a.pacing || [0])[6] || 0;
  if (today >= Math.max(3, pa * 1.5)) out.push(th ? `• เดินวน ${today} ครั้งวันนี้ (ปกติ ${pa.toFixed(1)}) อาจเครียด ควรตรวจคอกและสิ่งรบกวน` : `• Pacing ${today} times today (usually ${pa.toFixed(1)}): may be stressed. Check the enclosure for disturbances.`);
  const st = statusOf(a.health);
  out.push(th ? (st === 'healthy' ? '• สรุป: วันนี้ปกติ ดูแลตามรายการประจำวันได้เลย' : st === 'watch' ? '• สรุป: เริ่มต่างจากปกติ ให้สังเกตการกินและน้ำวันนี้เป็นพิเศษ' : '• สรุป: หลายอย่างต่างจากปกติพร้อมกัน ควรแจ้งสัตวแพทย์วันนี้')
    : (st === 'healthy' ? '• Summary: a normal day. Follow the usual routine.' : st === 'watch' ? '• Summary: drifting from normal. Watch food and water closely today.' : '• Summary: several things are off at once. Tell the vet today.'));
  return out.join('\n');
}
