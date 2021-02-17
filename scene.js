
// --- Objects ---

class Object {
	constructor() {
		this.model = null;

		this.draw = true;

		// Transformation parameters
		
		// Displacement vector
		this.tx = 0.0;
		this.ty = 0.0;
		this.tz = 0.0;

		// Rotation angles	
		this.rx = 0.0;
		this.ry = 0.0;
		this.rz = 0.0;

		// Scaling factors
		this.sx = 1.0;
		this.sy = 1.0;
		this.sz = 1.0;
	}
}

var boardM = null;
var queenM = null;
var squareM = null;

var boardC = null;
var queenC = null;