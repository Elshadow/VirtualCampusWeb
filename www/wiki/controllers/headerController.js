/**
 * Created by wuxiangan on 2016/12/15.
 */

app.controller('headerCtrl', function ($scope, $state, $auth, Account, Message) {
    //console.log("headerCtrl");
    $scope.isLogin = Account.isAuthenticated();
    $scope.user = Account.getUser();

    $scope.goLoginPage = function () {
        window.location.href="/#/login";
    }

    $scope.goRegisterPage = function () {
        window.location.href="/#/home";
    }

    $scope.goHomePage = function () {
        window.location.href="/#/home";
    }

    $scope.goPersonalPage = function () {
        if (!$scope.isLogin) {
            console.log("----");
            Message.info("请先登录!!!");
            return;
        }
        window.location.href = "/" + $scope.user.username;
    }
    $scope.logout = function () {
        $auth.logout();
        $scope.isLogin = false;
        window.location.href="/#/login";
    }

    $scope.coordinateTransform = function (lng, lat){
        if (typeof(lng) != "undefined" && typeof(lat) != "undefined") {
            var gcjCoordinate = coordtransform.wgs84togcj02(lng, lat)
            var bdCoordinate = coordtransform.gcj02tobd09(gcjCoordinate[0], gcjCoordinate[1])
            return bdCoordinate;
        }else{
            return [0,0]
        }
    }

    $scope.coordinateTrans = function () {
        if (confirm("确定执行此操作,转换OSM经纬度坐标为百度经纬度坐标吗(该操作仅限执行一次,请谨慎操作,如造成数据错乱后果自负)?")) {
            // 提供转换WGS84经纬度坐标为百度经纬度坐标功能实现
            util.http("get", config.apiUrlPrefix + 'school', {}, function (data) {
                $scope.schools = data;
                // $scope.$apply();
                $scope.schools.map(function(item,index){
                    if (item.norhtWestLng != null && typeof(item.norhtWestLng) != "undefined" && item.schoolName != null) {
                        var northWest = $scope.coordinateTransform(item.norhtWestLng, item.northWestLat);
                        var northEast = $scope.coordinateTransform(item.northEastLng, item.northEastLat);
                        var southEast = $scope.coordinateTransform(item.southEastLng, item.southEastLat);
                        var southWest = $scope.coordinateTransform(item.southWestLng, item.southWestLat);
                        var params = {
                            schoolName:item.schoolName,
                            _id:item._id,
                            northWestLat:northWest[1],
                            norhtWestLng:northWest[0],
                            northEastLat:northEast[1],
                            northEastLng:northEast[0],
                            southWestLat:southWest[1],
                            southWestLng:southWest[0],
                            southEastLat:southEast[1],
                            southEastLng:southEast[0],
                        }
                        util.http("put", config.apiUrlPrefix + 'school', params, function (data) {
                            // 更新学校区域范围经纬度为百度经纬度

                        }, function (error) {
                            $scope.errMsg = error.message;
                        });
                    }
                })
                // console.log($scope.searchName);
            }, function (error) {
                $scope.errMsg = error.message;
            });
        }
    }

    $scope.$on("onUserProfile", function (event, user) {
        $scope.user = user;
    });

    $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
        $scope.isLogin = bAuthenticated;
    });
});