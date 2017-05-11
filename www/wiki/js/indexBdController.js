app.controller('indexBdCtrl', function ($scope,$auth,Account,$state) {
    // 判断用户是否已经登录,如果未登录自动跳转到登录页面
    // if (Account.isAuthenticated()) {
    //     $state.go("login");
    // }
    $scope.flag = false;
    $scope.alert = false;
    $scope.confirm = false;
    $scope.add = false;
    $scope.searchName=[];
    $scope.currentName=[];
    $scope.title = "";
    $scope.confirmtitle = "";
    var city = "";
    // $scope.delete = false;
    if (!Account.isAuthenticated()) {
        $state.go("login");
    }
    $scope.schoolName = "";
    // 是否允许更新操作flag
    $scope.updateFlag = false;

    var chinaLat = 37.899050079360935;
    var chinaLng = 102.83203125;
    var map = new BMap.Map("map");  // 创建地图实例  
    var point = new BMap.Point(chinaLng, chinaLat); // 创建点坐标  
    map.centerAndZoom(point, 15);   // 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true);    //开启鼠标滚轮缩放
    var bottom_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM});   //右下角，仅包含缩放按钮
    // 添加缩放按钮控件
    map.addControl(bottom_right_navigation);

    // 添加定位控件
    // var geolocationControl = new BMap.GeolocationControl();
    // geolocationControl.addEventListener("locationSuccess", function(e){
    //     // 定位成功事件
    //     var address = '';
    //         address += e.addressComponent.province;
    //         address += e.addressComponent.city;
    //         address += e.addressComponent.district;
    //         address += e.addressComponent.street;
    //         address += e.addressComponent.streetNumber;
    //     alert("当前定位地址为：" + address);
    //     });
    // geolocationControl.addEventListener("locationError",function(e){
    //     // 定位失败事件
    //     alert(e.message);
    // });
    // map.addControl(geolocationControl);

    // 添加城市列表控件
    map.addControl(new BMap.CityListControl({
        anchor: BMAP_ANCHOR_TOP_RIGHT,
        offset: new BMap.Size(10, 10)
    }));

    function searchPosition(keyword){
        if (typeof(keyword) != "undefined" && keyword != null && $.trim(keyword) != "") {
            var options = {
                onSearchComplete: function(results){
                    // 判断状态是否正确
                    if (local.getStatus() == BMAP_STATUS_SUCCESS){
                        var s = [];
                        for (var i = 0; i < results.getCurrentNumPois(); i ++){
                            s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
                            // console.log(results.getPoi(i))
                            map.centerAndZoom(results.getPoi(i).point, 15);
                            break;
                        }
                    }else{
                        $scope.alert = true;
                        $scope.title = "查询地址信息失败";
                    }
                }
            };
            var local = new BMap.LocalSearch(map, options);
            local.search(keyword);
        }else{
            $scope.alert = true;
            $scope.title = "查询地点不允许为空";
        }
    }

    var blueIcon = new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
        scale: 1,//图标缩放大小
        fillColor: "blue",//填充颜色
        fillOpacity: 0.8//填充透明度
    });

    var redIcon = new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
        scale: 1,//图标缩放大小
        fillColor: "red",//填充颜色
        fillOpacity: 0.8//填充透明度
    });

    // //设置marker图标为水滴
    // var vectorMarker = new BMap.Marker(new BMap.Point(chinaLng,chinaLat), {
    //   // 指定Marker的icon属性为Symbol
    //   icon: blueIcon
    // });
    // map.addOverlay(vectorMarker);

    // 定义一个搜索控件类,即function
    function SearchControl(){
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
        this.defaultOffset = new BMap.Size(10, 10);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    SearchControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    SearchControl.prototype.initialize = function(map){
      // 创建一个DOM元素
      var div = document.createElement("div");
      div.setAttribute("class","search-ctrl");
      var input = document.createElement("input");
      input.setAttribute("class","search-ctrl-inp");
      input.setAttribute("maxlength", "50");
      input.type = "text";
      input.placeholder = "请输入地点";
      var button = document.createElement("img");
      button.setAttribute("class","search-ctrl-btn");
      button.src = "./wiki/assets/images/search.png";
      div.appendChild(input);
      div.appendChild(button);
      // 文本框绑定回车键事件
      input.onkeydown = function(e){
        if(e.which == 13){
            var data = e.target.value;
            searchPosition(data);
        }
      }
      // 按钮绑定点击事件
      button.onclick = function(e){
        var data = document.getElementsByClassName('search-ctrl-inp')[0].value;
        searchPosition(data);
      }
      // 添加DOM元素到地图中
      map.getContainer().appendChild(div);
      // 将DOM元素返回
      return div;
    }
    // 创建控件
    var searchCtrl = new SearchControl();
    // 添加到地图当中
    map.addControl(searchCtrl);

    // 添加绘图功能实现
    var lastOverlay = null;
    var overlaycomplete = function(e){
        if (lastOverlay != null && typeof(lastOverlay) != "undefined") {
            // 如果新划设的矩形区域范围经纬度小于原有经纬度的话，则撤销当前所划设区域并提示
            var old_northEast = lastOverlay.po[1];
            var old_southWest = lastOverlay.po[3];

            var new_northEast = e.overlay.po[1];
            var new_southWest = e.overlay.po[3];
            if (new_southWest.lng >= old_southWest.lng || new_southWest.lat >= old_southWest.lat || new_northEast.lng <= old_northEast.lng || new_northEast.lat <= old_northEast.lat) {
                alert("新绘制矩形范围不允许小于等于原有矩形范围")
                map.removeOverlay(e.overlay);
            }else{
                // 如果矩形框已经存在的情况下，则从地图上清除该矩形框
                map.removeOverlay(lastOverlay);
                lastOverlay = e.overlay;
                drawingManager.close();
            }
        }else if ($scope.updateFlag == true) {
            lastOverlay = e.overlay;
        }
        // 设置矩形框可编辑
        // e.overlay.enableEditing();
        // console.log(e.overlay)
    };
    var styleOptions = {
        strokeColor:"black",    //边线颜色。
        fillColor:"orange",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.8,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    }
    //实例化鼠标绘制工具
    var drawingManager = new BMapLib.DrawingManager(map, {
        isOpen: false, //是否开启绘制模式
        enableDrawingTool: false, //是否显示工具栏
        drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
            offset: new BMap.Size(150, 10), //偏离值
            scale: 0.5,
            drawingModes: [BMAP_DRAWING_RECTANGLE]
        },
        circleOptions: styleOptions, //圆的样式
        polylineOptions: styleOptions, //线的样式
        polygonOptions: styleOptions, //多边形的样式
        rectangleOptions: styleOptions //矩形的样式
    });  
     //添加鼠标绘制工具监听事件，用于获取绘制结果
    drawingManager.addEventListener('overlaycomplete', overlaycomplete);

    // 定义一个绘制矩形控件类,即function
    function DrawControl(){
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
        this.defaultOffset = new BMap.Size(80, 10);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    DrawControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    DrawControl.prototype.initialize = function(map){
      // 创建一个DOM元素
      var div = document.createElement("div");
      div.setAttribute("class","draw");
      var btn = document.createElement("div");
      btn.setAttribute("class","draw-btn");
      btn.innerText = "绘制";
      div.appendChild(btn);
      // 按钮绑定点击事件
      btn.onclick = function(e){
        if (btn.innerText == "绘制") {
            // 开启绘制模式,并设置绘制模式为矩形绘制模式
            drawingManager.open();
            drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
            btn.innerText = "结束绘制";
        }else{
            // 关闭绘制模式
            drawingManager.close();
            btn.innerText = "绘制";
            // 更新学校区域范围四个顶点经纬度信息
            if(lastOverlay || $scope.updateFlag == true){
                // console.log(lastOverlay.po)
                // 0 1 2 3对应左上 右上 右下 左下四个顶点经纬度
                var northWest = lastOverlay.po[0];
                var northEast = lastOverlay.po[1];
                var southEast = lastOverlay.po[2];
                var southWest = lastOverlay.po[3];
                var params = {
                    schoolName: $scope.schoolName,
                    _id: $scope.id,
                    northWestLat: northWest.lat,
                    norhtWestLng: northWest.lng,
                    northEastLat: northEast.lat,
                    northEastLng: northEast.lng,
                    southWestLat: southWest.lat,
                    southWestLng: southWest.lng,
                    southEastLat: southEast.lat,
                    southEastLng: southEast.lng,
                }
                util.http("put", config.apiUrlPrefix + 'school', params, function (data) {
                    getSchool();
                    $scope.updateFlag = false;
                    $scope.$apply();
                    getSchool();
                }, function (error) {
                    $scope.errMsg = error.message;
                });
            }else{
                $scope.$apply();
            }
        }
      }
      // 添加DOM元素到地图中
      map.getContainer().appendChild(div);
      // 将DOM元素返回
      return div;
    }
    // // 创建控件
    var drawCtrl;
    // var drawCtrl = new DrawControl();
    // // 添加到地图当中
    // map.addControl(drawCtrl);

    //清除覆盖物
    function remove_overlay(){
        map.clearOverlays();         
    }

    // 获取学校列表
    function getSchool(){
        var params = {}
        util.http("get", config.apiUrlPrefix + 'school', params, function (data) {
            // $auth.setToken(data.token);
            // Account.setUser(data.userInfo);

            // console.log("登录成功");
            // 跳转地图页面
            // $state.go("index");
            $scope.items = data;
            $scope.all = data;
            // $scope.$apply();
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
    $scope.showAdd = function(){
        $scope.add = true;
    }
    $scope.hideAdd = function(){
        $scope.add = false;
    }
    //新增学校
    $scope.addUniversity = function(schooleName){
        var curTag;
        // console.log($scope.uniName)
        if(schooleName){
            // var str = $scope.uniName.replace(/\s+/g, "")
            var params = {
                schoolName:schooleName
            }
            util.http("put", config.apiUrlPrefix + 'school/new', params, function (data) {
                    // 添加学校成功的情况下，将lastOverlay置为空
                    lastOverlay = null;
                    // 将可更新操作标识置为TURE
                    $scope.updateFlag = true;
                    getSchool();
                    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                        //下面是在页面render完成后执行的js
                        var schoolArray = document.getElementsByClassName('list-li');
                        for(var i=0;i<schoolArray.length;i++){
                            var curName = JSON.parse(schoolArray[i].attributes.latlng.nodeValue).schoolName;
                            if(curName == schooleName){
                                curTag = schoolArray[i];
                            }
                        }
                        angular.element(curTag).triggerHandler('click',curTag);
                        $scope.add = false;
                    });
            }, function (error) {
                $scope.errMsg = error.message;
                $scope.alert = true;
                $scope.title = error.message;
            });
        }else{
            $scope.alert = true;
            $scope.title = "学校名称不能为空";
        }
    }

    function coordinateTransform(lng, lat){
        if (typeof(lng) != "undefined" && typeof(lat) != "undefined") {
            var gcjCoordinate = coordtransform.wgs84togcj02(lng, lat)
            var bdCoordinate = coordtransform.gcj02tobd09(gcjCoordinate[0], gcjCoordinate[1])
            return bdCoordinate;
        }else{
            return [0,0]
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
        // 移除所有覆盖物
        remove_overlay();
        if(latlng.norhtWestLng){
            // var northWest = coordinateTransform(latlng.norhtWestLng, latlng.northWestLat);
            // var northEast = coordinateTransform(latlng.northEastLng, latlng.northEastLat);
            // var southEast = coordinateTransform(latlng.southEastLng, latlng.southEastLat);
            // var southWest = coordinateTransform(latlng.southWestLng, latlng.southWestLat);
            // 学校区域范围已绘制情况下，展示矩形区域信息
            var rectangle = new BMap.Polygon([
                // new BMap.Point(northWest[0], northWest[1]),
                // new BMap.Point(northEast[0], northEast[1]),
                // new BMap.Point(southEast[0], southEast[1]),
                // new BMap.Point(southWest[0], southWest[1])
                new BMap.Point(latlng.norhtWestLng, latlng.northWestLat),
                new BMap.Point(latlng.northEastLng, latlng.northEastLat),
                new BMap.Point(latlng.southEastLng, latlng.southEastLat),
                new BMap.Point(latlng.southWestLng, latlng.southWestLat)
            ], {strokeColor:"black", fillColor:"orange", strokeWeight:3, strokeOpacity:0.8, fillOpacity:0.6, strokeStyle:"solid"});
            map.addOverlay(rectangle);
            var bounds = new BMap.Bounds(new BMap.Point(latlng.southWestLng, latlng.southWestLat),new BMap.Point(latlng.northEastLng, latlng.northEastLat));
            // map.setBounds(bounds);
            // 设置lastOverlay的值
            lastOverlay = rectangle;
        }else{
            // 设置lastOverlay的值
            lastOverlay = null;
            // 设置可更新状态值为true
            $scope.updateFlag = true;
        }
        searchPosition(latlng.schoolName,true);
        // 如果绘图控件不存在，则创建
        if (drawCtrl == null || typeof(drawCtrl) == "undefined") {
            // 创建控件
            drawCtrl = new DrawControl();
            // 添加到地图当中
            map.addControl(drawCtrl);
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
    $scope.moveover = function(e){
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
        e.stopPropagation();
        if(JSON.parse(e.target.parentElement.attributes.latlng.nodeValue).southWestLat){
            $scope.confirmtitle = "删除后地理轮廓需重新绘制，确认删除?";
        }else{
            $scope.confirmtitle = "确定删除?";
        }
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
            });
    }
    $scope.hideConfirm = function(){
        $scope.confirm = false;
    }
});