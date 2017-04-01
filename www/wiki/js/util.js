/**
 * Created by wuxiangan on 2016/10/11.
 */

var util = {
    colorList:["rgb(145,185,114)","rgb(185,150,114)","rgb(185,114,178)","rgb(185,127,114)","rgb(114,185,160)","rgb(114,134,185)"],
    stack:[],   // 堆栈操作模拟
    id:0,       // ID产生器 局部唯一性
    lastUrlObj:{}, // 记录最近一次URL信息
};

util.getId = function () {
    this.id = this.id > 1000000 ? 0 : this.id+1;
    return this.id;
}
// 获取一个随机颜色
util.getRandomColor = function (index) {
    index = index || 0;
    index %= this.colorList.length;
    return this.colorList[index];
}

// 将字符串url解析成{sitename, pagename}对象
util.parseUrl = function () {
    var hostname = window.location.hostname;
    var pathname = window.location.pathname;
    var sitename = hostname.match(/([\w]+)\.[\w]+\.[\w]+/);
    var pagename = 'index';

    // 排除IP访问
    if (hostname.split(':')[0].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        sitename = undefined;
    }

    if (sitename) {
        sitename = sitename[1];
        pagename = pathname.match(/^\/?([^\/]+)/);
        pagename = pagename ? pagename[1] : 'index';
    } else {
        sitename = pathname.match(/^\/?([^\/]+)\/?([^\/]*)/);  // 这里不会返回null
        if (sitename == undefined) {
            return {};
        }
        pagename = sitename[2] || pagename;
        sitename = sitename[1]
    }

    return {sitename:sitename, pagename:pagename};
}

util.setLastUrlObj = function (urlObj) {
    this.lastUrlObj = urlObj;
}

util.getLastUrlObj = function () {
    return this.lastUrlObj;
}

util.setAngularServices = function(angularServices) {
    this.angularServices = angularServices;
}

util.getAngularServices = function() {
    return this.angularServices;
}

util.setSelfServices = function (selfServices) {
    this.selfServices = selfServices;
}

util.getSelfServices = function () {
    return this.selfServices;
}

util.setScope = function ($scope) {
    this.angularServices.$scope = $scope;
}

util.getScope = function () {
    return this.angularServices.$scope;
}

util.setParams = function (params) {
    this.params = params;
}

util.getParams = function () {
    return this.params;
}

util.setFunction = function (func) {
    this.func = func;
}

util.getFunction = function () {
    return this.func;
}

// stack
util.push = function (obj) {
    this.stack.push(obj);
}

util.pop = function () {
    return this.stack.pop();
}

util.stringTrim = function (str) {
    return str ? str.replace(/(^\s*)|(\s*$)/g,'') : str;
}

util.getCurrentDateString = function () {
    var date = new Date();
    return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

// GET PUT POST DELETE
util.http = function(method, url, params, callback, errorCallback) {
    var $http = this.angularServices.$http;
    var httpRespone = undefined;

    // 在此带上认证参数
    if (method == 'POST') {
        httpRespone = $http({method:method,url:url,data:params}); //$http.post(url, params);
    } else {
        httpRespone = $http({method:method,url:url,params:params});
    }
    httpRespone.then(function (response) {
        var data = response.data;
        console.log(data);
        if (data.error && data.error.id == 0) {
            //console.log(data.data);
            callback && callback(data.data);
            util.setParentIframeAutoHeight();
        }else if (data.error == null && data != null) {
            callback && callback(data);
        }else {
            console.log(data);
            errorCallback && errorCallback(data.error);
        }
    }).catch(function (response) {
        console.log(response);
        // 网络错误
        //errorCallback && errorCallback(response.data);
    });
}

util.post = function (url, params, callback, errorCallback) {
    this.http("POST", url, params, callback, errorCallback);
}

util.get = function (url, params, callback, errorCallback) {
    this.http("GET", url, params, callback, errorCallback);
}

util.jsonStringToObject = function (str) {
    var obj = {};
    try {
        obj = JSON.parse(str);
    } catch (e) {
        console.log(str);
        console.log(e);
    }
    return obj;
}

util.objectToJsonString = function (obj) {
    return JSON.stringify(obj);
}



util.pagination = function (page, params, pageCount) {
    params.page = params.page || 0;
    page = page || 1;
    pageCount = pageCount || 1000000; // 页总数设置无线大

    if (params.page == page || page < 1 || page > pageCount) {
        return false;              // 不翻页
    }
    params.page = page;

    return true;
}

util.setParentIframeAutoHeight = function (minHeight) {
    if (!window.IframeId) {
        return ;
    }
    window.setTimeout(function () {
        var iframe = window.parent.document.getElementById(window.IframeId);
        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
        //console.log(iframe.contentWindow.document.body.scrollHeight);
        //console.log(iframe.contentWindow.document.documentElement.scrollHeight);
        //console.log(iframe.contentWindow.document.body.clientHeight);
        //console.log(iframe.contentWindow.document.documentElement.clientHeight);
    },1);
    return ;
}

util.setIframeParams = function (obj) {
    this.iframeParams = obj;
}

util.getIframeParams = function () {
    return this.iframeParams || window.iframeParams || {};
}

util.isSubMoudle = function () {
    return window.IframeId ? true : false;
}
