import express from 'express';
import crypto from 'crypto';
import { Type } from '@google/genai';
import { runMiddleware, authMiddleware, adminMiddleware, getDb, getAiClient } from './utils';

const app = express();
app.use(express.json());

app.get('/api/admin/check', async (req: any, res: any) => {
  try { await runMiddleware(req,res,authMiddleware); await runMiddleware(req,res,adminMiddleware); return res.json({ok:true}); }
  catch (e:any) { if(!res.headersSent) return res.status(500).json({error:e.message}); }
});

app.get('/api/admin/data', async (req:any,res:any)=>{
  try { await runMiddleware(req,res,authMiddleware); await runMiddleware(req,res,adminMiddleware);
    const usersSnap = await getDb().collection('users').get();
    const users = usersSnap.docs.map((doc:any)=>({id:doc.id,...doc.data()}));
    const configDoc = await getDb().collection('config').doc('global').get();
    let apiKeyMasked='';
    if (configDoc.exists && configDoc.data()?.geminiApiKey) { const key = configDoc.data()!.geminiApiKey; apiKeyMasked = key.substring(0,8)+'***'+key.substring(key.length-4); }
    return res.json({users, apiKeyMasked});
  } catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
});

app.post('/api/admin/config', async (req:any,res:any)=>{
  try { await runMiddleware(req,res,authMiddleware); await runMiddleware(req,res,adminMiddleware);
    const {geminiApiKey}=req.body; await getDb().collection('config').doc('global').set({geminiApiKey},{merge:true}); return res.json({success:true});
  } catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
});
app.post('/api/admin/users', async (req:any,res:any)=>{
  try { await runMiddleware(req,res,authMiddleware); await runMiddleware(req,res,adminMiddleware);
    const { targetUserId, tier } = req.body; const expiry = tier !== 'free' ? Date.now()+30*24*60*60*1000 : null;
    await getDb().collection('users').doc(targetUserId).set({tier,tierExpiry:expiry},{merge:true}); return res.json({success:true});
  } catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
});

app.post('/api/chat', async (req:any,res:any)=>{
  try { await runMiddleware(req,res,authMiddleware);
    const uid=req.user.uid; const userDoc=await getDb().collection('users').doc(uid).get(); let tier=userDoc.data()?.tier||'free';
    const adminEmail=process.env.ADMIN_EMAIL; if (adminEmail && req.user.email===adminEmail) tier='pro';
    if (tier==='free') {
      const today = new Date().toISOString().split('T')[0]; const usageDate=userDoc.data()?.geminiLastDate; let usageCount=userDoc.data()?.geminiDailyUsage||0;
      if (usageDate!==today) usageCount=0; if (usageCount>=10) return res.status(403).json({error:'Batas harian free tier tercapai (10/hari). Upgrade ke Pro untuk unlimited.'});
      await getDb().collection('users').doc(uid).set({geminiLastDate:today,geminiDailyUsage:usageCount+1},{merge:true});
    }
    const ai=await getAiClient(); const {messages}=req.body;
    const prompt=(messages||[]).map((m:any)=>`${m.role==='user'?'User':'Assistant'}: ${m.content}`).join('\n');
    const response=await ai.models.generateContent({model:'gemini-3-flash-preview',contents:prompt});
    return res.json({reply: response.text || ''});
  } catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
});

function aiJson(path:string, schema:any, buildContents:(body:any)=>string){
  app.post(path, async (req:any,res:any)=>{
    try { const ai=await getAiClient(); const response=await ai.models.generateContent({model:'gemini-3-flash-preview', contents: buildContents(req.body), config:{responseMimeType:'application/json', responseSchema:schema}}); return res.json(JSON.parse(response.text?.trim()||'{}')); }
    catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
  });
}

aiJson('/api/check-answer',{type:Type.OBJECT,properties:{isCorrect:{type:Type.BOOLEAN},feedback:{type:Type.STRING},correctedSentence:{type:Type.STRING}},required:['isCorrect','feedback']},({question,answer,level})=>`Soal: ${question}\nJawaban siswa (${level}): ${answer}\n\nKoreksi jawaban ini. Apakah maknanya benar dan grammar/artikelnya tepat? Berikan skor benar/salah, penjelasan dalam bahasa Indonesia, dan perbaikannya bila ada kesalahan.`);
aiJson('/api/generate-exercises',{type:Type.ARRAY,items:{type:Type.OBJECT}},({level,grammarTopic,vocabulary})=>`Buatkan persis 3 soal kuis mini pilihan ganda (multiple_choice) Bahasa Jerman untuk level ${level} berdasarkan materi: ${grammarTopic}. Gunakan kosa kata berikut jika relevan: ${vocabulary?.map((v:any)=>v.word).join(', ')}. Soal HARUS berupa pilihan ganda dengan 4 opsi jawaban.`);
aiJson('/api/vocab-examples',{type:Type.ARRAY,items:{type:Type.OBJECT}},({word,level})=>`Buatkan 2 contoh kalimat sederhana berbahasa Jerman menggunakan kata '${word}' untuk siswa level ${level}. Sertakan terjemahannya di bahasa Indonesia.`);
aiJson('/api/koreksi-kalimat',{type:Type.OBJECT,properties:{isPerfect:{type:Type.BOOLEAN},correctedSentence:{type:Type.STRING},explanation:{type:Type.STRING}},required:['isPerfect','correctedSentence','explanation']},({sentence})=>`Saya mencoba menulis kalimat bahasa Jerman ini: "${sentence}".\nTolong periksa tata bahasa (grammar), penggunaan artikel, kata kerja, dan susunan kalimatnya. Beri penjelasan mendalam dalam bahasa Indonesia, dan berikan kalimat yang benar.`);
aiJson('/api/pronunciation',{type:Type.OBJECT,properties:{phonetic:{type:Type.STRING},tip:{type:Type.STRING}},required:['phonetic','tip']},({word})=>`Berikan panduan singkat membaca kata berbahasa Jerman '${word}' untuk lidah orang Indonesia. Berikan format transliterasi sederhana yang mudah.`);
aiJson('/api/generate-study-plan',{type:Type.ARRAY,items:{type:Type.OBJECT}},({level,xp,lessonsCompleted})=>`Saya adalah siswa bahasa Jerman di level ${level}. Saya memiliki ${xp} XP dan telah menyelesaikan pelajaran berikut: ${(lessonsCompleted||[]).join(', ')}. Buatkan rencana belajar berupa 10 poin fokus.`);
aiJson('/api/generate-mock-test',{type:Type.ARRAY,items:{type:Type.OBJECT}},({level})=>`Buatkan ujian simulasi (Mock Test) bahasa Jerman level ${level} dalam format resmi seperti (Goethe/TELC). Total 20 soal pilihan ganda.`);
aiJson('/api/check-mock-test',{type:Type.ARRAY,items:{type:Type.OBJECT}},({level,wrongAnswers})=>`Seorang siswa bahasa Jerman level ${level} baru saja menyelesaikan simulasi ujian. Berikut ini daftar soal yang dijawab salah olehnya (format JSON): ${JSON.stringify(wrongAnswers||[])}. Tolong berikan penjelasan singkat bahasa Indonesia untuk tiap soal salah.`);

app.post('/api/payment/create', async (req:any,res:any)=>{
  try { await runMiddleware(req,res,authMiddleware);
    const IPAYMU_VA=process.env.IPAYMU_VA; const IPAYMU_API_KEY=process.env.IPAYMU_API_KEY; const IPAYMU_URL=process.env.IPAYMU_URL||'https://sandbox.ipaymu.com'; const APP_URL=process.env.APP_URL||'http://localhost:3000';
    const { userId, planType, email, name } = req.body; const price=49000;
    const body:any={account:IPAYMU_VA,product:[`DeutschUp ${planType.toUpperCase()}`],qty:['1'],price:[price.toString()],returnUrl:`${APP_URL}/dashboard?payment=success`,notifyUrl:`${APP_URL}/api/payment/callback`,cancelUrl:`${APP_URL}/pricing?payment=cancel`,referenceId:`ORDER-${userId}-${Date.now()}`,buyerName:name,buyerEmail:email};
    const stringBody = JSON.stringify(body); const bodyHash=crypto.createHash('sha256').update(stringBody).digest('hex').toLowerCase(); const stringToSign = `POST:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`; const signature=crypto.createHmac('sha256', IPAYMU_API_KEY||'').update(stringToSign).digest('hex').toLowerCase();
    const ipaymuReq = await fetch(`${IPAYMU_URL}/api/v2/payment`,{method:'POST',headers:{'Content-Type':'application/json','va':IPAYMU_VA||'','signature':signature,'timestamp':new Date().toISOString()},body:stringBody});
    const ipaymuRes:any = await ipaymuReq.json(); if (!ipaymuReq.ok) return res.status(400).json({error: ipaymuRes?.Message || 'Gagal membuat pembayaran'});
    await getDb().collection('orders').doc(body.referenceId).set({userId,planType,status:'pending',createdAt:Date.now()});
    return res.json({url: ipaymuRes?.Data?.Url || ipaymuRes?.Data?.SessionUrl});
  } catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
});

app.post('/api/payment/callback', async (req:any,res:any)=>{
  try { const {status,sid}=req.body; if (status==='berhasil' || status==='success') { const orderDoc = await getDb().collection('orders').doc(sid).get(); if(orderDoc.exists){ const order:any=orderDoc.data(); const expiry=Date.now()+30*24*60*60*1000; await getDb().collection('users').doc(order.userId).set({tier:order.planType,tierExpiry:expiry},{merge:true}); await getDb().collection('orders').doc(sid).update({status:'paid',paidAt:Date.now()}); }} return res.json({success:true}); }
  catch(e:any){ if(!res.headersSent) return res.status(500).json({error:e.message}); }
});

export default app;
