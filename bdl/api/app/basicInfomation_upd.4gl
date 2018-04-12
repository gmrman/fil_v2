IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION basicinformation_upd(p_json)
   DEFINE p_json                    util.JSONArray
   DEFINE tempobj                   util.JSONObject
   DEFINE l_cnt                     INTEGER
   DEFINE l_return_str              STRING
   DEFINE l_insert                  BOOLEAN
   DEFINE l_basicinformation        RECORD
             server_ip                 LIKE basicinformation.server_ip,                   #後台主機IP
             server_area               LIKE basicinformation.server_area,                 #後台主機區域
             server_product            LIKE basicinformation.server_product,              #後台主機產品別
             permission_ip             LIKE basicinformation.permission_ip,               #後台權限主機IP
             barcode_repeat            LIKE basicinformation.barcode_repeat,              #條碼庫存可重複
             barcode_separator         LIKE basicinformation.barcode_separator,           #條碼分隔
             warehouse_separator       LIKE basicinformation.warehouse_separator,         #倉庫分隔
             plant_id                  LIKE basicinformation.plant_id,                    #廠別
             mr_no                     LIKE basicinformation.mr_no,                       #雜收單別
             mi_no                     LIKE basicinformation.mi_no,                       #雜發單別
             reason_no                 LIKE basicinformation.reason_no,                   #理由碼
             camera_used               LIKE basicinformation.camera_used,                 #手機使用相機鏡頭
             lot_auto                  LIKE basicinformation.lot_auto,                    #由WS取得批號
             inventory_display         LIKE basicinformation.inventory_display,           #盤點庫存量是否顯示
             report_ent                LIKE basicinformation.report_ent,                  #基礎資料更新企業
             report_site               LIKE basicinformation.report_site,                 #基礎資料更新SITE
             report_datetime           STRING,                                            #基礎資料更新日
             warehouse_no              LIKE basicinformation.warehouse_no,                #倉庫
             warehouse_no_cost         LIKE stockinformation.warehouse_cost,              #倉庫成本否
             isDisplay_no              LIKE basicinformation.isDisplay_no,                #顯示方式
             isDisplay_name            LIKE basicinformation.isDisplay_name,              #顯示方式
             isDisplay_spec            LIKE basicinformation.isDisplay_spec,              #顯示方式
             font_size                 LIKE basicinformation.font_size,                   #字體大小
             workstation_no            LIKE basicinformation.workstation_no,              #工作站編號
             workstation_name          LIKE basicinformation.workstation_name,            #工作站名稱
             machine_no                LIKE basicinformation.machine_no,                  #機台編號
             machine_name              LIKE basicinformation.machine_name,                #機台名稱
             shift_no                  LIKE basicinformation.shift_no,                    #班別
             all_1_no                  LIKE basicinformation.all_1_no,                    #一階段調撥單別
             all_2_no                  LIKE basicinformation.all_2_no,                    #二階段撥出單別
             all_3_no                  LIKE basicinformation.all_3_no,                    #二階段撥入單別
             warehouse_way_cost        LIKE basicinformation.warehouse_way_cost,          #在途成本庫位
             warehouse_way             LIKE basicinformation.warehouse_way,               #在途非成本庫位
             condition_start_date_type LIKE basicinformation.condition_start_date_type,   #篩選條件起始日期類別
             condition_start_date      LIKE basicinformation.condition_start_date,        #篩選條件起始日期
             basic_data_download       LIKE basicinformation.basic_data_download,         #基礎資料下載 Timeout秒數
             inventory_operation       LIKE basicinformation.inventory_operation,         #庫存資料下載 Timeout秒數
             out_in_operation          LIKE basicinformation.out_in_operation,            #一般資料下載 Timeout秒數
             BT_printer                LIKE basicinformation.BT_printer,                  #藍牙印表機類型
             valuation_unit            LIKE basicinformation.valuation_unit               #是否使用計價單位
                                    END RECORD
   DEFINE obj                       RECORD
             server_ip                 LIKE basicinformation.server_ip,                   #後台主機IP
             server_area               LIKE basicinformation.server_area,                 #後台主機區域
             server_product            LIKE basicinformation.server_product,              #後台主機產品別
             permission_ip             LIKE basicinformation.permission_ip,               #後台權限主機IP
             barcode_repeat            LIKE basicinformation.barcode_repeat,              #條碼庫存可重複
             barcode_separator         LIKE basicinformation.barcode_separator,           #條碼分隔
             warehouse_separator       LIKE basicinformation.warehouse_separator,         #倉庫分隔
             plant_id                  LIKE basicinformation.plant_id,                    #廠別
             mr_no                     LIKE basicinformation.mr_no,                       #雜收單別
             mi_no                     LIKE basicinformation.mi_no,                       #雜發單別
             reason_no                 LIKE basicinformation.reason_no,                   #理由碼
             camera_used               LIKE basicinformation.camera_used,                 #手機使用相機鏡頭
             lot_auto                  LIKE basicinformation.lot_auto,                    #由WS取得批號
             inventory_display         LIKE basicinformation.inventory_display,           #盤點庫存量是否顯示
             report_ent                LIKE basicinformation.report_ent,                  #基礎資料更新企業
             report_site               LIKE basicinformation.report_site,                 #基礎資料更新SITE
             report_datetime           STRING,                                            #基礎資料更新日
             warehouse_no              LIKE basicinformation.warehouse_no,                #倉庫
             warehouse_no_cost         LIKE stockinformation.warehouse_cost,              #倉庫成本否
             isDisplay_no              LIKE basicinformation.isDisplay_no,                #顯示方式
             isDisplay_name            LIKE basicinformation.isDisplay_name,              #顯示方式
             isDisplay_spec            LIKE basicinformation.isDisplay_spec,              #顯示方式
             font_size                 LIKE basicinformation.font_size,                   #字體大小
             workstation_no            LIKE basicinformation.workstation_no,              #工作站編號
             workstation_name          LIKE basicinformation.workstation_name,            #工作站名稱
             machine_no                LIKE basicinformation.machine_no,                  #機台編號
             machine_name              LIKE basicinformation.machine_name,                #機台名稱
             shift_no                  LIKE basicinformation.shift_no,                    #班別
             all_1_no                  LIKE basicinformation.all_1_no,                    #一階段調撥單別
             all_2_no                  LIKE basicinformation.all_2_no,                    #二階段撥出單別
             all_3_no                  LIKE basicinformation.all_3_no,                    #二階段撥入單別
             warehouse_way_cost        LIKE basicinformation.warehouse_way_cost,          #在途成本庫位
             warehouse_way             LIKE basicinformation.warehouse_way,               #在途非成本庫位
             condition_start_date_type LIKE basicinformation.condition_start_date_type,   #篩選條件起始日期類別
             condition_start_date      LIKE basicinformation.condition_start_date,        #篩選條件起始日期
             basic_data_download       LIKE basicinformation.basic_data_download,         #基礎資料下載 Timeout秒數
             inventory_operation       LIKE basicinformation.inventory_operation,         #庫存資料下載 Timeout秒數
             out_in_operation          LIKE basicinformation.out_in_operation,            #一般資料下載 Timeout秒數
             BT_printer                LIKE basicinformation.BT_printer,                  #藍牙印表機類型
             valuation_unit            LIKE basicinformation.valuation_unit,              #是否使用計價單位
             
             enterprise_no             LIKE userinformation.enterprise_no,                #企業代碼
             site_no                   LIKE userinformation.site_no,                      #營運據點
             account                   LIKE userinformation.account,                      #使用者帳號
             employee_no               LIKE userinformation.employee_no,                  #員工編號
             employee_name             LIKE userinformation.employee_name,                #員工姓名
             language                  LIKE userinformation.language,                     #使用語言
             department_no             LIKE userinformation.department_no,                #部門編號
             department_name           LIKE userinformation.department_name,              #部門名稱
             last_log_time             LIKE userinformation.last_log_time,                #最後登入時間
             log_in                    LIKE userinformation.log_in,                       #已登入
             manage_barcode_inventory  LIKE userinformation.manage_barcode_inventory,     #條碼庫存管理方式
             feature                   LIKE userinformation.feature                       #顯示產品特徵
                                    END RECORD

   DISPLAY p_json
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(obj)

   SELECT * INTO l_basicinformation.*
   FROM basicinformation

   LET l_insert = TRUE
   IF (l_basicinformation.server_ip != obj.server_ip) OR
      cl_null(l_basicinformation.server_ip) OR
      cl_null(obj.server_ip) THEN
      LET l_insert = FALSE
   END IF

   IF (l_basicinformation.server_area != obj.server_area) THEN
      LET l_insert = FALSE
   END IF
   
   IF (l_basicinformation.server_product != obj.server_product) OR
      cl_null(l_basicinformation.server_product) OR
      cl_null(obj.server_product) THEN
      LET l_insert = FALSE
   END IF

   #如果 IP / 區域 / 產品別 與資料庫不同 清除所有設定資料
   IF NOT(l_insert) THEN
      LET obj.barcode_repeat            = NULL
      LET obj.barcode_separator         = NULL
      LET obj.warehouse_separator       = NULL
      LET obj.plant_id                  = NULL
      LET obj.mr_no                     = NULL
      LET obj.mi_no                     = NULL
      LET obj.reason_no                 = NULL
      LET obj.camera_used               = NULL
      LET obj.lot_auto                  = NULL
      LET obj.inventory_display         = NULL
      LET obj.report_ent                = NULL
      LET obj.report_site               = NULL
      LET obj.report_datetime           = NULL
      LET obj.warehouse_no              = NULL
      LET obj.warehouse_no_cost         = NULL
      LET obj.isDisplay_no              = NULL
      LET obj.isDisplay_name            = NULL
      LET obj.isDisplay_spec            = NULL
      LET obj.font_size                 = NULL        
      LET obj.workstation_no            = NULL
      LET obj.workstation_name          = NULL
      LET obj.machine_no                = NULL
      LET obj.machine_name              = NULL
      LET obj.shift_no                  = NULL
      LET obj.all_1_no                  = NULL
      LET obj.all_2_no                  = NULL
      LET obj.all_3_no                  = NULL
      LET obj.warehouse_way_cost        = NULL
      LET obj.warehouse_way             = NULL
      LET obj.condition_start_date_type = NULL
      LET obj.condition_start_date      = NULL
      LET obj.basic_data_download       = NULL
      LET obj.inventory_operation       = NULL
      LET obj.out_in_operation          = NULL
      LET obj.BT_printer                = NULL
      LET obj.valuation_unit            = NULL
      
      #修改IP後 清除庫位DB
      DELETE FROM stockinformation
      IF SQLCA.sqlcode THEN 
         RETURN '[{"data":false,"message":"DELETE stockinformation ERROR"}]' 
      END IF

      #修改IP後 清除使用者資訊
      DELETE FROM userinformation
      IF SQLCA.sqlcode THEN 
         RETURN '[{"data":false,"message":"DELETE userinformation ERROR"}]' 
      END IF

   END IF

   DELETE FROM basicinformation
   INSERT INTO basicinformation (server_ip,server_area,server_product,permission_ip,barcode_repeat,barcode_separator,warehouse_separator,
                                plant_id,mr_no,mi_no,reason_no,camera_used,lot_auto,inventory_display,
                                report_ent,report_site,report_datetime,
                                warehouse_no,isDisplay_no,isDisplay_name,isDisplay_spec,font_size,
                                workstation_no,workstation_name,warehouse_no,machine_name,shift_no,all_1_no,
                                all_2_no,all_3_no,warehouse_way_cost,warehouse_way,condition_start_date_type,condition_start_date,
                                basic_data_download,inventory_operation,out_in_operation,BT_printer,valuation_unit)
                        VALUES (obj.server_ip,obj.server_area,obj.server_product,obj.permission_ip,obj.barcode_repeat,obj.barcode_separator,obj.warehouse_separator,
                                obj.plant_id,obj.mr_no,obj.mi_no,obj.reason_no,obj.camera_used,obj.lot_auto,obj.inventory_display,
                                obj.report_ent,obj.report_site,obj.report_datetime,
                                obj.warehouse_no,obj.isDisplay_no,obj.isDisplay_name,obj.isDisplay_spec,obj.font_size,
                                obj.workstation_no,obj.workstation_name,obj.warehouse_no,obj.machine_name,obj.shift_no,obj.all_1_no,
                                obj.all_2_no,obj.all_3_no,obj.warehouse_way_cost,obj.warehouse_way,obj.condition_start_date_type,obj.condition_start_date,
                                obj.basic_data_download,obj.inventory_operation,obj.out_in_operation,obj.BT_printer,obj.valuation_unit)
   IF SQLCA.sqlcode THEN RETURN '[{"data":false,"message":"INSERT basicinformation ERROR"}]' END IF

   IF NOT cl_null(obj.enterprise_no) AND
      NOT cl_null(obj.site_no) AND
      NOT cl_null(obj.account) THEN
      LET l_cnt = 0
      SELECT COUNT(*) INTO l_cnt
        FROM userinformation
       WHERE enterprise_no = obj.enterprise_no
         AND site_no = obj.site_no
         AND account = obj.account

      IF l_cnt = 0 THEN
         INSERT INTO userinformation (enterprise_no,site_no,account,employee_no,employee_name,
                                     language,department_no,department_name,last_log_time,log_in,
                                     server_ip,server_area,manage_barcode_inventory,feature)
                             VALUES (obj.enterprise_no,obj.site_no,obj.account,obj.employee_no,obj.employee_name,
                                     obj.language,obj.department_no,obj.department_name,obj.last_log_time,obj.log_in,
                                     obj.server_ip,obj.server_area,obj.manage_barcode_inventory,obj.feature)
         IF SQLCA.sqlcode THEN RETURN '[{"data":false,"message":"INSERT userinformation ERROR"}]' END IF
      ELSE
         IF obj.log_in = "Y" THEN
         
            UPDATE userinformation
               SET employee_no     = obj.employee_no,
                  employee_name   = obj.employee_name,
                  language        = obj.language,
                  department_no   = obj.department_no,
                  department_name = obj.department_name,
                  last_log_time   = obj.last_log_time,
                  log_in          = obj.log_in,
                  server_ip       = obj.server_ip,
                  server_area     = obj.server_area,
                  manage_barcode_inventory = obj.manage_barcode_inventory,
                  feature         = obj.feature
            WHERE enterprise_no = obj.enterprise_no
               AND site_no = obj.site_no
               AND account = obj.account
            IF SQLCA.sqlcode THEN RETURN '[{"data":false,"message":"UPDATE userinformation ERROR"}]' END IF
         ELSE
            DELETE FROM userinformation
         END IF
      END IF
   END IF

   SELECT warehouse_cost INTO obj.warehouse_no_cost
     FROM stockinformation
    WHERE warehouse_no = obj.warehouse_no
      AND enterprise_no = obj.enterprise_no
      AND site_no = obj.site_no
      AND COALESCE(storage_spaces_no,' ') = ' '

   #系統資訊
   LET g_basicInfo.server_ip                 = obj.server_ip                  #後台主機IP
   LET g_basicInfo.server_area               = obj.server_area                #後台主機區域
   LET g_basicInfo.server_product            = obj.server_product             #後台主機產品別
   LET g_basicInfo.permission_ip             = obj.permission_ip              #後台權限主機
   LET g_basicInfo.barcode_repeat            = obj.barcode_repeat             #條碼庫存可重複
   LET g_basicInfo.barcode_separator         = obj.barcode_separator          #條碼分隔
   LET g_basicInfo.warehouse_separator       = obj.warehouse_separator        #倉庫分隔
   LET g_basicInfo.plant_id                  = obj.plant_id                   #廠別
   LET g_basicInfo.mr_no                     = obj.mr_no                      #雜收單別
   LET g_basicInfo.mi_no                     = obj.mi_no                      #雜發單別
   LET g_basicInfo.reason_no                 = obj.reason_no                  #理由碼
   LET g_basicInfo.camera_used               = obj.camera_used                #手機使用相機鏡頭
   LET g_basicInfo.lot_auto                  = obj.lot_auto                   #由WS取得批號
   LET g_basicInfo.inventory_display         = obj.inventory_display          #盤點庫存量是否顯示
   LET g_basicInfo.report_ent                = obj.report_ent                 #基礎資料更新企業
   LET g_basicInfo.report_site               = obj.report_site                #基礎資料更新SITE
   LET g_basicInfo.report_datetime           = obj.report_datetime            #基礎資料更新日
   LET g_basicInfo.warehouse_no              = obj.warehouse_no               #倉庫
   LET g_basicInfo.warehouse_no_cost         = obj.warehouse_no_cost          #倉庫成本否
   LET g_basicInfo.isDisplay_no              = obj.isDisplay_no               #顯示方式
   LET g_basicInfo.isDisplay_name            = obj.isDisplay_name             #顯示方式
   LET g_basicInfo.isDisplay_spec            = obj.isDisplay_spec             #顯示方式
   LET g_basicInfo.font_size                 = obj.font_size                  #字體大小
   LET g_basicInfo.workstation_no            = obj.workstation_no             #工作站編號
   LET g_basicInfo.workstation_name          = obj.workstation_name           #工作站名稱
   LET g_basicInfo.machine_no                = obj.machine_no                 #機台編號
   LET g_basicInfo.machine_name              = obj.machine_name               #機台名稱
   LET g_basicInfo.shift_no                  = obj.shift_no                   #班別
   LET g_basicInfo.all_1_no                  = obj.all_1_no                   #一階段調撥單別
   LET g_basicInfo.all_2_no                  = obj.all_2_no                   #二階段撥出單別
   LET g_basicInfo.all_3_no                  = obj.all_3_no                   #二階段撥入單別
   LET g_basicInfo.warehouse_way_cost        = obj.warehouse_way_cost         #在途成本庫位
   LET g_basicInfo.warehouse_way             = obj.warehouse_way              #在途非成本庫位
   LET g_basicInfo.condition_start_date_type = obj.condition_start_date_type  #篩選條件起始日期類別
   LET g_basicInfo.condition_start_date      = obj.condition_start_date       #篩選條件起始日期
   LET g_basicInfo.basic_data_download       = obj.basic_data_download        #基礎資料下載 Timeout秒數
   LET g_basicInfo.inventory_operation       = obj.inventory_operation        #庫存資料下載 Timeout秒數
   LET g_basicInfo.out_in_operation          = obj.out_in_operation           #一般資料下載 Timeout秒數
   LET g_basicInfo.BT_printer                = obj.BT_printer                 #藍牙印表機類型
   LET g_basicInfo.valuation_unit            = obj.valuation_unit             #是否使用計價單位
   
   #使用者資訊
   LET g_userInfo.enterprise_no              = obj.enterprise_no              #企業代碼
   LET g_userInfo.site_no                    = obj.site_no                    #營運據點
   LET g_userInfo.account                    = obj.account                    #使用者帳號
   LET g_userInfo.employee_no                = obj.employee_no                #員工編號
   LET g_userInfo.employee_name              = obj.employee_name              #員工姓名
   LET g_userInfo.language                   = obj.language                   #使用語言
   LET g_userInfo.department_no              = obj.department_no              #部門編號
   LET g_userInfo.department_name            = obj.department_name            #部門名稱
   LET g_userInfo.last_log_time              = obj.last_log_time              #最後登入時間
   LET g_userInfo.log_in                     = obj.log_in                     #已登入
   LET g_userInfo.server_ip                  = obj.server_ip                  #後台主機IP
   LET g_userInfo.server_area                = obj.server_area                #後台主機區域
   LET g_userInfo.manage_barcode_inventory   = obj.manage_barcode_inventory   #條碼庫存管理方式
   LET g_userInfo.feature                    = obj.feature                    #是否顯示產品特徵

   LET l_return_str = '[{"data":true,"warehouse_no_cost": "',g_basicInfo.warehouse_no_cost,'"}]'
   RETURN l_return_str

END FUNCTION
