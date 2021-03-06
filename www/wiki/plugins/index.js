$(function(){
	var map = L.map('map');
	var china = [37.899050079360935, 102.83203125];
	map.setView(china,5);
	var myIcon = L.divIcon({className:"div-icon"});
	var positionData = {
		leftBottom:{lat:37.899050079360935,lng:102.83203125},
		rightTop:{lat:38.00000,lng:102.933333}
	}
	var marker,leftTop,leftBottom,rightTop,rightBottom;
	var corner1,corner2,bounds,rec,ids={};
	var count = 1;
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	  }).addTo(map);
		function drawRec(e){
			var c1 = L.latLng(e.latlng);
			var c2 = L.latLng(e.oldLatLng);
			var bound = L.latLngBounds(c1, c2);
			if(rec != undefined && rec != null){
				rec.setBounds(bound)
			}else{
				rec = L.rectangle(bound, {color: "#f00", weight: 1}).addTo(map);
			}
			// setMarker();
			marker.on('dragend',setMarker());
		}
		function createMarker(e){
			marker = L.marker(e.latlng,{icon:myIcon,draggable:true}).addTo(map);
			marker.on("drag",drawRec);
		}
		//创建绘制控件
		L.Control.Draw = L.Control.extend({
			options:{
				position:"topright"
			},
			onAdd:function(map){
				var container = L.DomUtil.create('div','draw-btn');
				var options = this.options;
				container.innerText = "绘制";
				container.onclick = this._click;
				return container;

			},
			_click:function(e){
				e.stopPropagation();
				if(count){
					map.on('click',setMarker);
					e.target.innerText = '完成绘制';
				}else {
					e.target.innerText == '绘制';
					count = 1;
				}

			}
		})
		L.control.draw = function(options){
			return new L.Control.Draw(options);
		}
		L.control.draw().addTo(map);
	//移动时计算坐标
	function move(e){
		var position = rec.getBounds();
		var data = {} ;
		console.log(position);
		// console.log(e);
		if(e.target._leaflet_id == ids.leftTop){
			console.log('左上')
			data.rightTop = {lat:e.latlng.lat,lng:position._northEast.lng};
			data.leftBottom = {lat:position._southWest.lat,lng:e.latlng.lng};
		}else if(e.target._leaflet_id == ids.leftBottom){
			console.log('左下')
			data.leftBottom = e.latlng;
			data.rightTop = position._northEast;
		}else if(e.target._leaflet_id == ids.rightTop){
			console.log('右上')
			data.rightTop = {lat:e.latlng.lat,lng:e.latlng.lng};
			data.leftBottom = position._southWest;

		}else if(e.target._leaflet_id == ids.rightBottom){
			console.log('右下')
			data.rightTop = {lat:position._northEast.lat,lng:e.latlng.lng};
			data.leftBottom = {lat:e.latlng.lat,lng:position._southWest.lng};

		}
		reDraw(data);
	}
		 function setMarker(e){
			//  if(marker != undefined && marker != null){
			// 	 marker.remove();
			//  }
			if(count){
				corner1 = L.latLng(e.latlng.lat,e.latlng.lng)
				corner2 = L.latLng(e.latlng.lat, e.latlng.lng);
				bounds = L.latLngBounds(corner1, corner2);
				rec = L.rectangle(bounds, {color: "#f00", weight: 1}).addTo(map);
				var positionData = rec.getBounds();
				positionData.leftBottom = positionData._southWest;
				positionData.rightTop = positionData._northEast;
				leftTop = L.marker([positionData.rightTop.lat, positionData.leftBottom.lng], {icon: myIcon,draggable:true}).addTo(map);
				leftBottom = L.marker([positionData.leftBottom.lat,positionData.leftBottom.lng], {icon: myIcon,draggable:true}).addTo(map);
				rightTop = L.marker([positionData.rightTop.lat,positionData.rightTop.lng], {icon: myIcon,draggable:true}).addTo(map);
				rightBottom = L.marker([positionData.leftBottom.lat, positionData.rightTop.lng], {icon: myIcon,draggable:true}).addTo(map);
				ids = {
					leftTop:leftTop._leaflet_id,
					leftBottom:leftBottom._leaflet_id,
					rightTop:rightTop._leaflet_id,
					rightBottom:rightBottom._leaflet_id,

				}
				count = 0;
			}
			leftTop.on('drag',move);
			leftBottom.on('drag',move);
			rightTop.on('drag',move);
			rightBottom.on('drag',move);
		}
		//重新绘制地图
		function reDraw(data){

			corner1 = L.latLng(data.leftBottom.lat,data.leftBottom.lng)
			corner2 = L.latLng(data.rightTop.lat, data.rightTop.lng);
			bounds = L.latLngBounds(corner1, corner2);
			// leftTop = L.marker([data.rightTop.lat, data.leftBottom.lng], {icon: myIcon}).addTo(map);
			// leftBottom = L.marker([data.leftBottom.lat,data.leftBottom.lng], {icon: myIcon}).addTo(map);
			// rightTop = L.marker([data.rightTop.lat,data.rightTop.lng], {icon: myIcon}).addTo(map);
			// rightBottom = L.marker([data.leftBottom.lat, data.rightTop.lng], {icon: myIcon}).addTo(map);
			leftTop.setLatLng([data.rightTop.lat, data.leftBottom.lng]);
			leftBottom.setLatLng([data.leftBottom.lat,data.leftBottom.lng]);
			rightTop.setLatLng([data.rightTop.lat,data.rightTop.lng]);
			rightBottom.setLatLng([data.leftBottom.lat,data.rightTop.lng]);
			rec.setBounds(bounds);

		}
})
