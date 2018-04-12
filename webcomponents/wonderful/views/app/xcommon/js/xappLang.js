define(["app"], function (app) {
    app.service('xAppLang', ['$rootScope', function ($rootScope) {
        var self = this;
        self.lang_val = "";

        self.langs = {
            "shipping_mark": null,
            "shipping_mark_no": null,
            "shipping_mark_error1":null,
            "shipping_mark_error2":null,
            "item_no":null,
        };

        var sys_language = window.navigator.language;
        sys_language = sys_language.replace("-", "_");
        if (sys_language == 'zh_CN') {
            setlang("zh_CN");
        } else {
            setlang("zh_TW");
        }

        self.changeLangs = function (sys_language) {
            if (sys_language == 'zh_CN') {
                setlang("zh_CN");
            } else {
                setlang("zh_TW");
            }
        };


        /**
         * 修改語系
         */
        function setlang(lang_val) {
            self.lang_val = lang_val;
            if (lang_val == 'zh_TW') {
                //繁体
                self.langs.item_no = "品号";
                self.langs.shipping_mark = "唛头";
                self.langs.shipping_mark_no = "唛头号";
                self.langs.shipping_mark_error1 = "唛头不可为空,请先刷读唛头信息";
                self.langs.shipping_mark_error2 = "您输入的唛头信息有误，请重新输入";
                self.langs.shipping_mark_error3 = "您输入的唛头信息已扫描,请重新输入";
            } else {
                self.langs.item_no = "品号";
                self.langs.shipping_mark = "唛头";
                self.langs.shipping_mark_no = "唛头号";
                self.langs.shipping_mark_error1 = "唛头不可为空,请先刷读唛头信息";
                self.langs.shipping_mark_error2 = "您输入的唛头信息有误，请重新输入";
                self.langs.shipping_mark_error3 = "您输入的唛头信息已扫描，请重新输入";
            }
        }
    }]);
});
