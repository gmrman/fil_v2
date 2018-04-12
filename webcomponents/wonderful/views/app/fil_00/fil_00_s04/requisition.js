  define(["app", "API", "APIS", "AppLang","views/app/xcommon/menu/_menu.js"], function(app) {
      app.service('fil_00_s04_requisition', ['APIService', '$timeout',
          'AppLang', '$ionicLoading', 'userInfoService', 'commonService','xmenuService',
          function(APIService, $timeout, AppLang, $ionicLoading, userInfoService, commonService
          ,xmenuService) {

              var self = this;
              var langs = AppLang.langs;
              self.authPermissions = [];
              self.lang_val = AppLang.lang_val;
              self.isclear = true;
              self.purchase = [];
              self.sales = [];
              self.produce = [];
              self.stock = [];
              self.complex = [];

              self.setAuthPermissions = function(res) {
                  self.authPermissions = res.result.permissions;
              };

              self.clearAuthPermissions = function() {
                  self.authPermissions = [];
              };

              var setDisplayByAccount = function(func) {
                  var account = userInfoService.userInfo.account;
                  if (account == "digiwin") {
                      return true;
                  }

                  //行發版作業
                  var fil3 = [
                      'fil111', 'fil112', 'fil113', 'fil114', 'fil116',
                      'fil208', 'fil209', 'fil210', 'fil211', 'fil212', 'fil217', 'fil218',
                      'fil304', 'fil305', 'fil306',
                      'fil409',
                      'fil516'
                      // 'fil514', 'fil515', 'fil516', 'fil517'
                  ];

                  var index = fil3.findIndex(function(item) {
                      return item == func;
                  });
                  if (index == -1) {
                      return true;
                  }
                  return false;
              };

              var setDisplayByPermissions = function(func) {
                  //權限管理
                  for (var i = 0; i < self.authPermissions.length; i++) {
                      var target = self.authPermissions[i].target;
                      var value = ":" + func;
                      var index = target.search(value);
                      if (index != -1) {
                          return true;
                      }
                  }
                  return false;
              };

              var setDisplayByProduct = function(func) {
                  // use_func = [
                  //     'fil101', 'fil102', 'fil103', 'fil104', 'fil105',
                  //     'fil106', 'fil107', 'fil108', 'fil109', 'fil110',
                  //     'fil111', 'fil112', 'fil113', 'fil114', 'fil115',
                  //     'fil116', 'fil117', 'fil118', 'fil119', 'fil120',
                  //     'fil301', 'fil302', 'fil303', 'fil304', 'fil305',
                  //     'fil306', 'fil307', 'fil308', 'fil309', 'fil310',
                  //     'fil201', 'fil202', 'fil203', 'fil204', 'fil205',
                  //     'fil206', 'fil207', 'fil208', 'fil209', 'fil210',
                  //     'fil211', 'fil212', 'fil213', 'fil214', 'fil215',
                  //     'fil216', 'fil217', 'fil218', 'fil219', 'fil220',
                  //     'fil221', 'fil222',
                  //     'fil401', 'fil402', 'fil403', 'fil404', 'fil405',
                  //     'fil406', 'fil407', 'fil408', 'fil409', 'fil410',
                  //     'fil501', 'fil502', 'fil503', 'fil504', 'fil505',
                  //     'fil506', 'fil507', 'fil508', 'fil509', 'fil510',
                  //     'fil511', 'fil512', 'fil513', 'fil514', 'fil515',
                  //     'fil516', 'fil517', 'fil518', 'fil519', 'fil520',
                  //     'fil521', 'fil522', 'fil523', 'fil524', 'fil525',
                  //     'fil526', 'fil527',
                  //     'fil601', 'fil602', 'fil603',
                  // ];

                  //各產品可用ICON
                  var use_func = [];
                  switch (userInfoService.userInfo.server_product) {
                      case "TOPGPST":
                      case "TOPGP51":
                      case "TOPGP525":
                      case "TOPGP53":
                          use_func = [
                              'fil101', 'fil102', 'fil103', 'fil104', 'fil105',
                              'fil106', 'fil107', 'fil108', 'fil110',
                              'fil111', 'fil112', 'fil113', 'fil114', 'fil115',
                              'fil116', 'fil117', 'fil119', 'fil120',
                              'fil301', 'fil303', 'fil304', 'fil305',
                              'fil306', 'fil310',
                              'fil202', 'fil203', 'fil204', 'fil205',
                              'fil206', 'fil207', 'fil208', 'fil209', 'fil210',
                              'fil211', 'fil212', 'fil213', 'fil214',
                              'fil216', 'fil217', 'fil218',
                              'fil221',
                              'fil401', 'fil402', 'fil403', 'fil404', 'fil405',
                              'fil407', 'fil409', 'fil410',
                              'fil501', 'fil502', 'fil503', 'fil504', 'fil505',
                              'fil506', 'fil507', 'fil508', 'fil509', 'fil510',
                              'fil512', 'fil513', 'fil514', 'fil515',
                              'fil516', 'fil517', 'fil518', 'fil519', 'fil520',
                              'fil524', 'fil525',
                              'fil526', 'fil527',
                              'fil601', 'fil602', 'fil603',
                          ];
                          break;
                      case "T100":
                          use_func = [
                              'fil101', 'fil102', 'fil103', 'fil104', 'fil105',
                              'fil106', 'fil107', 'fil108', 'fil110',
                              'fil111', 'fil112', 'fil113', 'fil114', 'fil115',
                              'fil116', 'fil117', 'fil119', 'fil120',
                              'fil301', 'fil303', 'fil304', 'fil305',
                              'fil306', 'fil310',
                              'fil202', 'fil203', 'fil204', 'fil205',
                              'fil206', 'fil207', 'fil208', 'fil209', 'fil210',
                              'fil211', 'fil212', 'fil213', 'fil214',
                              'fil216', 'fil217', 'fil218',
                              'fil221',
                              'fil401', 'fil402', 'fil403', 'fil404', 'fil405',
                              'fil407', 'fil408', 'fil409', 'fil410',
                              'fil501', 'fil502', 'fil503', 'fil504', 'fil505',
                              'fil506', 'fil507', 'fil508', 'fil509', 'fil510',
                              'fil512', 'fil513', 'fil514', 'fil515',
                              'fil516', 'fil517', 'fil518', 'fil519', 'fil520',
                              'fil524', 'fil525',
                              'fil526', 'fil527',
                              'fil601', 'fil602', 'fil603',
                          ];
                          break;
                      case "WF":
                          use_func = [
                              'fil101', 'fil102', 'fil103', 'fil104', 'fil105',
                              'fil106', 'fil107', 'fil108', 'fil110',
                              'fil115',
                              'fil119',
                              'fil301', 'fil303',
                              'fil310',
                              'fil202', 'fil203',
                              'fil206', 'fil207',
                              'fil213', 'fil214',
                              'fil216',
                              'fil221',
                              'fil501', 'fil502', 'fil503', 'fil504',
                              'fil511', 'fil512', 'fil513',
                              'fil519', 'fil520',
                              'fil524', 'fil525',
                              'fil526',
                              'fil601', 'fil602', 'fil603',
                          ];
                          break;
                      case "EF":
                      case "E10":
                          use_func = [
                              'fil101', 'fil102', 'fil103', 'fil104', 'fil105',
                              'fil106', 'fil107', 'fil108', 'fil109', 'fil110',
                              'fil115', 'fil116', 'fil118', 'fil119',
                              'fil301', 'fil302', 'fil303',
                              'fil307', 'fil308', 'fil309', 'fil310',
                              'fil201', 'fil202', 'fil203', 'fil204', 'fil205',
                              'fil206', 'fil207',
                              'fil213', 'fil214', 'fil215',
                              'fil216', 'fil219', 'fil220',
                              'fil221', 'fil222',
                              'fil401', 'fil402', 'fil403', 'fil404', 'fil405',
                              'fil406', 'fil407', 'fil408',
                              'fil501', 'fil502', 'fil503', 'fil504', 'fil505',
                              'fil506',
                              'fil511', 'fil512', 'fil513', 'fil514', 'fil515',
                              'fil517', 'fil518', 'fil519',
                              'fil524', 'fil525',
                              'fil526', 'fil527',
                              'fil601', 'fil602', 'fil603',
                          ];
                          break;
                  }
                  var flag = false;
                  for (var i = 0; i < use_func.length; i++) {
                      if (func == use_func[i]) {
                          flag = true;
                          break;
                      }
                  }
                  return flag;
              };

              self.setDisplay = function(func) {
                  if (userInfoService.userInfo.account == "root") {
                      return true;
                  }
                  var flag = setDisplayByProduct(func);
                  if (flag) {
                      if (commonService.isNull(userInfoService.userInfo.permission_ip) ||
                          userInfoService.userInfo.permission_ip == "999") {
                          switch (userInfoService.userInfo.server_product) {
                              case "TOPGPST":
                              case "TOPGP51":
                              case "TOPGP525":
                              case "TOPGP53":
                              case "T100":
                                  flag = setDisplayByAccount(func);
                                  break;
                              default:
                                  flag = true;
                          }
                          return flag;
                      }
                      flag = setDisplayByPermissions(func);
                  }
                  return flag;
              };

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
                      this.isdisplay = self.setDisplay(func);
                  }
                  return menu;
              })();

              var setList = function(mod, list) {
                  angular.forEach(list, function(value) {
                      if (value.isdisplay) {
                          switch (mod) {
                              case "purchase":
                                  self.purchase.push(value);
                                  break;
                              case "sales":
                                  self.sales.push(value);
                                  break;
                              case "produce":
                                  self.produce.push(value);
                                  break;
                              case "stock":
                                  self.stock.push(value);
                                  break;
                              case "complex":
                                  self.complex.push(value);
                                  break;
                          }
                      }
                  });
              };

              self.clear = function() {
                  self.lang_val = AppLang.lang_val;
                  self.isclear = true;
                  self.purchase = [];
                  self.sales = [];
                  self.produce = [];
                  self.stock = [];
                  self.complex = [];
              };

              self.init = function() {
                  self.isclear = false;
                  xmenuService.setLists(setList);
                  // new menu("模組", "作業", "圖形", "作業編號", "執行動作", "掃描類型", "出入庫碼", "有無箱條碼", "頁面", "名稱" )
                  setList("purchase", [ //採購管理
                      new menu('APM', 'fil101', 'fun01-2', "1-1", "A", "1", "0", "1", 'fil_common_s01', langs.purchase + langs.receiveing + '(' + langs.shipments + ')'), //採購收貨(送貨)
                      new menu('APM', 'fil102', 'fun02-2', "2-1", "A", "1", "1", "1", 'fil_common_s01', langs.purchase + langs.put_in_storage + '(' + langs.upcoming + ')'), //採購入庫(待辦)
                      new menu('APM', 'fil103', 'fun03-2', "3-1", "A", "1", "1", "1", 'fil_common_s01', langs.receiveing + langs.put_in_storage + '(' + langs.shipments + ')'), //收貨入庫(送貨)
                      new menu('APM', 'fil104', 'fun01-2', "1", "A", "1", "0", "2", 'fil_common_s01', langs.purchase + langs.receiveing + '(' + langs.receipt + ')'), //採購收貨(單據)
                      new menu('APM', 'fil105', 'fun02-2', "2", "A", "1", "1", "2", 'fil_common_s01', langs.purchase + langs.put_in_storage + '(' + langs.receipt + ')'), //採購入庫(單據)
                      new menu('APM', 'fil106', 'fun03-2', "3", "A", "1", "1", "2", 'fil_common_s02.fil_common_s07', langs.receiveing + langs.put_in_storage + '(' + langs.receipt + ')'), //收貨入庫(單據)
                      new menu('APM', 'fil107', 'fun01-1', "1", "A", "3", "0", "1", 'fil_common_s02.fil_common_s03', langs.purchase + langs.receiveing), //採購收貨
                      new menu('APM', 'fil108', 'fun03-1', "3", "A", "3", "1", "1", 'fil_common_s02.fil_common_s03', langs.receiveing + langs.put_in_storage), //收貨入庫
                      new menu('APM', 'fil119', 'fun01-2', "1-2", "A", "1", "0", "2", 'fil_common_s02.fil_common_s07', langs.shipments + langs.receiveing + '(' + langs.receipt + ')'), //送貨收貨(單據)
                      new menu('APM', 'fil117', 'fun02-2', "2", "S", "1", "1", "2", 'fil_common_s01', langs.purchase + langs.put_in_storage + langs.shelves), //採購入庫上架
                      new menu('APM', 'fil109', 'fun04-1', "4", "A", "1", "-1", "1", 'fil_common_s01', langs.warehouse + langs.return+'(' + langs.new + langs.doc + 'E' + ')'), //倉庫退回(新單E)
                      new menu('APM', 'fil110', 'fun04-1', "4", "S", "1", "-1", "1", 'fil_common_s01', langs.warehouse + langs.return+'(' + langs.post + ')'), //倉庫退回(過帳)
                      new menu('APM', 'fil111', 'fun01-3', "1-1", "A", "1", "0", "2", 'fil3_01_s01', langs.shipments + langs.receiveing + '(' + langs.row + ')'), //送貨收貨(行)
                      new menu('APM', 'fil112', 'fun01-3', "1-1", "A", "1", "0", "1", 'fil3_common_s01', langs.purchase + langs.receiveing + '(' + langs.send + ')'), //送貨收貨(送)
                      new menu('APM', 'fil113', 'fun02-3', "2-1", "A", "1", "1", "1", 'fil3_common_s01', langs.purchase + langs.put_in_storage + '(' + langs.stay + ')'), //送貨入庫(待)
                      new menu('APM', 'fil114', 'fun03-3', "3-1", "A", "1", "1", "1", 'fil3_common_s01', langs.receiveing + langs.put_in_storage + '(' + langs.send + ')'), //送貨入庫(送)
                      new menu('AQC', 'fil115', 'fun15-1', "16-3", "A", "0", "0", "0", 'fil_16_02_s04', "IQC"), //IQC
                      new menu('AQC', 'fil120', 'fun15-1', "16-3", "Y", "0", "0", "0", 'fil_16_03_s01', "IQC" + '(' + langs.confirm + ')'), //IQC(確認)
                      new menu('APM', 'fil116', 'fun01-3', "16-3", "A", "0", "0", "0", 'fil_23_s01', langs.receiveing + langs.examine), //收货检验
                      new menu('APM', 'fil118', 'fun01-3', "16-3", "A", "0", "0", "0", 'fil_24_s01', langs.receiveing + langs.examine + '(' + 'E' + ')') //收货检验(E)
                  ]);

                  setList("sales", [ //銷售管理
                    //  new menu('AXM', 'fil301', 'fun05-1', "5", "A", "1", "-1", "1", 'fil_common_s01', langs.sale + langs.delivery), //銷售出貨
                      new menu('AXM', 'fil302', 'fun06-1', "6", "A", "1", "1", "1", 'fil_common_s01', langs.sale + langs.return+'(' + langs.new + langs.doc + 'E' + ')'), //銷售退回(新單E)
                      new menu('AXM', 'fil303', 'fun06-1', "6", "S", "1", "1", "1", 'fil_common_s01', langs.sale + langs.return+'(' + langs.post + ')'), //銷售退回(過帳)
                      new menu('AXM', 'fil304', 'fun05-2', "5", "A", "1", "-1", "1", 'fil3_common_s01', langs.sale + langs.delivery + '(' + langs.row + ')'), //銷售出貨(行)
                      new menu('AXM', 'fil305', 'fun05-3', "5", "S", "1", "-1", "1", 'fil3_common_s01', langs.sale + langs.delivery + '(' + langs.pass + ')'), //銷售出貨(過)
                      new menu('AXM', 'fil306', 'fun06-2', "6", "S", "1", "1", "1", 'fil3_common_s01', langs.sale + langs.return+'(' + langs.pass + ')'), //銷售退回(過)
                      new menu('AXM', 'fil307', 'fun05-1', "5-1", "A", "1", "-1", "1", 'fil_common_s01', langs.title_05_01 + '(' + langs.upcoming + ')'), //寄售調撥(待辦)
                      new menu('AXM', 'fil308', 'fun05-1', "5-2", "S", "1", "-1", "1", 'fil_common_s01', langs.title_05_02), //銷售撿貨核對
                      new menu('AXM', 'fil309', 'fun05-1', "5-3", "S", "1", "-1", "1", 'fil_common_s01', langs.title_05_03), //寄售調撥核對
                      new menu('AXM', 'fil310', 'fun05-1', "5-4", "A", "1", "-1", "1", 'fil_common_s01', langs.sale + langs.delivery + '(' + langs.order + ')'), //銷售出貨(訂單)
                  ]);

                  setList("produce", [ //生產管理
                      new menu('ASF', 'fil201', 'fun07-2', "7-3", "A", "1", "-1", "1", 'fil_common_s01', langs.goods_issue + '(' + langs.apply + 'E' + ')'), //發料待辦(申請E)
                      new menu('ASF', 'fil202', 'fun07-2', "7", "A", "1", "-1", "1", 'fil_common_s01', langs.goods_issue + '(' + langs.new + langs.doc + ')'), //發料待辦(新單)
                      new menu('ASF', 'fil203', 'fun07-1', "7", "S", "1", "-1", "1", 'fil_common_s01', langs.goods_issue + '(' + langs.post + ')'), //發料待辦(過帳)
                      new menu('ASF', 'fil204', 'fun07-1', "7-1", "A", "1", "-1", "2", 'fil_common_s02.fil_common_s07', langs.goods_issue + '(' + langs.receipt + ')'), //發料(單據)
                      new menu('ASF', 'fil205', 'fun07-2', "7-2", "A", "1", "-1", "1", 'fil_common_s01', langs.back_off + langs.goods_issue), //倒扣發料
                      new menu('ASF', 'fil206', 'fun08-2', "8", "A", "1", "1", "1", 'fil_common_s01', langs.return_material + '(' + langs.new + langs.doc + ')'), //退料待辦(新單)
                      new menu('ASF', 'fil207', 'fun08-1', "8", "S", "1", "1", "1", 'fil_common_s01', langs.return_material + '(' + langs.post + ')'), //退料待辦(過帳)
                      new menu('ASF', 'fil208', 'fun07-3', "7", "A", "1", "-1", "1", 'fil3_common_s01', langs.goods_issue + '(' + langs.new + ')'), //發料待辦(新)
                      new menu('ASF', 'fil209', 'fun07-3', "7", "S", "1", "-1", "1", 'fil3_common_s01', langs.goods_issue + '(' + langs.pass + ')'), //發料待辦(過)
                      new menu('ASF', 'fil210', 'fun07-4', "7-4", "A", "1", "-1", "1", 'fil3_common_s01', langs.return_material + langs.replenish_material), //退料補料
                      new menu('ASF', 'fil211', 'fun08-3', "8", "A", "1", "1", "1", 'fil3_common_s01', langs.return_material + '(' + langs.new + ')'), //退料待辦(新)
                      new menu('ASF', 'fil212', 'fun08-3', "8", "S", "1", "1", "1", 'fil3_common_s01', langs.return_material + '(' + langs.pass + ')'), //退料待辦(過)
                      new menu('ASF', 'fil220', 'fun07-2', "7-5", "S", "1", "-1", "1", 'fil_common_s01', langs.title_07_05), //領料核對
                      new menu('ASF', 'fil213', 'fun09-1', "9", "A", "3", "1", "1", 'fil_common_s02.fil_common_s03', langs.completion + langs.put_in_storage), //完工入庫
                      new menu('ASF', 'fil214', 'fun09-1', "9-1", "A", "0", "0", "2", 'fil_09_01_s01', langs.put_in_storage + langs.apply), //入庫申請
                      new menu('ASF', 'fil221', 'fun09-1', "9-1", "A", "0", "0", "2", 'fil_common_s02.fil_common_s07', langs.put_in_storage + langs.apply + '(' + langs.multi + ')'), //入庫申請(多筆)
                      new menu('ASF', 'fil215', 'fun09-1', "9-2", "A", "1", "1", "1", 'fil_common_s01', langs.put_in_storage + langs.shelves + '(' + langs.new + langs.doc + 'E' + ')'), //入庫上架(新單E)
                      new menu('ASF', 'fil216', 'fun09-1', "9-2", "S", "1", "1", "1", 'fil_common_s01', langs.put_in_storage + langs.shelves + '(' + langs.post + ')'), //入庫上架(過帳)
                      new menu('ASF', 'fil219', 'fun09-1', "9-3", "A", "1", "1", "1", 'fil_common_s01', langs.produce + langs.put_in_storage + '(' + langs.work_rder + ')'), //生產入庫(工單)
                      new menu('ASF', 'fil222', 'fun09-1', "9-3", "S", "1", "1", "1", 'fil_common_s01', langs.put_in_storage + langs.post + '(' + 'E' + ')'), //入庫過帳(E)
                      new menu('ASF', 'fil217', 'fun09-2', "9", "A", "3", "1", "1", 'fil3_common_s02.fil3_common_s03', langs.completion + langs.put_in_storage + '(' + langs.row + ')'), //完工入庫(行)
                      new menu('ASF', 'fil218', 'fun09-3', "9-2", "S", "1", "1", "1", 'fil3_common_s01', langs.put_in_storage + langs.shelves + '(' + langs.pass + ')'), //入庫上架(過)
                      new menu('ASF', 'fil401', 'fun10-1', "10", "0", "2", "0", "0", 'fil_10_s01', langs.move_in + '(' + 'Move In' + ')'), //工單報工 Move In
                      new menu('ASF', 'fil402', 'fun10-2', "10", "1", "2", "0", "0", 'fil_10_s01', langs.check_in + '(' + 'Check In' + ')'), //工單報工 Check In
                      new menu('ASF', 'fil403', 'fun10-3', "10", "2", "2", "0", "0", 'fil_10_s01', langs.work_rder + langs.daily_work), //工單報工
                      new menu('ASF', 'fil404', 'fun10-4', "10", "3", "2", "0", "0", 'fil_10_s01', langs.check_out + '(' + 'Check Out' + ')'), //工單報工 Check Out
                      new menu('ASF', 'fil405', 'fun10-5', "10", "4", "2", "0", "0", 'fil_10_s01', langs.move_out + '(' + 'Move Out' + ')'), //工單報工 Move Out
                      new menu('ASF', 'fil406', 'fun10-5', "10", "5", "2", "0", "0", 'fil_10_s01', langs.title_10_06 + '(E)'), //轉移入庫(E)
                      new menu('ASF', 'fil407', 'fun10-7', "17", "0", "2", "0", "0", 'fil_17_s01', langs.process + langs.inquire), //工藝查詢
                      new menu('AQC', 'fil408', 'fun15-1', "16-2", "A", "0", "0", "0", 'fil_16_02_s01', "PQC"), //PQC
                      new menu('AQC', 'fil410', 'fun15-1', "16-4", "Y", "0", "0", "0", 'fil_16_03_s01', "FQC" + '(' + langs.confirm + ')'), //FQC(確認)
                      new menu('ASF', 'fil409', 'fun10-6', "10", "2", "2", "0", "0", 'fil3_10_s01', langs.work_rder + langs.daily_work + '(' + langs.row + ')'), //工单报工(行)
                  ]);

                  setList("stock", [ //庫存管理
                      new menu('AIN', 'fil524', 'fun11-1', "11", "A", "1", "-1", "1", 'fil_common_s02.fil_common_s03', langs.sundry + langs.goods_issue + '(' + langs.new + langs.doc + ')'), //雜項發料(新單)
                      new menu('AIN', 'fil501', 'fun11-1', "11", "S", "1", "-1", "1", 'fil_common_s01', langs.sundry + langs.goods_issue + '(' + langs.post + ')'), //雜項發料(過帳)
                      new menu('AIN', 'fil525', 'fun12-1', "12", "A", "1", "1", "1", 'fil_common_s02.fil_common_s03', langs.sundry + langs.receive_item + '(' + langs.new + langs.doc + ')'), // 雜項收料(新單)
                      new menu('AIN', 'fil502', 'fun12-1', "12", "S", "1", "1", "1", 'fil_common_s01', langs.sundry + langs.receive_item + '(' + langs.post + ')'), // 雜項收料(過帳)
                      new menu('AIN', 'fil503', 'fun13-1', "13-5", "A", "1", "-1", "1", 'fil_common_s01', langs.title_13_1 + '(' + langs.apply + ')'), //一階段調撥(申請)
                      new menu('AIN', 'fil504', 'fun13-1', "13-1", "A", "1", "-1", "1", 'fil_common_s02.fil_common_s03', langs.title_13_1), //一階段調撥
                      new menu('AIN', 'fil505', 'fun13-2', "13-2", "A", "1", "-1", "1", 'fil_common_s02.fil_common_s03', langs.title_13_2), //兩階段撥出
                      new menu('AIN', 'fil506', 'fun13-3', "13-3", "S", "1", "1", "1", 'fil_common_s01', langs.title_13_3), //兩階段撥入
                      new menu('AIN', 'fil507', 'fun14-1', "14", "0", "1", "0", "0", 'fil_14_s01', langs.stock + langs.inventory), //庫存盤點
                      new menu('AIN', 'fil511', 'fun14-2', "14-1", 1, "1", "0", "0", 'fil_14_01_s01', langs.stock + langs.inventory), //庫存盤點
                      new menu('AIN', 'fil512', 'fun15-1', "15", "0", "0", "0", "0", 'fil_15_s01', langs.stock + langs.inquire), //庫存查詢
                      new menu('AIN', 'fil513', 'fun15-1', "18", "0", "0", "0", "0", 'fil_18_s01', langs.barcode + langs.froze), //條碼凍結
                      new menu('AIN', 'fil514', 'fun11-2', "11", "A", "1", "-1", "1", 'fil3_common_s02.fil3_common_s03', langs.sundry + langs.goods_issue + '(' + langs.row + ')'), // 雜項發料(行)
                      new menu('AIN', 'fil515', 'fun12-2', "12", "A", "1", "1", "1", 'fil3_common_s02.fil3_common_s03', langs.sundry + langs.receive_item + '(' + langs.row + ')'), // 雜項收料(行)
                      new menu('AIN', 'fil516', 'fun13-4', "13-5", "A", "1", "-1", "1", 'fil3_common_s01', langs.title_13_1 + '(' + langs.state + ')'), //倉庫調撥(一)(申)
                      new menu('AIN', 'fil517', 'fun13-4', "13-1", "A", "1", "-1", "1", 'fil3_common_s02.fil3_common_s03', langs.title_13_1 + '(' + langs.row + ')'), //倉庫調撥(一)(行)
                      new menu('AIN', 'fil518', 'fun06-2', "20", "S", "1", "-1", "1", 'fil_common_s01', langs.scrap + '(' + langs.post + ')'), //報廢(過帳)
                      new menu('AOO', 'fil519', 'print-1', "21", "", "", "", "", 'fil_print_s04', langs.title_print), //憑證列印
                      new menu('AOO', 'fil520', 'print-3', "", "", "", "", "", 'fil_print_s01', langs.title_print_1), //藍芽標籤列印
                      new menu('AOO', 'fil522', 'print-1', "", "", "", "", "", 'fil_print_s02', langs.title_print_2), //標籤列印
                      new menu('AOO', 'fil523', 'print-1', "", "", "", "", "", 'fil_print_s03', langs.title_print_3), //wifi列印
                      new menu('AOO', 'fil521', 'print-2', "", "", "", "", "", 'fil_file_transfer_s01', "檔案傳輸"), //檔案傳輸
                      new menu('AIN', 'fil526', 'fun08-3', "19", "", "", "", "", 'fil_19_s01', langs.packing + langs.job), //裝箱作業
                      new menu('AIN', 'fil527', 'fun10-1', "25", "", "", "", "", 'fil_25_s01', langs.transport + langs.directive), //搬運指示
                  ]);

                  setList("complex", [ //其他
                      new menu('COM', 'fil601', 'fun01-3', "", "A", "0", "0", "0", 'fil_02_s01', langs.receiveing), //收貨
                      new menu('COM', 'fil602', 'fun09-2', "", "B", "0", "0", "0", 'fil_02_s01', langs.put_in_storage), //入庫
                      new menu('COM', 'fil603', 'fun03-3', "", "0", "0", "0", "0", '', langs.board), //看板
                  ]);

              };

              return self;
          }
      ]);
  });