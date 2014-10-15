var container = document.body;

// fpsステータス表示
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );


// -------------------------
// utility
// -------------------------

// イベントへのリスナ割当を行う
function on(type, func) {
  container.addEventListener(
      type, func, false);
}

// degreeをradianに変換する
function rad(degree) {
  return degree * Math.PI / 180;
}



// -------------------------
// main
// -------------------------

function setupLight(scene) {

  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight( 0x606060 );
  scene.add(ambientLight);

  // directional lighting
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

}

function setupObjects(scene) {
  var objects = [
    function() {
      var geometry = new THREE.BoxGeometry(100, 100,100);

      //var material = new THREE.MeshBasicMaterial({color: 0x00ff00});

      //var material = new THREE.MeshPhongMaterial({
      //  // light
      //  specular: '#a9fcff',
      //  // intermediate
      //  color: '#00abb1',
      //  // dark
      //  emissive: '#006063',
      //  shininess: 100
      //});
      //
      var texture  = new THREE.ImageUtils.loadTexture('/images/texture.jpg');
      var material = new THREE.MeshLambertMaterial({map: texture});

      var cube = new THREE.Mesh( geometry, material );
      //cube.position.set(0,0,0);
      return cube;
    },
    function() {
      var size = 500, step = 50;

      var geometry = new THREE.Geometry();

      for ( var i = - size; i <= size; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

      }

      var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

      var line = new THREE.Line( geometry, material );
      line.type = THREE.LinePieces;
      return line;
    }
  ];

  for(i in objects) {
    scene.add( objects[i]() );
  }

}

function createUpdateFunc(scene, camera) {
  var isMouseDown = false;
  var isShiftDown = false;
  var isCtrlDown = false;

  var angle = {theta: 45, phi: 60};
  var radious = 1600;
  var downedPosition = new THREE.Vector2();
  var downedAngle = {};

  on('mousedown', function(e){
    event.preventDefault();

    isMouseDown = true;

    downedPosition.x = e.clientX;
    downedPosition.y = e.clientY;
    downedAngle.theta = angle.theta;
    downedAngle.phi = angle.phi;
    downedRadious = radious;
  });

  on('mousemove', function(e){
    event.preventDefault();

    if (isMouseDown) {
      if (isShiftDown) {
        //ズーム
        radious = downedRadious + (e.clientY - downedPosition.y) * 10;

      } else {
        // 回転

        angle.theta = - (e.clientX - downedPosition.x)
          + downedAngle.theta;
        angle.phi = (e.clientY - downedPosition.y)
          + downedAngle.phi;

        angle.phi = Math.min(90, Math.max(0, angle.phi));
      }
    }

  });

  on('mouseup', function(e){
    event.preventDefault();

    isMouseDown = false;
  });

  on('keydown', function(event) {
    switch( event.keyCode ) {
      case 16: isShiftDown = true; break;
      case 17: isCtrlDown = true; break;
    }
  });

  on('keyup', function(event) {
    switch ( event.keyCode ) {
      case 16: isShiftDown = false; break;
      case 17: isCtrlDown = false; break;
    }
  });



  return function () {
    camera.position.x = radious * Math.sin( rad(angle.theta) ) * Math.cos( rad(angle.phi) );
    camera.position.y = radious * Math.sin( rad(angle.phi) );
    camera.position.z = radious * Math.cos( rad(angle.theta) ) * Math.cos( rad(angle.phi) );

    camera.updateMatrix();
    camera.lookAt( scene.position );
  };
}

function render(renderer, scene, camera, update) {
  requestAnimationFrame(function() {
    render(renderer, scene, camera, update);
  });

  update();

  renderer.render(scene, camera);
  stats.update();
}



function main() {
  // レンダラ
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // カメラ
  var camera = new THREE.PerspectiveCamera( 45,
   window.innerWidth / window.innerHeight,
   1, 10000 );
  camera.position.y = 200;

  // 画面リサイズ対応
  window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }, false );


  // シーン
  var scene = new THREE.Scene();

  setupLight(scene);
  setupObjects(scene);
  render(renderer, scene, camera, createUpdateFunc(scene, camera));
}



main();

