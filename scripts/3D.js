// - Global variables -

// Graphics variables
var container, stats;
var camera, controls, scene, renderer;
var textureLoader;
var clock = new THREE.Clock();

var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

// Physics variables
var gravityConstant = 7.8;
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var physicsWorld;
var margin = 0.05;
var mouse = {x: 0, y: 0};
var fbx;
var touch = false;
var tilt = false;
var beta = 0;
var gamma = 0;
var canvasMain;
var imageOpen = false;
var factor = 70;
var initial = false;
var shakeX = 0;
var shakeY = 0;
var acc = { x : 0, y : 0, z : 0}

var bound = [];
var boundShape = [];
// Rigid bodies include all movable objects
var rigidBodies = [];
var objects = [];

var resizeTimeout;
var resizeX;
var resizeY;
var isAndroid = false;

var mouseGrav = {x: 0, y: 0};
var angleTimeout = false;

var tTexture = 0;

var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();
var transformAux1 = new Ammo.btTransform();
var tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );

var mouseCount = 5;
var colliders = {"website": [3, 5, 3],
				"nextimage": [2.7, 2.7, 2.7],
				"reebok": [4.7, 2.5, 4.7],
				"visual": [1.8, 4, 1.8],
				"twogether": [5, 0.2, 3],
				"visual_2": [2, 4, 2],
				"visual_3": [2.1, 4, 2.1],
				"sontfwap": [5.5, 1.25, 0.2],
				"visual_4": [5, 0.2, 3],
				"iam": [3.8, 4, 3.8],
				"boookland": [8, 2, 8],
				"visual_6": [1.1, 4, 1.1],
				"agenda": [1.4, 1.4, 4.8],
				"sterling": [1.8, 0.2, 3],
				"visual_7": [1.8, 5.8, 1.8],
				"visual_8": [5, 5, 5],
				"reebok_2": [2.5, 2.5, 2.5],
				"neighborhood": [4.7, 3.7, 3.2],
				"neighborhood_2": [2.7, 3.7, 1.8],
				"everyone": [1.7, 2.5, 0.2],
				"visual_9": [4, 1.4, 4],
				"plasticpaper": [3, 4.3, 0.4]}

var time = 0;


$(document).ready(function(){

	if ( WEBGL.isWebGLAvailable() === false ) {
		document.body.appendChild( WEBGL.getWebGLErrorMessage() );
		document.getElementById( 'container' ).innerHTML = "";
	}

	if ("ontouchstart" in document.documentElement){
		touch = true;
	}

	var ua = navigator.userAgent.toLowerCase();
	isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");

	resizeX = window.innerWidth;
	resizeY = window.innerHeight;

	init();

});


function init() {
	initGraphics();
	initPhysics();
	animate();
	listeners3D();
}


function listeners3D(){
	//listen to shake event
    var shakeEvent = new Shake({threshold: 5, timeout: 20});
    shakeEvent.start();
    window.addEventListener('shake', function(){
        console.log("shake");
        shakeX = Math.random() * 200 - 100;
		shakeY = Math.random() * 200 - 100;
		setTimeout(function() {
			shakeX = 0;
			shakeY = 0;
		}, 20);
    }, false);

    //stop listening
    function stopShake(){
        shakeEvent.stop();
    }

    var aT;
    $("#container").mousedown(function(){
    	angleTimeout = true;
    	clearTimeout(aT);
    	aT = setTimeout(function(){
    		angleTimeout = false;
    	}, 5000);
    	for(var i = 0; i < objects.length; i++){
    		var r1 = Math.random() * 20 - 10;
    		var r2 = Math.random() * 20 - 10;
    		var r3 = Math.random() * 20 - 10;
			// objects[i].setLinearVelocity( new Ammo.btVector3( r1, r2, r3 ) );
			objects[i].setAngularVelocity( new Ammo.btVector3( r1, r2, r3 ) );
		}
    });

    //check if shake is supported or not.
    if(!("ondevicemotion" in window)){console.log("Shake Not Supported");}
    if(window.DeviceMotionEvent){
	  window.addEventListener("devicemotion", motion, false);
	}else{
	  console.log("DeviceMotionEvent is not supported");
	}
	$( window ).resize(resizeHandler);

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	if(window.DeviceOrientationEvent){
		tilt = true;
		window.addEventListener("deviceorientation", handleOrientation, true);
	}else{
		console.log("DeviceOrientationEvent is not supported");
	}
}


function initGraphics() {

	container = document.getElementById( 'container' );

	camera = new THREE.OrthographicCamera( window.innerWidth / - factor, window.innerWidth / factor, (window.innerHeight * 0.94) / factor, (window.innerHeight * 0.94) / - factor, -1000, 1000 );
	camera.position.set( 0, 10, 0 );
	camera.rotation.set( 3*Math.PI/2, 0, 0 );

	scene = new THREE.Scene();

	canvasMain = document.getElementById("canvas");
	renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvasMain, alpha: true});
	renderer.setClearColor( 0xffffff, 0);
	renderer.antialias = true;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, (window.innerHeight * 0.94) );
	renderer.shadowMap.enabled = true;

	//LIGHTS––––––––––––––––––––––––––––
	var ambient = new THREE.AmbientLight( 0xffffff, 0.9 );
	scene.add( ambient );
	var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 0.3 );
	directionalLight.position.set( 100, 350, 250 );
	directionalLight.castShadow = true;
	scene.add( directionalLight );

	container.innerHTML = "";
	container.appendChild( renderer.domElement );

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		// console.log( item, loaded, total );
	};

	var loader = new THREE.FBXLoader();
	loader.load( 'assets/fbx/3D_Final.fbx', function ( object ) {

		fbx = object;

		object.traverse( function ( child ) {

			if ( child.isMesh ) {

				if(child.name == "plasticpaper"){
					child.material[0].map.anisotropy = renderer.capabilities.getMaxAnisotropy();
					child.material[1].map.anisotropy = renderer.capabilities.getMaxAnisotropy();
					child.material[2].map.anisotropy = renderer.capabilities.getMaxAnisotropy();
				}

				if(child.material.map){
					child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
				}
				if(child.material[0] && child.material[0].map){
					child.material[0].map.anisotropy = renderer.capabilities.getMaxAnisotropy();
				}
				if(child.material[1] && child.material[1].map){
					child.material[1].map.anisotropy = renderer.capabilities.getMaxAnisotropy();
				}
				if(child.material[2] && child.material[2].map){
					child.material[2].map.anisotropy = renderer.capabilities.getMaxAnisotropy();
				}

			}
		});
		object.scale.set(0.3,0.3,0.3);
		object.rotation.z = 90;
		object.position.set(0,0,0);
		createObjects();
		$("#container").css("opacity", "1");
	});

}

function initPhysics() {

	// Physics configuration
	collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
	physicsWorld.setGravity( new Ammo.btVector3( 0, - gravityConstant, 0 ) );

}

function createObjects() {

	var w = (window.innerWidth+30)/35;
	var h = ((window.innerHeight * 0.94)+30)/35;

	// Ground
	pos.set( 0, - 0.5, 0 );
	quat.set( 0, 0, 0, 1 );
	var ground = createParalellepipedWithPhysics( w, 1, h, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFF0000 } ) );
	ground.visible = false;
	boundShape.push(ground);

	pos.set( 0, 20, 0 );
	quat.set( 0, 0, 0, 1 );
	var ground = createParalellepipedWithPhysics( w, 1, h, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
	ground.visible = false;
	boundShape.push(ground);

	pos.set( 0, 0, h/2 );
	quat.set( 0, 0, 0, 1 );
	var ground = createParalellepipedWithPhysics( w, 50, 1, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0x0000FF } ) );
	ground.visible = false;
	boundShape.push(ground);

	pos.set( 0, 0, -h/2 );
	quat.set( 0, 0, 0, 1 );
	var ground = createParalellepipedWithPhysics( w, 50, 1, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0x0000FF } ) );
	ground.visible = false;
	boundShape.push(ground);

	pos.set( w/2, 0, 0 );
	quat.set( 0, 0, 0, 1 );
	var ground = createParalellepipedWithPhysics( 1, 50, h, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0x0000FF } ) );
	ground.visible = false;
	boundShape.push(ground);

	pos.set( -w/2, 0, 0 );
	quat.set( 0, 0, 0, 1 );
	var ground = createParalellepipedWithPhysics( 1, 50, h, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0x0000FF } ) );
	ground.visible = false;
	boundShape.push(ground);

	if(!initial){
		var stoneMass = 120;
		var numStones = 20;
		quat.set( 4, 1, 4, 2 );
		for ( var i = 0; i < fbx.children.length; i++ ) {

			var ball = fbx.children[i].clone();
			var name = ball.name;
			var c = colliders[name];

			pos.set( 0, 2, 1 );
			stoneMass = 120 + (Math.random()*100)-50;

			var canes = createBallsWithPhysics( ball, c, stoneMass, pos, quat, new THREE.MeshStandardMaterial( { color: 0xFFFFFF, roughness: 0, metalness: 100 } ) );

		}
		makeMice();
		initial = true;
	}

}

function makeMice(){
	for(var i = 0; i < mouseCount; i++){
		var ball = fbx.children[13].clone();
		var name = ball.name;
		var c = colliders[name];

		quat.set( 1, 0, 1, 1 );
		pos.set( 0, 2, 1 );
		stoneMass = 120 + (Math.random()*100)-50;

		var mice = createBallsWithPhysics( ball, c, stoneMass, pos, quat, new THREE.MeshStandardMaterial( { color: 0xFFFFFF, roughness: 0, metalness: 100 } ) );
	}

}

function createParalellepipedWithPhysics( sx, sy, sz, mass, pos, quat, material ) {

	var object = new THREE.Mesh( new THREE.BoxBufferGeometry( sx, sy, sz, 1, 1, 1 ), material );
	var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
	shape.setMargin( margin );

	createRigidBody( object, shape, mass, pos, quat);

	return object;

}

function createBallsWithPhysics( mesh, collider, mass, pos, quat, material ) {

		var w = window.innerWidth;

		var ballMass = 35;
		var ballRadius = 1.2;

		if(w < 640){
			mesh.scale.set(0.05,0.05,0.05);
			var ballShape = new Ammo.btBoxShape( new Ammo.btVector3( (collider[0] * 0.5), (collider[1] * 0.5), (collider[2] * 0.5) ) );
		} else {
			if(w < 1150){
				mesh.scale.set(0.075,0.075,0.075);
				var ballShape = new Ammo.btBoxShape( new Ammo.btVector3( (collider[0] * 0.75), (collider[1] * 0.75), (collider[2] * 0.75) ) );
			} else {
				mesh.scale.set(0.1,0.1,0.1);
				var ballShape = new Ammo.btBoxShape( new Ammo.btVector3( collider[0], collider[1], collider[2] ) );
			}
		}
		ballShape.setMargin( margin );

		var pos = new THREE.Vector3();
		var ang = new THREE.Quaternion();
		ang.set(5, 5, 5, 5);

		createRigidBody( mesh, ballShape, mass, pos, quat, pos, ang);

	return;

}


function createConvexHullPhysicsShape( coords ) {

	var shape = new Ammo.btConvexHullShape();

	for ( var i = 0, il = coords.length; i < il; i+= 3 ) {
		tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], coords[ i + 2 ] );
		var lastOne = ( i >= ( il - 3 ) );
		shape.addPoint( tempBtVec3_1, lastOne );
	}

	return shape;

}


function createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

	if ( pos ) {
		object.position.copy( pos );
	}
	else {
		pos = object.position;
	}
	if ( quat ) {
		object.quaternion.copy( quat );
	}
	else {
		quat = object.quaternion;
	}

	var transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
	var motionState = new Ammo.btDefaultMotionState( transform );

	var localInertia = new Ammo.btVector3( 0, 0, 0 );
	physicsShape.calculateLocalInertia( mass, localInertia );

	var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
	var body = new Ammo.btRigidBody( rbInfo );

	body.setFriction( 0 );

	if ( vel ) {
		body.setLinearVelocity( new Ammo.btVector3( vel.x, vel.y, vel.z ) );
	}
	if ( angVel ) {
		body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );
	}

	object.userData.physicsBody = body;
	object.userData.collided = false;

	scene.add( object );

	if ( mass > 0 ) {
		rigidBodies.push( object );
		objects.push(body);

		// Disable deactivation
		body.setActivationState( 4 );
	} else {
		bound.push(body);
	}

	physicsWorld.addRigidBody( body );

	return body;
}


function animate() {

	requestAnimationFrame( animate );

	if(scrolled == 0){

		if(fbx && !touch){
			var dest1 = 0.01 + mouseGrav.y*5;
			var dest2 = 0.01 + Math.abs(mouseGrav.x*25);
			var dest3 = 0.01 + mouseGrav.y*10;

			fbx.children[8].material[1].map.offset.x += (dest1 - fbx.children[8].material[1].map.offset.x)/50;
			fbx.children[10].material.map.repeat.y += (dest2 - fbx.children[10].material.map.repeat.y)/50;
			fbx.children[10].material.map.offset.y += (dest3 - fbx.children[10].material.map.offset.y)/50;
			fbx.children[10].material.map.minFilter = THREE.LinearFilter;
		}

		if(fbx && touch){
			var dest1 = 0.01 + (Math.sin(tTexture) + 1) * 5;
			var dest2 = 0.01 + (Math.sin(tTexture) + 1) * 10;
			var dest3 = 0.01 + (Math.sin(tTexture) + 1) * 10;

			tTexture += 0.01;

			fbx.children[8].material[1].map.offset.x += (dest1 - fbx.children[8].material[1].map.offset.x)/50;
			fbx.children[10].material.map.repeat.y += (dest2 - fbx.children[10].material.map.repeat.y)/50;
			fbx.children[10].material.map.offset.y += (dest3 - fbx.children[10].material.map.offset.y)/50;
			fbx.children[10].material.map.minFilter = THREE.LinearFilter;
		}

		render();
	}

}

function render() {

	var deltaTime = clock.getDelta();

	updatePhysics( deltaTime );

	renderer.render( scene, camera );

	time += deltaTime;

}


function resizeHandler(){
	var w = window.innerWidth;
	var h = window.innerHeight * 0.94;

    if(!touch){
		clearTimeout(resizeTimeout);
		camera.left = -window.innerWidth / factor;
	    camera.right = window.innerWidth / factor;
	    camera.top = h / factor;
	    camera.bottom = -h / factor;
	    camera.updateProjectionMatrix();

	    renderer.setSize( window.innerWidth, h );

	    for(var i = 0; i < bound.length; i++){
	    	physicsWorld.removeRigidBody(bound[i]);
	    }
	    for(var i = 0; i < boundShape.length; i++){
	    	scene.remove( bound[i] );
	    }

		createObjects();

	    resizeX = w;
	    resizeY = h;
	}
}


function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = event.pageX - window.innerWidth/2;
	mouse.y = event.pageY - window.innerHeight/2;
	mouseGrav.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouseGrav.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


function handleOrientation(event) {

	beta     = event.beta;
	gamma    = event.gamma;

	gamma = Math.round(gamma);
	if(gamma > 25){
		gamma = 25;
	}
	if(gamma < -25){
		gamma = -25;
	}

	beta = Math.round(beta);
	if(beta > 25){
		beta = 25;
	}
	if(beta < -25){
		beta = -25;
	}

}


function motion(event){
  acc.x = event.accelerationIncludingGravity.x;
  acc.y = event.accelerationIncludingGravity.y;
  acc.z = event.accelerationIncludingGravity.z;
}


function updatePhysics( deltaTime ) {

	// Step world
	physicsWorld.stepSimulation( deltaTime, 10 );
	if(touch){
		var gravX = gamma/2;
		var gravY = beta/2;
		if(shakeX != 0 && shakeY != 0){
			if(isAndroid){
				physicsWorld.setGravity( new Ammo.btVector3( -acc.x*30, 0, acc.y*30 ));
			} else {
				physicsWorld.setGravity( new Ammo.btVector3( acc.x*30, 0, -acc.y*30 ));
			}
		} else {
			if(isAndroid){
				physicsWorld.setGravity( new Ammo.btVector3( -acc.x, 0, acc.y ));
			} else {
				physicsWorld.setGravity( new Ammo.btVector3( acc.x, 0, -acc.y ));
			}
		}

		if(!angleTimeout){
			for(var i = 0; i < objects.length; i++){
				objects[i].setAngularVelocity( new Ammo.btVector3( 0.1, 0.1, 0.1 ) );
			}
		}

	} else {
		var gravFactor = 40;
		var gravX = (mouse.x/(window.innerWidth/2));
		var gravY = (mouse.y/(window.innerHeight/2));

		if(gravX <= -0.5){
			gravX = (gravX + 0.5) * gravFactor;
		} else {
			if(gravX >= 0.5){
				gravX = (gravX - 0.5) * gravFactor;
			} else {
				gravX = 0;
			}
		}

		if(gravY <= -0.5){
			gravY = (gravY + 0.5) * gravFactor;
		} else {
			if(gravY >= 0.5){
				gravY = (gravY - 0.5) * gravFactor;
			} else {
				gravY = 0;
			}
		}

		physicsWorld.setGravity( new Ammo.btVector3( gravX, 0, gravY ));

		if(gravX == 0 && gravY == 0 && !angleTimeout){
			for(var i = 0; i < objects.length; i++){
				objects[i].setAngularVelocity( new Ammo.btVector3( 0.1, 0.1, 0.1 ) );
			}
		}
	}

	// Update rigid bodies
	for ( var i = 0, il = rigidBodies.length; i < il; i++ ) {
		var objThree = rigidBodies[ i ];
		var objPhys = objThree.userData.physicsBody;
		var ms = objPhys.getMotionState();
		if ( ms ) {

			ms.getWorldTransform( transformAux1 );
			var p = transformAux1.getOrigin();
			var q = transformAux1.getRotation();
			objThree.position.set( p.x(), p.y(), p.z() );
			objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

			objThree.userData.collided = false;

		}
	}

	

}
