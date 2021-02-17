

// -----------
// GLOBAL VARS
// -----------

// Meta data

const FETCH = 0;
const ANIM_MOV = 1;
const CHECK = 2;
const ANIM_ERR = 3;
const ANIM_SUC = 4;
const ANIM_FAI = 5;

var N = 4;

var mPortX = -2;
var mPortY = -2;
var mouseDown = false;
var pickMode = false;

var currentStep = 0;
var solution = null;
var solvable = false;
var currentBoard = null;
var currentState = FETCH;
var pause = false;
var wait = 61;
var numBacktracks = 0;
var speed = 1;
var start_queen = null;

var anim = null;

// Model info

var board = null;
var bModel = null;
var qModel = null;

var queens = [];
var tiles = []; // TO BE USED BY SUBANIMS ONLY

function allModels() {
    var ret=queens.slice();
	ret.unshift(board);
	ret.push(...(tiles.slice()));
    return ret;
}

// Skin info

var skin=0;

function setSkin(sk) {
	skin=sk;
	var b=boardM;
	var q=queenM;
	Suc=[0.0, 1.0, 0.0];
	Fai=[1.0, 0.0, 0.0];
	squareM.difColor=Suc;
	squareM.difColor=Fai;
	switch(sk) {
	case 1:
		b=boardC;
		q=queenC;
		Suc=rgbToDecimal([215,200,60]);
		Fai=rgbToDecimal([200,200,205]);
	break;
	}

	if (board.model!=null) board.model=b;
	bModel=b;
	for (qu of queens) qu.model=q;
	qModel=q;
	if (currentState==ANIM_SUC) squareM.difColor=Suc;
	else if (currentState==ANIM_ERR) squareM.difColor=Fai;
}

// WebGL

var gl = null; // WebGL context

var shaderProgram = null;

var triangleVertexPositionBuffer = null;
	
var triangleVertexNormalBuffer = null;

var triangleVertexColorBuffer = null;

// GLOBAL transformation parameters

var globalRx = 0.0;
var globalRy = 0.0;
var globalRz = 0.0;

var rotMatrix = mult(rotationXXMatrix(30),rotationYYMatrix(45));

var cameraRx = 0.0;
var cameraRy = 0.0;
var cameraRz = 0.0;

var scTopDown = 6.3/3;
var scNormal = 0.2/15;
var globalSx = 0.25;
var globalSy = 0.25;
var globalSz = 0.25;

var globalTz = 0.0;

// To allow choosing the way of drawing the model triangles

var primTypes = {};
 
// To allow choosing the projection type

var projectionType = 1;

// The viewer position

var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];

// ----------
// WEBGL CODE
// ----------

// Rendering

function initBuffers( model ) {	
	
	// Vertex Coordinates
		
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems =  model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Vertex Normal Vectors
		
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( model.normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = model.normals.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
			triangleVertexNormalBuffer.itemSize, 
            gl.FLOAT, false, 0, 0);
}

function drawPrimitive(prim) {
	var pType=null;
	if (prim.type!=null) pType=prim.type;
	else pType=gl.POINTS;

	initBuffers(prim);

	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), 
		flatten(prim.kAmbi) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
		flatten(prim.kDiff) );
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "difColor"),
        flatten(prim.difColor) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(prim.kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		prim.nPhong );
				
	gl.drawArrays(pType, 0, triangleVertexPositionBuffer.numItems); 
}

function drawModel( obj,
					mvMatrix) {
	
	// Local Transformations
    
	mvMatrix = mult( mvMatrix, translationMatrix( obj.tx, obj.ty, obj.tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( obj.rz ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( obj.ry ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( obj.rx ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( obj.sx, obj.sy, obj.sz ) );
						 
	// Apply Transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Light Sources
	
	var numLights = lightSources.length;
	
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );
	
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
    
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
    
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
	}
	
	// Drawing

	for (var i=0;i<obj.model.primitives.length;i++) drawPrimitive(obj.model.primitives[i]);
}

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix
	
	if( projectionType == 0 ) {
		
		// Orthogonal view volume
		
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		
		globalTz = 0.0;
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[3] = 0.0;
		
		pos_Viewer[2] = 1.0;
	}
	else {	

		// A standard view volume.
		
		pMatrix = perspective( 45, 1, 0.05, 15 );
		
		globalTz = -2.5;

		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
		
		pos_Viewer[3] = 1.0;  
	}
	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// Passing the viewer position to the vertex shader
	
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"),
        flatten(pos_Viewer) );
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	
	// Camera Rotation
	mvMatrix = mult(translationMatrix( 0, 0, globalTz ),
					rotationZZMatrix(cameraRz));
	mvMatrix = mult(mvMatrix,
					rotationYYMatrix(cameraRy));
	mvMatrix = mult(mvMatrix,
					rotationXXMatrix(cameraRx));
	// Global rotation
	mvMatrix = mult(mvMatrix,
					rotMatrix);
	// Global Scaling
	mvMatrix = mult( mvMatrix, scalingMatrix( globalSx, globalSy, globalSz ) );
	
	// FOR EACH LIGHT SOURCE
	    
	for(var i = 0; i < lightSources.length; i++ ) {
		// Animating the light source, if defined
		    
		var lightSourceMatrix = mat4();
	
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
	
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}
			
	// Instantianting all scene models
	var sceneModels = allModels();
	for(var i = 0; i < sceneModels.length; i++ )
	{ 
		if (sceneModels[i].draw) drawModel( sceneModels[i],
			   mvMatrix);
	}
}

// Animation

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime != 0 ) {
		
		var elapsed = timeNow - lastTime;
		
	}
	
	if (anim!=null) {
		if (anim.step()) {
			anim.reset();
			anim.step();
		}
	}
	
	lastTime = timeNow;
}

function tick() {
	if(solution != null && !pause && wait > 60) {
		switch(currentState){
			case FETCH:
				if (currentStep < solution.length) {
					currentBoard = solution[currentStep++];
					currentState++;
					document.getElementById("current_step").innerHTML = currentStep - 1;
				}
				else if (solvable) {
					currentState=ANIM_SUC;
				}
				else {
					currentState=ANIM_FAI;
				}
				break;

			case ANIM_MOV:
				switch(currentBoard.info){
					case MOVEMENT:
						if(anim == null) {
							var queen =  queens[queens.length-1];
							anim = new Move(queen,[queen.tx,queen.ty,queen.tz],[getAnimCoordinates(currentBoard.queen[1]),queen.ty,getAnimCoordinates(currentBoard.queen[0])]);
							anim.speed = speed;
						}
						if(anim.step()) {
							anim = null;
							currentState++;
						}
						break;
					case NEW_QUEEN:
						if(anim == null) {
							var queen = new Object();
							queen.model = qModel;
							queen.tx = getAnimCoordinates(currentBoard.queen[1]);
							queen.ty+=0.01;
							queen.tz = getAnimCoordinates(currentBoard.queen[0]);
							queens.push(queen);

							anim = new New(queen,[-1.0,queen.ty,-1.0]);
							anim.speed = speed;
						}

						if(anim.step()) {
							anim = null;
							currentState++;
						}
						break;
					case BACKTRACK:
						if(anim == null) {
							document.getElementById("num_backtracks").innerHTML = ++numBacktracks;
							var queen =  queens[queens.length-1];
							anim = new Remove(queen);
							anim.speed = speed;
						}
						if(anim.step()) {
							queens.pop();
							anim = null;
							currentState++;
						}
						break;

					case INIT:
						currentState++;
						break;
				}
				break;

			case CHECK:
				if(currentBoard.danger.length == 0) currentState = FETCH;
				else currentState++;
				break;

			case ANIM_ERR:
				if (anim == null) {
					var queen =  queens[queens.length-1];
					var queenPos = [queen.tx,queen.ty];
					var conflicts = [];
					for (const pos of currentBoard.danger) conflicts.push([getAnimCoordinates(pos[1]),getAnimCoordinates(pos[0])]);

					anim = new Confict(queenPos,conflicts,tiles);
					anim.speed = speed;
				}
				if(anim.step()) {
					anim= null;
					currentState = FETCH;
				}
				break;
			case ANIM_SUC:
				if (anim == null) anim = new Success(queens,tiles);
				if(anim.step()) anim.reset();
				break;
			case ANIM_FAI:
				if (anim == null) anim = new Failure(queens,N);
				anim.step();
				
				break;
		}
	}

	wait++;
	
	requestAnimFrame(tick);
	
	drawScene();

	document.getElementById("play-pause-button").disabled = pickMode;
	document.getElementById("step-backward-button").disabled = pickMode || currentStep == 0;
	document.getElementById("step-forward-button").disabled = pickMode || (solution != null && currentStep >= solution.length);
	document.getElementById("animation-reset-button").disabled = pickMode;

}

function setBoardToStep(step){
	pause_state = pause;
	pause = true;
	currentStep = step;
	currentState = FETCH;
	if(anim != null) anim.restore();
	queens = []

	if(start_queen != null) {
		var queen = new Object();
		queen.model = qModel;
		queen.tx = getAnimCoordinates(start_queen[1]);
		queen.ty+=0.01;
		queen.tz = getAnimCoordinates(start_queen[0]);
		queens.push(queen);
	}

	for(var i = 0; i < N; i++){
		for(var j = 0; j < N; j++) {
			if(i != starting_queen_col && solution[step].nboard[j][i]){
				var queen = new Object();
				queen.model = qModel;
				queen.tx = getAnimCoordinates(i);
				queen.ty+=0.01;
				queen.tz = getAnimCoordinates(j);
				queens.push(queen);
			}
		}
	}
	document.getElementById("current_step").innerHTML = currentStep;
	currentStep++;
	anim = null;
	pause = pause_state;
}

function resetGame(new_N, st_queen = null) {
	N = new_N;
	boardM = BoardModel(new_N,primTypes);
	queenM = QueenModel(new_N,primTypes);
	squareM = SquareModel(primTypes);
	boardC = BoardChristmas(new_N,primTypes);
	queenC = QueenChristmas(new_N,primTypes);

	if (skin==0) {
		bModel=boardM;
		qModel=queenM;
	}
	else {
		bModel=boardC;
		qModel=queenC;
	}

	board = new Object();
	board.model = bModel;

	if(anim != null) anim.restore();

	queens = [];
	tiles = [];

	document.getElementById("num_backtracks").innerHTML = 0;
	currentStep = 0;
	currentState = FETCH;
	setNormalView();
	solution = null;
	anim = null;
	pause = false;
	wait = 61;
	numBacktracks = 0;
	start_queen = st_queen;
	executeAsync(function() {
		s = solve(new_N, st_queen);
		solvable = s[0];
		solution = s[1];
	});
	if(pickMode) setNormalView();
}

function setTopDownView() {
	rotMatrix = rotationXXMatrix(90);;
	globalSx = globalSy = globalSz = scTopDown/N;
	cameraRx=cameraRz=0;
}

function setNormalView() {
	rotMatrix = mult(rotationXXMatrix(30),rotationYYMatrix(45));
	globalSx = globalSy = globalSz = (0.4+scNormal*N)*scTopDown/N;
	cameraRx=cameraRz=0;
}

// Listeners

function evPause() {
	pause = !pause;
	wait = 61;
	if(!pause) document.getElementById("play-pause-button").innerHTML = '<span title="You can also use the SpaceBar Key" class="glyphicon glyphicon-pause"></span>';
	else document.getElementById("play-pause-button").innerHTML = '<span title="You can also use the SpaceBar Key" class="glyphicon glyphicon-play"></span>';
}

function evStepF() {
	if (currentStep < solution.length) {
		if(solution[currentStep].info == BACKTRACK) document.getElementById("num_backtracks").innerHTML = ++numBacktracks;
		if(currentState != ANIM_ERR && anim != null && currentBoard.info == MOVEMENT) { 
			while(!anim.step()) continue;
			currentState = FETCH;
			anim.restore();
			anim = null;
		}
		else setBoardToStep(currentStep);
		wait = 0;
	}
}

function evStepB() {
	if (currentStep > 0) {
		if(currentStep < solution.length) if(solution[currentStep].info == BACKTRACK) document.getElementById("num_backtracks").innerHTML = --numBacktracks;
		if (currentStep == 1) setBoardToStep(currentStep-1);
		else setBoardToStep(currentStep - 2);
		wait = 0;
	}
}

function evSpeed(sp) {
	document.getElementById("speed_val").innerHTML = sp;
	speed = + sp;
	slider=document.getElementById('speed-slider');
	slider.value=sp;
}

function setEventListeners(){
	
	var nvalue = document.getElementById("n-value");
	
	nvalue.addEventListener("change", function(){
		
		var p = nvalue.selectedIndex;
		resetGame(p+2);

	});

	document.addEventListener("keydown", event=>{
		switch(event.keyCode) {
		case 32:
			evPause();
		break;
		case 37:
			evStepB();
		break;
		case 39:
			evStepF();
		break;
		case 82:
			resetGame(N);
		break;
		case 83:
			if (skin==0) setSkin(1);
			else setSkin(0);
		break;
		case 171:
			if (speed<15) evSpeed(speed+1);
		break;
		case 173:
			if (speed>1) evSpeed(speed-1);
		break;
		}
	});
	
	var projection = document.getElementById("projection-selection");
	
	projection.addEventListener("click", function(){
		
		var p = projection.selectedIndex;
				
		switch(p){
			
			case 0 : projectionType = 0;
				break;
			
			case 1 : projectionType = 1;
				break;
		}  	
	});

	document.getElementById("face-culling-button").onclick = function(){
		
		if( gl.isEnabled( gl.CULL_FACE ) )
		{
			gl.disable( gl.CULL_FACE );
		}
		else
		{
			gl.enable( gl.CULL_FACE );
		}
	}; 

	document.getElementById("reset-camera-button").onclick = function(){
		setNormalView();
		if(pickMode) pause = false;
		pickMode=false;
	};

	document.getElementById("topdown-camera-button").onclick = function(){
		setTopDownView();
	}; 

	document.getElementById("starting-queen-button").onclick = function(){
		pickMode = true;
		resetGame(N);
		pause = true;
		setTopDownView();
	}; 

	document.getElementById("animation-reset-button").onclick = function(){
		resetGame(N);
	};  

	document.getElementById("play-pause-button").onclick = function(){
		evPause();
	};

	document.getElementById("step-forward-button").onclick = function(){
		evStepF();
	};

	document.getElementById("step-backward-button").onclick = function(){
		evStepB();
	};

	document.getElementById('speed-slider').onchange = function() {
		evSpeed(this.value);
	}
	
	// Canvas Camera Control

	var canvas = document.getElementById("my-canvas");

	// Camera control
	canvas.addEventListener("mousemove", e => {
		
		if (mouseDown) {
			var lastX=mPortX;
			var lastY=mPortY;
			
			var rect = gl.canvas.getBoundingClientRect();
			mPortX = (e.clientX - rect.left) / canvas.width *  2 - 1;
			mPortY = (e.clientY - rect.top) / canvas.height * -2 + 1;
			if (mPortX>1) mPortX=1;
			else if (mPortX<-1) mPortX=-1;
			if (mPortY>1) mPortY=1;
			else if (mPortY<-1) mPortY=-1;

			var deltaX=0;
			var deltaY=0;
			if (lastX>=-1) deltaX=mPortX-lastX;
			if (lastY>=-1) deltaY=mPortY-lastY;

			var rotY=deltaX*180/2;
			var rotX=deltaY*180/2;

			document.getElementById('mouse').innerHTML = "camera: (" + cameraRx.toFixed(2) + "," + cameraRy.toFixed(2) + ")";


			var camMatrix=mult(rotationZZMatrix(cameraRz),rotationXXMatrix(cameraRx));
			camMatrix=mult(camMatrix,rotationYYMatrix(cameraRy));
			rotMatrix=mult(camMatrix,rotMatrix);

			cameraRx=-rotX;
			cameraRy=rotY;
		}
	});

	canvas.addEventListener("mousedown", e => {
		mouseDown=true;

		var rect = gl.canvas.getBoundingClientRect();
		mPortX = (e.clientX - rect.left) / canvas.width *  2 - 1;
		mPortY = (e.clientY - rect.top) / canvas.height * -2 + 1;
		if (mPortX>1) mPortX=1;
		else if (mPortX<-1) mPortX=-1;
		if (mPortY>1) mPortY=1;
		else if (mPortY<-1) mPortY=-1;

		if(pickMode) {
			matrix_coords = getMatrixFromMouse(mPortX,mPortY);
			resetGame(N, matrix_coords);
		}
		pickMode=false;
	});

	document.addEventListener("mouseup", function(){
		mouseDown=false;
		mPortX=-2;
		mPortY=-2;
	});

	// Zoom in/out
	canvas.addEventListener("wheel", e => {
		if(pickMode) pause = false;
		pickMode=false;

		if (e.deltaY>0) {
			globalSx-=0.05;
			globalSy-=0.05;
			globalSz-=0.05;
			if (globalSx<0 || globalSy<0 || globalSz<0) globalSx=globalSy=globalSz=0;
		}
		else if (e.deltaY<0) {
			globalSx+=0.1;
			globalSy+=0.1;
			globalSz+=0.1;
		}
	});
}

function getAnimCoordinates(x){
	return x + (-N/2 + 0.5);
}

// NOTE: mouse_x and mouse_y should be (or obtained the same way as) the mPortX and mPortY in the mousedown event listener
function getMatrixFromMouse(mouse_x,mouse_y) {

	var side = 2/N;

	var xx = (mouse_x+1);
	var yy = (2-(mouse_y+1));

	xx=Math.floor(xx/side);
	yy=Math.floor(yy/side);

	return [yy,xx];
}

// ----------
// WEBGL INIT
// ----------

function initWebGL( canvas ) {
	try {
		
		// Create the WebGL context
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		triangleVertexPositionBuffer = gl.createBuffer();
		triangleVertexNormalBuffer = gl.createBuffer();
		triangleVertexColorBuffer = gl.createBuffer();
		
		primTypes.triangles = gl.TRIANGLES;
		primTypes.trStrip = gl.TRIANGLE_STRIP;
		primTypes.trFan = gl.TRIANGLE_FAN;
		
		gl.enable( gl.CULL_FACE );
		
		gl.cullFace( gl.BACK );
		
		gl.enable( gl.DEPTH_TEST );
        
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

function runWebGL() {
	
	var canvas = document.getElementById("my-canvas");
	
	initWebGL( canvas );

	resetGame(N);

	shaderProgram = initShaders( gl );
	
	setEventListeners();
	
	tick();		// A timer controls the rendering / animation    
}