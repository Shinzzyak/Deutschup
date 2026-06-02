export default function handler(req: any, res: any) {
  return res.json({ ok: true, time: Date.now() });
}
