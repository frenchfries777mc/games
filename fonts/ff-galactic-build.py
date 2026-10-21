# builds ff-galactic.woff2: our own simple stroke drawing of the Standard Galactic Alphabet (A-Z both cases; digits stay normal)
import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
SX,SY,T=42,66,104   # grid 0..10 -> units ; stroke width
def d(x,y): return [(x-0.6,y),(x+0.6,y)]
G={
 'a':[[(0,0),(0,7),(3,10),(7,10),(10,7)]],
 'b':[[(3,10),(10,0)],[(0,0),(10,0)]],
 'c':[[(3,7),(5,7),(5,0)],d(5,10)],
 'd':[[(0,10),(10,10)],[(0,7),(10,1)]],
 'e':[[(0,10),(0,0),(10,0)],d(8,9)],
 'f':[d(2,10),d(5,10),d(8,10),[(0,6),(10,6)]],
 'g':[[(7,10),(7,0)],[(2,5),(7,5)]],
 'h':[[(0,10),(10,10)],[(0,6),(10,6)],[(5,6),(5,0)]],
 'i':[[(5,10),(5,3)],d(5,0)],
 'j':[d(5,10),d(5,5),d(5,0)],
 'k':[[(5,10),(5,0)],d(1,5),d(9,5)],
 'l':[[(2,10),(2,0)],d(7,8),d(7,2)],
 'm':[[(10,8),(10,0),(0,0)],d(1,9)],
 'n':[[(5,10),(10,10),(4,0)],d(1,9)],
 'o':[[(0,9),(2,10),(10,10),(4,0)]],
 'p':[d(2,10),[(2,7),(2,0)],[(8,10),(8,3)],d(8,0)],
 'q':[[(0,7),(10,7),(10,0),(0,0)],d(5,10)],
 'r':[d(2,8),d(8,8),d(2,2),d(8,2)],
 's':[[(1,10),(1,5),(8,5),(8,0)]],
 't':[[(0,10),(10,10),(10,4)],d(10,0)],
 'u':[d(3,9),d(7,9),[(0,5),(10,5)]],
 'v':[[(5,10),(5,5)],[(0,5),(10,5)],[(0,0),(10,0)]],
 'w':[d(5,9),d(1,1),d(9,1)],
 'x':[[(3,0),(9,10)],d(1,9)],
 'y':[[(3,10),(3,0)],[(7,10),(7,0)]],
 'z':[[(0,0),(0,7),(3,10),(7,10),(10,7),(10,0)]],
}
def area(p): return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2
def cw(p): return p if area(p)<0 else p[::-1]
def quad(a,b):
    (x1,y1),(x2,y2)=a,b; dx,dy=x2-x1,y2-y1; L=math.hypot(dx,dy) or 1; nx,ny=-dy/L*T/2,dx/L*T/2; ex,ey=dx/L*T/2,dy/L*T/2
    return [(x1+nx-ex,y1+ny-ey),(x2+nx+ex,y2+ny+ey),(x2-nx+ex,y2-ny+ey),(x1-nx-ex,y1-ny-ey)]
def glyph(strokes):
    pen=TTGlyphPen(None); off=T/2+90
    for s in strokes:
        pts=[(x*SX+off,y*SY+T/2) for x,y in s]
        for i in range(len(pts)-1):
            q=cw([(round(x),round(y)) for x,y in quad(pts[i],pts[i+1])])
            pen.moveTo(q[0]); [pen.lineTo(p) for p in q[1:]]; pen.closePath()
    return pen.glyph()
order=['.notdef','space']; glyphs={}; cmap={32:'space'}; metrics={}
e=TTGlyphPen(None); glyphs['.notdef']=e.glyph(); metrics['.notdef']=(500,0)
glyphs['space']=TTGlyphPen(None).glyph(); metrics["space"]=(300,0)
W=int(10*SX+T+180)
for c,s in G.items():
    n='sg_'+c; order.append(n); glyphs[n]=glyph(s); metrics[n]=(W,0); cmap[ord(c)]=n; cmap[ord(c.upper())]=n
fb=FontBuilder(1000,isTTF=True); fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(metrics); fb.setupHorizontalHeader(ascent=900,descent=-250)
fb.setupNameTable({'familyName':'FF Galactic','styleName':'Regular','copyright':'© 2026 Frenchfries777'}); fb.setupOS2(sTypoAscender=900,sTypoDescender=-250,usWinAscent=900,usWinDescent=250); fb.setupPost()
import sys
fb.font.flavor='woff2'; fb.save(sys.argv[1])
