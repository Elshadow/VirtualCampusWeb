/**
 * Created by HouC on 2017/3/27.
 */

app.controller('loginCtrl', function ($scope, $rootScope, $state, $auth, Account) {
    // 判断用户是否已经登录,如果已经登录自动跳转到地图页面
    if (Account.isAuthenticated()) {
        $state.go("indexBd");
    }
    // $scope.errMsg = "用户名或密码错误";
    $scope.login = function () {
        $scope.errMsg = "";
        var params = {
            name:util.stringTrim($scope.email),
            pwd:util.stringTrim($scope.password),
        };
        if (!params.name || !params.pwd) {
            $scope.errMsg = "用户名或密码错误";
            return;
        }
        util.http("POST", config.apiUrlPrefix + 'user/login', params, function (data) {
            $auth.setToken(data.token);
            Account.setUser(data.userInfo);
            // console.log("登录成功,token = " + data.token);
            // 跳转地图页面
			$state.go("indexBd");
        }, function (error) {
            $scope.errMsg = error.message;
        });
    }
   // $scope.login = function(){
   //  location.href = '/#/index';
   // }
});

