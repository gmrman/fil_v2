IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION basicinformation_get(p_json)
   DEFINE p_json                    util.JSONArray
   DEFINE r_json                    util.JSONArray
   DEFINE r_return                  STRING
   DEFINE l_i                       INTEGER
   DEFINE r_obj                     DYNAMIC ARRAY OF RECORD
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

   SELECT server_ip,server_area,server_product,permission_ip,
          barcode_repeat,barcode_separator,warehouse_separator,
          plant_id,
          mr_no,mi_no,
          reason_no,
          camera_used,
          inventory_display,
          report_ent,
          report_site,
          report_datetime,
          warehouse_no,
          isDisplay_no,isDisplay_name,isDisplay_spec,
          font_size,workstation_no,workstation_name,machine_no,machine_name,shift_no,
          all_1_no,all_2_no,all_3_no,
          warehouse_way_cost,warehouse_way,
          condition_start_date_type,condition_start_date,
          basic_data_download,inventory_operation,out_in_operation,
          BT_printer,valuation_unit
     INTO r_obj[1].server_ip,r_obj[1].server_area,r_obj[1].server_product,r_obj[1].permission_ip,
          r_obj[1].barcode_repeat,r_obj[1].barcode_separator,r_obj[1].warehouse_separator,
          r_obj[1].plant_id,
          r_obj[1].mr_no,r_obj[1].mi_no,
          r_obj[1].reason_no,
          r_obj[1].camera_used,
          r_obj[1].inventory_display,
          r_obj[1].report_ent,
          r_obj[1].report_site,
          r_obj[1].report_datetime,
          r_obj[1].warehouse_no,
          r_obj[1].isDisplay_no,r_obj[1].isDisplay_name,r_obj[1].isDisplay_spec,
          r_obj[1].font_size,r_obj[1].workstation_no,r_obj[1].workstation_name,r_obj[1].machine_no,r_obj[1].machine_name,r_obj[1].shift_no,
          r_obj[1].all_1_no,r_obj[1].all_2_no,r_obj[1].all_3_no,
          r_obj[1].warehouse_way_cost,r_obj[1].warehouse_way,
          r_obj[1].condition_start_date_type,r_obj[1].condition_start_date,
          r_obj[1].basic_data_download,r_obj[1].inventory_operation,r_obj[1].out_in_operation,
          r_obj[1].BT_printer,
          r_obj[1].valuation_unit
     FROM basicinformation

   LET l_i = 0
   SELECT COUNT(account) INTO l_i
     FROM userinformation
     WHERE log_in = 'Y'

     
   IF (l_i) > 1 THEN
      UPDATE userinformation
         SET log_in = 'N'
   ELSE
      SELECT enterprise_no,site_no,
             account,
             employee_no,employee_name,
             language,
             department_no,department_name,
             last_log_time,log_in,
             manage_barcode_inventory,
             feature
        INTO r_obj[1].enterprise_no,r_obj[1].site_no,
             r_obj[1].account,
             r_obj[1].employee_no,r_obj[1].employee_name,
             r_obj[1].language,
             r_obj[1].department_no,r_obj[1].department_name,
             r_obj[1].last_log_time,r_obj[1].log_in,
             r_obj[1].manage_barcode_inventory,
             r_obj[1].feature
        FROM userinformation
        
       WHERE COALESCE(server_ip,' ') = COALESCE(r_obj[1].server_ip,' ')
         AND COALESCE(server_area,' ') = COALESCE(r_obj[1].server_area,' ')
         AND log_in = 'Y'

       SELECT warehouse_cost INTO r_obj[1].warehouse_no_cost
         FROM stockinformation
        WHERE warehouse_no = r_obj[1].warehouse_no
          AND enterprise_no = r_obj[1].enterprise_no
          AND site_no = r_obj[1].site_no
          AND COALESCE(storage_spaces_no,' ') = ' '
    END IF

   #系統資訊
   LET g_basicInfo.server_ip                 = r_obj[1].server_ip                   #後台主機IP
   LET g_basicInfo.server_area               = r_obj[1].server_area                 #後台主機區域
   LET g_basicInfo.server_product            = r_obj[1].server_product              #後台主機產品別
   LET g_basicInfo.permission_ip             = r_obj[1].permission_ip               #後台權限主機IP
   LET g_basicInfo.barcode_repeat            = r_obj[1].barcode_repeat              #條碼庫存可重複
   LET g_basicInfo.barcode_separator         = r_obj[1].barcode_separator           #條碼分隔
   LET g_basicInfo.warehouse_separator       = r_obj[1].warehouse_separator         #倉庫分隔
   LET g_basicInfo.plant_id                  = r_obj[1].plant_id                    #廠別
   LET g_basicInfo.mr_no                     = r_obj[1].mr_no                       #雜收單別
   LET g_basicInfo.mi_no                     = r_obj[1].mi_no                       #雜發單別
   LET g_basicInfo.reason_no                 = r_obj[1].reason_no                   #理由碼
   LET g_basicInfo.camera_used               = r_obj[1].camera_used                 #手機使用相機鏡頭
   LET g_basicInfo.inventory_display         = r_obj[1].inventory_display           #盤點庫存量是否顯示
   LET g_basicInfo.report_ent                = r_obj[1].report_ent                  #基礎資料更企業
   LET g_basicInfo.report_site               = r_obj[1].report_site                 #基礎資料更SITE
   LET g_basicInfo.report_datetime           = r_obj[1].report_datetime             #基礎資料更新日
   LET g_basicInfo.warehouse_no              = r_obj[1].warehouse_no                #倉庫
   LET g_basicInfo.warehouse_no_cost         = r_obj[1].warehouse_no_cost           #倉庫成本倉否
   LET g_basicInfo.isDisplay_no              = r_obj[1].isDisplay_no                #顯示方式
   LET g_basicInfo.isDisplay_name            = r_obj[1].isDisplay_name              #顯示方式
   LET g_basicInfo.isDisplay_spec            = r_obj[1].isDisplay_spec              #顯示方式
   LET g_basicInfo.font_size                 = r_obj[1].font_size                   #字體大小
   LET g_basicInfo.workstation_no            = r_obj[1].workstation_no              #工作站編號
   LET g_basicInfo.workstation_name          = r_obj[1].workstation_name            #工作站名稱
   LET g_basicInfo.machine_no                = r_obj[1].machine_no                  #機台編號
   LET g_basicInfo.machine_name              = r_obj[1].machine_name                #機台名稱
   LET g_basicInfo.shift_no                  = r_obj[1].shift_no                    #班別
   LET g_basicInfo.all_1_no                  = r_obj[1].all_1_no                    #一階段調撥單別
   LET g_basicInfo.all_2_no                  = r_obj[1].all_2_no                    #二階段撥出單別
   LET g_basicInfo.all_3_no                  = r_obj[1].all_3_no                    #二階段撥入單別
   LET g_basicInfo.warehouse_way_cost        = r_obj[1].warehouse_way_cost          #在途成本庫位
   LET g_basicInfo.warehouse_way             = r_obj[1].warehouse_way               #在途非成本庫位
   LET g_basicInfo.condition_start_date_type = r_obj[1].condition_start_date_type   #篩選條件起始日期類別
   LET g_basicInfo.condition_start_date      = r_obj[1].condition_start_date        #篩選條件起始日期
   LET g_basicInfo.basic_data_download       = r_obj[1].basic_data_download         #基礎資料下載 Timeout秒數
   LET g_basicInfo.inventory_operation       = r_obj[1].inventory_operation         #庫存資料下載 Timeout秒數
   LET g_basicInfo.out_in_operation          = r_obj[1].out_in_operation            #一般資料下載 Timeout秒數
   LET g_basicInfo.BT_printer                = r_obj[1].BT_printer                  #藍牙印表機類型
   LET g_basicInfo.valuation_unit            = r_obj[1].valuation_unit              #是否使用計價單位
   
   #使用者資訊
   LET g_userInfo.enterprise_no              = r_obj[1].enterprise_no               #企業代碼
   LET g_userInfo.site_no                    = r_obj[1].site_no                     #營運據點
   LET g_userInfo.account                    = r_obj[1].account                     #使用者帳號
   LET g_userInfo.employee_no                = r_obj[1].employee_no                 #員工編號
   LET g_userInfo.employee_name              = r_obj[1].employee_name               #員工姓名
   LET g_userInfo.language                   = r_obj[1].language                    #使用語言
   LET g_userInfo.department_no              = r_obj[1].department_no               #部門編號
   LET g_userInfo.department_name            = r_obj[1].department_name             #部門名稱
   LET g_userInfo.last_log_time              = r_obj[1].last_log_time               #最後登入時間
   LET g_userInfo.log_in                     = r_obj[1].log_in                      #已登入
   LET g_userInfo.server_ip                  = r_obj[1].server_ip                   #後台主機IP
   LET g_userInfo.server_area                = r_obj[1].server_area                 #後台主機區域
   LET g_userInfo.feature                    = r_obj[1].feature 
   LET g_userInfo.manage_barcode_inventory   = r_obj[1].manage_barcode_inventory 

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
