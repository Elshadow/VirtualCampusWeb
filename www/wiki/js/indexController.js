app.controller('indexCtrl', function ($scope,$auth,Account,$state) {
    // 判断用户是否已经登录,如果未登录自动跳转到登录页面
    // if (Account.isAuthenticated()) {
    //     $state.go("login");
    // }
    $scope.flag = false;
    $scope.alert = false;
    $scope.confirm = false;
    $scope.searchName=[];
    $scope.currentName=[];
    $scope.title = "";
    $scope.confirmtitle = "";
    // $scope.delete = false;
    if (!Account.isAuthenticated()) {
        $state.go("login");
    }
    $scope.schoolName = "";
    var map = L.map('map',{
        zoomControl:false
    });
    var china = [37.899050079360935, 102.83203125];
    // map.setView(china,4);

    // map.locationfound = function(e){
    //     console.log(e);
    // }
    var myIcon = L.divIcon({className:"div-icon"});
    // var positionData = {
    //     leftBottom:{lat:37.899050079360935,lng:102.83203125},
    //     rightTop:{lat:38.00000,lng:102.933333}
    // }
    var marker,leftTop,leftBottom,rightTop,rightBottom;
    var corner1,corner2,bounds,rec,ids={},drawCtrl;
    var count = 1;
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    L.control.scale().addTo(map);
    L.control.zoom({
        position:"bottomright"
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
        }
        function createMarker(e){
            marker = L.marker(e.latlng,{icon:myIcon,draggable:true}).addTo(map);
            marker.on("drag",drawRec);
        }
        //创建搜索控件
        L.Control.Search = L.Control.extend({
            options:{
                position:"topleft"
            },
            onAdd:function(map){
                var container = L.DomUtil.create('div','search-ctrl');
                var options = this.options;
                var input = L.DomUtil.create('input','search-ctrl-inp');
                input.placeholder = "请输入地点";
                var button =L.DomUtil.create('img','search-ctrl-btn');
                button.src = "./wiki/assets/images/search.png"
                input.onkeydown = this._find;
                button.onclick = this._search;
                container.appendChild(input);
                container.appendChild(button);
                if (L.DomEvent) {
                    L.DomEvent.disableClickPropagation(container);
                }
                return container;

            },
            _find:function(e){
                if(e.which == 13){
                    console.log(13);
                    var data = e.target.value;
                    searchPosition(data);

                }
            },
            _search:function(e){
                var data = document.getElementsByClassName('search-ctrl-inp')[0].value;
                searchPosition(data);
            }
        })
        L.control.search = function(options){
            return new L.Control.Search(options);
        }
        L.control.search().addTo(map);
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
                if (L.DomEvent) {
                    L.DomEvent.disableClickPropagation(container);
                }
                return container;

            },
            _click:function(e){
                e.stopPropagation();
                if(count){
                    if(rec){
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
                        leftTop.on('drag',move);
                        leftBottom.on('drag',move);
                        rightTop.on('drag',move);
                        rightBottom.on('drag',move);

                    }else{
                        map.on('click',setMarker);
                    }
                    $scope.flag = true;
                    $scope.$apply();
                    e.target.innerText = '完成绘制';
                }else {
                    
                    var latlng = rec.getBounds();
                    // console.log($scope.latlng);
                    var params = {
                        schoolName:$scope.schoolName,
                        _id:$scope.id,
                        northWestLat:latlng._northEast.lat,
                        norhtWestLng:latlng._southWest.lng,
                        northEastLat:latlng._northEast.lat,
                        northEastLng:latlng._northEast.lng,
                        southWestLat:latlng._southWest.lat,
                        southWestLng:latlng._southWest.lng,
                        southEastLat:latlng._southWest.lat,
                        southEastLng:latlng._northEast.lng,
                    }
                    util.http("put", config.apiUrlPrefix + 'school', params, function (data) {
                        // console.log(data);
                        // location.reload(true);
                        getSchool();
                        e.target.innerText = '绘制';
                        $scope.flag = false;
                        leftTop.remove();
                        leftBottom.remove();
                        rightTop.remove();
                        rightBottom.remove();
                        // $scope.$apply();

                    }, function (error) {
                        $scope.errMsg = error.message;
                    });
                    count = 1;
                   
                    
                }

            }
        })
        L.control.draw = function(options){
            return new L.Control.Draw(options);
        }
        
    //移动时计算坐标
    function move(e){
        var position = rec.getBounds();
        var data = {} ;
        // console.log(position);
        // console.log(e);
        if(e.target._leaflet_id == ids.leftTop){
            // console.log('左上')
            data.rightTop = {lat:e.latlng.lat,lng:position._northEast.lng};
            data.leftBottom = {lat:position._southWest.lat,lng:e.latlng.lng};
        }else if(e.target._leaflet_id == ids.leftBottom){
            // console.log('左下')
            data.leftBottom = e.latlng;
            data.rightTop = position._northEast;
        }else if(e.target._leaflet_id == ids.rightTop){
            // console.log('右上')
            data.rightTop = {lat:e.latlng.lat,lng:e.latlng.lng};
            data.leftBottom = position._southWest;

        }else if(e.target._leaflet_id == ids.rightBottom){
            // console.log('右下')
            data.rightTop = {lat:position._northEast.lat,lng:e.latlng.lng};
            data.leftBottom = {lat:e.latlng.lat,lng:position._southWest.lng};

        }
        reDraw(data);
    }
         function setMarker(e){
            //  if(marker != undefined && marker != null){
            //   marker.remove();
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
        // console.log($auth.getToken());
        // console.log(Account);
        function getSchool(){
                var params = {

                }
                util.http("get", config.apiUrlPrefix + 'school', params, function (data) {
                    // $auth.setToken(data.token);
                    // Account.setUser(data.userInfo);

                    // console.log("登录成功");
                    // 跳转地图页面
                    // $state.go("index");
                    $scope.items = data;
                    $scope.all = data;
                    // $scope.all.map(function(item,index){
                    //     $scope.searchName.push(data[index].schoolName);
                    // })
                    // console.log($scope.searchName);

                }, function (error) {
                    $scope.errMsg = error.message;
                });
            }
            getSchool();
    $scope.hideAlert = function(){
        $scope.alert = false;
        // $scope.$apply();
    }
    //新增学校
    $scope.addUniversity = function(){
        // console.log($scope.uniName)
        if($scope.uniName != null && $scope.uniName != "" && typeof($scope.uniName) != "undefined"){
            // var str = $scope.uniName.replace(/\s+/g, "")
            var params = {
                schoolName:$scope.uniName
            }
            util.http("put", config.apiUrlPrefix + 'school/new', params, function (data) {
                    location.reload();
            }, function (error) {
                $scope.errMsg = error.message;
                $scope.alert = true;
                $scope.title = error.message;
                // $scope.$apply();
            });
        }else{
            $scope.alert = true;
            $scope.title = "学校名称不能为空";
        }
        
    }
    $scope.editUni = function(e){
        for(var i = 0;i<e.target.parentNode.children.length;i++){
            e.target.parentNode.children[i].style.background = "#eee";
        }
        e.target.style.background = "#999";
        var latlng = JSON.parse(e.target.attributes.latlng.nodeValue);
        $scope.id = latlng._id;
        $scope.schoolName = latlng.schoolName;
        if(latlng.norhtWestLng){
            var c1 = L.latLng(latlng.southWestLat,latlng.southWestLng);
            var c2 = L.latLng(latlng.northEastLat,latlng.northEastLng);
            var bound = L.latLngBounds(c1, c2);
            if(rec){
                rec.setBounds(bound);
            }else{
                rec = L.rectangle(bound, {color: "#f00", weight: 1}).addTo(map);
            }
            map.fitBounds(bound);

        }else{
            if(rec){
                rec.remove();
                rec = '';
            }
            searchPosition(latlng.schoolName);
        }
        if(!drawCtrl){
            drawCtrl = L.control.draw().addTo(map);
        }
        
    }
    $scope.searchInp = function(e){
        if(e.which == 13){
            var data = e.target.value;
            if(data == undefined || data == ""){
                $scope.items = $scope.all;
            }else{
                searchSchool(data)
            }
                
        }
    }
    $scope.searchIcon = function(data){
        if(data == undefined || data == ""){
            $scope.items = $scope.all;
        }else{
            searchSchool(data)
        }
        
        // searchSchool(data);
    }
    function searchSchool(data){
        if(data != null && data != "" && typeof(data) != "undefined"){
            $scope.currentName = [];
            $scope.all.map(function(item,i){
                if(item.schoolName&&item.schoolName.indexOf(data)>=0){
                    $scope.currentName.push(item);
                    // console.log($scope.currentName);
                    
                }
            })
            $scope.items = $scope.currentName;
            console.log($scope.items)
        }else{
            $scope.alert = true;
            $scope.title = "学校名称不能为空";
        }
        
    }

    function searchPosition(data){
        var params = {
            q: data,
            format: "json",
            polygon_geojson: 1,
            addressdetails: 1,
            countrycodes: "cn",
            limit: 1
        }
        util.http("get", "http://nominatim.openstreetmap.org/search", params, function (data) {
            // console.log(data[0].lat)
            if (data && data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                var searchPos = [lat, lon];
                map.setView(searchPos, 17);
            }else{
                $scope.alert = true;
                $scope.title = "查询不到该地址";
            }
        }, function (error) {
            $scope.alert = true;
            $scope.title = "查询地址信息失败";
        });
    }
    $scope.moveover = function(e){
        console.log(e);
        // e.stopPropagation();
        e.target.children[0].style.display = 'inline';

    }
    $scope.moveout = function(e){
        // e.stopPropagation();
        e.target.children[0].style.display = 'none';
    }
    $scope.over = function(e){
        // e.stopPropagation();
        e.target.style.display = 'inline';
    }
    $scope.out = function(e){
        e.target.style.display = 'none';
    }
    $scope.delete = function(e){
        $scope.confirmtitle = "你确定删除?";
        $scope.confirm = true;
        $scope.deleteId = JSON.parse(e.target.parentElement.attributes.latlng.nodeValue)._id;
    }
    $scope.sureDelete = function(e){
            // var id = JSON.parse(e.target.parentElement.attributes.latlng.nodeValue)._id;
            var params = {
                schoolId:$scope.deleteId

            }
            util.http("put", config.apiUrlPrefix + 'school/deleteById', params, function (data) {
                        location.reload();
                    }, function (error) {
                        $scope.errMsg = error.message;
                        $scope.alert = true;
                        $scope.title = error.message;
                        // $scope.$apply();
            });
    }
    $scope.hideConfirm = function(){
        $scope.confirm = false;
    }
    var locate = map.locate({
        timeout:0
    });
    locate.on('locationfound',locationfound);
    locate.on('locationerror',locationerror);
    function locationfound(e){
        map.setView([e.latlng.lat,e.latlng.lng],15);
    }
    function locationerror(e){
        $scope.alert = true;
        $scope.title = "获取当前位置信息失败";
        map.setView(china,4);
    }
});