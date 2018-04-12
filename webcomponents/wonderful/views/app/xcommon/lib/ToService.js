define(["app"], function (app) {
    app.service('toService', ['$ionicLoading','$ionicPopup', function ($ionicLoading,$ionicPopup) {
        var self = this;
        self.showToast = function (flag,value) {
            try
            {
                if (flag == "1")//一般提示
                {
                    window.plugins.toast.showWithOptions(
                        {
                            message: value,
                            duration: "4000", //  'short', 'long', '3000', 900 (the latter are milliseconds)
                            position: "bottom", //  'top', 'center', 'bottom'
                            styling: {
                                opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                                //backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
                                //textColor: '#FFFF00', // Default #FFFFFF
                                textSize: 20.5, // Default is approx. 13.
                                cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                                horizontalPadding: 20, // iOS default 16, Android default 50
                                verticalPadding: 16 // iOS default 12, Android default 30
                            }
                        },
                        function (result) {
                            if (result && result.event) {
                            }
                            else {
                            }
                        });
                }
                else if (flag == "2")//Error提示
                {
                    navigator.notification.beep(1);

                    window.plugins.toast.showWithOptions(
                        {
                            message: value,
                            duration: "5000", //  'short', 'long', '3000', 900 (the latter are milliseconds)
                            position: "bottom", //  'top', 'center', 'bottom'
                            styling: {
                                opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                                backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
                                textColor: '#FFFFFF', // Default #FFFFFF
                                textSize: 20.5, // Default is approx. 13.
                                cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                                horizontalPadding: 20, // iOS default 16, Android default 50
                                verticalPadding: 16 // iOS default 12, Android default 30
                            }
                        },
                        function (result) {
                            if (result && result.event) {
                            }
                            else {
                            }
                        });
                }
                else if (flag == "3")//生单提示
                {
                    navigator.notification.beep(1);

                    window.plugins.toast.showWithOptions(
                        {
                            message: value,
                            duration: "4000", //  'short', 'long', '3000', 900 (the latter are milliseconds)
                            position: "center", //  'top', 'center', 'bottom'
                            styling: {
                                opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                                backgroundColor: '#4B6CB3', // make sure you use #RRGGBB. Default #333333
                                textColor: '#FFFFFF', // Default #FFFFFF
                                textSize: 20.5, // Default is approx. 13.
                                cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                                horizontalPadding: 20, // iOS default 16, Android default 50
                                verticalPadding: 16 // iOS default 12, Android default 30
                            }
                        },
                        function (result) {
                            if (result && result.event) {
                            }
                            else {
                            }
                        });
                }
                else {
                    window.plugins.toast.showWithOptions(
                        {
                            message: value,
                            duration: "short", //  'short', 'long', '3000', 900 (the latter are milliseconds)
                            position: "top", //  'top', 'center', 'bottom'
                            styling: {
                                opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                                //backgroundColor: '#4B6CB3', // make sure you use #RRGGBB. Default #333333
                                //textColor: '#FFFF00', // Default #FFFFFF
                                textSize: 20.5, // Default is approx. 13.
                                cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                                horizontalPadding: 20, // iOS default 16, Android default 50
                                verticalPadding: 16 // iOS default 12, Android default 30
                            }
                        },
                        function (result) {
                            if (result && result.event) {
                            }
                            else {
                            }
                        });
                }
            }
            catch (ex) {
                //此部分用于网页端测试
                var mTitle = "温馨提示";
                var alertPopup = $ionicPopup.alert({
                    title: mTitle,
                    template: value
                });
                alertPopup.then(function (res) {
                    console.log(mTitle + value);
                });
            }
        }
        self.showLoading = function () {
            $ionicLoading.show({
                hideOnStateChange: true,
                tmplate:'<ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
                duration: 40000
            });
        };
        return self
    }
    ])
})