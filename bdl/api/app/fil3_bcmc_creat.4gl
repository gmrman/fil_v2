IMPORT os
IMPORT com
IMPORT util
IMPORT XML 
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION fil3_bcmc_creat(p_json)
   DEFINE p_json                       util.JSONArray
   DEFINE tempobj                      util.JSONObject
   DEFINE r_json                       util.JSONArray
   DEFINE r_return                     STRING
   DEFINE l_states                     DYNAMIC ARRAY OF RECORD
      code                                BOOLEAN,     
      MESSAGE                             STRING,     
      data                                STRING
                                       END RECORD
   DEFINE l_cnt                        INTEGER
   DEFINE l_bcmc_t                     RECORD LIKE app_base_bcmc_t.*
   DEFINE l_data                       RECORD
      bcae005                             LIKE app_base_bcae_t.bcae005,  #出入庫瑪
      bcae006                             LIKE app_base_bcae_t.bcae006,  #作業代號
      bcae014                             LIKE app_base_bcae_t.bcae014,  #記錄作業編號
      bcae015                             LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
      bcae002                             LIKE app_base_bcae_t.bcae002   #單號
                                       END RECORD
   DEFINE barcode_info                 RECORD   #單身記錄
      enterprise_no                       LIKE app_base_bcmc_t.bcmcent,      #企业编号
      site_no                             LIKE app_base_bcmc_t.bcmcsite,     #营运据点
      barcode_no                          LIKE app_base_bcmc_t.bcmc001,      #条码编号
      item_no                             LIKE app_base_bcmc_t.bcmc002,      #料件编号
      item_feature_no                     LIKE app_base_bcmc_t.bcmc003,      #产品特征
      item_feature_name                   LIKE app_base_bcmc_t.bcmc004,      #产品特征说明
      warehouse_no                        LIKE app_base_bcmc_t.bcmc005,      #库位编号
      storage_spaces_no                   LIKE app_base_bcmc_t.bcmc006,      #储位编号
      lot_no                              LIKE app_base_bcmc_t.bcmc007,      #批号
      inventory_management_features       LIKE app_base_bcmc_t.bcmc008,      #库存管理特征
      plot_no                             LIKE app_base_bcmc_t.bcmc009,      #制造批号
      serial_no                           LIKE app_base_bcmc_t.bcmc010,      #制造序号
      inventory_unit                      LIKE app_base_bcmc_t.bcmc011,      #库存单位
      barcode_qty                         LIKE app_base_bcmc_t.bcmc012,      #条位数量
      inventory_qty                       LIKE app_base_bcmc_t.bcmc013,      #库存数量
      source_operation                    LIKE app_base_bcmc_t.bcmc014,      #来源作业
      source_no                           LIKE app_base_bcmc_t.bcmc015,      #来源单号
      source_seq                          LIKE app_base_bcmc_t.bcmc016,      #来源项次
      source_line_seq                     LIKE app_base_bcmc_t.bcmc017,      #来源项序
      source_batch_seq                    LIKE app_base_bcmc_t.bcmc018,      #来源分批序
      barcode_lot_no                      LIKE app_base_bcmc_t.bcmc019,      #條碼批號
      barcode_type                        LIKE app_base_bcmc_t.bcmc020,      #條碼類型
      item_name                           LIKE app_base_bcmc_t.bcmc021,      #品名
      item_spec                           LIKE app_base_bcmc_t.bcmc022,      #規格
      lot_control_type                    LIKE app_base_bcmc_t.bcmc023,      #批號管控方式
      ingoing_warehouse_no                LIKE app_base_bcmc_t.bcmc995,      #撥入倉庫
      ingoing_storage_spaces_no           LIKE app_base_bcmc_t.bcmc996,      #撥入儲位
      reason_code                         LIKE app_base_bcmc_t.bcmc997,      #理由碼
      picking_qty                         LIKE app_base_bcmc_t.bcmc998,      #檢貨數量
      last_transaction_date               LIKE app_base_bcmc_t.bcmc999       #最后异动时间
                                       END RECORD
                                       
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_data)
   LET tempobj = p_json.get(2)
   CALL tempobj.toFGL(barcode_info)

   IF cl_null(l_data.bcae002) THEN 
      LET l_data.bcae002 = " "
   END IF 

   IF cl_null(barcode_info.item_feature_no) THEN
      LET barcode_info.item_feature_no = " "
   END IF 
   IF cl_null(barcode_info.storage_spaces_no) THEN
      LET barcode_info.storage_spaces_no = " "
   END IF 
   IF cl_null(barcode_info.lot_no) THEN
      LET barcode_info.lot_no = " "
   END IF 
   IF cl_null(barcode_info.inventory_management_features) THEN
      LET barcode_info.inventory_management_features = " "
   END IF
   IF cl_null(barcode_info.source_line_seq) THEN
      LET barcode_info.source_line_seq = 0
   END IF 
   IF cl_null(barcode_info.source_batch_seq) THEN
      LET barcode_info.source_batch_seq = 0
   END IF 
   IF cl_null(barcode_info.warehouse_no) THEN
      LET barcode_info.warehouse_no = " "
   END IF 
   
   #插入bcmc表格
   LET l_bcmc_t.bcmcent = barcode_info.enterprise_no
   LET l_bcmc_t.bcmcsite = barcode_info.site_no
   LET l_bcmc_t.bcmc001 = barcode_info.barcode_no
   LET l_bcmc_t.bcmc002 = barcode_info.item_no
   LET l_bcmc_t.bcmc003 = barcode_info.item_feature_no
   LET l_bcmc_t.bcmc004 = barcode_info.item_feature_name
   LET l_bcmc_t.bcmc005 = barcode_info.warehouse_no
   LET l_bcmc_t.bcmc006 = barcode_info.storage_spaces_no
   LET l_bcmc_t.bcmc007 = barcode_info.lot_no
   LET l_bcmc_t.bcmc008 = barcode_info.inventory_management_features
   LET l_bcmc_t.bcmc009 = barcode_info.plot_no
   LET l_bcmc_t.bcmc010 = barcode_info.serial_no
   LET l_bcmc_t.bcmc011 = barcode_info.inventory_unit
   LET l_bcmc_t.bcmc012 = barcode_info.barcode_qty
   LET l_bcmc_t.bcmc013 = barcode_info.inventory_qty
   LET l_bcmc_t.bcmc014 = l_data.bcae006
   LET l_bcmc_t.bcmc015 = l_data.bcae002
   LET l_bcmc_t.bcmc016 = 0
   LET l_bcmc_t.bcmc017 = 0
   LET l_bcmc_t.bcmc018 = 0
   LET l_bcmc_t.bcmc019 = barcode_info.barcode_lot_no
   LET l_bcmc_t.bcmc020 = barcode_info.barcode_type
   LET l_bcmc_t.bcmc021 = barcode_info.item_name
   LET l_bcmc_t.bcmc022 = barcode_info.item_spec
   LET l_bcmc_t.bcmc023 = barcode_info.lot_control_type

   LET l_bcmc_t.bcmc995 = barcode_info.ingoing_warehouse_no
   LET l_bcmc_t.bcmc996 = barcode_info.ingoing_storage_spaces_no
   LET l_bcmc_t.bcmc997 = barcode_info.reason_code
   LET l_bcmc_t.bcmc998 = barcode_info.picking_qty
   LET l_bcmc_t.bcmc999 = CURRENT

   LET l_cnt = 0
   DELETE FROM app_base_bcmc_t
    WHERE bcmcent  = g_userInfo.enterprise_no
      AND bcmcsite = g_userInfo.site_no
      AND bcmc001  = l_bcmc_t.bcmc001
      AND bcmc005  = l_bcmc_t.bcmc005
      AND bcmc006  = l_bcmc_t.bcmc006
      AND bcmc007  = l_bcmc_t.bcmc007
      AND bcmc014  = l_bcmc_t.bcmc014
      AND bcmc015  = l_bcmc_t.bcmc015

   INSERT INTO app_base_bcmc_t VALUES(l_bcmc_t.*)
   IF SQLCA.SQLCODE THEN
      LET g_status.code = FALSE
      LET g_status.message = SQLCA.SQLCODE
   END IF

   LET l_states[1].* = g_status.*
   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return
   
END FUNCTION    