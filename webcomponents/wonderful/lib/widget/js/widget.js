(function(window) {
    $topWindow = function() { //通用函数，获取顶端窗口
        var parentWin = window;
        while (parentWin != parentWin.parent) {
            if (parentWin.parent.document.getElementsByTagName("FRAMESET").length > 0) break;
            parentWin = parentWin.parent;
        }
        return parentWin;
    };
    var topWin = $topWindow();
    var topDoc = topWin.document;

    $id = function(id) { //通用函数，通过id获取元素
        return typeof id == "string" ? document.getElementById(id) : id;
    };
    $radio = function(name) { //通用函数，通过id获取元素
        try {
            var radios = document.getElementsByName(name);
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    return radios[i];
                }
            }
            return {
                value: ""
            };
        } catch (e) {
            return {
                value: ""
            };
        }
    };
    $bodyDimensions = function(win) { //通用函数，获取屏幕值
        win = win || window;
        var doc = win.document;
        var cw = ((doc.compatMode == "BackCompat") ? doc.body.clientWidth : doc.documentElement.clientWidth);
        var ch = ((doc.compatMode == "BackCompat") ? doc.body.clientHeight : doc.documentElement.clientHeight);
        var sl = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
        var st = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
        var sw = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
        var sh = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
        var w = Math.max(cw, sw);
        var h = Math.max(ch, sh);
        return {
            "clientWidth": cw,
            "clientHeight": ch,
            "scrollLeft": sl,
            "scrollTop": st,
            "scrollWidth": sw,
            "scrollHeight": sh,
            "width": w,
            "height": h
        };
    };

    window.$bodyDimensions = $bodyDimensions;
    window.$id = $id;
    window.$radio = $radio;
    /*界面弹窗对象*/
    var dialogDiv = {
        ID: '',
        HTMLS: "",
        Width: "100%",
        Height: "100",
        BackgroundColor: '#000',
        Top: "30%",
        AutoClose: null,
        BackClose: false,
        init: function() {
            this.createDom();
            this.setPosition();
            this.bindEvent();
        },
        get: function(n) {
            return config[n];
        },
        set: function(n, v) {
            config[n] = v;
        },
        createDom: function() {
            var div = this.getBgDiv();
            var _self = this;
            if (!div) {
                div = topDoc.createElement("div");
                div.id = "Widget_DialogDiv";
                topDoc.getElementsByTagName("BODY")[0].appendChild(div);
                div.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:1000;background-color:" + this.BackgroundColor + ";opacity:0.4;filter:alpha(opacity=40);";
            } else {
                div.style.backgroundColor = this.BackgroundColor;
            }
            div = topDoc.createElement("div");
            div.id = "backdrop_" + this.ID;
            div.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:1001;pointer-events:auto;";

            topDoc.getElementsByTagName("BODY")[0].appendChild(div);
            div.innerHTML = '<div id="div_back_' + this.ID + '" align="center" style="position:absolute;">' + this.HTMLS + '</div>';
            if (_self.BackClose) {
                div.onclick = function() {
                    _self.close();
                    //e.preventDefault();
                };
            }
        },
        autoClose: function() {
            if (this.closed) {
                clearTimeout(this._closeTimeoutId);
                return;
            }
            this.AutoClose -= 1;
            if (this.AutoClose <= 0) {
                this.close();
            } else {
                var self = this;
                this._closeTimeoutId = setTimeout(function() {
                    self.autoClose();
                }, 1000);
            }
        },
        bindEvent: function() {},
        show: function() {
            this.init();
            var div = this.getBgDiv();
            div.style.display = '';
            if (this.AutoClose && this.AutoClose > 0) this.autoClose();
        },
        close: function() {
            try {
                var totalDialog = this.getBgDiv();
                totalDialog.style.display = "none";
                $id('backdrop_' + this.ID).innerHTML = "";
                $id('backdrop_' + this.ID).outerHTML = "";
                this.closed = true;
            } catch (e) {
                console.log(e);
            }
        },
        getBgDiv: function() {
            var dialogDiv = topWin.$id("Widget_DialogDiv");
            if (!dialogDiv) {
                console.log('获取弹出层页面对象出错');
            }
            try {
                return dialogDiv;
            } finally {
                dialogDiv = null;
            }
        },
        setPosition: function() {
            var bd = $bodyDimensions(topWin);
            var Targetdiv = topWin.$id("div_back_" + this.ID);
            var divHeight = ((this.Height.search('%') == -1) ? this.Height : parseInt(this.Height.split('%')[0]) * bd.clientHeight / 100);
            var divWidth = ((this.Width.search('%') == -1) ? this.Width : parseInt(this.Width.split('%')[0]) * bd.clientWidth / 100);
            var divTop = ((this.Top.search('%') == -1) ? this.Top : parseInt(this.Top.split('%')[0]) * bd.clientHeight / 100);
            Targetdiv.style.top = ((divTop !== "") ? divTop : (bd.clientHeight - ((divHeight === "") ? 350 : inputHeight)) / 2) + "px";
            Targetdiv.style.left = (bd.clientWidth - ((divWidth === "") ? 250 : divWidth)) / 2 + "px";
            Targetdiv.style.width = divWidth + "px";
            Targetdiv.style.height = divHeight + "px";
        },
    };
    /**popup 控件**/
    var popUP = function(mesg) {
        mesg = mesg || '';
        var config = {};
        this.ID = 'popup';
        this.Top = "80%";
        this.Width = "200";
        this.BackgroundColor = 'rgba(255, 255, 255, 0)';
        this.AutoClose = 2;
        this.HTMLS = '<div style="background-color: green;color: #fff;min-width: 80px;height:40px;border-radius: 20px;line-height: 40px;font-size:12px;">' + mesg + '</div>';
        //this.show();
    };
    var popError = function(mesg) {
        mesg = mesg || '';
        var config = {};
        this.ID = 'popup';
        this.Top = "80%";
        this.Width = "250";
        this.BackgroundColor = 'rgba(255, 255, 255, 0)';
        this.AutoClose = 2;
        this.HTMLS = '<div style="background-color: red;color: #fff;min-width: 100px;height:40px;border-radius: 20px;line-height: 40px;font-size:12px;">' + mesg + '</div>';
        //this.show();
    };
    popUP.prototype = dialogDiv;
    popError.prototype = dialogDiv;
    window.popup = function(mesg) {
        var Popup = new popUP(mesg);
        Popup.show();
    };
    window.errorpop = function(mesg) {
        var Errorpop = new popError(mesg);
        Errorpop.show();
    };

    var Dialog_button = function(mesg, htmls) {
        var sys_language = window.navigator.language.replace("-", "_");
        var lang_confirm = "確認";
        var lang_cancel = "取消";
        if (sys_language == 'zh_CN') {
            lang_confirm = "确认";
            lang_cancel = "取消";
        }
        if (sys_language == 'en_US') {
            lang_confirm = "confirm";
            lang_cancel = "cancel";
        }

        mesg = mesg || '';
        var self = this;
        var config = {};
        this.ID = "dialogbutton";
        this.Top = "40%";
        this.Width = "80%";
        this.button = true;
        this.BackgroundColor = 'rgba(0, 0, 0, 1)';
        this.btnOk = function() {};
        this.HTMLS = '<style>.dilaogbtn{background-color:#fcfcfc;border-radius:5px;}}</style>' +
            '<div style="background-color:#DDE0E0;color: #000;min-width: 80px;height:80px;border-radius: 5px;font-size:15px;">' +
            '<table cellspacing="0" class="dilaogbtn" align="center" width="100%">' + '<tr><td colspan="2" align="center">' + htmls + mesg + '</td></tr>' +
            '<tr align="center"><td id="dialog_cancle" style="border-top:1px solid #eee;height:40px;line-height:40px"><button class=" " style="width: 90%;margin: 5%;min-height: 47px;border-color: transparent;background-color: #f8f8f8;color: #444;">' + lang_cancel + '</button></td>' +
            '<td id="dialog_ok"  style="border-top:1px solid #eee;height:40px;line-height:40px"><button class=" " style="width: 90%;margin: 5%;min-height: 47px;border-color: transparent;background-color: #387ef5;color: #fff;">' + lang_confirm + '</button></td>' +
            '</tr></table>' +
            '</div>';
        //this.show();
    };
    Dialog_button.prototype = dialogDiv;
    var Dialog_unbutton = function(mesg) {
        mesg = mesg || '';
        var config = {};
        this.Top = "30%";
        this.Width = "250";
        this.ID = "dialogunbutton";
        this.button = true;
        this.BackgroundColor = 'rgba(255, 255, 255, 0)';
        this.AutoClose = 2;
        this.HTMLS = '<style>.dilaogbtn{background-color:#E5E9ED;border-radius:5px;}.dilaogbtn tr:nth-child(1) td{height:80px;line-height:80px}.dilaogbtn tr:nth-child(2) td{border-top:1px solid #C1C7D0;height:40px;line-height:40px}.dilaogbtn tr:nth-child(2) td:first-child{border-right:1px solid #C1C7D0;}</style>' +
            '<div style="background-color:#DDE0E0;color: #73767B;min-width: 80px;height:80px;border-radius: 5px;font-size:14px;">' +
            '<table cellspacing="0" class="dilaogbtn" align="center" width="100%">' + '<tr><td align="center">' + mesg + '</td></tr>' +
            '</table>' +
            '</div>';
        //this.show();
    };

    window.dialog = function(mesg, param) {
        mesg = mesg || "";
        var flag = ((param === undefined) ? false : true);
        var dialog = {};
        if (flag) {
            dialog = new Dialog_button(mesg, param.htmls);
            dialog.htmls = param.htmls;
        } else {
            dialog = new Dialog_unbutton(mesg);
        }
        dialog.show();
        if (flag) {
            $id('dialog_cancle').onclick = function() {
                param.btn_Cancle();
                dialog.close();

            };
            $id('dialog_ok').onclick = function() {
                param.btn_Ok();
                dialog.close();
            };
        }
    };

})(window);
