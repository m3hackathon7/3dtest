var container = document.body;

// Our Javascript will go here.
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;
// fpsステータス表示
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//var geometry = new THREE.CubeGeometry(10, 10, 10);
var geometry = new THREE.BoxGeometry(1,1,1);
//var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
//var material = new THREE.MeshPhongMaterial( {  color: 0x00FF7F, ambient:0x990000 } );
//var material = new THREE.MeshPhongMaterial({
//  // light
//  specular: '#a9fcff',
//  // intermediate
//  color: '#00abb1',
//  // dark
//  emissive: '#006063',
//  shininess: 100
//});
var texture  = new THREE.ImageUtils.loadTexture('/images/texture.jpg');
var material = new THREE.MeshLambertMaterial({map: texture});

var cube = new THREE.Mesh( geometry, material );
//cube.position.set(0,0,0);
scene.add( cube );

// add subtle ambient lighting
var ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

// directional lighting
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);


var prevPosition = {};
var mousedown = false;
renderer.domElement.addEventListener('mousedown', function(e){
  mousedown = true;
  prevPosition = {x: e.pageX, y: e.pageY};
}, false);

renderer.domElement.addEventListener('mousemove', function(e){
  if(!mousedown) return;
  var moveDistance = {x: prevPosition.x - e.pageX, y: prevPosition.y - e.pageY};

  cube.rotation.x += moveDistance.y * 0.01;
  cube.rotation.y -= moveDistance.x * 0.01;

  prevPosition = {x: e.pageX, y: e.pageY};
  //render();
}, false);

renderer.domElement.addEventListener('mouseup', function(e){
  mousedown = false;
}, false);

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
  //cube.rotation.x += 0.01; // 追加
  //cube.rotation.y += 0.01; // 追加
}

render();
