/**
 * Created by wuxiangan on 2016/9/28.
 */

app.config(function ($stateProvider, $urlRouterProvider) {
    //$urlRouterProvider.otherwise('/');
    var templatePath = config.pageUrlPrefix;
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: templatePath + 'login.html',
    }).state('home', {
        url:"/home",
        templateUrl:templatePath + 'home.html'
    }).state('index', {
        url:"/index",
        templateUrl:templatePath + 'index.html'
    });
});



