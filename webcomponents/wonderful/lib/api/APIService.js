define(["app", "md5", "config", "AppLang", "ReqTestData"], function(app) {
    app.service("APIService", function(commonService, userInfoService, configUrl, $timeout, AppLang, ReqTestData) {
        // $rootScope.imageFlag = true; //定义照片显示标志位(默认显示)
        var APIService = {
            "parseToJSON": function(jsonStr) {
                try {
                    console.log("传回参数" + jsonStr);
                    var json = JSON.parse(jsonStr);
                    return json;
                } catch (e) {
                    console.log(e);
                    return {
                        "srvver": "1.0",
                        "srvcode": "400",
                        "payload": {
                            "std_data": {
                                "execution": {
                                    "code": "400",
                                    "sql_code": "",
                                    "description": AppLang.langs.non_standard_format,
                                    "data": jsonStr
                                }
                            }
                        }
                    };
                }
            }
        };

        APIService.Web_Post = function(webTran, success, fail) {
            var params = {
                isauth: false,
                usertoken: "",
                param: null
            };

            if (!commonService.isNull(userInfoService.userInfo.permission_ip)) {
                if (webTran.auth && webTran.service != "log.infomation.get") {
                    params.isauth = true;
                    params.usertoken = webTran.usertoken || "";
                    params.param = webTran.parameter;
                    serverHTTP(params, "http://" + userInfoService.userInfo.permission_ip + webTran.url, 30000, success, fail);
                    return;
                }
            }

            var web_post = {
                prod: userInfoService.userInfo.server_product,
                lang: userInfoService.userInfo.language,
                acct: userInfoService.userInfo.account,
                name: webTran.service,
                ip: userInfoService.userInfo.server_ip,
                id: userInfoService.userInfo.account,
                EntId: userInfoService.userInfo.enterprise_no,
                CompanyId: userInfoService.userInfo.site_no,
                parameter: webTran.parameter
            };

            //網頁版測試資料
            if (commonService.Platform == "Chrome") {
                if (!userInfoService.userInfo) {
                    web_post.lang = 'zh_TW';
                    web_post.acct = 'tiptop';
                    web_post.ip = '10.40.40.18';
                    web_post.id = 'tiptop';
                    web_post.EntId = '99';
                    web_post.CompanyId = 'DSCTC';
                }
            }

            params.param = {
                "key": "f5458f5c0f9022db743a7c0710145903",
                "type": "sync",
                "host": {
                    "prod": "APP",
                    "ip": web_post.ip,
                    "lang": web_post.lang,
                    "acct": web_post.acct || "tiptop",
                    "timestamp": commonService.getCurrent(2),
                },
                "service": {
                    "prod": web_post.prod,
                    "name": web_post.name,
                    "ip": web_post.ip,
                    "id": web_post.id
                },
                "datakey": {
                    "EntId": web_post.EntId || "ENT",
                    "CompanyId": web_post.CompanyId || "SITE",
                    "PlantId": userInfoService.userInfo.plant_id || ""
                },
                "payload": {
                    "std_data": {
                        "parameter": web_post.parameter
                    }
                }
            };
            var timeout_seconds = 0;
            switch (web_post.name) {
                case "app.bc.stock.count.data.get":
                case "app.stock.count.scan.upload":
                case "app.bc.stock.count.data.no2.get":
                case "app.stock.count.scan.no2.upload":
                    timeout_seconds = userInfoService.userInfo.inventory_operation || 1800; // 30分鐘
                    break;
                case "user.storage.infomation.get":
                    timeout_seconds = userInfoService.userInfo.basic_data_download || 900; // 15分鐘
                    break;
                default:
                    timeout_seconds = userInfoService.userInfo.out_in_operation || 30; // 30 秒
            }
            var url = configUrl.getUrl();

            if (ReqTestData.testData) {
                ReqTestData.getServer(params, url, timeout_seconds, success, fail);
            } else {
                serverHTTP(params, url, timeout_seconds, success, fail);
            }
        };

        var serverHTTP = function(params, url, timeout_seconds, success, fail) {
            function error(error_message) {
                if (!error_message) {
                    error_message = AppLang.langs.timeout_error;
                }
                result = {
                    "srvver": "1.0",
                    "srvcode": "400",
                    "payload": {
                        "std_data": {
                            "execution": {
                                "code": "400",
                                "sql_code": "",
                                "description": error_message,
                            }
                        }
                    }
                };
                // xmlhttp.abort();
                fail(result);
                return;
            }

            try {
                success = success || function(result) {};
                fail = fail || function(fail) {};
                if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                    xmlhttp = new XMLHttpRequest();
                } else { // code for IE6, IE5
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                paramStr = angular.toJson(params.param);
                console.log('Web_Post参数:' + paramStr);
                xmlhttp.open("POST", url, true);
                if (params.isauth) {
                    xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8;");
                    xmlhttp.setRequestHeader("digi-middleware-auth-app", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTMxMTE4MzExOTIsInNpZCI6ODIyMDIzMzgxOTg0NjE5NjU1LCJpZCI6IkZJTCJ9.JbFR_U2K1fIQCLBRZ4_IdmO_KI7rEpMm2_TcpmZM4ME");
                    // xmlhttp.setRequestHeader("digi-middleware-auth-user", params.usertoken);
                } else {
                    xmlhttp.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
                }
                var result = {};
                xmlhttp.onerror = function(e) {
                    console.log("xmlhttp.onerror");
                    var status = xmlhttp.statusText || xmlhttp.status;
                    error(AppLang.langs.ws_connection_error + ",status：" + status);
                };
                var timeout = timeout_seconds * 1000;
                xmlhttp.timeout = timeout;
                xmlhttp.ontimeout = function(e) {
                    console.log(e);
                    error();
                };
                xmlhttp.send(paramStr);
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === 0) {
                        fail(result, paramStr);
                        return;
                    }
                    if (xmlhttp.readyState == 4 && (xmlhttp.status == 400 || xmlhttp.status == 404)) {
                        result = APIService.parseToJSON(xmlhttp.responseText);
                        fail(result, paramStr);
                        return;
                    }
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) { //表示请求成功发送并响应成功
                        var str = xmlhttp.responseText;
                        result = APIService.parseToJSON(xmlhttp.responseText);
                        var flag = false;
                        if ((result.srvcode == "000" && result.payload.std_data.execution.code == "0") || params.isauth) {
                            flag = true;
                        }

                        if (flag) {
                            success(result, paramStr);
                        } else {
                            fail(result, paramStr);
                        }
                        console.log(result);
                        return;
                    }
                };
            } catch (e) {
                console.error(e);
            }
        };

        return APIService;
    });
});