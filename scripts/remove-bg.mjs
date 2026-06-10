import fs from 'node:fs';
import zlib from 'node:zlib';

const crcTable = (() => { const t=[]; for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;} return t; })();
function crc32(buf){let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=crcTable[(c^buf[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}

function decode(file){
  const d=fs.readFileSync(file);
  let p=8; let w,h,ct,bd; const idat=[];
  while(p<d.length){
    const len=d.readUInt32BE(p); const type=d.toString('ascii',p+4,p+8); const data=d.subarray(p+8,p+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);bd=data[8];ct=data[9];}
    else if(type==='IDAT'){idat.push(data);}
    else if(type==='IEND')break;
    p+=12+len;
  }
  const raw=zlib.inflateSync(Buffer.concat(idat));
  const bpp = ct===2?3: ct===6?4:0;
  if(!bpp) throw new Error('unsupported color type '+ct);
  const stride=w*bpp;
  const out=Buffer.alloc(h*stride);
  let pos=0;
  const prev=Buffer.alloc(stride);
  for(let y=0;y<h;y++){
    const f=raw[pos++]; const line=raw.subarray(pos,pos+stride); pos+=stride;
    const cur=out.subarray(y*stride,y*stride+stride);
    for(let i=0;i<stride;i++){
      const a=i>=bpp?cur[i-bpp]:0; const b=prev[i]; const c=i>=bpp?prev[i-bpp]:0; let v=line[i];
      if(f===1)v=(v+a)&255; else if(f===2)v=(v+b)&255; else if(f===3)v=(v+((a+b)>>1))&255;
      else if(f===4){const pa=Math.abs(b-c),pb=Math.abs(a-c),pc=Math.abs(a+b-2*c);const pr=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);v=(v+pr)&255;}
      cur[i]=v;
    }
    cur.copy(prev);
  }
  return {w,h,bpp,out};
}

function encodeRGBA(w,h,rgba){
  const stride=w*4; const raw=Buffer.alloc(h*(stride+1));
  for(let y=0;y<h;y++){raw[y*(stride+1)]=0; rgba.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}
  const comp=zlib.deflateSync(raw,{level:9});
  const chunks=[];
  const mk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type,'ascii');const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc]);};
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  chunks.push(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]));
  chunks.push(mk('IHDR',ihdr)); chunks.push(mk('IDAT',comp)); chunks.push(mk('IEND',Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

const inFile=process.argv[2], outFile=process.argv[3], maxDim=parseInt(process.argv[4]||'400');
const {w,h,bpp,out}=decode(inFile);
// downscale (nearest) to maxDim
const scale=Math.min(1,maxDim/Math.max(w,h));
const nw=Math.max(1,Math.round(w*scale)), nh=Math.max(1,Math.round(h*scale));
const rgba=Buffer.alloc(nw*nh*4);
for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){
  const sx=Math.min(w-1,Math.floor(x/scale)), sy=Math.min(h-1,Math.floor(y/scale));
  const si=(sy*w+sx)*bpp, di=(y*nw+x)*4;
  rgba[di]=out[si]; rgba[di+1]=out[si+1]; rgba[di+2]=out[si+2]; rgba[di+3]=255;
}
// edge flood-fill remove near-white
const near=(i)=>rgba[i]>238&&rgba[i+1]>238&&rgba[i+2]>238;
const vis=new Uint8Array(nw*nh); const q=[];
const push=(x,y)=>{if(x<0||y<0||x>=nw||y>=nh)return;const pi=y*nw+x;if(vis[pi])return;if(!near(pi*4))return;vis[pi]=1;q.push(pi);};
for(let x=0;x<nw;x++){push(x,0);push(x,nh-1);} for(let y=0;y<nh;y++){push(0,y);push(nw-1,y);}
let removed=0;
while(q.length){const pi=q.pop();const x=pi%nw,y=(pi/nw)|0;rgba[pi*4+3]=0;removed++;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}
fs.writeFileSync(outFile,encodeRGBA(nw,nh,rgba));
console.log(`decoded ${w}x${h} ct-bpp${bpp} -> ${nw}x${nh}, removed ${removed} bg px (${(removed/(nw*nh)*100).toFixed(1)}%)`);
