

function computeVertexNormals( coordsArray, normalsArray ) {
	
	// Clearing the new normals array
	
	normalsArray.splice( 0, normalsArray.length );
	
    // Taking 3 vertices from the coordinates array 

    for( var index = 0; index < coordsArray.length; index += 9 )
    {
		// Compute unit normal vector for each triangle
			
        var normalVector = computeNormalVector( coordsArray.slice(index, index + 3),
												coordsArray.slice(index + 3, index + 6),
												coordsArray.slice(index + 6, index + 9) );

        // Store the unit normal vector for each vertex 

        for( var j = 0; j < 3; j++ )
        {
            normalsArray.push( normalVector[0], normalVector[1], normalVector[2] ); 
		}
	}
}

// ASSUMES A LOOPED STRIP
function computeVertexStripNormals( coordsArray, normalsArray ) {
	
	// Clearing the new normals array
	
	normalsArray.splice( 0, normalsArray.length );
	
    // Taking 3 vertices from the coordinates array 

	var faceNormals=[];
	var order=true;
	for (var i=0;i<coordsArray.length-8;i+=3) {
		if (order) faceNormals.push(computeNormalVector([coordsArray[i],coordsArray[i+1],coordsArray[i+2]],
														[coordsArray[i+3],coordsArray[i+4],coordsArray[i+5]],
														[coordsArray[i+6],coordsArray[i+7],coordsArray[i+8]]));
		else faceNormals.push(computeNormalVector([coordsArray[i],coordsArray[i+1],coordsArray[i+2]],
													[coordsArray[i+6],coordsArray[i+7],coordsArray[i+8]],
													[coordsArray[i+3],coordsArray[i+4],coordsArray[i+5]]));
		order=!order;
	}
	var mid=computeCentroid(faceNormals[faceNormals.length-2],faceNormals[faceNormals.length-1],faceNormals[0]);
	normalize(...mid);
	normalsArray.push(...mid);
	mid=computeCentroid(faceNormals[faceNormals.length-1],faceNormals[0],faceNormals[1]);
	normalize(...mid);
	normalsArray.push(...mid);
	var fnor=0;
	for (var i=6;i<coordsArray.length-6;i+=3,fnor++) {
		mid=computeCentroid(faceNormals[fnor],faceNormals[fnor+1],faceNormals[fnor+2]);
		normalize(mid);
		normalsArray.push(...mid);
	}
	mid=computeCentroid(faceNormals[faceNormals.length-2],faceNormals[faceNormals.length-1],faceNormals[0]);
	normalize(mid);
	normalsArray.push(...mid);
	mid=computeCentroid(faceNormals[faceNormals.length-1],faceNormals[0],faceNormals[1]);
	normalize(mid);
	normalsArray.push(...mid);
}

// ASSUMES A FLAT FAN
function computeVertexFanNormals( ringArray, center, normalsArray ) {
	
	// Clearing the new normals array
	
	normalsArray.splice( 0, normalsArray.length );
	
	var normalVector = computeNormalVector( center,
												ringArray.slice(0, 3),
												ringArray.slice(3, 6) );

    for( var index = 0; index < ringArray.length+1; index += 3 )
    {
		normalsArray.push( normalVector[0], normalVector[1], normalVector[2] ); 
	}
}

function rgbToDecimal(arr) {
	dec=arr.slice();

	dec[0]/=255.0;
	dec[1]/=255.0;
	dec[2]/=255.0;

	return dec;
}

// --- Models ---

class Prim {
	constructor() {
		this.type = null;
		this.vertices = [];
		this.normals = [];
		this.kAmbi = [0.2, 0.2, 0.2];
		this.kDiff = [0.7, 0.7, 0.7];
		this.difColor = [1.0, 1.0, 1.0];
		this.kSpec = [0.7, 0.7, 0.7];
		this.nPhong = 100;
	}
}

class Model {
	constructor() {
		// EMPTY MODEL
		this.primitives = [];
	}
}

function SquareModel(primTypes=null) {

	var square = new Model();

	var face = new Prim();
	face.type=primTypes.triangles;
	face.kAmbi=[0.2, 0.2, 0.2];
	face.kDiff=[1.0, 1.0, 1.0];
	face.difColor=[1.0, 1.0, 1.0];
	face.kSpec=[0.1, 0.1, 0.1];
	face.nPhong=128;
	face.vertices.push(-0.5,0.0,0.5,
						0.5,0.0,-0.5,
						-0.5,0.0,-0.5,
						-0.5,0.0,0.5,
						0.5,0.0,0.5,
						0.5,0.0,-0.5);
	computeVertexNormals(face.vertices,face.normals);

	square.primitives.push(face);

	return square;
	
}

function subdivideRing(ring,thick) {
	var result=[];
	for (var vx=0;vx+5<ring.length;vx+=3) {
		var v1 = [ring[vx],ring[vx+1],ring[vx+2]];
		var v2 = [ring[vx+3],ring[vx+4],ring[vx+5]];

		var mid=computeMidPoint(v1,v2);
		var height=mid[1];
		mid[1]=0;
		normalize(mid,thick);
		mid[1]=height;

		result.push(v1[0],v1[1],v1[2],mid[0],mid[1],mid[2]);
	}
	result.push(ring[0],ring[1],ring[2]);
	return result;
}

function mergeArrays(arr1, arr2) {
	var result=[];
	for (var i=0;i<arr1.length-2;i+=3) {
		result.push(arr1[i],arr1[i+1],arr1[i+2],
					arr2[i],arr2[i+1],arr2[i+2]);
	}
	return result;
}

function vertexReverse(vertices) {
	var result=[];
	for (var i=0;i<vertices.length-2;i+=3) {
		result.unshift(vertices[i],vertices[i+1],vertices[i+2]);
	}
	return result;
}
