# builds ff-aurebesh.woff2: our own simple stroke drawing of the Aurebesh letters (A-Z both cases)
import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
SX,SY,T=42,66,104   # grid 0..10 -> units ; stroke width
G={
 'a':[[(0,10),(4,10),(4,7)],[(10,10),(4,5),(10,0)],[(0,0),(4,0),(4,3)]],
 'b':[[(3,10),(0,8),(0,2),(3,0)],[(7,10),(10,8),(10,2),(7,0)],[(3,5),(7,5)]],
 'c':[[(0,10),(0,4),(10,4)],[(10,10),(10,0)]],
 'd':[[(0,10),(10,10),(4,0)],[(1,5),(6,5)]],
 'e':[[(0,10),(3,0),(6,10)],[(9.5,10),(9.5,0)]],
 'f':[[(4,10),(4,0),(10,0)],[(0,6),(10,6)],[(10,10),(7,6)]],
 'g':[[(0,10),(10,10),(10,0),(3,0),(0,4),(0,10)]],
 'h':[[(0,10),(10,10)],[(2,5),(8,5)],[(0,0),(10,0)],[(10,10),(10,7)]],
 'i':[[(3,8),(6,10),(6,0)]],
 'j':[[(0,10),(10,10)],[(0,5),(9,5),(5,0)]],
 'k':[[(0,10),(10,10),(10,0),(0,0)]],
 'l':[[(0,10),(6,0),(6,10)]],
 'm':[[(8,10),(0,0),(10,0)]],
 'n':[[(0,0),(3,10),(7,10),(10,0)]],
 'o':[[(2,10),(8,10),(10,5),(8,0),(2,0),(0,5),(2,10)]],
 'p':[[(10,10),(10,0),(0,0),(0,6),(10,6)]],
 'q':[[(10,10),(0,10),(0,0)],[(10,4),(5,4)]],
 'r':[[(0,10),(10,10),(4,0)]],
 's':[[(0,10),(8,2)],[(0,4),(4,0)],[(10,10),(6,6)]],
 't':[[(0,9),(10,9)],[(5,9),(5,0)],[(1,4),(5,0),(9,4)]],
 'u':[[(0,10),(0,0),(10,0),(10,10)],[(4,10),(10,4)]],
 'v':[[(0,10),(5,5),(10,10)],[(5,5),(5,0)]],
 'w':[[(0,10),(10,10),(10,0),(0,0),(0,10)]],
 'x':[[(0,0),(5,10),(10,0),(0,0)]],
 'y':[[(0,10),(5,0),(10,10)],[(3,6),(7,6)]],
 'z':[[(10,10),(10,0),(0,0),(4,5),(10,5)]],
}
def area(p): return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2
def cw(p): return p if area(p)<0 else p[::-1]
def quad(a,b):
    (x1,y1),(x2,y2)=a,b; dx,dy=x2-x1,y2-y1; L=math.hypot(dx,dy) or 1; nx,ny=-dy/L*T/2,dx/L*T/2; ex,ey=dx/L*T/2,dy/L*T/2
    return [(x1+nx-ex,y1+ny-ey),(x2+nx+ex,y2+ny+ey),(x2-nx+ex,y2-ny+ey),(x1-nx-ex,y1-ny-ey)]
def glyph(strokes):
    pen=TTGlyphPen(None); off=T/2+30
    for s in strokes:
        pts=[(x*SX+off,y*SY+T/2) for x,y in s]
        for i in range(len(pts)-1):
            q=cw([(round(x),round(y)) for x,y in quad(pts[i],pts[i+1])])
            pen.moveTo(q[0]); [pen.lineTo(p) for p in q[1:]]; pen.closePath()
    return pen.glyph()
order=['.notdef','space']; glyphs={}; cmap={32:'space'}; metrics={}
e=TTGlyphPen(None); glyphs['.notdef']=e.glyph(); metrics['.notdef']=(500,0)
glyphs['space']=TTGlyphPen(None).glyph(); metrics["space"]=(300,0)
W=int(10*SX+T+60)
for c,s in G.items():
    n='au_'+c; order.append(n); glyphs[n]=glyph(s); metrics[n]=(W,0); cmap[ord(c)]=n; cmap[ord(c.upper())]=n
fb=FontBuilder(1000,isTTF=True); fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(metrics); fb.setupHorizontalHeader(ascent=900,descent=-250)
fb.setupNameTable({'familyName':'FF Aurebesh','styleName':'Regular','copyright':'© 2026 Frenchfries777'}); fb.setupOS2(sTypoAscender=900,sTypoDescender=-250,usWinAscent=900,usWinDescent=250); fb.setupPost()
import sys
fb.font.flavor='woff2'; fb.save(sys.argv[1])
