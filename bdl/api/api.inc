IMPORT util
SCHEMA ds
GLOBALS
   DEFINE g_result                  util.JSONObject   #{"message":"","data":[]}
   DEFINE jsonobj                   util.JSONObject   #主要用于解析前端API协议header部份
   DEFINE jsonarr                   util.JSONArray    #主要用于解析头端API的数据部份
   DEFINE result                    STRING            #JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
   DEFINE web                       STRING            #WebComponent variable
   DEFINE res                       STRING            #JavaScript return value
   DEFINE type                      STRING            #api type
   DEFINE operation                 STRING            #operation
   DEFINE g_datetime                STRING            # yyyy-MM-dd HH:mm:ss.SSSSS
   DEFINE g_scanno                  STRING            # yyyyMMddHHmmssSSSSS
   DEFINE g_user                    STRING            #使用者帐号
   DEFINE g_status                  RECORD
            code                       BOOLEAN,       #0:success, 其他:fail
            message                    STRING,        #说明信息
            data                       STRING         #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                                    END RECORD
   DEFINE g_basicInfo               RECORD            #紀錄系統資訊，一開始載入系統會由SQLLITE給值
            server_ip                  LIKE basicinformation.server_ip,                   #後台主機IP
            server_area                LIKE basicinformation.server_area,                 #後台主機區域
            server_product             LIKE basicinformation.server_product,              #後台主機產品別
            permission_ip              LIKE basicinformation.permission_ip,               #後台權限主機IP
            barcode_repeat             LIKE basicinformation.barcode_repeat,              #條碼庫存可重複
            barcode_separator          LIKE basicinformation.barcode_separator,           #條碼分隔
            warehouse_separator        LIKE basicinformation.warehouse_separator,         #倉庫分隔
            plant_id                   LIKE basicinformation.plant_id,                    #廠別
            mr_no                      LIKE basicinformation.mr_no,                       #雜收單別
            mi_no                      LIKE basicinformation.mi_no,                       #雜發單別
            reason_no                  LIKE basicinformation.reason_no,                   #理由碼
            camera_used                LIKE basicinformation.camera_used,                 #手機使用相機鏡頭
            lot_auto                   LIKE basicinformation.lot_auto,                    #由WS取得批號
            inventory_display          LIKE basicinformation.inventory_display,           #盤點庫存量是否顯示
            report_ent                 LIKE basicinformation.report_ent,                  #基礎資料更新企業
            report_site                LIKE basicinformation.report_site,                 #基礎資料更新SITE
            report_datetime            LIKE basicinformation.report_datetime,             #基礎資料更新日
            warehouse_no               LIKE basicinformation.warehouse_no,                #倉庫
            warehouse_no_cost          LIKE stockinformation.warehouse_cost,              #倉庫成本否
            isDisplay_no               LIKE basicinformation.isDisplay_no,                #顯示方式
            isDisplay_name             LIKE basicinformation.isDisplay_name,              #顯示方式
            isDisplay_spec             LIKE basicinformation.isDisplay_spec,              #顯示方式
            font_size                  LIKE basicinformation.font_size,                   #字體大小
            workstation_no             LIKE basicinformation.workstation_no,              #工作站編號
            workstation_name           LIKE basicinformation.workstation_name,            #工作站名稱
            machine_no                 LIKE basicinformation.machine_no,                  #機台編號
            machine_name               LIKE basicinformation.machine_name,                #機台名稱
            shift_no                   LIKE basicinformation.shift_no,                    #班別
            all_1_no                   LIKE basicinformation.all_1_no,                    #一階段調撥單別
            all_2_no                   LIKE basicinformation.all_2_no,                    #二階段撥出單別
            all_3_no                   LIKE basicinformation.all_3_no,                    #二階段撥入單別
            warehouse_way_cost         LIKE basicinformation.warehouse_way_cost,          #在途成本庫位
            warehouse_way              LIKE basicinformation.warehouse_way,               #在途非成本庫位
            condition_start_date_type  LIKE basicinformation.condition_start_date_type,   #篩選條件起始日期類別
            condition_start_date       LIKE basicinformation.condition_start_date,        #篩選條件起始日期
            basic_data_download        LIKE basicinformation.basic_data_download,         #基礎資料下載 Timeout秒數
            inventory_operation        LIKE basicinformation.inventory_operation,         #庫存資料下載 Timeout秒數
            out_in_operation           LIKE basicinformation.out_in_operation,            #一般資料下載 Timeout秒數
            BT_printer                 LIKE basicinformation.BT_printer,                  #藍牙印表機類型
            valuation_unit             LIKE basicinformation.valuation_unit               #是否使用計價單位
                                    END RECORD
   DEFINE g_userInfo                RECORD            #紀錄使用者資訊，一開始載入系統會由SQLLITE給值
            enterprise_no              LIKE userinformation.enterprise_no,              #企業代碼
            site_no                    LIKE userinformation.site_no,                    #營運據點
            account                    LIKE userinformation.account,                    #使用者帳號
            employee_no                LIKE userinformation.employee_no,                #員工編號
            employee_name              LIKE userinformation.employee_name,              #員工姓名
            language                   LIKE userinformation.language,                   #使用語言
            department_no              LIKE userinformation.department_no,              #部門編號
            department_name            LIKE userinformation.department_name,            #部門名稱
            last_log_time              LIKE userinformation.last_log_time,              #最後登入時間
            log_in                     LIKE userinformation.log_in,                     #已登入
            server_ip                  LIKE userinformation.server_ip,                  #後台主機IP
            server_area                LIKE userinformation.server_area,                #後台主機區域
            manage_barcode_inventory   LIKE userinformation.manage_barcode_inventory,   #條碼庫存管理方式
            feature                    LIKE userinformation.feature                     #是否顯示產品特徵
                                    END RECORD
END GLOBALS