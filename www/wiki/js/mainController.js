/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('mainCtrl', function ($scope, $rootScope, $http, $state, $compile, $auth, Account, SelfData, ProjectStorageProvider, Message) {
    // 信息提示框
    $("#messageTipCloseId").click(function () {
        Message.hide();
    });

    // 加载内容信息
    function initContentInfo() {
        $rootScope.IsRenderServerWikiContent = false;
        var moduleIframeParser = new ModuleIframeParser();
        var md = window.markdownit({html:true});
        var urlObj = util.parseUrl();

        // 置空用户页面内容
        moduleIframeParser.render("<div></div>");
        if (window.location.href.indexOf('#') >=0 || !urlObj.sitename || urlObj.sitename == "wiki") {
            if (window.location.path != "/" && window.location.hash) {                  // 带有#前端路由 统一用/#/url格式
                // console.log(window.location.hash);
                window.location.href="/" + window.location.hash;
            } else if (window.location.pathname == '/' && !window.location.hash) {     // wikicraft.cn  重定向/#/login
                window.location.href="/#/login";
            } else {                                                                           // /wiki/xxx    旧版本/wiki/xxx页
                $rootScope.IsRenderServerWikiContent = true;
            }
            // console.log($rootScope.IsRenderServerWikiContent);
            return ;
        }
        // 访问用户页
        // util.http("POST", config.apiUrlPrefix + "website_pages/getDetailInfo", {sitename:urlObj.sitename, pagename:urlObj.pagename}, function (data) {
        //     data = data || {};
        //     console.log("aaaa"+data)
        //     // 这三种基本信息根化，便于用户页内模块公用
        //     $rootScope.userinfo = data.userinfo;
        //     $rootScope.siteinfo = data.siteinfo;
        //     $rootScope.pageinfo = data.pageinfo;
        //     var pageContent = data.pageinfo ? data.pageinfo.content : '<div>用户页丢失!!!</div>';
        //     pageContent = md.render(pageContent);
        //     var userpageObj = {user:$rootScope.user, userinfo:$rootScope.userinfo, siteinfo:$rootScope.siteinfo, pageinfo:$rootScope.pageinfo};
        //     util.setIframeParams(userpageObj);
        //     sessionStorage.setItem("userpageObj", util.objectToJsonString(userpageObj));
        //     moduleIframeParser.render(pageContent);
        // });

         // $http.get('http://localhost:8099/wiki/html/templates/test.html').then(function (response) {
         // console.log(response.data);
         // var pageContent = response.data;
         // pageContent = md.render(pageContent);
         // util.setIframeParams({user:$rootScope.user, userinfo:$rootScope.userinfo, siteinfo:$rootScope.siteinfo, pageinfo:$rootScope.pageinfo});
         // moduleIframeParser.render(pageContent);
         // });
    }
    
    // 初始化基本信息
    function initBaseInfo() {
        /*配置一些全局服务*/
        util.setAngularServices({$http:$http, $state:$state, $compile:$compile, $auth:$auth});
        util.setSelfServices({Account:Account, ProjectStorageProvider:ProjectStorageProvider, SelfData: SelfData, Message:Message});
        // iframe子模块信息初始化
        if (util.isSubMoudle()) {
            util.setParentIframeAutoHeight();
            var iframeParams = util.getIframeParams();
            //console.log(iframeParams);
            iframeParams.user.loaded && Account.setUser(iframeParams.user);
            $rootScope.userinfo = iframeParams.userinfo;
            $rootScope.siteinfo = iframeParams.siteinfo;
            $rootScope.pageinfo = iframeParams.pageinfo;
            $rootScope.isSubModule = true;
        }
        // 获取用户基本信息
        if (Account.isAuthenticated()) {
            if (Account.isLoaded()) {
                $scope.user = Account.getUser();
            } else {
                Account.getProfile();
            }
        }
        //console.log("mainCtrl");
    }
    
    function init() {
        initBaseInfo();
        initContentInfo();
    }

    //Account.ensureAuthenticated(init());
    init();
});

