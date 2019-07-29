'use strict';
var scene,
ptgeometry,//用于协助生成路径
camera,
render,
renderer,
canvas,
controls,
curveline=[],//路径集合
perc=0,
render_stats;
var taillines=[];//尾线
var basicpoints=[];//基础路径
var moonlist=[];//光球集合
var tailmoongroup=6;//尾线光球的集合
var modellist=[];//模型数组
var startchange=false;
var Eveparticle;
var bigparticles;
function initscene(){

	scene =new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x131426);
	camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.001,10000);
	camera.position.set(0,300,0);
	camera.rotation.set(-0.2,0.2,0.1);
	canvas = document.getElementById("canvas");
	renderer = new THREE.WebGLRenderer({canvas:canvas});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor(0x131426, 1.0);

	// controls = new THREE.OrbitControls( camera, canvas);
 //    controls.target.set(0, 0, 0);
 //    controls.update();

	render_stats = new Stats();
    render_stats.domElement.style.position = 'absolute';
    render_stats.domElement.style.top = '1px';
    render_stats.domElement.style.zIndex = 100;
    // document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

 //    var axisHelper = new THREE.GridHelper(5000,100);
 //    scene.add(axisHelper);
	// scene.add(new THREE.AxesHelper(5000));
	start();

	requestAnimationFrame(render);
}
function start(){
	basicpoints=[
		// [0,0,0],
		// [-3030,3050,3580],
		// [-5280,1720,3540],
		// [-7250,3230,730],
	 //    [-6050,6090,-490],
	 //    [-2530,4740,-4110],
	 //    [1090,6850,-4210],
	 //    [5390,4760,-1640],
	 //    [7280,2190,90],
	 //    [5300,1060,3590],
	 //    [2370,1860,4060],
	 //    [0,0,0],
		[-350,143,-800],
		[-161,-91,-958],
	    [642,213,-812],
		[801,84,-284],
		[544,-102,692],
		[-293,52,874],
		[-670,219,432],
		[-940,93,386],
		[-927,368,-174],
		[-350,143,-800],
	]; 
	basicpoints=basicpoints.reverse();
	ptgeometry =  new THREE.SphereGeometry(6, 6, 6);//粒子线条数量
	ptgeometry.center();
	sceneinit();
	loadObject();
}
function posrandom(i){
	var now=new Date();
    var ran=now.getSeconds();
    var num=(Math.random(1,200)*ran-Math.random(1,80)*ran)*i;
    return num;
}
function sceneinit(){
	bigparticles = new THREE.Group();
	var colors=[
		["rgba(255,255,255,1)","rgba(0,255,140,1)","rgba(0,100,64,1)","rgba(0,0,0,1)"],
		["rgba(255,255,255,1)","rgba(0,255,255,1)","rgba(0,0,64,1)","rgba(0,0,0,1)"],
		["rgba(255,255,255,1)","rgba(250,0,140,1)","rgba(100,0,64,1)","rgba(0,0,0,1)"],
		["rgba(255,255,255,1)","rgba(250,120,0,1)","rgba(100,50,0,1)","rgba(0,0,0,1)"],
	];
	var textureLoader = new THREE.TextureLoader();
	var mapDot = textureLoader.load('img/light2.png');  // 圆点
	var newmoonmaterial=new THREE.SpriteMaterial( {
		map: mapDot,
		blending: THREE.AdditiveBlending,
	});
    var evematerial = new THREE.SpriteMaterial( {
        map: new THREE.CanvasTexture( generateSprite(["rgba(255,255,255,1)","rgba(255,255,255,1)","rgba(255,255,255,1)","rgba(0,0,0,1)"],[0,0.2,0.3,1])),
        blending: THREE.AdditiveBlending
    } );
	ptgeometry.vertices.forEach(function (e, i, arr) {
		var pos=e.clone();
		createMoon(pos,colors[i%4]);//头部的光球
		var points=[
		];
		for(var j=0;j<basicpoints.length;j++)
		{
			var newpos = new THREE.Vector3(pos.x+posrandom(i),pos.y+posrandom(i),pos.z+posrandom(i));
			points.push(new THREE.Vector3(newpos.x+basicpoints[j][0],newpos.y+basicpoints[j][1],newpos.z+basicpoints[j][2]));
		}
		var line = new THREE.CatmullRomCurve3(points);

		curveline.push(line);

		var pts=line.getPoints(150);//粒子线条长度,每根线条上的粒子数量拼凑的
		var spritegroup=[];
		var moon;
		var av=ifselect(pts.length);
		// var geometry = new THREE.Geometry();
		// geometry.vertices=pts;
		// var material = new THREE.LineBasicMaterial( { color:0xffffff } );
		// var splineObject = new THREE.Line( geometry, material );
		// scene.add(splineObject);

		for(var i=0;i<pts.length;i++)
		{
			moon=new THREE.Sprite( newmoonmaterial );
			moon.position.set(0,0,0);
			moon.scale.set(10,10,10);
			if(av.indexOf(i)>-1)
			{
				moon.scale.set(15,15,15);
			}
			spritegroup.push(moon);
			scene.add(moon);
		}
		taillines.push(spritegroup);
	})
    for ( var i = 0; i < 1000; i++ ) {
        Eveparticle = new THREE.Sprite( evematerial );
        Eveparticle.position.set(Math.random() * 4000 - 2000, Math.random() * 1000-300,Math.random() * 4000 - 2000);
        initParticle( Eveparticle,i);

        scene.add( Eveparticle );
    }
    for(var i=0;i<10;i++)
    {
    	var sp=new THREE.Sprite(newmoonmaterial);
		sp.scale.set( 40, 40, 40 );
		initbigParticle(sp,i*10);
		bigparticles.add(sp);
    }
    scene.add(bigparticles);
}
function initParticle( particle, delay ) {
    var particle = this instanceof THREE.Sprite ? this : particle;
    var delay = delay !== undefined ? delay : 0;
    particle.scale.x = particle.scale.y = Math.random() * 16 + 5;
    new TWEEN.Tween( particle )
        .delay( delay )
        .to( {}, 20000 )
        .onComplete( initParticle )
        .start();

    new TWEEN.Tween( particle.position )
        .delay( delay)
        .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 20000 )
        .start();
}
function initbigParticle( particle, delay ) {
    var particle = this instanceof THREE.Sprite ? this : particle;
    var delay = delay !== undefined ? delay : 0;
    particle.scale.x = particle.scale.y = Math.random() * 16 + 5;
    new TWEEN.Tween( particle )
        .delay( delay )
        .to( {}, 10000 )
        .onComplete( initbigParticle )
        .start();
    new TWEEN.Tween( particle.position )
        .delay( delay)
        .to( { x: camera.position.x+Math.random() * -100, y: camera.position.y+Math.random() * 50, z:camera.position.z+Math.random() * -100 }, 10000 )
        .start();
}
function ifselect(length){
  var tempmax = parseInt(Math.random() * 2) + 2;
  var originalArray = new Array();
  for (var i = 0; i < length; i++) {
    originalArray[i] = i;
  }
  originalArray.sort(function () { return 0.5 - Math.random(); });
  return originalArray.slice(0, tempmax);
}
function createMoon(pos,color) {
	var moonmaterial=new THREE.SpriteMaterial( {
		map: new THREE.CanvasTexture( generateSprite(color,[0,0.2,0.4,1])),
		blending: THREE.AdditiveBlending,
	});
	var moon=new THREE.Sprite( moonmaterial );
	moon.position.x = pos.x;
	moon.position.y = pos.y;
	moon.position.z = pos.z;
	moon.scale.set(20,20,20);
	scene.add(moon);
	moonlist.push(moon);
}
function particlego(){
	startchange=false;
	for(var i=0;i<curveline.length;i++)
	{
		var pos=curveline[i].getPointAt(perc%1);
		linego(pos,i);
	}
}
function moongo(){
	var pc=perc%1;
	for(var i=0;i<curveline.length;i++)
	{
		var pos=curveline[i].getPointAt(pc);
		moonlist[i].position.copy(pos);
	}
}
function linego(poses,j){
	var length=taillines[j].length;
	taillines[j][length-1].position.copy(poses);
	for(var i=0;i<length-1;i++)
	{
		taillines[j][i].position.copy(taillines[j][i+1].position);
	}
}
function generateSprite(colors,poses) {
	var canvas = document.createElement( 'canvas' );
	canvas.width = 64;
	canvas.height = 64;
	var context = canvas.getContext( '2d' );
	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width/2 );
	for(var i=0;i<colors.length;i++)
	{
		gradient.addColorStop(poses[i],colors[i]);
	}
	context.fillStyle = gradient;
	context.fillRect( 0, 0, canvas.width, canvas.height );
	return canvas;
}
function loadObject() {
    var loader = new THREE.JSONLoader();
    loader.load('model/head.js', function (geo, materials) {
        geo.center();
        geo.normalize();
        geo.scale(500, 500, 500);
        modellist.push(geo)
        geo.position=new THREE.Vector3(0,0,0);
    })
    loader.load('model/book.js', function (geo, materials) {
        geo.center();
        geo.normalize();
        geo.scale(500, 500, 500)
        modellist.push(geo)
        geo.position=new THREE.Vector3(0,0,0);
    })
    loader.load('model/game.js', function (geo, materials) {
        geo.center();
        geo.normalize();
        geo.scale(500, 500, 500)
        geo.rotateY(-Math.PI / 2);
        modellist.push(geo);
        geo.position=new THREE.Vector3(0,0,0);
    })
    loader.load('model/movie.js', function (geo, materials) {
        geo.center();
        geo.normalize();
        geo.scale(500, 500, 500);
        geo.rotateX(Math.PI / 2);
        modellist.push(geo)
        geo.position=new THREE.Vector3(0,0,0);
    })
    loader.load('model/kv.js', function (geo, materials) {
        geo.center();
        geo.normalize();
        geo.scale(500, 500, 500)
        modellist.push(geo)
        geo.position=new THREE.Vector3(0,0,0);
    })
}
function tweenObj(index) {
	var length = modellist[index].vertices.length;
	for(var i=0;i<taillines.length;i++)
	{
		for(var j=0;j<taillines[i].length;j++)
		{
			var poi = modellist[index].vertices[(i*taillines[i].length+j) % length];
			new TWEEN.Tween(taillines[i][j].position).to({
                x: poi.x,
                y: poi.y,
                z: poi.z
            }, 1000).easing(TWEEN.Easing.Exponential.In).delay(1000 * Math.random()).start();
            new TWEEN.Tween(taillines[i][j].scale).to({
                x: 10,
                y: 10,
                z: 10
            }, 1000).easing(TWEEN.Easing.Exponential.In).delay(1000 * Math.random()).start();
		}
	}
	for(var i=0;i<moonlist.length;i++)
	{
		var poi = modellist[index].vertices[(i % length)*3];
		new TWEEN.Tween(moonlist[i].position).to({
            x: poi.x,
            y: poi.y,
            z: poi.z
        }, 1000).easing(TWEEN.Easing.Exponential.In).delay(1000 * Math.random()).start();
        new TWEEN.Tween(moonlist[i].scale).to({
                x: 10,
                y: 10,
                z: 10
        }, 1000).easing(TWEEN.Easing.Exponential.In).delay(1000 * Math.random()).start();
	}
}
/*special control*/
var modelindex=0;
var step=1;
var mouseX=0;
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();
var selectedObject = null;
var textureLoader = new THREE.TextureLoader();
var mapDot1 = new THREE.CanvasTexture( generateSprite(["rgba(255,255,255,1)","rgba(250,120,0,1)","rgba(100,50,0,1)","rgba(0,0,0,1)"],[0,0.2,0.3,1]));  // 圆点
var mapDot2 = textureLoader.load('img/light2.png');
var newmoonmaterial=new THREE.SpriteMaterial( {
	map: mapDot1,
	blending: THREE.AdditiveBlending,
});
var oldmoonmaterial=new THREE.SpriteMaterial( {
	map: mapDot2,
	blending: THREE.AdditiveBlending,
});
function particlesizeinit(){
	for(var i=0;i<taillines.length;i++)
	{
		var av=ifselect(taillines[i].length);
		for(var j=0;j<taillines[i].length;j++)
		{
			var size=10;
			if(av.indexOf(j)>-1)
			{
				size=15;
			}
            new TWEEN.Tween(taillines[i][j].scale).to({
                x: size,
                y: size,
                z: size
            }, 1000).easing(TWEEN.Easing.Exponential.In).delay(1000 * Math.random()).start();
		}
	}
	for(var i=0;i<moonlist.length;i++)
	{
        new TWEEN.Tween(moonlist[i].scale).to({
                x: 20,
                y: 20,
                z: 20
        }, 1000).easing(TWEEN.Easing.Exponential.In).delay(1000 * Math.random()).start();
	}
}
function objchange(){
	tweenObj(modelindex%5);
}
function slidemodel(index){
	startchange=false;
	step+=1;
	particlesizeinit();
	modelindex=index;
}
function nextmodel(){
	if(startchange==true)
	{
		startchange=false;
		step+=1;
		particlesizeinit();
	    modelindex++;
	}
}
function prevmodel(){
	if(startchange==true&&step<1)
	{
		startchange=false;
		step+=1;
		particlesizeinit();
		if(modelindex==0)
		{
			modelindex=5;
		}
	    modelindex--;
	}
}
function onDocumentMouseMove( event ) {
	if ( selectedObject ) {
		selectedObject.material=oldmoonmaterial;
		selectedObject.scale.set(selectedObject.scale.x/1.5,selectedObject.scale.y/1.5,selectedObject.scale.z/1.5);
		selectedObject = null;
	}
	mouseX = event.clientX - window.innerWidth / 2;
	var intersects = getIntersects( event.layerX, event.layerY );
	if ( intersects.length > 0 ) {

		var res = intersects.filter( function ( res ) {

			return res && res.object;

		} )[ 0 ];

		if ( res && res.object ) {
			selectedObject = res.object;
			selectedObject.material=newmoonmaterial;
			selectedObject.scale.set(selectedObject.scale.x*1.5,selectedObject.scale.y*1.5,selectedObject.scale.z*1.5);
		}

	}
}
function getIntersects( x, y ) {

	x = ( x / window.innerWidth ) * 2 - 1;
	y = - ( y / window.innerHeight ) * 2 + 1;

	mouseVector.set( x, y, 0.5 );
	raycaster.setFromCamera( mouseVector, camera );

	return raycaster.intersectObject( bigparticles, true );

}//射线检测鼠标是否接触到大的光点
render = function () {
	TWEEN.update();
	if(perc<step)
	{
		perc+=0.001;
		moongo();
		particlego();
		camera.lookAt(moonlist[0].position);
		var pc=0.5+perc;
		var pos=curveline[0].getPointAt(pc%1);
		camera.position.set(pos.x,camera.position.y,pos.z);
	}else{
		if(startchange==false)
		{
			camera.lookAt(moonlist[0].position.lerp(modellist[modelindex%5].position,0.01));
			startchange=true;
			objchange();
		}
	}
	if(startchange==true)
	{
		camera.position.x += ( mouseX - camera.position.x ) * 0.003;
	}
    renderer.render(scene, camera); // 渲染场景Sprite
    requestAnimationFrame(render);
    render_stats.update();
};
document.addEventListener("mousemove", onDocumentMouseMove, false );