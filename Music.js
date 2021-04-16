//zzfx
zzfx=(...t)=>zzfxP(zzfxG(...t))
zzfxP=(...t)=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(t.length,t[0].length,zzfxR);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f,e.connect(zzfxX.destination);return e}
zzfxG=(a=1,t=.05,h=220,M=0,n=0,s=.1,i=0,r=1,o=0,z=0,e=0,f=0,m=0,x=0,b=0,d=0,u=0,c=1,G=0,I=zzfxR,P=99+M*I,V=n*I,g=s*I,j=G*I,k=u*I,l=2*Math.PI,p=(a=>0<a?1:-1),q=P+j+V+g+k,v=(o*=500*l/I**2),w=(h*=(1+2*t*Math.random()-t)*l/I),y=p(b)*l/4,A=0,B=0,C=0,D=0,E=0,F=0,H=1,J=[])=>{for(;C<q;J[C++]=F)++E>100*d&&(E=0,F=A*h*Math.sin(B*b*l/I-y),F=p(F=i?1<i?2<i?3<i?Math.sin((F%l)**3):Math.max(Math.min(Math.tan(F),1),-1):1-(2*F/l%2+2)%2:1-4*Math.abs(Math.round(F/l)-F/l):Math.sin(F))*Math.abs(F)**r*a*zzfxV*(C<P?C/P:C<P+j?1-(C-P)/j*(1-c):C<P+j+V?c:C<q-k?(q-C-k)/g*c:0),F=k?F/2+(k>C?0:(C<q-k?1:(C-q)/k)*J[C-k|0]/2):F),A+=1-x+1e9*(Math.sin(C)+1)%2*x,B+=1-x+1e9*(Math.sin(C)**2+1)%2*x,h+=o+=500*z*l/I**3,H&&++H>f*I&&(h+=e*l/I,w+=e*l/I,H=0),m&&++D>m*I&&(h=w,o=v,D=1,H=H||1);return J};
zzfxV=0.5
zzfxR=44100
zzfxX=new(top.AudioContext||webkitAudioContext);
//zzfxM
zzfxM=(n,f,t,e=125)=>{let l,o,z,r,g,h,x,a,u,c,d,i,m,p,G,M=0,R=[],b=[],j=[],k=0,q=0,s=1,v={},w=zzfxR/e*60>>2;for(;s;k++)R=[s=a=d=m=0],t.map((e,d)=>{for(x=f[e][k]||[0,0,0],s|=!!f[e][k],G=m+(f[e][0].length-2-!a)*w,p=d==t.length-1,o=2,r=m;o<x.length+p;a=++o){for(g=x[o],u=o==x.length+p-1&&p||c!=(x[0]||0)|g|0,z=0;z<w&&a;z++>w-99&&u?i+=(i<1)/99:0)h=(1-i)*R[M++]/2||0,b[r]=(b[r]||0)-h*q+h,j[r]=(j[r++]||0)+h*q+h;g&&(i=g%1,q=x[1]||0,(g|=0)&&(R=v[[c=x[M=0]||0,g]]=v[[c,g]]||(l=[...n[c]],l[2]*=2**((g-12)/12),g>0?zzfxG(...l):[])))}m=G});return[b,j]}

let s = (snd) => zzfx(...snd).start();
var gArr = (n) => Array.from(new Array(n).keys());
//Music
//Generate drum patterns
var drm = [gArr(18).map(i => i == 2 ? 15 : 0),gArr(18).map(i => i == 2 ? 15 : 0),gArr(18).map(i => i == 10 ? 15 : i == 0 ? 1 : 0),gArr(18).map(i => i == 0 ? 2 : (i % 4 == 0 && i != 12) ? 15 : 0)];
drm[1][14] = 15;
//Generate note patterns
var mkEch = (n) => gArr(18).map(i => i == 0 ? 3 : [2,6,10,14].includes(i) ? n + [0,0.1,0.5,0.7][[2,6,10,14].indexOf(i)] : i == 1 ? -0.1 : 0);
var Ech = [mkEch(18),mkEch(22),mkEch(24),mkEch(30)];
//Generate song pattern
var wrp = (n) => n - (Math.trunc(n/4)*4);
var ptrn = gArr(4).map(i => i < 8 ? wrp(i) : i < 16 ? 4 + wrp(i) : 8 + wrp(i));
var song = [
[
[,0,86,,,,,.7,,,,.5,,6.7,1,.05],             //Kick
[.7,0,270,,,.12,3,1.65,-2,,,,,4.5,,.02],    //Snare
[.4,0,2200,,,.04,3,2,,,800,.02,,4.8,,.01,.1],  //Hi-hat
[,0,130.81 ,,,1] //Echo Synth
],
[[Ech[0]],[Ech[1]],[Ech[2]],[Ech[3]]],
ptrn,100];