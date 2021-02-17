
function BoardChristmas(N,primTypes=null) {

	var board = new Model();
	
	var boardCol = rgbToDecimal([195,123,54]);

	// vertex computation

	var floor = 0; // y coordinate of ground level

	var wood=new Prim();
	wood.type=primTypes.triangles;
	wood.difColor=boardCol;

	var half = N/2;
	var top = -0.1;
	var bottom = 0.25;
	
	// INNER

	var face=[-half,floor,half,
			-half,floor-top,-half,
			-half,floor-top,half,
			-half,floor,half,
			-half,floor,-half,
			-half,floor-top,-half];
	wood.vertices.push(...face);
	face=[half,floor,half,
			-half,floor-top,half,
			half,floor-top,half,
			half,floor,half,
			-half,floor,half,
			-half,floor-top,half];
	wood.vertices.push(...face);
	face=[half,floor,-half,
			half,floor-top,half,
			half,floor-top,-half,
			half,floor,-half,
			half,floor,half,
			half,floor-top,half];
	wood.vertices.push(...face);
	face=[-half,floor,-half,
			half,floor-top,-half,
			-half,floor-top,-half,
			-half,floor,-half,
			half,floor,-half,
			half,floor-top,-half];
	wood.vertices.push(...face);

	// UPPER
	var t=floor-top;
	face=[-half-0.5,t,-half-0.5,
			-half,t,half,
			-half,t,-half,
			-half-0.5,t,-half-0.5,
			-half-0.5,t,half+0.5,
			-half,t,half];
	wood.vertices.push(...face);
	face=[-half-0.5,t,half+0.5,
			half,t,half,
			-half,t,half,
			-half-0.5,t,half+0.5,
			half+0.5,t,half+0.5,
			half,t,half];
	wood.vertices.push(...face);
	face=[half+0.5,t,half+0.5,
			half,t,-half,
			half,t,half,
			half+0.5,t,half+0.5,
			half+0.5,t,-half-0.5,
			half,t,-half];
	wood.vertices.push(...face);
	face=[half+0.5,t,-half-0.5,
		-half,t,-half,
		half,t,-half,
		half+0.5,t,-half-0.5,
		-half-0.5,t,-half-0.5,
		-half,t,-half];
wood.vertices.push(...face);

	// SIDES

	face=[-half-0.5,floor-bottom,half+0.5,
			-half-0.5,floor-bottom,-half-0.5,
			half+0.5,floor-bottom,-half-0.5,

			-half-0.5,floor-bottom,half+0.5,
			half+0.5,floor-bottom,-half-0.5,
			half+0.5,floor-bottom,half+0.5];
	wood.vertices.push(...face); // BOTTOM

	face=[-half-0.5,floor-bottom,-half-0.5,
			-half-0.5,floor-top,half+0.5,
			-half-0.5,floor-top,-half-0.5,
		
			-half-0.5,floor-bottom,-half-0.5,
			-half-0.5,floor-bottom,half+0.5,
			-half-0.5,floor-top,half+0.5];
	wood.vertices.push(...face);  // LEFT

	face=[-half-0.5,floor-bottom,half+0.5,
			half+0.5,floor-top,half+0.5,
			-half-0.5,floor-top,half+0.5,
		
			-half-0.5,floor-bottom,half+0.5,
			half+0.5,floor-bottom,half+0.5,
			half+0.5,floor-top,half+0.5];
	wood.vertices.push(...face); // FRONT

	face=[half+0.5,floor-bottom,-half-0.5,
			half+0.5,floor-top,-half-0.5,
			half+0.5,floor-top,half+0.5,
		
			half+0.5,floor-bottom,-half-0.5,
			half+0.5,floor-top,half+0.5,
			half+0.5,floor-bottom,half+0.5];
	wood.vertices.push(...face); // RIGHT

	face=[-half-0.5,floor-bottom,-half-0.5,
			-half-0.5,floor-top,-half-0.5,
			half+0.5,floor-top,-half-0.5,
		
			-half-0.5,floor-bottom,-half-0.5,
			half+0.5,floor-top,-half-0.5,
			half+0.5,floor-bottom,-half-0.5];
	wood.vertices.push(...face); // BACK

	board.primitives.push(wood);

	var white=new Prim();
	white.type=primTypes.triangles;
	white.kAmbi=[1.0, 1.0, 1.0];
	white.kDiff=[1.0, 1.0, 1.0];
	white.difColor=rgbToDecimal([217,0,0]);
	white.kSpec=[0.4, 0.4, 0.4];
	white.nPhong=128;

	var black=new Prim();
	black.type=primTypes.triangles;
	black.kAmbi=[1.0, 1.0, 1.0];
	black.kDiff=[1.0, 1.0, 1.0];
	black.difColor=rgbToDecimal([0,153,36]);
	black.kSpec=[0.4, 0.4, 0.4];
	black.nPhong=128;

	var w=true;
	for (var row=0;row<N;row++) {
		if (row%2==0) w=true;
		else w=false;
		for (col=0;col<N;col++) {

			var relx=col-half;
			var relz=row-half;
			var face=[relx,floor,relz+1,
						relx+1,floor,relz,
						relx,floor,relz,
						relx,floor,relz+1,
						relx+1,floor,relz+1,
						relx+1,floor,relz]; // tile

			if (w) white.vertices.push(...face);
			else black.vertices.push(...face);

			w=!w;
		}
	}
	board.primitives.push(white);
	board.primitives.push(black);

	for (var i=0;i<board.primitives.length;i++) computeVertexNormals(board.primitives[i].vertices,board.primitives[i].normals);
	
	return board;

}

function QueenChristmas(N,primTypes=null) {

	var kAmbi=[1.0, 1.0, 1.0];
	var kDiff=[1.0, 1.0, 1.0];
	var difColor1=[1.0, 0.0, 0.0];
	var difColor2=[1.0, 1.0, 1.0];
	var kSpec=[1.0, 1.0, 1.0];
	var nPhong1=70;
	var nPhong2=10

	var queen = new Model();

	var subdiv = 1; // Subdivision parameter

	var ringHeights = [];
	if (N<7) ringHeights = [0.0, 0.25, 0.5, 0.8, 0.3, 0.6];
	else if (N<10) ringHeights = [0.0, 0.25, 0.6, 1.0, 0.4, 0.7];
	else ringHeights = [0.0, 0.25, 0.75, 1.25, 0.5, 0.75];
	var hei = 0;
	for (var i=0;i<ringHeights.length;i++) {
		hei+=ringHeights[i];
		ringHeights[i]=hei;
	}
	var ringThickness = [0.5, 0.5, 0.15, 0.15, 0.4, 0.1];

	var rings = [];

	// SIMPLE RING GENERATION
	for (var i=0;i<ringHeights.length;i++) {	
		var height = ringHeights[i];
		var side = ringThickness[i];
		rings.push([side,height,0.0,
					0.0,height,side,
					-side,height,0.0,
					-0.0,height,-side,
					side,height,0.0]);
	}

	// RING SUBDIVISION
	for (var ring=0;ring<rings.length;ring++) {
		for (var sd=0;sd<subdiv;sd++) {
			rings[ring]=subdivideRing(rings[ring],ringThickness[ring]);
		}
	}

	// vertex computation
	
	// BASE
	var base=new Prim();
	base.type=primTypes.trFan;
	base.kAmbi=kAmbi;
	base.kDiff=kDiff;
	base.difColor=difColor2;
	base.kSpec=kSpec;
	base.nPhong=nPhong2;
	base.vertices.push(0.0,ringHeights[0],0.0, ...rings[0]);
	computeVertexFanNormals(rings[0],[0.0,ringHeights[0],0.0],base.normals);
	queen.primitives.push(base);

	// LEVELS
	for (var i=0;i<rings.length-2;i++) {
		var level=new Prim();
		level.type=primTypes.trStrip;
		level.kAmbi=kAmbi;
		level.kDiff=kDiff;
		if (i==0 || i==rings.length-3) {
			level.difColor=difColor2;
			level.nPhong=nPhong2;
		}
		else {
			level.difColor=difColor1;
			level.nPhong=nPhong1;
		}
		level.kSpec=kSpec;
		level.vertices.push(...mergeArrays(rings[i],rings[i+1]));
		computeVertexStripNormals(level.vertices,level.normals);
		queen.primitives.push(level);
	}

	// TOP
	var top=new Prim();
	top.type=primTypes.trFan;
	top.kAmbi=kAmbi;
	top.kDiff=kDiff;
	top.difColor=difColor1;
	top.kSpec=kSpec;
	top.nPhong=nPhong1;
	var vtx=rings[rings.length-2];
	vtx=vertexReverse(vtx);
	top.vertices.push(0.0,ringHeights[rings.length-2],0.0, ...vtx);
	computeVertexFanNormals(vtx,[0.0,ringHeights[rings.length-2],0.0],top.normals);
	queen.primitives.push(top);

	// CROWN
	var crown=new Prim();
	crown.type=primTypes.triangles;
	crown.kAmbi=kAmbi;
	crown.kDiff=kDiff;
	crown.difColor=difColor1;
	crown.kSpec=kSpec;
	crown.nPhong=nPhong1;
	var doRing=rings[rings.length-2];
	var upRing=rings[rings.length-1];
	for (var vx=0;vx<doRing.length-5;vx+=3) {
		var v1 = [doRing[vx],doRing[vx+1],doRing[vx+2]];
		var v2 = [doRing[vx+3],doRing[vx+4],doRing[vx+5]];
		var mid=computeMidPoint(v1,v2);
		crown.vertices.push(mid[0],mid[1],mid[2],
							v1[0],v1[1],v1[2],
							upRing[vx],upRing[vx+1],upRing[vx+2]); // LEFT FRONT
		crown.vertices.push(v1[0],v1[1],v1[2],
							mid[0],mid[1],mid[2],
							upRing[vx],upRing[vx+1],upRing[vx+2]); // LEFT BACK
		crown.vertices.push(v2[0],v2[1],v2[2],
							mid[0],mid[1],mid[2],
							upRing[vx+3],upRing[vx+4],upRing[vx+5]); // RIGHT FRONT
		crown.vertices.push(mid[0],mid[1],mid[2],
							v2[0],v2[1],v2[2],
							upRing[vx+3],upRing[vx+4],upRing[vx+5]); // RIGHT BACK
	}
	computeVertexNormals(crown.vertices,crown.normals);
	queen.primitives.push(crown);

    return queen;

}