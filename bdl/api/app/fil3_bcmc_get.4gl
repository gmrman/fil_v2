IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION fil3_bcmc_get(p_json)
   DEFINE p_json              util.JSONArray
   DEFINE tempobj             util.JSONObject
   DEFINE r_json              util.JSONArray
   DEFINE r_return            STRING
   DEFINE l_sql               STRING
   DEFINE l_i                 INTEGER
   DEFINE obj                 RECORD
            type_no              STRING
                              END RECORD
   DEFINE l_data              RECORD
            bcae005              LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006              LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014              LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015              LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            bcae002              LIKE app_base_bcae_t.bcae002   #單號
                              END RECORD
   DEFINE l_bcmc              RECORD
            barcode_no           LIKE app_base_bcmc_t.bcmc001,
            item_no              LIKE app_base_bcmc_t.bcmc002,  #料號
            item_feature_no      LIKE app_base_bcmc_t.bcmc003   #產品特徵
                              END RECORD
   DEFINE r_obj               DYNAMIC ARRAY OF RECORD
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
      picking_qty                         LIKE app_base_bcmc_t.bcmc998,      #
      last_transaction_date               LIKE app_base_bcmc_t.bcmc999,      #最后异动时间
      should_qty                          LIKE app_base_bcmc_t.bcmc998,
      already_qty                         LIKE app_base_bcmc_t.bcmc998
                              END RECORD
               
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(obj)     
   LET tempobj = p_json.get(2)
   CALL tempobj.toFGL(l_data)     
   LET tempobj = p_json.get(3)
   CALL tempobj.toFGL(l_bcmc)

   LET l_sql = " SELECT bcmcent, bcmcsite,bcmc001, bcmc002, bcmc003, ",
               "        bcmc004, bcmc005, bcmc006, bcmc007, bcmc008, ",
               "        bcmc009, bcmc010, bcmc011, bcmc012, bcmc013, ",
               "        bcmc014, bcmc015, bcmc016, bcmc017, bcmc018, ",
               "        bcmc019, bcmc020, bcmc021, bcmc022, bcmc023, ",
               "        bcmc995, bcmc996, bcmc997, bcmc998, bcmc999, ",
               "        0      , bcmc998                             ",
               "   FROM app_base_bcmc_t                              ",
               "  WHERE bcmcent = '",g_userInfo.enterprise_no,"'",
               "    AND bcmcsite = '",g_userInfo.site_no,"'",
               "    AND bcmc014 = '",l_data.bcae006,"' "
              
   IF obj.type_no = "1" THEN
      LET l_sql = l_sql , " AND bcmc015 = '",l_data.bcae002,"' "
      LET l_sql = l_sql , " AND bcmc001 = '",l_bcmc.barcode_no,"' "
   END IF

   IF obj.type_no = "2" THEN
      LET l_sql = l_sql , " AND bcmc015 = '",l_data.bcae002,"' "
      LET l_sql = l_sql , " AND bcmc002 = '",l_bcmc.item_no,"' "
      LET l_sql = l_sql , " AND bcmc003 = '",l_bcmc.item_feature_no,"' "
   END IF

   IF obj.type_no = "3" THEN
      LET l_sql = l_sql , " GROUP BY bcmc015 "
   END IF

   IF obj.type_no = "4" THEN
      LET l_sql = " SELECT bcmcent, bcmcsite,bcmc001, bcmc002,      bcmc003, ",
                  "        bcmc004, bcmc005, bcmc006, bcmc007,      bcmc008, ",
                  "        bcmc009, bcmc010, bcmc011, bcmc012,      bcmc013, ",
                  "        bcmc014, bcmc015, bcmc016, bcmc017,      bcmc018, ",
                  "        bcmc019, bcmc020, bcmc021, bcmc022,      bcmc023, ",
                  "        bcmc995, bcmc996, bcmc997, SUM(bcmc998), bcmc999, ",
                  "        0      , SUM(bcmc998)                             ",
                  "   FROM app_base_bcmc_t                                   ",
                  "  WHERE bcmcent = '",g_userInfo.enterprise_no,"'",
                  "    AND bcmcsite = '",g_userInfo.site_no,"'",
                  "    AND bcmc014 = '",l_data.bcae006,"' ",
                  "    AND bcmc015 = '",l_data.bcae002,"' ",
                  "  GROUP BY bcmc001 "
   END IF

   PREPARE bcmc_pre FROM l_sql 
   DECLARE bcmc_cr  CURSOR FOR bcmc_pre 

   LET l_i = 1
   FOREACH bcmc_cr INTO r_obj[l_i].*

      #代码中含有特殊字元时，特別處理
      LET r_obj[l_i].barcode_no = util.strings.urlEncode(r_obj[l_i].barcode_no)

      IF NOT cl_null(r_obj[l_i].barcode_lot_no) THEN
         LET r_obj[l_i].barcode_lot_no = util.strings.urlEncode(r_obj[l_i].barcode_lot_no)
      END IF

      IF NOT cl_null(r_obj[l_i].lot_no) THEN
         LET r_obj[l_i].lot_no = util.strings.urlEncode(r_obj[l_i].lot_no)
      END IF
      
      LET l_i = l_i + 1
   END FOREACH
   CALL r_obj.deleteElement(l_i)
      
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION
