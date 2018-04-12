define(["app", "API", "APIS"], function (app) {
   app.service("kb_03_requisition", ["APIService", "$timeout",
      function (APIService, $timeout) {

         var self = this
         self.init = function () {
            self.doc_array = []    //kb_03_s01 選取的單據暫存
            self.setting = {}      //kb_03 相關設定資料
         }

         //選取的單據紀錄
         self.kb_03_setDocArray = function (temp) {
            self.doc_array = angular.copy(temp)
         }

         self.kb_03_setting = function (temp) {
            self.setting = temp
         }

         return self
      }
   ])
})
