IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE type_bcme_t                 RECORD   #單身記錄
   enterprise_no                    LIKE app_base_bcme_t.bcmeent,    #企业编号
   site_no                          LIKE app_base_bcme_t.bcmesite,   #营运据点
   source_operation                 LIKE app_base_bcme_t.bcme001,    #来源作业
   source_no                        LIKE app_base_bcme_t.bcme002,    #来源单号
   doc_type                         LIKE app_base_bcme_t.bcme003,    #单据类型
   create_date                      LIKE app_base_bcme_t.bcme004,    #单据日期
   seq                              LIKE app_base_bcme_t.bcme005,    #单据项次
   doc_line_seq                     LIKE app_base_bcme_t.bcme006,    #单据项序
   doc_batch_seq                    LIKE app_base_bcme_t.bcme007,    #单据分批序
   object_no                        LIKE app_base_bcme_t.bcme008,    #对象编号
   object_name                      LIKE app_base_bcme_t.bcme009,    #对象名称
   item_no                          LIKE app_base_bcme_t.bcme010,    #料件编号
   item_feature_no                  LIKE app_base_bcme_t.bcme011,    #产品特征
   item_feature_name                LIKE app_base_bcme_t.bcme012,    #产品特征说明
   warehouse_no                     LIKE app_base_bcme_t.bcme013,    #库位
   storage_spaces_no                LIKE app_base_bcme_t.bcme014,    #储位
   lot_no                           LIKE app_base_bcme_t.bcme015,    #批号
   inventory_management_features    LIKE app_base_bcme_t.bcme016,    #库存管理特征
   doc_qty                          LIKE app_base_bcme_t.bcme017,    #单据数量
   in_out_qty                       LIKE app_base_bcme_t.bcme018,    #出入数量
   in_out_date1                     LIKE app_base_bcme_t.bcme019,    #出入日期1
   in_out_date2                     LIKE app_base_bcme_t.bcme020,    #出入日期2
   done_stus                        LIKE app_base_bcme_t.bcme021,    #数据处理否
   closed_stus                      LIKE app_base_bcme_t.bcme022,    #结案否
   upper_no                         LIKE app_base_bcme_t.bcme023,    #上阶单据编号
   upper_seq                        LIKE app_base_bcme_t.bcme024,    #上阶单据项次
   upper_line_seq                   LIKE app_base_bcme_t.bcme025,    #上阶单据项序
   upper_batch_seq                  LIKE app_base_bcme_t.bcme026,    #上阶单据分批序
   production_item_no               LIKE app_base_bcme_t.bcme027,    #生产料号
   production_qty                   LIKE app_base_bcme_t.bcme028,    #生产数量
   item_name_spec                   LIKE app_base_bcme_t.bcme029,    #品名规格
   production_unit_no               LIKE app_base_bcme_t.bcme030,    #生产单位
   upper_unit_no                    LIKE app_base_bcme_t.bcme031,    #上阶单据单位
   reference_unit_no                LIKE app_base_bcme_t.bcme032,    #参考单位
   reference_qty                    LIKE app_base_bcme_t.bcme033,    #参考数量
   upper_qty                        LIKE app_base_bcme_t.bcme034,    #上阶单据数量
   unit_no                          LIKE app_base_bcme_t.bcme035,    #原单单位
   allow_error_rate                 LIKE app_base_bcme_t.bcme036,    #允许误差率
   run_card_no                      LIKE app_base_bcme_t.bcme037,    #RUNCARD
   qpa_molecular                    LIKE app_base_bcme_t.bcme038,    #QPA分子
   qpa_denominator                  LIKE app_base_bcme_t.bcme039,    #QPA分母
   main_organization                LIKE app_base_bcme_t.bcme040,    #主營組織
   outgoing_warehouse_no            LIKE app_base_bcme_t.bcme041,    #撥出倉庫
   outgoing_storage_spaces_no       LIKE app_base_bcme_t.bcme042,    #撥出儲位
   item_name                        LIKE app_base_bcme_t.bcme043,    #品名
   item_spec                        LIKE app_base_bcme_t.bcme044,    #規格
   lot_control_type                 LIKE app_base_bcme_t.bcme045,    #批號管控方式
   conversion_rate_denominator      LIKE app_base_bcme_t.bcme046,    #單位轉換率分母
   conversion_rate_molecular        LIKE app_base_bcme_t.bcme047,    #單位轉換率分子
   inventory_unit                   LIKE app_base_bcme_t.bcme048,    #庫存單位
   decimal_places                   LIKE app_base_bcme_t.bcme049,    #小數位數
   decimal_places_type              LIKE app_base_bcme_t.bcme050,    #取位方式
   second_conversion_rate           LIKE app_base_bcme_t.bcme051,    #參考單位換算率
   reference_decimal_places         LIKE app_base_bcme_t.bcme052,    #參考單位小數位數
   reference_decimal_places_type    LIKE app_base_bcme_t.bcme053,    #參考單位取位方式
   reference_in_out_qty             LIKE app_base_bcme_t.bcme054,    #參考單位出入數量
   valuation_unit_no                LIKE app_base_bcme_t.bcme055,    #計價單位
   valuation_qty                    LIKE app_base_bcme_t.bcme056,    #計價數量
   multi_unit_type                  LIKE app_base_bcme_t.bcme057,    #多單位的單位控管方式
   inventory_qty                    LIKE app_base_bcme_t.bcme058,    #庫存數量
   main_warehouse_no                LIKE app_base_bcme_t.bcme059,    #主要倉庫
   main_storage_no                  LIKE app_base_bcme_t.bcme060,    #主要儲位
   first_in_first_out_control       LIKE app_base_bcme_t.bcme061,    #條碼先進先出控管方式
   erp_warehousing                  LIKE app_base_bcme_t.bcme062,    #倉儲是否以ERP為主
   production_item_feature_no       LIKE app_base_bcme_t.bcme127,    #生产料号产品特征
   production_in_out_qty            LIKE app_base_bcme_t.bcme128,    #生产出入数量
   last_transaction_date            LIKE app_base_bcme_t.bcme999,    #最后异动时间
   status                           LIKE app_base_bcme_t.bcmestus
                                 END RECORD
TYPE type_bcaf_t                 RECORD
   barcode_no                       LIKE app_base_bcaf_t.bcaf006,    #條碼
   item_no                          LIKE app_base_bcaf_t.bcaf007,    #料號
   item_feature_no                  LIKE app_base_bcaf_t.bcaf008,    #产品特征
   item_feature_name                LIKE app_base_bcaf_t.bcaf009,    #产品特征说明
   item_name                        LIKE app_base_bcaf_t.bcafname,   #品名
   item_spec                        LIKE app_base_bcaf_t.bcafspec,   #規格
   warehouse_no                     LIKE app_base_bcaf_t.bcaf010,    #倉庫
   storage_spaces_no                LIKE app_base_bcaf_t.bcaf011,    #儲位
   lot_no                           LIKE app_base_bcaf_t.bcaf012,    #批號
   unit                             LIKE app_base_bcaf_t.bcaf017,    #單位
   qty                              LIKE app_base_bcaf_t.bcaf016,    #數量
   main_organization                LIKE app_base_bcae_t.bcae016,    #主營組織
   ingoing_warehouse_no             LIKE app_base_bcaf_t.bcaf036,    #撥入倉庫
   ingoing_storage_spaces_no        LIKE app_base_bcaf_t.bcaf037,    #撥入儲位
   outgoing_warehouse_no            LIKE app_base_bcaf_t.bcaf036,    #撥出倉庫
   outgoing_storage_spaces_no       LIKE app_base_bcaf_t.bcaf037,    #撥出儲位
   in_transit_cost_warehouse_no     LIKE app_base_bcaf_t.bcaf038,    #在途成本倉
   in_transit_non_cost_warehouse_no LIKE app_base_bcaf_t.bcaf039,    #在途非成本倉
   run_card_no                      LIKE app_base_bcaf_t.bcaf040,    #RunCard
   source_no                        LIKE app_base_bcaf_t.bcaf020,    #单号
   seq                              LIKE app_base_bcaf_t.bcaf021,    #项次
   doc_line_seq                     LIKE app_base_bcaf_t.bcaf022,    #项序
   doc_batch_seq                    LIKE app_base_bcaf_t.bcaf023,    #分批序
   reason_no                        LIKE app_base_bcaf_t.bcaf041,    #理由碼
   reference_unit_no                LIKE app_base_bcaf_t.bcaf042,    #參考單位
   reference_qty                    LIKE app_base_bcaf_t.bcaf043,    #參考數量
   valuation_unit_no                LIKE app_base_bcaf_t.bcaf044,    #計價單位
   valuation_qty                    LIKE app_base_bcaf_t.bcaf045,    #計價數量
   inventory_unit                   LIKE app_base_bcaf_t.bcaf046,    #庫存單位
   inventory_qty                    LIKE app_base_bcaf_t.bcaf047,    #庫存數量
   multi_unit_type                  LIKE app_base_bcaf_t.bcafMunit,  #多單位的單位控管方式
   packing_barcode                  LIKE app_base_bcaf_t.bcafPcode,  #裝箱條碼
   packing_qty                      LIKE app_base_bcaf_t.bcafPqty,   #裝箱數量
   last_transaction_date            LIKE app_base_bcaf_t.bcaf001
                                 END RECORD

PUBLIC FUNCTION bcme_ae_af_get(p_json)
   DEFINE p_json           util.JSONArray
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE obj              RECORD
            type_no           STRING
                           END RECORD
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            info_id           LIKE app_base_bcme_t.bcme999
                           END RECORD
   DEFINE l_sql            STRING
   DEFINE l_source_no      STRING
   DEFINE l_count          INTEGER
   DEFINE l_i              INTEGER
   DEFINE r_obj            DYNAMIC ARRAY OF RECORD
                              submit_show    BOOLEAN,
                              bcme           DYNAMIC ARRAY OF type_bcme_t,
                              bcaf           DYNAMIC ARRAY OF type_bcaf_t
                           END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(obj)
   LET tempobj = p_json.get(2)
   CALL tempobj.toFGL(l_data)

   LET l_sql = " SELECT bcmeent,bcmesite,bcme001,bcme002,bcme003,",
               "        bcme004,bcme005,bcme006,bcme007,bcme008, ",
               "        bcme009,bcme010,bcme011,bcme012,bcme013, ",
               "        bcme014,bcme015,bcme016,bcme017,bcme018, ",
               "        bcme019,bcme020,bcme021,bcme022,bcme023, ",
               "        bcme024,bcme025,bcme026,bcme027,bcme028, ",
               "        bcme029,bcme030,bcme031,bcme032,bcme033, ",
               "        bcme034,bcme035,bcme036,bcme037,bcme038, ",
               "        bcme039,bcme040,bcme041,bcme042,bcme043, ",
               "        bcme044,bcme045,bcme046,bcme047,bcme048, ",
               "        bcme049,bcme050,bcme051,bcme052,bcme053, ",
               "        bcme054,bcme055,bcme056,bcme057,bcme058, ",
               "        bcme059,bcme060,bcme061,bcme062,         ",
               "        bcme127,bcme128,bcme999,bcmestus         ",
               "   FROM app_base_bcme_t                  ",
               "  WHERE bcmeent = '",g_userInfo.enterprise_no,"'",
               "    AND bcmesite = '",g_userInfo.site_no,"'",
               "    AND bcme003 = '",l_data.bcae006,"'"

   IF obj.type_no = "1" THEN 
      LET l_sql = l_sql , " GROUP BY bcme002 ,bcme999"
   END IF 

   IF obj.type_no = "2" THEN 
      LET l_sql = l_sql , "  AND bcme999 = '",l_data.info_id,"'"
   END IF 
               
   PREPARE bcme_pre FROM l_sql 
   DECLARE bcme_cs  CURSOR FOR bcme_pre 

   LET l_i = 1
   FOREACH bcme_cs INTO r_obj[1].bcme[l_i].*

      IF NOT cl_null(r_obj[1].bcme[l_i].lot_no) THEN
         LET r_obj[1].bcme[l_i].lot_no = util.strings.urlEncode(r_obj[1].bcme[l_i].lot_no)
      END IF 
      
      LET l_i = l_i + 1
   END FOREACH
   CALL r_obj[1].bcme.deleteElement(r_obj[1].bcme.getLength())
   

   LET l_count = 0
   LET l_sql = "  SELECT COUNT(1)                              ",
               "    FROM app_base_bcae_t,app_base_bcaf_t       ",
               "   WHERE bcafent = bcaeent                     ",
               "     AND bcafsite = bcaesite                   ",
               "     AND bcaf001 = COALESCE(bcae001,bcaf001)   ",
               "     AND bcaf002 = COALESCE(bcae002,bcaf002)   ",
               "     AND bcaf003 = COALESCE(bcae003,bcaf003)   ",
               "     AND bcaeent = '",g_userInfo.enterprise_no,"'",
               "     AND bcaesite = '",g_userInfo.site_no,"'",
               "     AND bcae006 = '",l_data.bcae006,"'"

   PREPARE bcme_cnt_pre FROM l_sql
   EXECUTE bcme_cnt_pre INTO l_count
      
   LET r_obj[1].submit_show = FALSE
   IF l_count > 0 OR r_obj[1].bcme.getLength() > 0 THEN 
      LET r_obj[1].submit_show = TRUE
   END IF 

   IF r_obj[1].submit_show THEN

      LET l_source_no = "bcaf020"
      IF l_data.bcae014="1-1" THEN
         LET l_source_no = "bcaf002"
      END IF
      
      LET l_sql = " SELECT bcaf006,    bcaf007,    bcaf008,    bcaf009,    bcafname,  ",
                  "        bcafspec,   bcaf010,    bcaf011,    bcaf012,    bcaf017,   ",
                  "        bcaf016,    bcae016,    bcaf036,    bcaf037,    bcaf036,   ",
                  "        bcaf037,    bcaf038,    bcaf039,    bcaf040,    ",l_source_no,",",
                  "        bcaf021,    bcaf022,    bcaf023,    bcaf041,    bcaf042,   ",
                  "        bcaf043,    bcaf044,    bcaf045,    bcaf046,    bcaf047,   ",     
                  "        bcafMunit,  bcafPcode,  bcafPqty,   bcaf001                                         ",
                  "   FROM app_base_bcaf_t,app_base_bcae_t  ",
                  "  WHERE bcafent = bcaeent",
                  "    AND bcafsite = bcaesite",
                  "    AND bcaf001 = COALESCE(bcae001,bcaf001)",
                  "    AND bcaf002 = COALESCE(bcae002,bcaf002)",
                  "    AND bcaf003 = COALESCE(bcae003,bcaf003)",
                  "    AND bcaeent = '",g_userInfo.enterprise_no,"'",
                  "    AND bcaesite = '",g_userInfo.site_no,"'",
                  "    AND bcae006 = '",l_data.bcae006,"'"

      IF obj.type_no = "2" THEN 
         LET l_sql = l_sql , "  AND bcae001 = '",l_data.info_id,"'"
      END IF 
                  
      PREPARE bcaf_pre FROM l_sql 
      DECLARE bcaf_cs  CURSOR FOR bcaf_pre 

      LET l_i = 1
      FOREACH bcaf_cs INTO r_obj[1].bcaf[l_i].*

         #代码中含有特殊字元时，特別處理
         LET r_obj[1].bcaf[l_i].barcode_no = util.strings.urlEncode(r_obj[1].bcaf[l_i].barcode_no)
         
         IF NOT cl_null(r_obj[1].bcaf[l_i].lot_no) THEN
            LET r_obj[1].bcaf[l_i].lot_no = util.strings.urlEncode(r_obj[1].bcaf[l_i].lot_no)
         END IF
            
         IF cl_null(r_obj[1].bcaf[l_i].item_name) THEN
            SELECT bcme043 , bcme044
              INTO r_obj[1].bcaf[l_i].item_name , r_obj[1].bcaf[l_i].item_spec
              FROM app_base_bcme_t
             WHERE bcmeent = g_userInfo.enterprise_no
               AND bcmesite = g_userInfo.site_no
               AND bcme001 = l_data.bcae014
               AND bcme002 = r_obj[1].bcaf[l_i].source_no
               AND bcme005 = r_obj[1].bcaf[l_i].seq
               AND bcme006 = r_obj[1].bcaf[l_i].doc_line_seq
               AND bcme007 = r_obj[1].bcaf[l_i].doc_batch_seq
         END IF

         LET l_i = l_i + 1
      END FOREACH
      CALL r_obj[1].bcaf.deleteElement(r_obj[1].bcaf.getLength())

   END IF 
   
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()
   RETURN r_return
END FUNCTION
