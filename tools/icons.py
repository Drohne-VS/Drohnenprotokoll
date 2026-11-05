#!/usr/bin/env python3
"""Erzeugt die App-Symbole (Entwurf C4: Drohne mit Stadtlogo auf Feuerwehrrot, Band FEUERWEHR).
Aufruf aus dem Projektordner:  python3 tools/icons.py
Benötigt Pillow und die Schrift DejaVu Sans Condensed Bold."""
import os
from PIL import Image, ImageDraw, ImageFont
import math
RED=(0xA6,0x35,0x3F); GREEN=(0x3E,0x8B,0x50); WHITE=(255,255,255); INK=(38,44,50); FWR=(175,43,30)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
def logo(d, ox, oy, k):
    P=lambda x,y:(ox+(x-77)*k, oy+(y-67)*k)
    d.polygon([P(77,173),P(199,67),P(199,293),P(77,399)], fill=RED)
    r=116; x0,y0,x1,y1=222,70,338,395
    d.polygon([P(x0,y0+r),P(x0,y1),P(x1-r,y1),P(x1,y1-r),P(x1,y0),P(x0+r,y0)], fill=GREEN)
    cx,cy=P(338,186); R=r*k; d.pieslice([cx-R,cy-R,cx+R,cy+R],180,270,fill=GREEN)
    cx,cy=P(222,279); d.pieslice([cx-R,cy-R,cx+R,cy+R],0,90,fill=GREEN)
LW,LH=261,332
def logo_fit(d, cx, cy, h): k=h/LH; logo(d, cx-LW*k/2, cy-LH*k/2, k)
def drone(d, cx, cy, span, rr, w, col, rotor_cols=None, body=True, body_col=None):
    for i,(sx,sy) in enumerate([(-1,-1),(1,-1),(-1,1),(1,1)]):
        d.line([(cx,cy),(cx+sx*span,cy+sy*span)],fill=col,width=int(w*1.5))
    for i,(sx,sy) in enumerate([(-1,-1),(1,-1),(-1,1),(1,1)]):
        x,y=cx+sx*span,cy+sy*span; c=rotor_cols[i] if rotor_cols else col
        d.ellipse([x-rr,y-rr,x+rr,y+rr],outline=c,width=w)
        h=rr*0.2; d.ellipse([x-h,y-h,x+h,y+h],fill=c)
    if body:
        b=span*0.55; d.rounded_rectangle([cx-b/2,cy-b/2,cx+b/2,cy+b/2],radius=int(b*0.25),fill=body_col or col)
def base(s, bg=WHITE):
    im=Image.new("RGB",(s,s),bg); return im, ImageDraw.Draw(im)
def mk(fn,S=512):
    big=fn(S*4).resize((S,S),Image.LANCZOS)
    m=Image.new("L",(S,S),0); ImageDraw.Draw(m).rounded_rectangle([0,0,S-1,S-1],radius=int(S*0.22),fill=255)
    out=Image.new("RGBA",(S,S),(0,0,0,0)); out.paste(big,(0,0),m); return out
FIRE=(196,30,36); FIRE_D=(150,20,24); ORANGE=(243,146,0); YEL=(255,204,0)
def plate(d, s, cx, cy, b, edge):
    d.rounded_rectangle([cx-b/2,cy-b/2,cx+b/2,cy+b/2],radius=int(b*0.2),fill=WHITE,outline=edge,width=max(2,int(s*0.018)))
    logo_fit(d,cx,cy,b*0.72)
def flame(d, cx, by, h, col, inner=None):
    # stilisierte Flamme aus Bézier-artigen Punkten
    pts=[]
    for t in range(0,181):
        a=math.radians(t*2)
        # Tropfenform mit Spitze oben
        x=math.sin(a)*0.5*(1-0.15*math.cos(a)); y=-(1-math.cos(a))/2
        pts.append((x,y))
    def poly(scale,dx,dy,c):
        P=[(cx+dx+x*h*0.62*scale, by+dy+y*h*scale - (abs(x)<0.05)*0) for x,y in pts]
        # Spitze anheben/verdrehen
        d.polygon(P,fill=c)
    poly(1,0,0,col)
    if inner: poly(0.55,0,-h*0.02,inner)
def c1(s):  # Feuerwehrrot
    im,d=base(s,FIRE); drone(d,s*0.5,s*0.5,s*0.27,s*0.13,max(2,int(s*0.022)),WHITE,body=False)
    plate(d,s,s*0.5,s*0.5,s*0.30,WHITE); return im
def c2(s):  # rote Rotoren
    im,d=base(s); drone(d,s*0.5,s*0.5,s*0.27,s*0.13,max(2,int(s*0.024)),INK,rotor_cols=[FIRE]*4,body=False)
    plate(d,s,s*0.5,s*0.5,s*0.30,INK); return im
def smooth(pts, n=14):
    out=[]; L=len(pts)
    for i in range(L):
        p0,p1,p2,p3=pts[(i-1)%L],pts[i],pts[(i+1)%L],pts[(i+2)%L]
        for k in range(n):
            t=k/n; t2=t*t; t3=t2*t
            out.append(tuple(0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3) for j in (0,1)))
    return out
FL=[(0,-1.0),(0.10,-0.80),(0.20,-0.66),(0.30,-0.80),(0.40,-0.58),(0.48,-0.34),(0.42,-0.12),(0.24,0),(-0.24,0),(-0.42,-0.12),(-0.48,-0.36),(-0.38,-0.62),(-0.26,-0.74),(-0.20,-0.56),(-0.10,-0.76)]
FI=[(0.02,-0.62),(0.12,-0.40),(0.24,-0.22),(0.16,-0.04),(-0.16,-0.04),(-0.24,-0.20),(-0.14,-0.38)]
def c3(s):  # Drohne vor der Flamme
    im,d=base(s,FIRE); cx=s*0.5; by=s*0.97; h=s*0.92
    d.polygon([(cx+x*h, by+y*h) for x,y in smooth(FL)],fill=ORANGE)
    d.polygon([(cx+x*h, by+y*h) for x,y in smooth(FI)],fill=YEL)
    drone(d,s*0.5,s*0.47,s*0.27,s*0.13,max(2,int(s*0.022)),WHITE,body=False)
    plate(d,s,s*0.5,s*0.47,s*0.30,WHITE); return im
def c4(s):  # Schriftband FEUERWEHR
    im,d=base(s,FIRE); drone(d,s*0.5,s*0.41,s*0.22,s*0.105,max(2,int(s*0.02)),WHITE,body=False)
    plate(d,s,s*0.5,s*0.41,s*0.25,WHITE)
    d.rectangle([0,s*0.78,s,s],fill=WHITE)
    f=ImageFont.truetype(FONT,int(s*0.11)); t="FEUERWEHR"; tb=d.textbbox((0,0),t,font=f)
    d.text((s*0.5-(tb[2]-tb[0])/2-tb[0], s*0.89-(tb[3]-tb[1])/2-tb[1]),t,font=f,fill=FIRE); return im

if __name__ == "__main__":
    OUT = os.path.join(os.path.dirname(__file__), "..", "pb_public") + "/"
    def sq(fn, S): return fn(S * 4).resize((S, S), Image.LANCZOS)
    sq(c4, 192).save(OUT + "icon-192.png"); sq(c4, 512).save(OUT + "icon-512.png"); sq(c4, 180).save(OUT + "icon-180.png")
    S = 512; bg = Image.new("RGB", (S, S), FIRE); inner = sq(c4, int(S * 0.80)); bg.paste(inner, ((S - inner.width) // 2, (S - inner.height) // 2)); bg.save(OUT + "icon-maskable.png")
    print("Symbole erzeugt in", os.path.normpath(OUT))
