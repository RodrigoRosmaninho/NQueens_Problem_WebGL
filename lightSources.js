//////////////////////////////////////////////////////////////////////////////
//
//  A class for instantiating light sources.
//
//  J. Madeira - Oct. 2015 + November 2017
//
//////////////////////////////////////////////////////////////////////////////
//----------------------------------------------------------------------------
//
//  Constructor
//
class LightSource {
	constructor() {
		// A new light source is always on
		this.isOn = true;
		// And is directional
		this.position = [0.0, 0.0, 1.0, 0.0];
		// White light
		this.intensity = [1.0, 1.0, 1.0];
		// Ambient component
		this.ambientIntensity = [0.2, 0.2, 0.2];
		// Animation controls
		this.rotXXOn = false;
		this.rotYYOn = false;
		this.rotZZOn = false;
		// Rotation angles	
		this.rotAngleXX = 0.0;
		this.rotAngleYY = 0.0;
		this.rotAngleZZ = 0.0;
		// NEW --- Rotation speed factor - Allow different speeds
		this.rotationSpeed = 1.0;
	}
	//----------------------------------------------------------------------------
	//
	//  Methods
	//
	isOff() {
		return this.isOn == false;
	}
	switchOn() {
		this.isOn = true;
	}
	switchOff() {
		this.isOn = false;
	}
	isDirectional() {
		return this.position[3] == 0.0;
	}
	getPosition() {
		return this.position;
	}
	setPosition(x, y, z, w) {
		this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;
		this.position[3] = w;
	}
	getIntensity() {
		return this.intensity;
	}
	setIntensity(r, g, b) {
		this.intensity[0] = r;
		this.intensity[1] = g;
		this.intensity[2] = b;
	}
	getAmbIntensity() {
		return this.ambientIntensity;
	}
	setAmbIntensity(r, g, b) {
		this.ambientIntensity[0] = r;
		this.ambientIntensity[1] = g;
		this.ambientIntensity[2] = b;
	}
	isRotYYOn() {
		return this.rotYYOn;
	}
	switchRotYYOn() {
		this.rotYYOn = true;
	}
	switchRotYYOff() {
		this.rotYYOn = false;
	}
	getRotAngleYY() {
		return this.rotAngleYY;
	}
	setRotAngleYY(angle) {
		this.rotAngleYY = angle;
	}
	getRotationSpeed() {
		return this.rotationSpeed;
	}
	setRotationSpeed(s) {
		this.rotationSpeed = s;
	}
}


// COMPLETE THE MISSING METHODS !!


//----------------------------------------------------------------------------
//
//  Instantiating light sources
//

var lightSources = [];

// Main Light Source

lightSources.push( new LightSource() );

lightSources[0].setPosition( 0.3, 0.8, 1.0, 0.0 );

lightSources[0].setIntensity( 1.0, 1.0, 1.0 );

lightSources[0].setAmbIntensity( 0.2, 0.0, 0.0 );

