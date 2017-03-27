/**
 * Created by wuxiangan on 2016/12/15.
 */

app.controller('homeCtrl', function ($scope, $rootScope, $state, $auth, Account, SelfData) {
    $scope.siteParams = {page:1, pageSize:3};
    $scope.userParams = {page:1, pageSize:3};
    $scope.userObj = {};
    $scope.siteObj = {};

    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    function init() {
        // to do something
    }

    $scope.register = function(){
        $scope.errMsg="";
        var params = {
            username:util.stringTrim($scope.username),
            email:util.stringTrim($scope.email),
            cellphone:util.stringTrim($scope.cellphone),
            password:util.stringTrim($scope.password),
        };
        // console.log(params);
        if (!params.username || params.username.length == 0 || !params.password || params.password == 0){
            $scope.errMsg = "用户名，密码为必填字段";
            return ;
        }
        if (!params.username.match(/[\d\w_]{3,20}/)){
            $scope.errMsg = "用户名格式错误，应由3-20数字或字母或下划线组成";
            return;
        }
        if (!params.email) {
            $scope.errMsg = "邮箱格式错误"
            return;
        }
        if (params.password.length < 4 || params.password.length > 20) {
            $scope.errMsg = "密码格式错误"
        }
        util.http("POST", config.apiUrlPrefix + "user/register", params, function (data) {
            console.log("注册成功")
            $auth.setToken(data.token);
            Account.setUser(data.userInfo);
            if (!data.userInfo.githubToken) {
                //Account.githubAuthenticate();
            } else {
                $state.go("home");
            }
        },function (error) {
            $scope.errMsg = error.message;
        });
    }

    init();
});