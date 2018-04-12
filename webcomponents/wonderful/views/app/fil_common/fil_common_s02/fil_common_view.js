define(["app", 'AppLang', "userInfoService"], function(app) {
      app.service('fil_common_view', ['AppLang', 'userInfoService',
            function(AppLang, userInfoService) {

                  var self = this;
                  var langs = AppLang.langs;

                  self.getViews = function(page_params) {

                        //設定參數
                        var views = {
                              has_source: true, //是否有來源單據
                              show_ingoing: false,
                              show_reason: false,
                              show_op: false,
                              show_directive: false,
                              show_doc_slip: false,
                              show_s07_page: false,
                              show_submit: false,
                              edit_qty: true,
                              use_erp_warehousing: false,
                              inquiry_list_title_already: langs.alreadyPutInStorage,
                              inquiry_list_title_should: langs.shouldPutInStorage,
                        };

                        //控制條碼掃描頁面數量是否可以修改
                        if ((userInfoService.userInfo.gp_flag && page_params.program_job_no == "13-5") ||
                              page_params.program_job_no == "13-3") {
                              views.edit_qty = false;
                        }

                        //控卡作業是否檢查 erp_warehousing 參數
                        switch (page_params.func) {
                              case "fil101": //採購收貨(送貨)
                              case "fil102": //採購入庫(待辦)
                              case "fil103": //收貨入庫(送貨)
                              case "fil104": //採購收貨(單據)
                              case "fil105": //採購入庫(單據)
                              case "fil106": //收貨入庫(單據)
                              case "fil107": //採購收貨
                              case "fil108": //收貨入庫
                              case "fil109": //倉庫退回(新單)
                              case "fil110": //倉庫退回(過帳)
                              case "fil117": //採購入庫上架
                              case "fil119": //送貨收貨(單據)
                              case "fil206": //退料(新單)
                              case "fil207": //退料(過帳)
                              case "fil213": //完工入庫
                              case "fil215": //入庫上架(新增)
                              case "fil216": //入庫上架(扣帳)
                              case "fil219": //生產入庫(工單)
                              case "fil221": //入庫申請(多筆)
                              case "fil222": //入庫過帳(E)
                              case "fil302": //銷售退回(新單E)
                              case "fil303": //銷售退回(過帳)
                              case "fil502": //雜收(過帳)
                              case "fil525": //雜項收料(新單)
                                    views.use_erp_warehousing = true;
                                    break;
                        }

                        //控制是否顯示頁面
                        //是否顯示指示頁
                        switch (page_params.func) {
                              case "fil301": // 銷售出貨(新單)
                              case "fil307": // 寄售調撥(待辦)
                              case "fil308": // 銷售撿貨核對
                              case "fil309": // 寄售調撥核對
                              case "fil310": // 銷售出貨(訂單)
                              case "fil201": // 發料(申請)
                              case "fil202": // 發料(新單)
                              case "fil203": // 發料(過帳)
                              case "fil204": // 發料(單據)
                              case "fil205": // 倒扣發料
                              case "fil220": // 領料核對
                              case "fil501": // 雜發(過帳)
                              case "fil503": // 一階段撥出(申請)
                                    views.show_directive = true;
                                    break;
                        };

                        //是否顯示掃描+明細頁面
                        switch (page_params.func) {
                              case "fil104": // 採購收貨(單據)
                              case "fil105": // 採購入庫(單據)
                              case "fil106": // 收貨入庫(單據)
                              case "fil117": // 採購入庫上架
                              case "fil119": // 送貨收貨(單據)
                              case "fil221": // 入庫申請(多筆)
                              case "fil204": // 發料(單據)
                                    views.show_s07_page = true;
                                    break;
                        };

                        //是否顯示撥出字樣
                        switch (page_params.func) {
                              case "fil503": // 一階段撥出(申請)
                              case "fil504": // 一階段撥出
                              case "fil505": // 兩階段撥出
                              case "fil506": // 兩階段撥入
                                    views.show_ingoing = true;
                                    break;
                              case "fil518": // 報廢(過帳)
                                    if (userInfoService.userInfo.gp_flag) {
                                          views.show_ingoing = false;
                                    }
                                    views.show_ingoing = true;
                                    break;
                        };

                        //是否顯示理由碼區塊
                        switch (page_params.func) {
                              case "fil518": // 報廢(過帳)
                                    views.show_reason = true;
                                    break;
                              case "fil524": // 雜項發料(新單)
                              case "fil525": // 雜項收料(新單)
                                    views.show_reason = true;
                                    // EF E10 WF 不使用理由碼
                                    if (userInfoService.userInfo.server_product == "EF" ||
                                          userInfoService.userInfo.server_product == "WF" ||
                                          userInfoService.userInfo.server_product == "E10") {
                                          views.show_reason = false;
                                    }
                                    break;
                        };

                        //是否顯示單別選擇功能
                        switch (page_params.func) {
                              case "fil504": // 一階段撥出
                              case "fil505": // 兩階段撥出
                              case "fil524": // 雜項發料(新單)
                              case "fil525": // 雜項收料(新單)
                                    views.has_source = false;
                                    views.show_doc_slip = true;
                                    break;
                        }

                        //是否顯示作業名稱
                        switch (page_params.func) {
                              case "fil202": // 發料(新單)
                              case "fil203": // 發料(過帳)
                              case "fil204": // 發料(單據)
                              case "fil205": // 倒扣發料
                                    views.show_op = true;
                                    break;
                        }

                        views = setDataCollectionTitle(page_params, views);

                        return views;
                  };

                  var setDataCollectionTitle = function(page_params, views) {
                        //設定各作業數據匯總時所顯示的標題
                        switch (page_params.program_job_no) {
                              case "1":
                              case "1-1":
                              case "1-2":
                              case "12":
                                    views.inquiry_list_title_already = langs.alreadyReceive;
                                    views.inquiry_list_title_should = langs.shouldReceive;
                                    break;
                              case "2":
                              case "2-1":
                              case "3":
                              case "3-1":
                              case "9":
                              case "9-1":
                              case "9-2":
                              case "9-3":
                                    views.inquiry_list_title_already = langs.alreadyPutInStorage;
                                    views.inquiry_list_title_should = langs.shouldPutInStorage;
                                    break;
                              case "5":
                              case "5-1":
                              case "5-2":
                              case "5-3":
                              case "5-4":
                                    views.inquiry_list_title_already = langs.alreadyDelivery;
                                    views.inquiry_list_title_should = langs.shouldDelivery;
                                    break;
                              case "4":
                              case "6":
                              case "8":
                                    views.inquiry_list_title_already = langs.alreadyReturn;
                                    views.inquiry_list_title_should = langs.shouldReturn;
                                    break;
                              case "7":
                              case "7-1":
                              case "7-2":
                              case "7-3":
                              case "7-5":
                              case "11":
                                    views.inquiry_list_title_already = langs.alreadyIssue;
                                    views.inquiry_list_title_should = langs.shouldIssue;
                                    break;
                              case "13-1":
                              case "13-2":
                                    views.inquiry_list_title_already = langs.alreadyOutgoing;
                                    break;
                              case "13-3":
                              case "13-5":
                                    views.inquiry_list_title_already = langs.outgoing;
                                    views.inquiry_list_title_should = langs.ingoing;
                                    break;
                              case "20":
                                    views.inquiry_list_title_already = langs.alreadyScrap;
                                    views.inquiry_list_title_should = langs.shouldScrap;
                                    break;
                              default:
                                    views.inquiry_list_title_already = langs.alreadyPutInStorage;
                                    views.inquiry_list_title_should = langs.shouldPutInStorage;
                        }
                        return views;
                  };



                  return self;
            }
      ]);
});