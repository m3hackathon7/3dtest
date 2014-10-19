(function() {

// -------------------------
// utility
// -------------------------

// degreeをradianに変換する
function rad(degree) {
  return degree * Math.PI / 180;
}

// -------------------------


/**
 * マウス・キーボードなどの入力機器の状態を
 * 把握し、保持する
 */
function Input(container) {
  this.current = {
    position: new THREE.Vector2(),
    isMouseDown: false,
    isShiftDown: false,
    isCtrlDown: false
  };
  this.mouseDown = {}; // マウス押下時の状態
  this.previous = {}; // 前フレームの状態

  this.deltaFromDown = function() {
    return this.current.position.clone().sub(this.mouseDown.position);
  };

  this.deltaFromPrevious = function() {
    return this.current.position.clone().sub(this.previous.position);
  };

  this.update = function() {
    this.previous = this.clone();
  };
  this.updateDown = function() {
    this.mouseDown = this.clone();
  };
  this.clone = function() {
    var obj = _.clone(this.current);
    obj.position = this.current.position.clone();
    return obj;
  };
  this.isMousePress = function() {
    return (this.current.isMouseDown && !this.previous.isMouseDown);
  };

  // イベントへのリスナ割当を行う
  function on(type, func) {
    var elm = container;
    if ((/^key/).test(type)) {
      elm = window;
    }
    elm.addEventListener(
        type, func, false);
  }

  // イベント割当
  var self = this;
  on('mousedown', function(e){
    event.preventDefault();
    self.current.isMouseDown = true;
    self.updateDown();
  });

  on('mousemove', function(e){
    event.preventDefault();
    self.current.position.x = e.clientX;
    self.current.position.y = e.clientY;
  });

  on('mouseup', function(e){
    event.preventDefault();
    self.current.isMouseDown = false;
  });

  on('keydown', function(event) {
    switch( event.keyCode ) {
      case 16: self.current.isShiftDown = true; break;
      case 17: self.current.isCtrlDown = true; break;
    }
  });

  on('keyup', function(event) {
    switch ( event.keyCode ) {
      case 16: self.current.isShiftDown = false; break;
      case 17: self.current.isCtrlDown = false; break;
    }
  });

}


/**
 * 様々なリソースを管理する
 */
function Resources() {
  this.cache = {};
  this.factories = {};
  this.register = function(key, factory) {
    this.factories[key] = factory;
  };

  this.get = function(key) {
    var obj = this.cache[key];
    if (!obj) {
      obj = this.create(key);
      this.cache[key] = obj;
    }
    return obj;
  };

  this.create = function(key) {
    var factory = this.factories[key];
    if (_.isFunction(factory)) {
      return factory();
    } else {
      return factory;
    }
  };
}


// メインシーン
function MainScene(input) {
  var $r = new Resources();
  this.$r = $r;

  $r.register('l:ambient', new THREE.AmbientLight( 0x606060 ));
  $r.register('l:directional', new THREE.DirectionalLight(0xffffff));

  $r.register('g:box', new THREE.BoxGeometry(100, 100,100));
  $r.register('m:blue', new THREE.MeshBasicMaterial({color: 0x00ff00}));
  $r.register('m:shine',
    new THREE.MeshPhongMaterial({
      // light
      specular: '#a9fcff',
      // intermediate
      color: '#00abb1',
      // dark
      emissive: '#006063',
      shininess: 100
    })
  );

  $r.register('t:texture', new THREE.ImageUtils.loadTexture('/images/texture.jpg'));
  $r.register('m:texture',
    new THREE.MeshLambertMaterial({map: $r.get('t:texture')})
  );

  $r.register('o:cube', function() {
    new THREE.Mesh( $r.get('g:box'), $r.get('m:texture') );
  });

  $r.register('g:grid', function () {
    var size = 500, step = 50;
    var geometry = new THREE.Geometry();
    for ( var i = - size; i <= size; i += step ) {
      geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
      geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

      geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
      geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
    }
    return geometry;
  });


  $r.register('m:lightGray',
    new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true }));

  $r.register('o:basePlane', function() {
    var line = new THREE.Line($r.get('g:grid'), $r.get('m:lightGray'));
    line.type = THREE.LinePieces;
    return line;
  });


  $r.register('m:green',
    new THREE.MeshPhongMaterial({ color: 0x00FF7F, ambient:0x993030 }));

  $r.register('g:ground', function() {
    var width = 1024, height = 1024;
    var data = new Uint8Array( width * height ),
    size = width * height, quality = 2, z = Math.random() * 100;

    for ( var j = 0; j < 4; j ++ ) {
      quality *= 4;
      for ( var i = 0; i < size; i ++ ) {
        var x = i % width, y = ~~ ( i / width );
        data[ i ] += Math.abs( Math.random() * 50);
      }
    }

    var quality = 64, step = width / quality;

    var geometry = new THREE.PlaneGeometry( 2000, 2000, quality - 1, quality - 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
      var x = i % quality, y = Math.floor( i / quality );
      geometry.vertices[ i ].y = data[ ( x * step ) + ( y * step ) * height ] * 2;
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    return geometry;
  });

  $r.register('o:ground', function() {
    return new THREE.Mesh($r.get('g:ground'), $r.get('m:green'))
  });


  $r.register('c:camera', function() {
    var camera = new THREE.PerspectiveCamera( 45,
     window.innerWidth / window.innerHeight,
     1, 10000 );
    camera.position.y = 200;
    return camera;
  });


  this.scene = new THREE.Scene();

  this.scene.add($r.get('l:ambient'));

  var directionalLight = $r.get('l:directional');
  directionalLight.position.set(1, 1, 1).normalize();
  this.scene.add(directionalLight);

  this.scene.add($r.get('o:basePlane'));
  this.scene.add($r.get('o:ground'));


  this.getCamera = function() {
    return $r.get('c:camera');
  };


  var angle = {theta: 45, phi: 60};
  var radious = 1600;
  var mouseDown = {};

  this.update = function() {

    if (input.isMousePress()) {
      mouseDown.angle = _.clone(angle);
      mouseDown.radious = radious;
    }

    if (input.current.isMouseDown) {
      var delta = input.deltaFromDown();
      if (input.current.isShiftDown) {
        //ズーム
        radious = mouseDown.radious + delta.y * 10;

      } else {
        // 回転
        angle.theta = - delta.x + mouseDown.angle.theta;
        angle.phi = Math.min(90, Math.max(0,
              delta.y + mouseDown.angle.phi));
      }
    }

    var camera = $r.get('c:camera');
    camera.position.x = Math.sin( rad(angle.theta) ) * Math.cos( rad(angle.phi) );
    camera.position.y = Math.sin( rad(angle.phi) );
    camera.position.z = Math.cos( rad(angle.theta) ) * Math.cos( rad(angle.phi) );
    camera.position.multiplyScalar(radious);

    camera.updateMatrix();
    camera.lookAt( this.scene.position );

    input.update();
  };
}

/**
 * 地形ビューア
 *
 * @param container 表示対象箇所のDOMエレメント
 */
function TerrainViewer(container) {

  // fpsステータス表示
  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  // レンダリングループ
  function render(renderer, scene) {
    requestAnimationFrame(function() {
      render(renderer, scene);
    });

    scene.update();

    renderer.render(scene.scene, scene.getCamera());
    stats.update();
  }

  // 描画メイン
  this.draw = function() {
    // レンダラ
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    console.log(container.offsetWidth, container.offsetHeight );
    container.appendChild( renderer.domElement );

    var input = new Input(container);
    var scene = new MainScene(input);
    render(renderer, scene);

    // 画面リサイズ対応
    container.addEventListener('resize', function () {
        var camera = this.getCamera();
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( container.offsetWidth, container.offsetHeight );
      }, false );
  };


  // 地形の地図画像とサイズを指定
  this.terrain = { image: null, width: 0, height: 0 };
  this.setTerrain = function(image, width, height) {
    this.terrain.image = image;
    this.terrain.width = width;
    this.terrain.height = height;
  };

  // 地形の中心点座標
  this.terrain.center = {latitude: 0, longitude: 0};
  this.setCenter = function(lat, lon) {
    this.terrain.center.latitude = lat;
    this.terrain.center.longitude = lon;
  };

  // 地図座標系と描画座標系の変換晩率
  this.convertRate = 1.0;
  this.setConvertRate = function(rate) {
    this.convertRate = rate;
  };

  // 地形の座標
  this.terrain.coordGrid = [];
  this.terrain.setCoordGrid = function(coordGrid, width, height) {
    this.terrain.coordGrid = coordGrid;
    this.terrain.coordWidth = width;
    this.terrain.coordHeight = height;
  };

  // 経路パス
  this.route = [];
  this.setRoute = function(route) {
    this.route = route;
  };
}

window.TerrainViewer = TerrainViewer;
})();

