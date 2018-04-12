define(["app"], function(app) {
    app.factory("configUrl", ['commonService', 'userInfoService', '$filter',
        function(commonService, userInfoService, $filter) {

            var self = this;
            self.url = "";

            self.getUrl = function() {
                return self.url;
            };

            self.setUrl = function() {

                var userInfo = userInfoService.getUserInfo();
                // TOPGP處理接口網址串接
                var area = $filter('lowercase')(userInfo.server_area);
                var url_server_area = "";
                if (!commonService.isNull(area)) {
                    url_server_area = "_" + area;
                }

                switch (userInfo.server_product) {
                    case "T100":
                        url_server_area = angular.copy(userInfo.server_area);
                        if (commonService.isNull(url_server_area)) {
                            url_server_area = "t10dev";
                        }
                        self.url = "http://" + userInfo.server_ip + "/w" + url_server_area + "/ws/r/awsp920";
                        break;
                    case "EF":
                    case "WF":
                        self.url = "http://" + userInfo.server_ip + "/WFILS/WFILSService.svc/ILSPOST";
                        break;
                    case "E10":
                        self.url = "http://" + userInfo.server_ip + ":" + userInfo.server_area + "/Restful/invokeSrv";
                        break;
                    case "TOPGPST":
                        self.url = "http://" + userInfo.server_ip + "/nws/ws/r/aws_restsrv" + url_server_area;
                        break;
                    case "TOPGP51":
                        self.url = "http://" + userInfo.server_ip + "/nws51/ws/r/aws_restsrv" + url_server_area;
                        break;
                    case "TOPGP525":
                        self.url = "http://" + userInfo.server_ip + "/nws525/ws/r/aws_restsrv" + url_server_area;
                        break;
                    case "TOPGP53":
                        self.url = "http://" + userInfo.server_ip + "/nws53/ws/r/aws_restsrv" + url_server_area;
                        break;
                }

                return self.url;
            };

            return self;
        }
    ]);
});