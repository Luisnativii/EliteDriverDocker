import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error('Pass the local audit account email and password.');
const base = 'http://127.0.0.1:18080/api';
const request = async (route, options = {}) => {
  const start = performance.now();
  const response = await fetch(base + route, { ...options, signal: AbortSignal.timeout(20000) });
  const data = await response.json().catch(() => null);
  return { status: response.status, ms: Math.round(performance.now() - start), data };
};
const login = await request('/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})});
if (login.status !== 200) throw new Error(`Local audit login failed: ${login.status}`);
const headers = {'Content-Type':'application/json', Authorization:`Bearer ${login.data.token}`};
const fleet = await request('/vehicles');
const vehicle = fleet.data.find(v=>v.name==='Toyota Corolla 2022');
if (!vehicle) throw new Error('Expected local test vehicle missing.');
const body = JSON.stringify({userId:login.data.user.id,vehicleId:vehicle.id,startDate:'2037-04-10',endDate:'2037-04-13'});
let attempts = [];
const cleanup = [];
try {
  attempts = await Promise.all(Array.from({length:5},()=>request('/reservations',{method:'POST',headers,body})));
} finally {
  for(const attempt of attempts.filter(a=>a.status===201)) {
    const result = await request('/reservations/'+attempt.data.id,{method:'DELETE',headers});
    cleanup.push({status:result.status,ms:result.ms});
  }
  const accepted = attempts.filter(a=>a.status===201).length;
  const report = {requestCount:5,accepted,passed:accepted===1,attempts:attempts.map(a=>({status:a.status,ms:a.ms,total:a.data?.totalPrice,error:a.data?.error})),cleanup};
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  fs.writeFileSync(path.join(root,'docs/auditoria-movil-2026-10-16/concurrency-results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}
