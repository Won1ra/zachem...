//Endless
//Glory to the Luna and New Lunar Republic!

'use strict';

let canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d'),

	width = window.outerWidth,
	height = window.innerHeight,
	border = height - 50,

	worldX = null,
	worldY = null,

	mouseDown = false,

	speed = 100,
	pixels = [],
	layers = new Array(width);

//PALETTE
let palette = {
	elems : document.getElementsByClassName('color'),
	colors : [],

	_selectedColorID : null,
	get selectedColorID(){return this._selectedColorID},
	set selectedColorID(id){this._selectedColorID=id;this._selectedColorRGB=this.getColorById(id)},

	_selectedColorRGB : null,
	get selectedColorRGB(){return this._selectedColorRGB},
	set selectedColorRGB(rgb){this._selectedColorRGB=rgb;this._selectedColorID=this.getIdByColor(rgb)},

	getColorById : function(id){return this.colors[id] || null},
	getIdByColor : function(rgb){
		for(let i=0;i<this.colors.length;i++) {
			let palClr = this.colors[i];
			if(palClr[0]===rgb[0] && palClr[1]===rgb[1] && palClr[2]===rgb[2]) return i;
		};
		return null;
	}
};
palette.selectedColorID = 0;
for(let i=0;i<palette.elems.length;i++) {
	let e = palette.elems[i];
	palette.colors.push(e.style.backgroundColor.match(/-?\d+/g).map(x=>+x));
	e.onclick = () => selectColor(i);
};
selectColor(palette.selectedColorID);
console.log(palette.colors.join('\n'));
//>------------------------------------------------

//CANVAS
canvas.width=width; canvas.height=height;
let imageData = ctx.getImageData(0,0,width,height),
	data = imageData.data;
for(let i=3;i<width*height<<2;i+=4) data[i]=255;
ctx.putImageData(imageData,0,0);
//>------------------------------------------------

//PIXELS
for(let i=0;i<width;i++) layers[i]=border;
//>------------------------------------------------

//LISTENERS
canvas.onmousemove = e => {
	if(!mouseDown) return;
	let lastX = worldX,
		lastY = worldY;
	worldX = e.clientX;
	worldY = e.clientY;

	let pixelsCount = 5;

	let stepX = Math.abs(lastX-worldX)/pixelsCount,
		stepY = Math.abs(lastY-worldY)/pixelsCount;

	for(let i=0;i<pixelsCount;i++){
		let x = ~~(lastX+stepX*i),
			y = ~~(lastY+stepY*i);
		if(y<layers[x]) addPxls(x,y,1,4);
	};
};

canvas.onmousedown = e => {mouseDown=true; worldX=e.clientX; worldY=e.clientY};
window.onblur = canvas.onmouseleave = canvas.onmouseup = () => mouseDown = false;

document.getElementById('clear').onclick = () => {
	pixels = [];
	for(let i=0;i<width*height<<2;i+=4) data[i]=data[i+1]=data[i+2]=0,data[i+3]=255;
	ctx.putImageData(imageData,0,0);
	for(let i=0;i<width;i++) layers[i]=border;
};
//>------------------------------------------------

//FUNCTIONS
function addPxls(x,y,count=500,range=500){
	main : for(let i=0;i<count;i++){
		let last = pixels.length;
		pixels.push({
			x:x+rand(-range,range),
			y:y+rand(-range,range),
			rgb: palette._selectedColorRGB
		});
		if(pixels[last].y>=layers[pixels[last].x]) {
			pixels.splice(last,1);
			count--;
			continue main
		};
		sub : for(let j=1;j<i;j++)
			if(pixels[last].x==pixels[last-j].x && pixels[last].y==pixels[last-j].y) {
				i--;
				pixels.unshift();
				break sub
			};
	};
};

function rand(a, b) {return Math.round(a-.5+Math.random()*(b-a+1))};

function getPxl(x,y){
	let c=x + y*width << 2;
	return [data[c],data[c+1],data[c+2]];
};

function setPxl(x,y,rgb){
	let c=x + y*width << 2;
	[data[c],data[c+1],data[c+2]] = [...rgb];
};

function selectColor(id){
	let selectedElem = palette.elems[palette.selectedColorID];
	selectedElem.childNodes.length && selectedElem.childNodes[0].remove();

	palette.selectedColorID = id;

	let selector = document.createElement('div'), s = selector.style,
		radius = 5;
	s.position = 'relative';
    s.marginLeft = selector.style.marginRight = 'auto';
	s.width = selector.style.height = radius*2+'px';
    s.top = selectedElem.offsetHeight/2-radius+'px';
    s.borderRadius = radius+'px';
    let rgb = palette.elems[id].style.backgroundColor.match(/-?\d+/g).map(x=>+x);
	if(rgb[0]==125 && rgb[1]===125 && rgb[2]===125) selector.style.backgroundColor = `rgb(20,230,230)`;
	else selector.style.backgroundColor = `rgb(${255-rgb[0]},${255-rgb[1]},${255-rgb[2]})`;

	palette.elems[id].appendChild(selector);
};

(function listener(){
	if(pixels.length){
		for(let i=0,len=pixels.length;i<len;i++){
			let pxl = pixels[i];
			setPxl(pxl.x,pxl.y,[0,0,0]);
			if(pxl.y+speed>=layers[pxl.x]){
				setPxl(pxl.x,layers[pxl.x],pxl.rgb);
				pixels.splice(i,1);
				i--;len--;layers[pxl.x]--;
			} else {
				pxl.y+=speed;
				setPxl(pxl.x,pxl.y,pxl.rgb);
			};
		};
		ctx.putImageData(imageData,0,0);
	};
	if(mouseDown && worldY<layers[worldX]) addPxls(worldX,worldY);
	window.requestAnimationFrame(listener);
})();