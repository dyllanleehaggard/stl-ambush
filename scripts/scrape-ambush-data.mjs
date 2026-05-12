// HTML-parser scraper for SoccerShift's content-wrapped JSON.
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PLAYERS_DIR = path.join(ROOT, 'public', 'players');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const DEBUG_DIR = path.join(ROOT, 'debug-output');

const ROSTER_PAGE = 'https://www.stlambush.com/stats#/192/team/557359/roster';
const SCHEDULE_PAGE = 'https://www.stlambush.com/stats#/192/team-schedule?team_id=557359';

function slugify(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['".]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
async function ensureDir(d){if(!existsSync(d))mkdirSync(d,{recursive:true});}
async function loadJSON(f,fb){try{return JSON.parse(await fs.readFile(f,'utf-8'));}catch{return fb;}}
async function downloadImage(url,dest){try{const r=await fetch(url,{headers:{Referer:'https://www.stlambush.com/'}});if(!r.ok)throw new Error('HTTP '+r.status);await fs.writeFile(dest,Buffer.from(await r.arrayBuffer()));return true;}catch{return false;}}
function upsizePhotoUrl(u){return u;}
function inferPos(p){if(!p)return null;const s=String(p).toLowerCase().trim();if(s==='g'||s.includes('goal'))return 'GK';if(s==='f'||s.includes('forward'))return 'F';if(s==='m'||s.includes('mid'))return 'M';if(s==='d'||s.includes('def'))return 'D';return String(p).toUpperCase().slice(0,2);}
function decodeHtml(s){return (s||'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}

async function captureApi(page,target,filter,wait=8000){
  const captures=[];
  page.on('response',async(res)=>{
    const u=res.url();if(!filter(u))return;
    const ct=res.headers()['content-type']||'';if(!ct.includes('json'))return;
    if(res.status()!==200)return;
    try{const body=await res.text();let parsed=null;try{parsed=JSON.parse(body);}catch{};captures.push({url:u,body,parsed});}catch{}
  });
  await page.goto(target,{waitUntil:'networkidle2',timeout:60000});
  await new Promise(r=>setTimeout(r,wait));
  return captures;
}

function parseRosterHtml(html){
  const result={active:[],inactive:[],staff:[]};
  const sectionRegex=/<h3 class="h3">([^<]*)<\/h3>/g;
  const liRegex=/<li class="col(?: clickable)?" a-href="#\/player\/(\d+)\/bio">[\s\S]*?<img src="([^"]+)"[\s\S]*?<a href="#\/player\/\d+\/bio" class="bh-link">([^<]+)<\/a>\s*<div class="bh-dark-grey">#(\d+)\s+([A-Z]+)<\/div>[\s\S]*?<\/li>/g;
  const staffRegex=/<li class="col"><div class="coach"><div a-href="#\/team-staff\/(\d+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<a href="#\/team-staff\/\d+"[^>]*>([^<]+)<\/a>\s*<div class="bh-dark-grey">([^<]+)<\/div>[\s\S]*?<\/li>/g;

  const sections=[];let m;
  while((m=sectionRegex.exec(html))!==null){sections.push({pos:m.index,title:m[1].trim()});}
  function sectionAt(pos){let s='active';for(const sec of sections){if(sec.pos>pos)break;if(sec.title.toLowerCase().includes('inactive'))s='inactive';else if(sec.title.toLowerCase().includes('staff'))s='staff';}return s;}

  while((m=liRegex.exec(html))!==null){
    const [,playerId,photoUrl,linkName,num,pos]=m;
    const name=decodeHtml(linkName).trim();
    const sec=sectionAt(m.index);
    if(sec==='staff')continue;
    result[sec].push({playerId,num,name,pos:inferPos(pos),photoUrl});
  }
  while((m=staffRegex.exec(html))!==null){
    const [,staffId,photoUrl,linkName,role]=m;
    const name=decodeHtml(linkName).trim();
    const hasRealPhoto=!photoUrl.includes('team-logo_url');
    result.staff.push({staffId,name,role:role.trim(),photoUrl:hasRealPhoto?photoUrl:null});
  }
  return result;
}

function parseScheduleHtml(html){
  const games=[];
  const gameRegex=/<div class="game"[^>]*>([\s\S]*?)(?=<div class="game"|$)/g;
  let gm;
  const monthMap={Jan:'JAN',Feb:'FEB',Mar:'MAR',Apr:'APR',May:'MAY',Jun:'JUN',Jul:'JUL',Aug:'AUG',Sep:'SEP',Oct:'OCT',Nov:'NOV',Dec:'DEC'};
  while((gm=gameRegex.exec(html))!==null){
    const block=gm[1];
    const dtM=block.match(/<div class="datetime"[^>]*>\s*([^<]+?)\s*<\/div>/);
    if(!dtM)continue;
    const dateParts=dtM[1].trim().match(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{1,2}:\d{2}(?:am|pm))/i);
    if(!dateParts)continue;
    const atVsM=block.match(/<div class="at-vs">(at|vs)<\/div>/i);
    const ourIsHome=atVsM?atVsM[1].toLowerCase()==='vs':false;
    const scores=[...block.matchAll(/<div class="score">(\d+)<\/div>/g)].map(m=>parseInt(m[1],10));
    if(scores.length<2)continue;
    const nameMatches=[...block.matchAll(/<div class="name">([^<]+?)<\/div>/g)].map(m=>m[1].trim());
    const opponent=nameMatches.find(n=>!n.toLowerCase().includes('ambush'))||null;
    const resM=block.match(/<span class="result">\s*([WLT])\s*<\/span>/);
    let result=resM?resM[1]:null;
    if(!result && scores.length>=2){
      const ourSc=ourIsHome?scores[0]:scores[1];
      const oppSc=ourIsHome?scores[1]:scores[0];
      result=ourSc>oppSc?'W':(ourSc<oppSc?'L':'T');
    }
    const statusM=block.match(/<span class="status">\s*([^<]+?)\s*<\/span>/);
    const isOvertime=statusM?/\bOT\b|\bSO\b/.test(statusM[1]):false;
    games.push({
      day:dateParts[1].toUpperCase().slice(0,3),
      monthLabel:monthMap[dateParts[2]]||dateParts[2].toUpperCase().slice(0,3),
      dateLabel:dateParts[3],
      time:dateParts[4],
      isHome:ourIsHome,
      opponent,
      ourScore:scores[0],
      oppScore:scores[1],
      result,
      isOvertime
    });
  }
  return games;
}

function _unused_old_parser(html){
  const games=[];
  const blocks=html.split(/BOXSCORE/i);
  for(let i=0;i<blocks.length-1;i++){
    const block=blocks[i].slice(-3000);
    const dm=block.match(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/i);
    if(!dm)continue;
    const tm=block.match(/(\d{1,2}:\d{2}(?:am|pm))/i);
    const scoreM=block.match(/>\s*(\d+)\s*<[\s\S]*?(VS|AT)[\s\S]*?>\s*(\d+)\s*</);
    if(!scoreM)continue;
    const homeScore=parseInt(scoreM[1],10),venueWord=scoreM[2].toUpperCase(),awayScore=parseInt(scoreM[3],10);
    const ourIsHome=venueWord==='VS';
    const oppM=block.match(/>(Kansas City|Milwaukee|Empire|Tacoma|Baltimore|Utica|San Diego|Chihuahua)\s+(Comets|Wave|Strykers|Stars|Blast|City FC|Sockers|Savage)/);
    const opponent=oppM?(oppM[1]+' '+oppM[2]):null;
    const wlM=block.match(/Final(?:\s+OT|\s+SO)?[\s\S]{0,300}?>\s*([WLT])\s*</);
    let result=wlM?wlM[1].toUpperCase():null;
    if(!result){const our=ourIsHome?homeScore:awayScore;const opp=ourIsHome?awayScore:homeScore;result=our>opp?'W':(our<opp?'L':'T');}
    const otM=block.match(/Final\s+(OT|SO)/);
    games.push({day:dm[1].toUpperCase().slice(0,3),monthLabel:dm[2].toUpperCase().slice(0,3),dateLabel:dm[3],time:tm?tm[1]:null,isHome:ourIsHome,opponent,ourScore:ourIsHome?homeScore:awayScore,oppScore:ourIsHome?awayScore:homeScore,result,isOvertime:!!otM});
  }
  return games;
}

async function downloadAll(items,prefix=''){
  await ensureDir(PLAYERS_DIR);
  const PLACEHOLDER_SIZE=26865;
  let success=0,skipped=0,noPhoto=0;
  for(const p of items){
    if(!p.photoUrl)continue;
    const slug=(prefix?prefix+'-':'')+slugify(p.name);
    let ext='.png';try{ext=path.extname(new URL(p.photoUrl).pathname)||'.png';}catch{}
    const dest=path.join(PLAYERS_DIR,slug+ext);
    if(existsSync(dest)){
      const st=await fs.stat(dest);
      if(st.size===PLACEHOLDER_SIZE){await fs.unlink(dest);noPhoto++;continue;}
      p.localPhoto='/stl-ambush/players/'+slug+ext;skipped++;continue;
    }
    const ok=await downloadImage(p.photoUrl,dest);
    if(ok){
      const st=await fs.stat(dest);
      if(st.size===PLACEHOLDER_SIZE){
        await fs.unlink(dest);noPhoto++;
        console.log('  (no photo) '+p.name);
        continue;
      }
      p.localPhoto='/stl-ambush/players/'+slug+ext;success++;
      console.log('  + '+p.name);
    }
  }
  console.log('  Downloaded '+success+', cached '+skipped+', no-photo '+noPhoto);
}

async function mergeRoster(parsed){
  const all=[...parsed.active.map(p=>({...p,isActive:true})),...parsed.inactive.map(p=>({...p,isActive:false}))];
  const existing=await loadJSON(path.join(DATA_DIR,'roster.json'),{players:[]});
  const byNum=new Map(),byName=new Map();
  for(const p of(existing.players||[])){if(p.num)byNum.set(String(p.num),p);if(p.name)byName.set(p.name.toLowerCase().replace(/[^a-z0-9]/g,''),p);}
  const merged=all.map(s=>{
    const nk=s.name.toLowerCase().replace(/[^a-z0-9]/g,'');
    const old=byNum.get(String(s.num))||byName.get(nk)||{};
    return {pronunciation:old.pronunciation??null,height:old.height??null,weight:old.weight??null,birthdate:old.birthdate??null,age:old.age??null,hometown:old.hometown??null,bio:old.bio??null,college:old.college??null,stats:old.stats??null,tag:old.tag??null,num:s.num||old.num,name:s.name||old.name,pos:s.pos||old.pos,photo:s.localPhoto||(s.photoUrl?null:old.photo)||null,playerId:s.playerId||old.playerId,isActive:s.isActive};
  });
  merged.sort((a,b)=>{const an=parseInt(a.num,10),bn=parseInt(b.num,10);if(isNaN(an))return 1;if(isNaN(bn))return -1;return an-bn;});
  const out={_comment:'St. Louis Ambush MASL roster. SoccerShift API + manual fields preserved.',lastUpdated:new Date().toISOString().slice(0,10),sourceNotes:'Names/numbers/photos via SoccerShift; pronunciation/bio from game notes.',players:merged};
  await fs.writeFile(path.join(DATA_DIR,'roster.json'),JSON.stringify(out,null,2));
  console.log('  Wrote '+merged.length+' players. '+merged.filter(p=>p.photo).length+' have photos. '+merged.filter(p=>p.pronunciation).length+' retained pronunciation.');
}

async function writeStaff(staff){
  if(!staff.length)return;
  const out={_comment:'St. Louis Ambush coaching staff and front office.',lastUpdated:new Date().toISOString().slice(0,10),coaches:staff.filter(s=>s.role.toLowerCase().includes('coach')).map(s=>({name:s.name,role:s.role,photo:s.localPhoto||null,staffId:s.staffId})),frontOffice:staff.filter(s=>!s.role.toLowerCase().includes('coach')).map(s=>({name:s.name,role:s.role,photo:s.localPhoto||null,staffId:s.staffId}))};
  await fs.writeFile(path.join(DATA_DIR,'coaches.json'),JSON.stringify(out,null,2));
  console.log('  Wrote '+out.coaches.length+' coaches + '+out.frontOffice.length+' front office');
}

async function mergeSchedule(scraped){
  const existing=await loadJSON(path.join(DATA_DIR,'schedule.json'),{games:[]});
  const oldByKey=new Map();for(const g of(existing.games||[])){oldByKey.set(g.monthLabel+'-'+g.dateLabel,g);}
  const monthMap={JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12'};
  const reconciled=scraped.map(s=>{
    const m=monthMap[s.monthLabel];if(!m)return null;
    const year=(m==='11'||m==='12')?'2025':'2026';
    const date=year+'-'+m+'-'+String(s.dateLabel).padStart(2,'0');
    const old=oldByKey.get(s.monthLabel+'-'+s.dateLabel);
    return {id:old?.id||date.replace(/-/g,'').slice(2),date,day:s.day||old?.day,dateLabel:String(s.dateLabel),monthLabel:s.monthLabel,time:s.time||old?.time,opponent:s.opponent||old?.opponent,isHome:s.isHome,venue:old?.venue||(s.isHome?'Family Arena':null),promo:old?.promo??null,status:'final',result:s.result,score:s.ourScore+'-'+s.oppScore,notes:old?.notes??null,isOvertime:s.isOvertime};
  }).filter(g=>g);
  reconciled.sort((a,b)=>a.date.localeCompare(b.date));
  const out={_comment:'St. Louis Ambush MASL schedule. SoccerShift results merged.',season:existing.season||'2025-26',lastUpdated:new Date().toISOString().slice(0,10),games:reconciled};
  await fs.writeFile(path.join(DATA_DIR,'schedule.json'),JSON.stringify(out,null,2));
  const w=reconciled.filter(g=>g.result==='W').length,l=reconciled.filter(g=>g.result==='L').length;
  console.log('  Wrote '+reconciled.length+' games. '+w+'W '+l+'L');
}

async function main(){
  console.log('🚀 STL Ambush Scraper (HTML parser mode)');
  await ensureDir(DEBUG_DIR);
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
  try{
    // Roster
    console.log('\n📋 Loading roster page...');
    const rPage=await browser.newPage();await rPage.setViewport({width:1440,height:900});
    const rCaps=await captureApi(rPage,ROSTER_PAGE,u=>u.includes('digitalshift.ca')&&u.includes('/team/roster'),8000);
    await rPage.close();
    console.log('  Captured '+rCaps.length+' roster responses');
    for(let i=0;i<rCaps.length;i++)await fs.writeFile(path.join(DEBUG_DIR,'roster-response-'+i+'.json'),rCaps[i].body);
    let rHtml=null;for(const c of rCaps){if(c.parsed?.content){rHtml=c.parsed.content;break;}}
    if(rHtml){
      const parsed=parseRosterHtml(rHtml);
      console.log('  Parsed '+parsed.active.length+' active, '+parsed.inactive.length+' inactive, '+parsed.staff.length+' staff');
      const all=[...parsed.active,...parsed.inactive];
      if(all.length){console.log('\n📸 Downloading player headshots...');await downloadAll(all);await mergeRoster(parsed);}
      if(parsed.staff.length){console.log('\n📸 Downloading staff headshots...');await downloadAll(parsed.staff,'staff');await writeStaff(parsed.staff);}
    }else console.log('  ❌ No content field found');

    // Schedule
    console.log('\n📅 Loading schedule page...');
    const sPage=await browser.newPage();await sPage.setViewport({width:1440,height:900});
    const sCaps=await captureApi(sPage,SCHEDULE_PAGE,u=>u.includes('digitalshift.ca')&&u.includes('team-schedule'),8000);
    await sPage.close();
    console.log('  Captured '+sCaps.length+' schedule responses');
    for(let i=0;i<sCaps.length;i++)await fs.writeFile(path.join(DEBUG_DIR,'schedule-response-'+i+'.json'),sCaps[i].body);
    let sHtml=null,maxLen=0;for(const c of sCaps){if(c.parsed?.content&&c.parsed.content.length>maxLen){sHtml=c.parsed.content;maxLen=c.parsed.content.length;}}
    if(sHtml){
      const games=parseScheduleHtml(sHtml);
      console.log('  Parsed '+games.length+' games from schedule HTML');
      if(games.length)await mergeSchedule(games);
    }else console.log('  ❌ No schedule content field found');
  }finally{await browser.close();}
  console.log('\n✅ Done!');
}
main().catch(err=>{console.error('❌ '+err.message);process.exit(1);});
