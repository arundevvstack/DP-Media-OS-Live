const https = require('https');
const fs = require('fs');

async function run() {
  const envText = fs.readFileSync('.env', 'utf-8');
  const env = {};
  envText.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
  });

  const corp = env.ETIMEOFFICE_CORP_ID;
  const user = env.ETIMEOFFICE_USERNAME;
  const pass = env.ETIMEOFFICE_PASSWORD;

  const r1 = await fetch('https://www.etimeoffice.com/Login/loginCheck');
  const html = await r1.text();
  let c = r1.headers.get('set-cookie');
  
  const tokenMatch = html.match(/__RequestVerificationToken[\s\S]*?value=\"([^\"]+)\"/);
  if(!tokenMatch) return console.log('no token');
  
  const data = new URLSearchParams({
    'loginModel.corporateId': corp,
    'loginModel.userName': user,
    'loginModel.password': pass,
    '__RequestVerificationToken': tokenMatch[1]
  });
  
  const r2 = await fetch('https://www.etimeoffice.com/Login/loginCheck', {
    method: 'POST',
    body: data,
    headers: { 'Cookie': c || '', 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
    redirect: 'manual'
  });
  
  const location = r2.headers.get('location');
  const newCookies = r2.headers.get('set-cookie');
  if (newCookies) c = c + '; ' + newCookies;

  const r3 = await fetch('https://www.etimeoffice.com' + location, {
    headers: { 'Cookie': c, 'User-Agent': 'Mozilla/5.0' }, redirect: 'manual'
  });
  
  const finalLoc = r3.headers.get('location');
  const c3 = r3.headers.get('set-cookie');
  if (c3) c = c + '; ' + c3;
  
  if (finalLoc) {
    const r4 = await fetch('https://www.etimeoffice.com' + finalLoc, {
      headers: { 'Cookie': c, 'User-Agent': 'Mozilla/5.0' }, redirect: 'manual'
    });
    const c4 = r4.headers.get('set-cookie');
    if(c4) c = c + '; ' + c4;
  }
  
  // Now try fetching the dashboard
  const dashRes = await fetch('https://www.etimeoffice.com/Dashboard', {
    headers: { 'Cookie': c, 'User-Agent': 'Mozilla/5.0' }
  });
  const dashHtml = await dashRes.text();
  console.log('Dashboard title:', dashHtml.match(/<title>([^<]+)<\/title>/)?.[1]);
  
  // Is it logged in?
  if (dashHtml.includes('Logout')) {
    console.log('Successfully logged in via Fetch!');
  } else {
    console.log('Not logged in. Body excerpt:', dashHtml.substring(0, 300));
  }
}
run();
