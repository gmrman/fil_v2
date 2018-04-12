define(["app", "API", "APIS"], function (app) {
   app.service("kb_05_requisition", ["APIService", "$timeout",
      function (APIService, $timeout) {

         var self = this
         self.init = function () {
            self.doc_array = []    //kb_05_s01 選取的單據暫存
            self.setting = {}      //kb_05 相關設定資料
         }

         //選取的單據紀錄
         self.kb_05_setDocArray = function (temp) {
            self.doc_array = angular.copy(temp)
         }

         self.kb_05_setting = function (temp) {
            self.setting = temp
         }

         return self
      }
   ])
})
