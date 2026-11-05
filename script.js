import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $=id=>document.getElementById(id);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x071326); scene.fog=new THREE.Fog(0x071326,27,105);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,180);camera.position.set(0,5.2,10.8);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9edcff,0x15203d,1.8));
const keyLight=new THREE.DirectionalLight(0xffffff,2.3);keyLight.position.set(-7,13,8);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);scene.add(keyLight);
const neon=new THREE.PointLight(0x19dfff,18,38);neon.position.set(0,5,-15);scene.add(neon);
const material=(c,r=.5,m=.15,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e});
const roadMat=material(0x102943,.85), edgeMat=new THREE.MeshBasicMaterial({color:0x27dfff}), whiteGlow=new THREE.MeshBasicMaterial({color:0x8cefff});
const road=new THREE.Mesh(new THREE.PlaneGeometry(10,180),roadMat);road.rotation.x=-Math.PI/2;road.position.set(0,-.12,-42);road.receiveShadow=true;scene.add(road);
for(const x of [-5,5]){let e=new THREE.Mesh(new THREE.BoxGeometry(.09,.04,180),edgeMat);e.position.set(x,-.08,-42);scene.add(e)}
for(const x of [-1.67,1.67]){let l=new THREE.Mesh(new THREE.BoxGeometry(.025,.015,180),whiteGlow);l.position.set(x,-.095,-42);scene.add(l)}
const floorMarks=[];for(let z=9;z>-150;z-=7){let m=new THREE.Mesh(new THREE.BoxGeometry(9,.018,.035),material(0x244766));m.position.set(0,-.085,z);scene.add(m);floorMarks.push(m)}
// Futuristic skyline with lit windows
const buildings=[];
for(let side of [-1,1])for(let i=0;i<23;i++){
 let h=5+Math.random()*17,w=2.5+Math.random()*3;
 let b=new THREE.Mesh(new THREE.BoxGeometry(w,h,5+Math.random()*5),material(i%3===0?0x152b50:0x101f3b,.78,.2));
 b.position.set(side*(7+Math.random()*4),h/2-0.1,-i*8-5);scene.add(b);buildings.push(b);
 for(let n=0;n<5;n++){let win=new THREE.Mesh(new THREE.BoxGeometry(.12,.32,.035),new THREE.MeshBasicMaterial({color:Math.random()>.5?0x28dfff:0x657dff}));win.position.set(b.position.x+(Math.random()-.5)*w,b.position.y-h/2+1+Math.random()*(h-1),b.position.z+2.51);scene.add(win)}
}
// Player character, backpack, visor and animated limbs
const player=new THREE.Group();scene.add(player);
const suit=material(0x23c9ed,.28,.35,0x06435a), dark=material(0x101a36,.3,.55), purple=material(0x526bff,.3,.4,0x151d66);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.37,.65,5,10),suit);torso.position.y=1.13;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.31,20,16),material(0x9cecff,.3,.2));head.position.y=1.82;head.castShadow=true;player.add(head);
const visor=new THREE.Mesh(new THREE.BoxGeometry(.48,.18,.12),dark);visor.position.set(0,1.85,-.27);player.add(visor);
const pack=new THREE.Mesh(new THREE.BoxGeometry(.48,.52,.25),purple);pack.position.set(0,1.13,.34);player.add(pack);
const limbs=[];
for(let x of [-.23,.23]){let arm=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.43,4,8),purple);arm.position.set(x,1.12,0);player.add(arm);limbs.push(arm);
 let leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.43,4,8),dark);leg.position.set(x*.7,.42,0);player.add(leg);limbs.push(leg)}
const lanes=[-3.25,0,3.25];let lane=1,vy=0,jumping=false;
const obstacles=[],coins3d=[];
function spawnObstacle(z,l,type){
 const group=new THREE.Group();let mesh;
 if(type==='block'){mesh=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.35,1),material(0xff527d,.35,.2,0x551126));mesh.position.y=.68;}
 else {mesh=new THREE.Mesh(new THREE.BoxGeometry(2.25,.62,.65),material(0xffb447,.35,.2,0x633000));mesh.position.y=.31;}
 mesh.castShadow=true;group.add(mesh);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(type==='block'?1.28:2.28,.08,.67),new THREE.MeshBasicMaterial({color:0xffe0a1}));stripe.position.y=type==='block'?1.02:.42;group.add(stripe);
 group.position.set(lanes[l],0,z);scene.add(group);obstacles.push({group,type});
}
function spawnCoins(z,l){for(let j=0;j<4;j++){let c=new THREE.Mesh(new THREE.TorusGeometry(.28,.085,9,20),material(0xffd45c,.2,.7,0x9a5b00));c.position.set(lanes[l],1.25,z-j*1.8);c.castShadow=true;scene.add(c);coins3d.push(c)}}
function spawnWave(){let blocked=Math.floor(Math.random()*3),type=Math.random()<.58?'block':'bar';spawnObstacle(-88,blocked,type);let safe=(blocked+1+Math.floor(Math.random()*2))%3;spawnCoins(-94,safe)}
let running=false,paused=false,score=0,coinCount=0,speed=18,spawnTimer=0,best=Number(localStorage.getItem('neonDashBestV2')||0),soundOn=true,audio;
$('best').textContent=best+' m';
function beep(freq=650,dur=.07){if(!soundOn)return;try{audio??=new AudioContext();let o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch{}}
function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;setTimeout(()=>$('toast').style.opacity=0,650)}
function move(d){if(running&&!paused){lane=Math.max(0,Math.min(2,lane+d));beep(330,.04)}}
function jump(){if(running&&!paused&&!jumping){vy=9.2;jumping=true;beep(500,.08)}}
$('left').onpointerdown=e=>{e.preventDefault();move(-1)};$('right').onpointerdown=e=>{e.preventDefault();move(1)};$('jump').onpointerdown=e=>{e.preventDefault();jump()};
addEventListener('keydown',e=>{if(e.repeat)return;if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.code==='Space'||e.key==='ArrowUp'){e.preventDefault();jump()}if(e.key==='Escape'||e.key==='p')togglePause()});
function clearWorld(){for(const o of obstacles)scene.remove(o.group);obstacles.length=0;for(const c of coins3d)scene.remove(c);coins3d.length=0}
function start(){clearWorld();score=0;coinCount=0;speed=18;spawnTimer=0;lane=1;player.position.set(0,0,0);vy=0;jumping=false;running=true;paused=false;$('distance').textContent='0 m';$('coins').textContent='0';$('overlay').style.display='none';$('pause').disabled=false;$('pause').textContent='Ⅱ';beep(700,.12)}
function finish(){running=false;paused=false;best=Math.max(best,Math.floor(score));localStorage.setItem('neonDashBestV2',best);$('best').textContent=best+' m';$('pause').disabled=true;$('message').textContent=`Run complete! You reached ${Math.floor(score)} metres and collected ${coinCount} coins. Your best distance is ${best} m.`;$('start').textContent='RUN AGAIN';$('overlay').style.display='grid';beep(180,.3)}
function togglePause(){if(!running)return;paused=!paused;$('pause').textContent=paused?'▶':'Ⅱ';if(paused){$('message').textContent='Take a breather. Your run is paused.';$('start').textContent='RESUME RUN';$('overlay').style.display='grid'}else{$('overlay').style.display='none'}}
$('pause').onclick=togglePause;$('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'♫':'♪';if(soundOn)beep()};
$('start').onclick=()=>{if(running&&paused){paused=false;$('overlay').style.display='none';$('pause').textContent='Ⅱ'}else start()};
let last=performance.now(),t=0;
function animate(now){requestAnimationFrame(animate);let dt=Math.min((now-last)/1000,.04);last=now;t+=dt;
 if(running&&!paused){
  score+=speed*dt*.52;speed=Math.min(31,18+score*.009);$('distance').textContent=Math.floor(score)+' m';
  player.position.x=THREE.MathUtils.damp(player.position.x,lanes[lane],13,dt);
  if(jumping){vy-=22*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;jumping=false}}
  player.rotation.z=THREE.MathUtils.damp(player.rotation.z,(lanes[lane]-player.position.x)*-.055,9,dt);
  torso.rotation.x=Math.sin(t*13)*.035;
  limbs.forEach((limb,i)=>{limb.rotation.x=jumping?-.45:Math.sin(t*13+i*Math.PI)*.55});
  spawnTimer-=speed*dt;if(spawnTimer<=0){spawnWave();spawnTimer=23+Math.random()*7}
  for(let i=obstacles.length-1;i>=0;i--){let o=obstacles[i];o.group.position.z+=speed*dt;
   let close=Math.abs(o.group.position.z)<.82&&Math.abs(o.group.position.x-player.position.x)<1.05;
   let cleared=o.type==='block'?player.position.y>1.18:player.position.y>.82;
   if(close&&!cleared){finish();break}
   if(o.group.position.z>13){scene.remove(o.group);obstacles.splice(i,1)}
  }
  for(let i=coins3d.length-1;i>=0;i--){let c=coins3d[i];c.position.z+=speed*dt;c.rotation.y+=dt*4;c.rotation.x=Math.sin(t*3+i)*.12;
   if(Math.abs(c.position.z)<.9&&Math.abs(c.position.x-player.position.x)<1.05&&Math.abs(c.position.y-(player.position.y+1.15))<1.2){coinCount++;$('coins').textContent=coinCount;scene.remove(c);coins3d.splice(i,1);toast('COIN +1');beep(880,.06);continue}
   if(c.position.z>13){scene.remove(c);coins3d.splice(i,1)}
  }
  for(const m of floorMarks){m.position.z+=speed*dt;if(m.position.z>12)m.position.z-=157}
  for(const b of buildings){b.position.z+=speed*dt*.55;if(b.position.z>18)b.position.z-=184}
 }
 camera.position.x=THREE.MathUtils.damp(camera.position.x,player.position.x*.13,2.5,dt);camera.lookAt(player.position.x*.1,1.05,-5);renderer.render(scene,camera)
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
