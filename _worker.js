import { Router } from 'itty-router';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/api/register', async (req, env) => {
  const { username, password } = await req.json();
  if (!username || !password) return new Response(JSON.stringify({error:'Username and password required'}),{status:400,headers:{'content-type':'application/json'}});
  const hash = bcrypt.hashSync(password, 8);
  try { await env.DB.prepare('INSERT INTO users (username,password) VALUES (?,?)').bind(username,hash).run();}
  catch (e) { return new Response(JSON.stringify({error:'Username already exists'}),{status:400,headers:{'content-type':'application/json'}});}
  return new Response(JSON.stringify({success:true,message:'User registered'}),{status:201,headers:{'content-type':'application/json'}});
});

router.all('*', (req, env) => env.ASSETS.fetch(req));
export default router;