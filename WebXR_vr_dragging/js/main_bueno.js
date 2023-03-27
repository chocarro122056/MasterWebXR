import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let camera, scene, renderer, drum1, drum2, cymbal,cymbal2, stickCymbal, stickCymbal2;
let container;
let skinnedMesh, skeleton, bones, skeletonHelper, box1, box2, box3, box4;
let raycaster;
const pointer = new THREE.Vector2();
let groupDraggables;
let intersectPoint;
let controllerGrip1, controllerGrip2;
let controller1, controller2;
const tempMatrix = new THREE.Matrix4();
const intersected = [];
                        
init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();

  let dirLight = new THREE.DirectionalLight ( 0xffffff, 1 );
  scene.add( dirLight );
        
  let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
  scene.add( hemiLight );
    
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 0, 1.6, 3 );

    
  raycaster = new THREE.Raycaster();
     groupDraggables = new THREE.Group();
    groupDraggables.add( stickCymbal2);
    scene.add( groupDraggables );


  // Creamos la geometría del tambor y los platillos
  const drumGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
  const drumMaterial = new THREE.MeshStandardMaterial({
      color: 0x593804,
      metalness: 0.3,
      roughness: 0.4,
  });
  drum1 = new THREE.Mesh(drumGeometry, drumMaterial);
  drum1.position.x = 1.3;
  
  const drum2Geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
  const drum2Material = new THREE.MeshStandardMaterial({
      color: 0x593804,
      metalness: 0.3,
      roughness: 0.4,
    });
  
  drum2 = new THREE.Mesh(drum2Geometry, drum2Material);
  drum2.position.x = -1.3;
  
  scene.add(drum1);
  scene.add(drum2);

       // Geometría del Platillo
    //const cymbalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
  const cymbalGeometry = new THREE.CylinderGeometry(0.01, 1.5, 0.02, 32);
  const cymbalMaterial = new THREE.MeshStandardMaterial({
         color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2,
    });
  cymbal = new THREE.Mesh(cymbalGeometry, cymbalMaterial);
  cymbal.position.y = 1.3;
  cymbal.position.x = 3.2;
  scene.add(cymbal);
  
  const cymbal2Geometry = new THREE.CylinderGeometry(0.01, 1.5, 0.02, 32);
  const cymbal2Material = new THREE.MeshStandardMaterial({
         color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2,
    });
  cymbal2 = new THREE.Mesh(cymbal2Geometry, cymbal2Material);
  cymbal2.position.y = 1.3;
  cymbal2.position.x = -3.2;
  scene.add(cymbal2);
  
  
  const stickCymbalGeometry = new THREE.BoxGeometry(0.1, 0.1, 3, 64);
  stickCymbalGeometry.rotateX(Math.PI / 2);
  const stickCymbalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2,
    });
  stickCymbal = new THREE.Mesh(stickCymbalGeometry, stickCymbalMaterial);
  stickCymbal.position.y = 0.5;
  stickCymbal.position.x = 3.2;
  scene.add(stickCymbal);
  
  const stickCymbalGeometry2 = new THREE.BoxGeometry(0.1, 0.1, 3, 64);
  stickCymbalGeometry2.rotateX(Math.PI / 2);
  const stickCymbalMaterial2 = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2,
    });
  stickCymbal2 = new THREE.Mesh(stickCymbalGeometry2, stickCymbalMaterial2);
  stickCymbal2.position.y = 0.5;
  stickCymbal2.position.x = -3.2;
  scene.add(stickCymbal2);
      

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    //document.body.appendChild( renderer.domElement );
	
    document.body.appendChild( VRButton.createButton( renderer ) );
    window.addEventListener( 'resize', onWindowResize );
    //window.addEventListener( 'pointerdown', onPointerDown );
    //window.addEventListener( 'pointerup', onPointerUp );
    //window.addEventListener( 'mousemove', onPointerMove );
        

    //Configuracion y visualizacion de los mandos
    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    
    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller2 );

    const geo = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
    const line = new THREE.Line( geo );
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );
}

function onSelectStart( event ) {

  const controller = event.target;

  const intersections = getIntersections( controller );

  if ( intersections.length > 0 ) {

    const intersection = intersections[ 0 ];

    const object = intersection.object;
    object.material.emissive.b = 1;
    controller.attach( object );

    controller.userData.selected = object;

  }

}

function onSelectEnd( event ) {

  const controller = event.target;

  if ( controller.userData.selected !== undefined ) {

    const object = controller.userData.selected;
    object.material.emissive.b = 0;
    groupDraggables.attach( object );

    controller.userData.selected = undefined;

  }


}

//Para que aparezca el rayo
function getIntersections( controller ) {

  tempMatrix.identity().extractRotation( controller.matrixWorld );

  raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
  raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

  return raycaster.intersectObjects( groupDraggables.children, false );

}

function intersectObjects( controller ) {

  // Do not highlight when already selected

  if ( controller.userData.selected !== undefined ) return;

  const line = controller.getObjectByName( 'line' );
  const intersections = getIntersections( controller );

  if ( intersections.length > 0 ) {

    const intersection = intersections[ 0 ];

    const object = intersection.object;
    object.material.emissive.r = 1;
    intersected.push( object );
    line.scale.z = intersection.distance;

  } else {

    line.scale.z = 5;
  }

}


function initSkinnedMesh() {

    const segmentHeight = 6;
    const segmentCount = 4;
    const height = segmentHeight * segmentCount;
    const halfHeight = height * 0.5;

    const sizing = {
            segmentHeight,
            segmentCount,
            height,
            halfHeight
    };

    const geometry = createGeometry( sizing );
    
    const material = new THREE.MeshStandardMaterial( {
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true,
            wireframe: true
    } );


    const bones = createBones( sizing );
    
    skeleton = new THREE.Skeleton( bones );
    
    skinnedMesh = new THREE.SkinnedMesh( geometry, material );

    const rootBone = skeleton.bones[ 0 ];
 		skinnedMesh.add( rootBone );
    
    skinnedMesh.bind( skeleton );
    

    scene.add( skinnedMesh );
    
    skeletonHelper = new THREE.SkeletonHelper( skinnedMesh );
    skeletonHelper.material.linewidth = 5;
    scene.add( skeletonHelper );
      
    
    box1.position.set(skeleton.bones[0].position.x,skeleton.bones[0].position.y,skeleton.bones[0].position.z);
    box2.position.set(skeleton.bones[1].position.x,skeleton.bones[1].position.y,skeleton.bones[1].position.z);

    scene.add(box1);
    scene.add(box2);

    
    box2.position.set(skeleton.bones[0].position.x,skeleton.bones[0].position.y+8,skeleton.bones[0].position.z);
    box3.position.set(skeleton.bones[0].position.x,skeleton.bones[0].position.y+16,skeleton.bones[0].position.z);
    box4.position.set(skeleton.bones[0].position.x,skeleton.bones[0].position.y+25,skeleton.bones[0].position.z);
   
    
   
}

function createGeometry( sizing ) {

    const geometry = new THREE.CylinderGeometry(
            5, // radiusTop
            5, // radiusBottom
            sizing.height, // height
            8, // radiusSegments
            sizing.segmentCount * 1, // heightSegments
            true // openEnded
    );

    const position = geometry.attributes.position;

    const vertex = new THREE.Vector3();

    const skinIndices = [];
    const skinWeights = [];

    for ( let i = 0; i < position.count; i ++ ) {

            vertex.fromBufferAttribute( position, i );

            const y = ( vertex.y + sizing.halfHeight );

            const skinIndex = Math.floor( y / sizing.segmentHeight );
            const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

            skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
            skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

    }

    geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
    geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

    return geometry;

    }

function createBones( sizing ) {

    bones = [];

    let prevBone = new THREE.Bone();
    bones.push( prevBone );
    prevBone.position.y = - sizing.halfHeight;

    for ( let i = 0; i < sizing.segmentCount; i ++ ) {

            const bone = new THREE.Bone();
            bone.position.y = sizing.segmentHeight;
            bones.push( bone );
            prevBone.add( bone );
            prevBone = bone;

    }
    return bones;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onPointerMove( event ) {
    
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const found = raycaster.intersectObjects(groupDraggables.children, true);
    if (found.length > 0 ) {
         intersectPoint = found[0].point;
         
    }
    if(box1.currentDrag){
        box1.position.x = intersectPoint.x;
        box1.position.y = intersectPoint.y;
        
       skeleton.bones[ 0 ].position.x = box1.position.x;
       skeleton.bones[ 0 ].position.y = box1.position.y;
       skeleton.bones[ 0 ].position.z = box1.position.z;
       // actualizamos los bones que están por encima
       skeleton.bones[ 1 ].position.x = box2.position.x;
       skeleton.bones[ 1 ].position.y = box2.position.y - box1.position.y;
       skeleton.bones[ 1 ].position.z = box2.position.z;
       
       skeleton.bones[ 2 ].position.x = box3.position.x;
       skeleton.bones[ 2 ].position.y = box3.position.y - box2.position.y;
       skeleton.bones[ 2 ].position.z = box3.position.z;
       
       skeleton.bones[ 3 ].position.x = box4.position.x;
       skeleton.bones[ 3 ].position.y = box4.position.y - box3.position.y;
       skeleton.bones[ 3 ].position.z = box4.position.z;
    }
    if(box2.currentDrag){
        box2.position.x = intersectPoint.x;
        box2.position.y = intersectPoint.y;
        
       skeleton.bones[ 1 ].position.x = box2.position.x;
       skeleton.bones[ 1 ].position.y = box2.position.y - box1.position.y;
       skeleton.bones[ 1 ].position.z = box2.position.z;
       
       skeleton.bones[ 2 ].position.x = box3.position.x;
       skeleton.bones[ 2 ].position.y = box3.position.y - box2.position.y;
       skeleton.bones[ 2 ].position.z = box3.position.z;
       
       skeleton.bones[ 3 ].position.x = box4.position.x;
       skeleton.bones[ 3 ].position.y = box4.position.y - box3.position.y;
       skeleton.bones[ 3 ].position.z = box4.position.z;
    }
    if(box3.currentDrag){
        box3.position.x = intersectPoint.x;
        box3.position.y = intersectPoint.y;
        
        skeleton.bones[ 2 ].position.x = box3.position.x;
        skeleton.bones[ 2 ].position.y = box3.position.y - box2.position.y;
        skeleton.bones[ 2 ].position.z = box3.position.z;
        
       skeleton.bones[ 3 ].position.x = box4.position.x;
       skeleton.bones[ 3 ].position.y = box4.position.y - box3.position.y;
       skeleton.bones[ 3 ].position.z = box4.position.z;
    }
    if(box4.currentDrag){
        box4.position.x = intersectPoint.x;
        box4.position.y = intersectPoint.y;
        
        skeleton.bones[ 3 ].position.x = box4.position.x;
        skeleton.bones[ 3 ].position.y = box4.position.y - box3.position.y;
        skeleton.bones[ 3 ].position.z = box4.position.z;
    }

}

function onPointerDown( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera);
 
    
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length) { 
    	//if(found[0].object.isIntersectable) {
      	if(found[0].object == box1) {
        	box1.currentIntesected = true;
      		box1.material.color.set( 0xe8720c );
          box1.currentDrag = true;
        }
        if(found[0].object == box2) {
        	box2.currentIntesected = true;
      		box2.material.color.set( 0xe8720c );
          box2.currentDrag = true;
        }
        if(found[0].object == box3) {
        	box3.currentIntesected = true;
      		box3.material.color.set( 0xe8720c );
          box3.currentDrag = true;
        }
        if(found[0].object == box4) {
        	box4.currentIntesected = true;
      		box4.material.color.set( 0xe8720c );
          box4.currentDrag = true;
        }
      	
      }
      
    //}
    
}

function onPointerUp( event ) {

  if (box1.currentIntesected) {
     box1.material.color.set( 0x1bcc1b );
     box1.currentDrag = false;
  }
  if (box2.currentIntesected) {
     box2.material.color.set( 0x1bcc1b );
     box2.currentDrag = false;
  }
  
  if (box3.currentIntesected) {
     box3.material.color.set( 0x1bcc1b );
     box3.currentDrag = false;
  }
  if (box4.currentIntesected) {
     box4.material.color.set( 0x1bcc1b );
     box4.currentDrag = false;
  }
 
   
}

function cleanIntersected() {

  while ( intersected.length ) {
    const object = intersected.pop();
    object.material.emissive.r = 0;
  }

}

function animate() {

  renderer.setAnimationLoop( render );

}

function render() {

  cleanIntersected();

  // Dibujar el rayo de los mandos
  intersectObjects( controller1 );
  intersectObjects( controller2 );

  renderer.render( scene, camera );

}
