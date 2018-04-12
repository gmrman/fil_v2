define(["app"], function(app) {
    app.factory("IonicPopupService", ["$ionicPopup", "AppLang", "$state", "IonicClosePopupService",
        function($ionicPopup, AppLang, $state, IonicClosePopupService) {

            /***********************************************************************************************************************
             * Descriptions...: 錯誤訊息顯示框
             * Usage..........: errorAlert(txt)
             * Input parameter: txt     錯誤訊息文字
             * Return code....: promise
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            this.errorAlert = function(txt) {
                var title = AppLang.langs.wrong;
                var alertPopup = $ionicPopup.alert({
                    title: title,
                    template: "<p style='text-align: center'>" + txt + "</p>",
                    okText: AppLang.langs.confirm,
                    okType: "lightblue"
                });
                IonicClosePopupService.register(false, alertPopup);
                return alertPopup;
            };

            /***********************************************************************************************************************
             * Descriptions...: 成功訊息顯示框
             * Usage..........: successAlert(txt)
             * Input parameter: txt       單號(如果有值會串接 "單號：" 字串)
             * Return code....: promise
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            this.successAlert = function(txt) {
                var title = AppLang.langs.submit + AppLang.langs.success;

                var showStr = "";
                if (txt) {
                    showStr = AppLang.langs.docno + ":" + txt;
                }

                var alertPopup = $ionicPopup.alert({
                    title: title,
                    template: "<p style='text-align: center'>" + showStr + "</p>",
                    okText: AppLang.langs.confirm,
                    okType: "lightblue"
                });
                return alertPopup;
            };

            return {
                errorAlert: this.errorAlert,
                successAlert: this.successAlert
            };

        }
    ]);

    /***********************************************************************************************************************
     * Descriptions...: 彈窗後，是否點擊反灰區塊關閉彈窗視窗
     * Usage..........: IonicClosePopupService.register(flag, popup)
     * Input parameter: flag       是否關閉彈窗視窗
     *                : popup      $ionicPopup 回傳之 promise
     * Return code....: 無
     * Modify.........: 20170911 By lyw
     ***********************************************************************************************************************/
    app.service("IonicClosePopupService", [
        function() {
            array = Array();
            var currentPopup;
            var htmlEl = angular.element(document.querySelector('html'));
            htmlEl.on('click', function(event) {
                if (event.target.nodeName === 'HTML') {
                    if (currentPopup) {
                        if (currentPopup.length > 0) {
                            var popup = currentPopup.pop();
                            var close_flag = popup.close_flag;
                            if (close_flag) {
                                popup.close();
                            }
                        }
                    }
                }
            });

            this.register = function(flag, popup) {
                popup.close_flag = flag;
                array.push(popup);
                currentPopup = array;
            };

            this.close_popup = function() {
                console.log(currentPopup);
                if (currentPopup) {
                    currentPopup.pop().close();
                }
            };
        }
    ]);

});
