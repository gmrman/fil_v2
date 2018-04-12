define(["app", "API", "APIS",
        "AppLang",
        "views/app/xcommon/js/xappLang.js"],
    function (app) {
        app.service('xmenuService', ['AppLang', 'xAppLang', function (AppLang, xAppLang) {
            var self = this;
            var langs = AppLang.langs;
            var xlangs = xAppLang.langs;
            var menu = (function() {
                function menu(mod, func, icon, program_job_no, status, scan_type, in_out_no, upload_scan_type, url, name) {
                    this.func = func;
                    this.mod = mod;
                    this.iscommon = "";
                    this.name = name;
                    this.url = url;
                    this.iconType = "png";
                    this.icon = "./views/app/fil_00/fil_00_s04/img/png/" + icon + ".png";
                    this.program_job_no = program_job_no;
                    this.status = status;
                    this.in_out_no = in_out_no;
                    this.scan_type = scan_type;
                    this.upload_scan_type = upload_scan_type;
                    this.isdisplay = true;
                    // this.isdisplay = true;
                }
                return menu;
            })();
            self.init = function () {
                self.integratedList = [];
                self.purchaseList = [ //採購管理
                ];

                self.salesList = [ //銷售管理
                    new menu('AXM', 'xfil301', 'fun05-1', "5", "A", "1", "-1", "1", 'xyc_fil_01_s01', langs.sale + langs.delivery), //銷售出貨

                ];


                self.produceList = [ //生產管理
                ];

                self.stockList = [ //庫存管理


                ];
                self.photoprintList = [ //其他

                ];
            };


            self.setLists = function (setList) {
                xAppLang.changeLangs(AppLang.lang_val);
                langs = AppLang.langs;
                xlangs = xAppLang.langs;
                self.init();
                setList("purchase",self.purchaseList);
                setList("integrated",self.integratedList);
                setList("sales",self.salesList);
                setList("produce",self.produceList);
                setList("stock",self.stockList);
                setList("photoprint",self.photoprintList);
                //success(self.res);
            }


            return self
        }])
    })