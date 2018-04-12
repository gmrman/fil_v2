define(["app"], function(app) {
    app.service('AppLang', [function() {
        var self = this;
        self.lang_val = "";
        self.langs = {};

        self.langs_reference = {

            //登入頁
            "app_title_image": ["name_t.png", "name_t.png", "name_t.png"], //標題圖片
            "app_name": ["廠內智能物流", "厂内智能物流", "FIL"],
            "user": ["使用者", "使用者", "user"],
            "account": ["帳號", "帐号", "account"],
            "password": ["密碼", "密码", "password"],
            "enterprise": ["企業", "企业", "ENT"],
            "site": ["公司別", "公司别", "SITE"],
            "login": ["登入", "登入", "Login"],
            "sign_out": ["登出", "登出", "sign_out"],
            "setting": ["後台管理", "后台管理", "setting"],
            "copyright": [
                "© 鼎新電腦 著作權所有，並保留一切權利。",
                "© 鼎新电脑 著作权所有，并保留一切权利。",
                "© 鼎新電腦 著作權所有，並保留一切權利。"
            ],

            //設定頁
            "cut": ["分隔", "分隔", "cut"],
            "area": ["區域", "区域", "area"],
            "data": ["資料", "资料", "data"],
            "number": ["編號", "编号", "number"],
            "system": ["系統", "系统", "system"],
            "plant_id": ["廠別", "厂别", "plant_id"],
            "information": ["資訊", "资讯", "information"],
            "voice": ["語音", "语音", "voice"],
            "men": ["男聲", "男音", "men"],
            "women": ["女聲", "女音", "women"],
            "novoice": ["不發聲", "不发音", "novoice"],
            "fontSize": ["字體大小", "字体大小", "fontSize"],
            "normal": ["正常", "正常", "normal"],
            "large": ["大", "大", "large"],
            "great": ["特大", "特大", "great"],
            "language": ["語言", "语言", "language"],
            "english": ["英文", "英文", "english"],
            "traditional": ["繁體中文", "繁体中文", "traditional"],
            "simplified": ["簡體中文", "简体中文", "simplified"],
            "department_name": ["部門名稱", "部门名称", "department_name"],
            "show_type": ["顯示方式", "显示方式", "show_type"],
            "permission_ip": ["權限主機 IP", "权限主机 IP", "permission_ip"],
            "server_product": ["產品別", "产品别", "server_product"],
            "is_show_feature": ["是否顯示產品特徵", "是否显示产品特征", "is_show_feature"],
            "is_show_multi_unit": ["是否使用多單位", "是否使用多单位", "is_show_multi_unit"],
            "multi_unit": ["多單位", "多单位", "multi unit"],
            "is_show_valuation_unit": ["是否使用計價單位", "是否使用计价单位", "is_show_valuation_unit"],
            "is_FIFO": ["管理先進先出否", "管理先进先出否", "is_FIFO"],
            "lot_auto": ["單據類入項是否自動產批號", "单据类入项是否自动产批号", "lot_auto"],
            "camera_used": ["手機使用相機鏡頭", "手机使用相机镜头", "camera_used"],
            "report_datetime": ["基礎資料更新日", "基础资料更新日", "report_datetime"],
            "inventory_display": ["盤點庫存量是否顯示", "盘点库存量是否显示", "inventory_display"],
            "manage_barcode_inventory": ["條碼庫存管理方式", "条码库存管理方式", "manage_barcode_inventory"],

            //報工 QC
            "eligible": ["合格", "合格", "Eligible"],
            "uneligible": ["不合格", "不合格", "Uneligible"],
            "move_in": ["進站", "投产", "Move In"],
            "move_out": ["出站", "转移", "Move Out"],
            "check_in": ["上線", "上线", "Check In"],
            "check_out": ["下線", "下线", "Check Out"],
            "job_number": ["作業編號", "作业编号", "Job Number"],
            "job_name": ["作業名稱", "作业名称", "Job Name"],
            "job_seq": ["作業序", "作业序", "Job Seq"],
            "job": ["作業", "作业", "Job"],
            "bad": ["不良", "不良", "Bad"],
            "scrap": ["報廢", "报废", "scrap"],
            "shift": ["班別", "班别", "Shift"],
            "judge": ["判定", "判定", "judge"],
            "break": ["破壞", "破坏", "break"],
            "level": ["等級", "等级", "level"],
            "reject": ["驗退", "验退", "reject"],
            "result": ["结果", "结果", "result"],
            "reason": ["原因", "原因", "reason"],
            "status": ["狀態", "状态", "status"],
            "quality": ["允收", "允收", "quality"],
            "project": ["項目", "项目", "project"],
            "machine": ["機器", "机器", "Machine"],
            "examine": ["檢驗", "检验", "examine"],
            "inspect": ["送檢", "送检", "inspect"],
            "hangseq": ["行序", "行序", "seq"],
            "tolerance": ["容差", "容差", "tolerance"],
            "RDinspect": ["抽驗", "抽验", "radom respect"],
            "rejection": ["拒收", "拒收", "respect"],
            "work_rder": ["工單", "工单", "work_rder"],
            "work_time": ["工時", "工时", "Work Time"],
            "inspection": ["送驗", "送验", "inspection"],
            "particular": ["特採", "特采", "particular"],
            "daily_work": ["報工", "报工", "Daily Work"],
            "shortcoming": ["缺點", "缺点", "Shortcoming"],
            "measure": ["測量值", "测量值", "measure"],
            "workstation": ["工作站", "工作站", "Workstation"],
            "machine_time": ["機時", "机时", "Machine Time"],
            "circulation_card": ["流轉卡", "流转卡", "circulation_card"],
            "ng_qty_error": ["NG 數量不可大於報廢數量！", "NG 数量不可大于报废数量！", "ng_qty_error"],
            "qc_maxqty_error": ["檢驗數量不可大於待驗批量！", "检验数量不可大于待验批量！", "qc_maxqty_error"],
            "defect_qty_error": ["缺點數量不可大於不良數量！", "缺点数量不可大于不良数量！", "defect_qty_error"],
            "dailyWork_employee_no_error": ["未設定人員！", "未设定报工人员！", "dailyWork_employee_no_error"],
            "input_defect_qty_error": [
                "輸入的不良數量不可以等於零！",
                "输入的不良数量不可以等于零！",
                "input_defect_qty_error"
            ],
            "dailyWork_work_qty_error": [
                "報工數量 + 報廢數量不可大於可報工量！",
                "报工数量 + 报废数量不可大于可报工量！",
                "dailyWork_work_qty_error"
            ],
            "measure_list_more_than_sampling_qty": [
                "測量值單身數量大於檢驗數量！",
                "测量值单身数量大于检验数量！",
                "measure_list_more_than_sampling_qty"
            ],
            "measure_list_less_than_sampling_qty": [
                "測量值單身數量小於檢驗數量！",
                "测量值单身数量小于检验数量！",
                "measure_list_less_than_sampling_qty"
            ],

            "item_no": ["料號", "料号", "item no"],
            "feature": ["特徵", "特征", "feature"],
            "material": ["物料", "料件", "material"],
            "product_no": ["品號", "品号", "product_name"],
            "product_name": ["品名", "品名", "product_name"],
            "item_feature": ["產品特徵", "产品特征", "item_feature"],
            "specification": ["規格", "规格", "specification"],
            "item_feature_no": ["特徵碼", "特征码", "item_feature_no"],
            "item_feature_name": ["特徵說明", "特征说明", "item_feature_name"],

            "origin": ["來源", "来源", "origin"],
            "purpose": ["目的", "目的", "purpose"],
            "receipt": ["單據", "单据", "receipt"],
            "docno": ["單號", "单号", "docno"],
            "seq": ["項次", "项次", "seq"],

            "no": ["否", "否", "no"],
            "yes": ["是", "是", "yes"],
            "doc": ["單", "单", "doc"],
            "not": ["無", "无", "not"],
            "row": ["行", "行", "row"],
            "new": ["新", "新", "new"],
            "one": ["一", "一", "one"],
            "two": ["二", "二", "two"],
            "send": ["送", "送", "send"],
            "have": ["有", "有", "have"],
            "mete": ["量", "量", "mete"],
            "item": ["料", "料", "item"],
            "stay": ["待", "待", "stay"],
            "pass": ["過", "过", "pass"],
            "state": ["申", "申", "state"],
            "these": ["此", "此", "these"],
            "minute": ["分", "分", "minute"],
            "please": ["請", "请", "please"],
            "already": ["已", "已", "already"],
            "molecular": ["子", "子", "molecular"],
            "denominator": ["母", "母", "denominator"],

            "lot": ["批號", "批号", "lot"],
            "qty": ["數量", "数量", "Quantity"],
            "set": ["設定", "设定", "set"],
            "main": ["主要", "主要", "main"],
            "bind": ["綁定", "绑定", "bind"],
            "both": ["兩者", "两者", "both"],
            "date": ["日期", "日期", "date"],
            "name": ["姓名", "姓名", "name"],
            "plan": ["計畫", "计划", "plan"],
            "post": ["過帳", "过帐", "post"],
            "save": ["保存", "保存", "save"],
            "sale": ["銷售", "销售", "sale"],
            "unit": ["單位", "单位", "unit"],
            "time": ["時間", "时间", "time"],
            "name": ["名稱", "名称", "name"],
            "multi": ["多筆", "多笔", "multi"],
            "order": ["訂單", "订单", "order"],
            "apply": ["申請", "申请", "apply"],
            "bring": ["產生", "产生", "bring"],
            "enter": ["進入", "进入", "enter"],
            "froze": ["凍結", "冻结", "froze"],
            "genre": ["類型", "类别", "genre"],
            "input": ["輸入", "输入", "input"],
            "label": ["標籤", "标签", "label"],
            "notes": ["備註", "备注", "notes"],
            "other": ["其他", "其他", "other"],
            "point": ["提示", "提示", "point"],
            "print": ["列印", "打印", "print"],
            "split": ["拆分", "拆分", "split"],
            "start": ["起始", "起始", "start"],
            "stock": ["庫存", "库存", "stock"],
            "wrong": ["錯誤", "错误", "wrong"],
            "board": ["看板", "看板", "board"],
            "batch": ["批次", "批次", "batch"],
            "report": ["報表", "报表", "report"],
            "cancel": ["取消", "取消", "cancel"],
            "common": ["常用", "常用", "common"],
            "delete": ["刪除", "删除", "delete"],
            "detail": ["明細", "明细", "detail"],
            "entire": ["全部", "全部", "entire"],
            "filter": ["篩選", "筛选", "filter"],
            "insert": ["新增", "新增", "insert"],
            "return": ["退回", "退回", "return"],
            "submit": ["提交", "提交", "submit"],
            "sundry": ["雜項", "杂项", "sundry"],
            "period": ["期間", "期间", "period"],
            "change": ["異動", "异动", "change"],
            "invalid": ["作廢", "作废", "invalid"],
            "packing": ["裝箱", "装箱", "Packing"],
            "orderby": ["排序", "排序", "orderby"],
            "barcode": ["條碼", "条码", "Barcode"],
            "complex": ["綜合", "综合", "complex"],
            "confirm": ["確認", "确认", "confirm"],
            "default": ["預設", "预设", "default"],
            "ingoing": ["撥入", "拨入", "ingoing"],
            "inquire": ["查詢", "查询", "inquire"],
            "shelves": ["上架", "上架", "shelves"],
            "storage": ["儲位", "储位", "storage"],
            "success": ["成功", "成功", "success"],
            "surplus": ["剩餘", "剩余", "surplus"],
            "process": ["工藝", "工艺", "process"],
            "produce": ["生產", "生产", "produce"],
            "dispatch": ["派工", "派工", "dispatch"],
            "doc_slip": ["單別", "单别", "doc_slip"],
            "back_off": ["倒扣", "倒扣", "back_off"],
            "customer": ["客戶", "客户", "customer"],
            "delivery": ["出貨", "出货", "delivery"],
            "download": ["下載", "下载", "download"],
            "employee": ["員工", "员工", "employee"],
            "maintain": ["維護", "维护", "maintain"],
            "outgoing": ["撥出", "拨出", "outgoing"],
            "purchase": ["採購", "采购", "purchase"],
            "received": ["已收", "已收", "received"],
            "scanning": ["掃描", "扫描", "scanning"],
            "upcoming": ["待辦", "待办", "upcoming"],
            "total_qty": ["總數", "总数", "total_qty"],
            "bluetooth": ["藍牙", "藍牙", "Bluetooth"],
            "situation": ["狀況", "异动", "situation"],
            "condition": ["條件", "条件", "condition"],
            "different": ["不同", "不同", "different"],
            "directive": ["指示", "指示", "directive"],
            "transport": ["搬運", "搬运", "transport"],
            "effective": ["有效", "有效", "effective"],
            "inventory": ["盤點", "盘点", "inventory"],
            "personnel": ["人員", "人员", "personnel"],
            "reference": ["參考", "参考", "reference"],
            "shipments": ["送貨", "送货", "shipments"],
            "warehouse": ["倉庫", "仓库", "warehouse"],
            "valuation": ["計價", "计价", "warehouse"],
            "completion": ["完工", "完工", "completion"],
            "department": ["部門", "部门", "department"],
            "management": ["管理", "管理", "management"],
            "receiveing": ["收貨", "收货", "receiveing"],
            "description": ["說明", "说明", "description"],
            "goods_issue": ["發料", "发料", "goods_issue"],
            "first_count": ["初盤", "初盘", "first_count"],
            "second_count": ["複盤", "复盘", "second_count"],
            "abbreviation": ["簡稱", "簡稱", "abbreviation"],
            "insufficient": ["不足", "不足", "insufficient"],
            "receive_item": ["收料", "收料", "receive_item"],
            "detailed_list": ["清冊", "清册", "detailed_list"],
            "never_receive": ["未收", "未收", "never_receive"],
            "put_in_storage": ["入庫", "入库", "put_in_storage"],
            "return_material": ["退料", "退料", "return_material"],
            "return_shipments": ["退貨", "退货", "return_shipments"],
            "replenish_material": ["補料", "补料", "replenish_material"],

            "printer": ["印表機", "打印機", "printer"],
            "box_qty": ["箱裝量", "箱装量", "box_qty"],
            "not_use": ["不使用", "不使用", "Do not use"],
            "supplier": ["供應商", "供应商", "supplier"],
            "batch_qty": ["批次量", "批次量", "batch_qty"],
            "reason_no": ["理由碼", "理由码", "reason_no"],
            "first_time": ["第一次", "第一次", "first_time"],
            "not_required": ["不需要", "不需要", "not_required"],
            "system_number": ["在制数", "在制数", "system_number"],
            "warehouse_storage_lot": ["倉儲批", "仓储批", "Warehouse Storage Lot"],

            //系統error
            "timeout_error": ["等待時間超過系統上限！", "等待时间超过系统上限！", "timeout_error"],
            "check_permission": ["檢查權限中", "检查权限中", "check_permission"],
            "non_standard_format": ["非標準格式", "非标准格式", "non_standard_format"],
            "ws_return_error": ["WS返回數據錯誤！", "WS返回数据错误！", "ws_return_error"],
            "ws_connection_error": ["與ERP接口連接異常！", "与ERP接口连接异常！", "ws_connection_error"],
            "permission_connection_error": ["與權限主機連接異常！", "与权限主机连接异常！", "permission_connection_error"],
            "account_or_password_not_null": ["帳號或密碼不能為空！", "帐号或密码不能为空！", "Account or password can not be empty"],

            "basic_data_download": ["基礎資料下載中", "基础资料下载中", "basic_data_download"],
            "inventory_data_download": ["盤點資料下載中", "盘点资料下载中", "inventory_data_download"],
            "inventory_data_upload": ["盤點資料上傳中", "盘点资料上传中", "inventory_data_upload"],
            "basic_data_download_time": ["基礎資料下載秒數", "基础资料下载秒数", "Basic data download seconds"],
            "inventory_operation_time": ["盤點作業下載秒數", "盘点作业下载秒数", "inventory_operation_time"],
            "out_in_operation_time": ["一般資料下載秒數", "一般资料下载秒数", "out_in_operation_time"],

            "select_all": ["全選", "全选", "select_all"],
            "not_select_all": ["不全選", "全不选", "not_select_all"],
            "last_week": ["上週", "上周", "last_week"],
            "last_month": ["上個月", "上个月", "last_month"],
            "three_months_ago": ["前三個月", "前三个月", "three_months_ago"],
            "last_year": ["去年", "去年", "last_year"],
            "unfinished": ["未完事項", "未完事项", "unfinished"],
            "expected_delivery": ["預計交期", "预计交期", "expected_delivery"],
            "plan_date_s": ["預計開工日期", "预计开工日期", "plan_date_s"],
            "please_choose": ["請選擇", "请选择", "please_choose"],
            "start_scan": ["請開始掃描", "请开始扫描", "start_scan"],
            "searchKeyword": ["搜索關鍵字", "搜索关键字", "searchKeyword"],
            "search": ["搜索", "搜索", "search"],
            "keyword": ["關鍵字", "关键字", "keyword"],
            "edit": ["請修改", "请修改", "edit"],
            "check": ["是否", "是否", "check"],
            "checkField": ["是否為", "是否为", "checkField"],
            "checkSubmit": ["是否提交", "是否提交", "checkSubmit"],
            "checkJumpTo": ["是否跳至", "是否跳至", "checkJumpTo"],
            "not_null": ["不可為空", "不可为空", "not_null"],
            "not_storage": ["不是儲位", "不是储位", "not_storage"],
            "not_warehouse": ["不是倉庫", "不是仓库", "not_warehouse"],
            "not_reason_no": ["不是理由碼", "不是理由码", "not_reason_no"],
            "reason_no_error": ["理由碼不可為空", "理由码不可为空", "reason_no_error"],
            "sel_item_error": ["請選擇料件！", "请选择料件！", "sel_item_error"],
            "picks_error": ["可揀貨數量不足！", "可拣货数量不足！", "picks_error"],
            "picks_error_1": ["輸入數量大於允出數量！", "输入数量大于允出数量！", "picks_error_1"],
            "picks_error_2": ["輸入數量大於允收數量！", "输入数量大于允收数量！", "picks_error_2"],
            "picks_error_3": ["輸入數量小於裝箱數量！", "输入数量小于装箱数量！", "picks_error_3"],
            "qty_error": ["數量不匹配", "数量不匹配", "The quantity does not match"],
            "show_zero_inventory": ["顯示零庫存", "显示零库存", "show_zero_inventory"],
            "not_exist_or_invalid": ["不存在或無效", "不存在或无效！", "not_exist_or_invalid"],
            "data_duplication_error": ["資料重複！", "资料重复！", "data_duplication_error"],
            "no_matching_data_error": ["無符合資料！", "无符合资料！", "no_matching_data_error"],
            "barcode_duplication_error": ["條碼重複！", "条码重复！", "barcode_duplication_error"],
            "Pbarcode_duplication_error": ["裝箱條碼重複！", "装箱条码重复！", "Pbarcode_duplication_error"],
            "allocation_seq_error": ["相同項次撥入倉儲需一致！", "相同项次拨入仓储需一致！", "allocation_seq_error"],
            "outgoing_warehouse_no_error": [
                "撥出倉儲不可等於撥入倉儲！",
                "拨出仓储不可等于拨入仓储！",
                "outgoing_warehouse_no_error"
            ],
            "outing_warehouse_cost_error": [
                "撥出倉儲及撥入倉儲，必須同為成本倉或同為非成本倉！",
                "拨出仓储及拨入仓储，必须同为成本仓或同为非成本仓！",
                "outing_warehouse_cost_error"
            ],

            "stockcount_error": [
                "未做過初盤或初盤差異調整的條碼不允許複盤！",
                "未做过初盘或初盘差异调整的条码不允许复盘！",
                "stockcount_error"
            ],
            "storage_management_error": [
                "此倉庫使用儲位管理，請選擇儲位！",
                "此仓库使用储位管理，请选择储位！",
                "storage_management_error"
            ],
            "storage_management_error2": [
                "此倉庫使用儲位管理，請確認單據儲位！",
                "此仓库使用储位管理，请确认单据储位！",
                "storage_management_error2"
            ],
            "barcode_material_different_error": [
                "條碼對應的物料不存在於單據！",
                "条码对应的物料不存在于单据！",
                "barcode_material_different_error"
            ],
            "barcode_doc_wsl_different_error": [
                "條碼倉儲批與單據不符！",
                "条码仓储批与单据不符！",
                "barcode_doc_wsl_different_error"
            ],
            "barcode_doc_origin_different_error": [
                "條碼來源與單據不符！",
                "条码来源与单据不符！",
                "barcode_doc_origin_different_error"
            ],
            "sel_item_exist_error": [
                "勾選的資料都已經存在單身資料中！",
                "勾选的资料都已经存在单身资料中！",
                "sel_item_exist_error"
            ],
            "barcode_not_relevant_inventory": [
                "該條碼沒有查詢到相關庫存資料！",
                "该条码没有查询到相关库存资料！",
                "barcode_not_relevant_inventory"
            ],
            "check_clear_data": [
                "所選單號有未成功提交的條碼掃描明細是否捨棄？",
                "所选单号有未成功提交的条码扫描明细是否舍弃？",
                "check_clear_data"
            ],
            "lot_control_point": [
                "該料號批號管控為不可有批號，是否清空批號新增該筆掃描資料？",
                "该料号批号管控为不可有批号，是否清空批号新增该笔扫描资料？",
                "lot_control_point"
            ],
            "lot_control_error": [
                "料號批號管控為必須要有批號，因未輸入批號，不新增至掃描資料！",
                "料号批号管控为必须要有批号，因未输入批号，不新增至扫描资料！",
                "lot_control_error"
            ],
            "lot_control_error_1": [
                "料號批號管控為必須要有批號！",
                "料号批号管控为必须要有批号！",
                "lot_control_error_1"
            ],
            "lot_control_error_2": [
                "料號批號管控為不可有批號！",
                "料号批号管控为不可有批号！",
                "lot_control_error_2"
            ],
            "lot_control_submit_error": [
                "料號批號管控為必須要有批號，因未輸入批號，無法提交！",
                "料号批号管控为必须要有批号，因未输入批号，无法提交！",
                "lot_control_submit_error"
            ],
            "fil_14_check_clear_data": [
                "有未提交的盤點明細是否捨棄？",
                "有未提交的盘点明细是否舍弃？",
                "fil_14_check_clear_data"
            ],
            "check_clear_submit_data": [
                "有未提交的資料是否捨棄？",
                "有未提交的资料是否舍弃？",
                "check_clear_submit_data"
            ],
            "fil_19_check_clear_list": [
                "是否一併刪除清單資料？",
                "是否一并删除清单资料？",
                "fil_19_check_clear_list"
            ],
            "fil_19_error_1": [
                "此條碼不可以存在裝箱條碼單身條碼清單中！",
                "此条码不可以存在装箱条码单身条码清单中！",
                "This barcode can not exist in the packing barcode single barcode list!"
            ],
            "fil_19_error_2": [
                "請先掃描裝箱條碼資料！",
                "请先扫描装箱条码资料！",
                "Please check the packing barcode!"
            ],
            "fil_19_error_3": [
                "此裝箱條碼(掃描值)沒有維護對應條碼資料！",
                "此装箱条码(扫描值)没有维护对应条码资料！",
                "This packing barcode (scan value) does not maintain the corresponding barcode information!"
            ],
            "packing_barcode_error": [
                "此裝箱條碼對應的條碼資料不符合單據，此筆掃描資料不新增至掃描明細！",
                "此装箱条码对应的条码资料不符合单据，此笔扫描资料不新增至扫描明细！",
                "packing_barcode_error"
            ],
            "packing_barcode_del_point": [
                "此條碼資料由裝箱條碼帶入，刪除時會刪除多筆資料，是否刪除？",
                "此條碼資料由裝箱條碼帶入，刪除時會刪除多筆資料，是否刪除？",
                "packing_barcode_del_point"
            ],
            "first_in_first_out_control_Y": [
                "掃描條碼資料不存發料指示中，不可新增至掃描明細中！",
                "扫描条码资料不存发料指示中，不可新增至扫描明细中！",
                "first_in_first_out_control_Y"
            ],
            "first_in_first_out_control_W": [
                "掃描條碼資料不存發料指示中！",
                "扫描条码资料不存发料指示中！",
                "first_in_first_out_control_W"
            ],
            "first_in_first_out_control_change_warehouse": [
                "掃描明細中，已有必須控卡先進先出的條碼資料，不可更改指示倉庫！",
                "扫描明细中，已有必须控卡先进先出的条码资料，不可更改指示仓库！",
                "first_in_first_out_control_change_warehouse"
            ],
            "print_point": [
                "已驅動報表列印！",
                "已驱动报表打印！",
                "print_point"
            ],

            //數據匯總使用
            "alreadyIssue": ["已發", "已发", "alreadyIssue"],
            "shouldIssue": ["應發", "应发", "shouldIssue"],
            "alreadyReceive": ["已收", "已收", "alreadyReceive"],
            "shouldReceive": ["應收", "应收", "shouldReceive"],
            "alreadyDelivery": ["已出", "已出", "alreadyDelivery"],
            "shouldDelivery": ["應出", "应出", "shouldDelivery"],
            "alreadyReturn": ["已退", "已退", "alreadyReturn"],
            "shouldReturn": ["應退", "应退", "shouldReturn"],
            "alreadyOutgoing": ["已撥出", "已拨出", "alreadyOutgoing"],
            "shouldOutgoing": ["應撥出", "应拨出", "shouldOutgoing"],
            "alreadyIngoing": ["已撥入", "已拨入", "alreadyIngoing"],
            "shouldIngoing": ["應撥入", "应拨入", "shouldIngoing"],
            "alreadyScrap": ["已報廢", "已报废", "alreadyScrap"],
            "shouldScrap": ["應報廢", "应报废", "shouldScrap"],
            "alreadyPutInStorage": ["已入庫", "已入库", "alreadyPutInStorage"],
            "shouldPutInStorage": ["應入庫", "应入库", "shouldPutInStorage"],
            "data_collection": ["數據匯總", "数据汇总", "data collection"],

            //標題 欄位命名 title_單據編號_流水號
            "title_05_01": ["寄售調撥", "寄售调拨", "title_05_01"],
            "title_05_02": ["銷售撿貨核對", "销售捡货核对", "title_05_02"],
            "title_05_03": ["寄售調撥核對", "寄售调拨核对", "title_05_03"],
            "title_07_01": ["現場叫料", "现场叫料", "title_07_01"],
            "title_07_05": ["領料核對", "领料核对", "title_07_05"],
            "title_08_01": ["現場退料", "现场退料", "title_08_01"],
            "title_10_06": ["轉移入庫", "转移入库", "title_10_06"],
            "title_13_1": ["一階段調撥", "一阶段调拨", "title_13_1"],
            "title_13_2": ["兩階段撥出", "两阶段拨出", "title_13_2"],
            "title_13_3": ["兩階段撥入", "两阶段拨入", "title_13_3"],
            "title_16_1": ["進貨", "进货", "title_16_1"],
            "title_16_2": ["半成品", "半成品", "title_16_2"],
            "title_16_4": ["成品", "成品", "title_16_4"],
            "title_print": ["憑證列印", "凭证打印", "title_print"],
            "title_print_1": ["藍牙標籤列印", "蓝牙标签打印", "title_print_1"],
            "title_print_2": ["標籤列印", "标签打印", "title_print_2"],
            "title_print_3": ["Wifi列印", "Wifi打印", "title_print_3"],
        };

        self.changeLangs = function(sys_language) {
            self.lang_val = sys_language;
            if (sys_language == 'zh_CN') {
                setlang(1);
            } else if (sys_language == 'en_US') {
                setlang(2);
            } else {
                setlang(0);
            }
        };

        self.changeLangs("zh_TW");

        //修改語系
        function setlang(index) {
            var array = Object.keys(self.langs_reference);
            var acb = {};
            for (var i = 0; i < array.length; i++) {
                var temp = array[i];
                var ref = temp;
                if (angular.isArray(self.langs_reference[temp])) {
                    ref = self.langs_reference[temp][index];
                }
                self.langs[temp] = ref;
            }
        }
    }]);
});