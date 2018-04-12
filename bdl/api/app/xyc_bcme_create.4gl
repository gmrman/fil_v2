IMPORT os
IMPORT com
IMPORT util
IMPORT XML 
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION xyc_bcme_create(p_json)
   DEFINE p_json util.JSONArray
   DEFINE tempobj util.JSONObject
   
   TYPE type_bcmc_t                 RECORD   #單身記錄
      enterprise_no                    LIKE app_base_bcmc_t.bcmcent,      #企业编号
      site_no                          LIKE app_base_bcmc_t.bcmcsite,     #营运据点
      barcode_no                       LIKE app_base_bcmc_t.bcmc001,      #条码编号
      item_no                          LIKE app_base_bcmc_t.bcmc002,      #料件编号
      item_feature_no                  LIKE app_base_bcmc_t.bcmc003,      #产品特征
      item_feature_name                LIKE app_base_bcmc_t.bcmc004,      #产品特征说明
      warehouse_no                     LIKE app_base_bcmc_t.bcmc005,      #库位编号
      storage_spaces_no                LIKE app_base_bcmc_t.bcmc006,      #储位编号
      lot_no                           LIKE app_base_bcmc_t.bcmc007,      #批号
      inventory_management_features    LIKE app_base_bcmc_t.bcmc008,      #库存管理特征
      plot_no                          LIKE app_base_bcmc_t.bcmc009,      #制造批号
      serial_no                        LIKE app_base_bcmc_t.bcmc010,      #制造序号
      inventory_unit                   LIKE app_base_bcmc_t.bcmc011,      #库存单位
      barcode_qty                      LIKE app_base_bcmc_t.bcmc012,      #条位数量
      inventory_qty                    LIKE app_base_bcmc_t.bcmc013,      #库存数量
      source_operation                 LIKE app_base_bcmc_t.bcmc014,      #来源作业
      source_no                        LIKE app_base_bcmc_t.bcmc015,      #来源单号
      source_seq                       LIKE app_base_bcmc_t.bcmc016,      #来源项次
      source_line_seq                  LIKE app_base_bcmc_t.bcmc017,      #来源项序
      source_batch_seq                 LIKE app_base_bcmc_t.bcmc018,      #来源分批序
      barcode_lot_no                   LIKE app_base_bcmc_t.bcmc019,      #條碼批號
      barcode_type                     LIKE app_base_bcmc_t.bcmc020,      #條碼類型
      item_name                        LIKE app_base_bcmc_t.bcmc021,      #品名
      item_spec                        LIKE app_base_bcmc_t.bcmc022,      #規格
      lot_control_type                 LIKE app_base_bcmc_t.bcmc023,      #批號管控方式
      reference_unit_no                LIKE app_base_bcmc_t.bcmc024,      #參考單位
      reference_qty                    LIKE app_base_bcmc_t.bcmc025,      #參考數量
      packing_barcode                  LIKE app_base_bcmc_t.bcmc026,      #裝箱條碼
      packing_qty                      LIKE app_base_bcmc_t.bcmc027,      #裝箱數量
      last_transaction_date            LIKE app_base_bcmc_t.bcmc999       #最后异动时间
                                    END RECORD
   TYPE type_bcme_t                 RECORD   #單身記錄
      enterprise_no                    LIKE xyc_app_base_bcme_t.bcmeent,      #企业编号
      site_no                          LIKE xyc_app_base_bcme_t.bcmesite,     #营运据点
      source_operation                 LIKE xyc_app_base_bcme_t.bcme001,      #来源作业
      source_no                        LIKE xyc_app_base_bcme_t.bcme002,      #来源单号
      doc_type                         LIKE xyc_app_base_bcme_t.bcme003,      #单据类型
      create_date                      LIKE xyc_app_base_bcme_t.bcme004,      #单据日期
      seq                              LIKE xyc_app_base_bcme_t.bcme005,      #单据项次
      doc_line_seq                     LIKE xyc_app_base_bcme_t.bcme006,      #单据项序
      doc_batch_seq                    LIKE xyc_app_base_bcme_t.bcme007,      #单据分批序
      object_no                        LIKE xyc_app_base_bcme_t.bcme008,      #对象编号
      object_name                      LIKE xyc_app_base_bcme_t.bcme009,      #对象名称
      item_no                          LIKE xyc_app_base_bcme_t.bcme010,      #料件编号
      item_feature_no                  LIKE xyc_app_base_bcme_t.bcme011,      #产品特征
      item_feature_name                LIKE xyc_app_base_bcme_t.bcme012,      #产品特征说明
      warehouse_no                     LIKE xyc_app_base_bcme_t.bcme013,      #库位
      storage_spaces_no                LIKE xyc_app_base_bcme_t.bcme014,      #储位
      lot_no                           LIKE xyc_app_base_bcme_t.bcme015,      #批号
      inventory_management_features    LIKE xyc_app_base_bcme_t.bcme016,      #库存管理特征
      doc_qty                          LIKE xyc_app_base_bcme_t.bcme017,      #单据数量
      in_out_qty                       LIKE xyc_app_base_bcme_t.bcme018,      #出入数量
      in_out_date1                     LIKE xyc_app_base_bcme_t.bcme019,      #出入日期1
      in_out_date2                     LIKE xyc_app_base_bcme_t.bcme020,      #出入日期2
      done_stus                        LIKE xyc_app_base_bcme_t.bcme021,      #数据处理否
      closed_stus                      LIKE xyc_app_base_bcme_t.bcme022,      #结案否
      upper_no                         LIKE xyc_app_base_bcme_t.bcme023,      #上阶单据编号
      upper_seq                        LIKE xyc_app_base_bcme_t.bcme024,      #上阶单据项次
      upper_line_seq                   LIKE xyc_app_base_bcme_t.bcme025,      #上阶单据项序
      upper_batch_seq                  LIKE xyc_app_base_bcme_t.bcme026,      #上阶单据分批序
      production_item_no               LIKE xyc_app_base_bcme_t.bcme027,      #生产料号
      production_qty                   LIKE xyc_app_base_bcme_t.bcme028,      #生产数量
      item_name_spec                   LIKE xyc_app_base_bcme_t.bcme029,      #品名规格
      production_unit_no               LIKE xyc_app_base_bcme_t.bcme030,      #生产单位
      upper_unit_no                    LIKE xyc_app_base_bcme_t.bcme031,      #上阶单据单位
      reference_unit_no                LIKE xyc_app_base_bcme_t.bcme032,      #参考单位
      reference_qty                    LIKE xyc_app_base_bcme_t.bcme033,      #参考数量
      upper_qty                        LIKE xyc_app_base_bcme_t.bcme034,      #上阶单据数量
      unit_no                          LIKE xyc_app_base_bcme_t.bcme035,      #原单单位
      allow_error_rate                 LIKE xyc_app_base_bcme_t.bcme036,      #允许误差率
      run_card_no                      LIKE xyc_app_base_bcme_t.bcme037,      #RUNCARD
      qpa_molecular                    LIKE xyc_app_base_bcme_t.bcme038,      #QPA分子
      qpa_denominator                  LIKE xyc_app_base_bcme_t.bcme039,      #QPA分母
      main_organization                LIKE xyc_app_base_bcme_t.bcme040,      #主營組織
      outgoing_warehouse_no            LIKE xyc_app_base_bcme_t.bcme041,      #撥出倉庫
      outgoing_storage_spaces_no       LIKE xyc_app_base_bcme_t.bcme042,      #撥出儲位
      item_name                        LIKE xyc_app_base_bcme_t.bcme043,      #品名
      item_spec                        LIKE xyc_app_base_bcme_t.bcme044,      #規格
      lot_control_type                 LIKE xyc_app_base_bcme_t.bcme045,      #批號管控方式
      conversion_rate_denominator      LIKE xyc_app_base_bcme_t.bcme046,      #單位轉換率分母
      conversion_rate_molecular        LIKE xyc_app_base_bcme_t.bcme047,      #單位轉換率分子
      inventory_unit                   LIKE xyc_app_base_bcme_t.bcme048,      #庫存單位
      decimal_places                   LIKE xyc_app_base_bcme_t.bcme049,      #小數位數
      decimal_places_type              LIKE xyc_app_base_bcme_t.bcme050,      #取位方式
      second_conversion_rate           LIKE xyc_app_base_bcme_t.bcme051,      #參考單位換算率
      reference_decimal_places         LIKE xyc_app_base_bcme_t.bcme052,      #參考單位小數位數
      reference_decimal_places_type    LIKE xyc_app_base_bcme_t.bcme053,      #參考單位取位方式
      reference_in_out_qty             LIKE xyc_app_base_bcme_t.bcme054,      #參考單位出入數量
      valuation_unit_no                LIKE xyc_app_base_bcme_t.bcme055,      #計價單位
      valuation_qty                    LIKE xyc_app_base_bcme_t.bcme056,      #計價數量
      multi_unit_type                  LIKE xyc_app_base_bcme_t.bcme057,      #多單位的單位控管方式
      inventory_qty                    LIKE xyc_app_base_bcme_t.bcme058,      #庫存數量
      main_warehouse_no				      LIKE xyc_app_base_bcme_t.bcme059,      #主要倉庫
      main_storage_no				      LIKE xyc_app_base_bcme_t.bcme060,      #主要儲位
      first_in_first_out_control		   LIKE xyc_app_base_bcme_t.bcme061,      #條碼先進先出控管方式
      erp_warehousing                  LIKE xyc_app_base_bcme_t.bcme062,      #倉儲是否以ERP為主
      production_item_feature_no       LIKE xyc_app_base_bcme_t.bcme127,      #生产料号产品特征
      production_in_out_qty            LIKE xyc_app_base_bcme_t.bcme128,      #生产出入数量
      last_transaction_date            LIKE xyc_app_base_bcme_t.bcme999,      #最后异动时间
      status                           LIKE xyc_app_base_bcme_t.bcmestus,
        xshipping_mark_no                LIKE xyc_app_base_bcme_t.shipping_mark_no
                                   END RECORD 
   DEFINE l_master                  RECORD                           
      barcode_detail                   DYNAMIC ARRAY OF type_bcmc_t, 
      source_doc_detail                DYNAMIC ARRAY OF type_bcme_t                                      
                                    END RECORD
   DEFINE l_data                    RECORD
            bcae005                    LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006                    LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014                    LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015                    LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            info_id                    LIKE xyc_app_base_bcme_t.bcme999
                                    END RECORD
   DEFINE i                         INTEGER
   DEFINE l_cnt                     INTEGER
   DEFINE l_qty                     LIKE xyc_app_base_bcme_t.bcme017  
   
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_master)

   LET tempobj = p_json.get(2)
   CALL tempobj.toFGL(l_data)

   #插入bcmc表格
 #  FOR i=1 TO l_master.barcode_detail.getLength() 
 #  END FOR

   IF l_master.source_doc_detail.getLength() > 0 THEN
      IF l_data.bcae014 != "1" AND l_data.bcae014 != "3"   AND 
         l_data.bcae014 != "9" AND l_data.bcae014 != "9-1" THEN
         DELETE FROM xyc_app_base_bcme_t
          WHERE bcmeent = g_userInfo.enterprise_no
            AND bcmesite = g_userInfo.site_no
            AND bcme003 = l_data.bcae006
            AND bcme999 = l_data.info_id
      END IF
   END IF 
   
   #插入bcme表格
   FOR i=1 TO l_master.source_doc_detail.getLength()

      IF cl_null(l_master.source_doc_detail[i].doc_line_seq) THEN
         LET l_master.source_doc_detail[i].doc_line_seq = 0
      END IF 
      IF cl_null(l_master.source_doc_detail[i].doc_batch_seq) THEN
         LET l_master.source_doc_detail[i].doc_batch_seq = 0
      END IF 
      IF cl_null(l_master.source_doc_detail[i].item_feature_no) THEN
         LET l_master.source_doc_detail[i].item_feature_no = " "
      END IF 
      IF cl_null(l_master.source_doc_detail[i].inventory_management_features) THEN
         LET l_master.source_doc_detail[i].inventory_management_features = " "
      END IF 
      IF cl_null(l_master.source_doc_detail[i].warehouse_no) THEN
         LET l_master.source_doc_detail[i].warehouse_no = " "
      END IF 
      IF cl_null(l_master.source_doc_detail[i].storage_spaces_no) THEN
         LET l_master.source_doc_detail[i].storage_spaces_no = " "
      END IF 
      IF cl_null(l_master.source_doc_detail[i].lot_no) THEN
         LET l_master.source_doc_detail[i].lot_no = " "
      END IF 
    IF cl_null(l_master.source_doc_detail[i].xshipping_mark_no) THEN
         LET l_master.source_doc_detail[i].xshipping_mark_no = " "
      END IF 
      SELECT COUNT(1) INTO l_cnt
        FROM xyc_app_base_bcme_t 
       WHERE bcmeent = l_master.source_doc_detail[i].enterprise_no
         AND bcmesite = l_master.source_doc_detail[i].site_no
         AND bcme001 = l_master.source_doc_detail[i].source_operation
         AND bcme002 = l_master.source_doc_detail[i].source_no
         AND bcme005 = l_master.source_doc_detail[i].seq
         AND bcme006 = l_master.source_doc_detail[i].doc_line_seq
         AND bcme007 = l_master.source_doc_detail[i].doc_batch_seq
         AND bcme013 = l_master.source_doc_detail[i].warehouse_no
         AND bcme014 = l_master.source_doc_detail[i].storage_spaces_no
         AND bcme015 = l_master.source_doc_detail[i].lot_no
         AND bcme999 = l_data.info_id

      CASE g_basicInfo.server_product
         WHEN "EF"
         WHEN "E10"
         WHEN "WF"
            DISPLAY ""
         OTHERWISE
            LET l_qty = l_master.source_doc_detail[i].doc_qty - l_master.source_doc_detail[i].in_out_qty
            IF  l_qty <= 0  THEN
               CONTINUE FOR
            END IF
      END CASE

      IF l_cnt = 0 THEN
         INSERT INTO xyc_app_base_bcme_t(bcmeent,bcmesite,
                                     bcme001,bcme002,bcme003,bcme004,bcme005,
                                     bcme006,bcme007,bcme008,bcme009,bcme010,
                                     bcme011,bcme012,bcme013,bcme014,bcme015,
                                     bcme016,bcme017,bcme018,bcme019,bcme020,
                                     bcme021,bcme022,bcme023,bcme024,bcme025,
                                     bcme026,bcme027,bcme028,bcme029,bcme030,
                                     bcme031,bcme032,bcme033,bcme034,bcme035,
                                     bcme036,bcme037,bcme038,bcme039,bcme040,
                                     bcme041,bcme042,bcme043,bcme044,bcme045,
                                     bcme046,bcme047,bcme048,bcme049,bcme050,
                                     bcme051,bcme052,bcme053,bcme054,bcme055,
                                     bcme056,bcme057,bcme058,bcme059,bcme060,
                                     bcme061,bcme062,
                                     bcme127,bcme128,bcme999,bcmestus,shipping_mark_no)
         VALUES ( l_master.source_doc_detail[i].enterprise_no,
                  l_master.source_doc_detail[i].site_no,
                  l_master.source_doc_detail[i].source_operation,
                  l_master.source_doc_detail[i].source_no,
                  l_data.bcae006,
                  l_master.source_doc_detail[i].create_date,
                  l_master.source_doc_detail[i].seq,
                  l_master.source_doc_detail[i].doc_line_seq,
                  l_master.source_doc_detail[i].doc_batch_seq,
                  l_master.source_doc_detail[i].object_no,               
                  l_master.source_doc_detail[i].object_name,
                  l_master.source_doc_detail[i].item_no,
                  l_master.source_doc_detail[i].item_feature_no,
                  l_master.source_doc_detail[i].item_feature_name,
                  l_master.source_doc_detail[i].warehouse_no,
                  l_master.source_doc_detail[i].storage_spaces_no,
                  l_master.source_doc_detail[i].lot_no,
                  l_master.source_doc_detail[i].inventory_management_features,
                  l_master.source_doc_detail[i].doc_qty,
                  l_master.source_doc_detail[i].in_out_qty,              
                  l_master.source_doc_detail[i].in_out_date1,
                  l_master.source_doc_detail[i].in_out_date2,
                  l_master.source_doc_detail[i].done_stus,
                  l_master.source_doc_detail[i].closed_stus,
                  l_master.source_doc_detail[i].upper_no,
                  l_master.source_doc_detail[i].upper_seq,
                  l_master.source_doc_detail[i].upper_line_seq,
                  l_master.source_doc_detail[i].upper_batch_seq,
                  l_master.source_doc_detail[i].production_item_no,
                  l_master.source_doc_detail[i].production_qty,                 
                  l_master.source_doc_detail[i].item_name,
                  l_master.source_doc_detail[i].production_unit_no,
                  l_master.source_doc_detail[i].upper_unit_no,
                  l_master.source_doc_detail[i].reference_unit_no,
                  l_master.source_doc_detail[i].reference_qty,
                  l_master.source_doc_detail[i].upper_qty,
                  l_master.source_doc_detail[i].unit_no,
                  l_master.source_doc_detail[i].allow_error_rate,
                  l_master.source_doc_detail[i].run_card_no,
                  l_master.source_doc_detail[i].qpa_molecular,
                  l_master.source_doc_detail[i].qpa_denominator,
                  l_master.source_doc_detail[i].main_organization,
                  l_master.source_doc_detail[i].outgoing_warehouse_no,
                  l_master.source_doc_detail[i].outgoing_storage_spaces_no,
                  l_master.source_doc_detail[i].item_name,
                  l_master.source_doc_detail[i].item_spec,
                  l_master.source_doc_detail[i].lot_control_type,
                  l_master.source_doc_detail[i].conversion_rate_denominator,
                  l_master.source_doc_detail[i].conversion_rate_molecular,
                  l_master.source_doc_detail[i].inventory_unit,
                  l_master.source_doc_detail[i].decimal_places,
                  l_master.source_doc_detail[i].decimal_places_type,
                  l_master.source_doc_detail[i].second_conversion_rate,
                  l_master.source_doc_detail[i].reference_decimal_places,
                  l_master.source_doc_detail[i].reference_decimal_places_type,
                  l_master.source_doc_detail[i].reference_in_out_qty,
                  l_master.source_doc_detail[i].valuation_unit_no,
                  l_master.source_doc_detail[i].valuation_qty,
                  l_master.source_doc_detail[i].multi_unit_type,
                  l_master.source_doc_detail[i].inventory_qty,
                  l_master.source_doc_detail[i].main_warehouse_no,
                  l_master.source_doc_detail[i].main_storage_no,
                  l_master.source_doc_detail[i].first_in_first_out_control,
                  l_master.source_doc_detail[i].erp_warehousing,
                  l_master.source_doc_detail[i].production_item_feature_no,
                  l_master.source_doc_detail[i].production_in_out_qty,          
                  l_data.info_id,
                  l_master.source_doc_detail[i].status,
                  l_master.source_doc_detail[i].xshipping_mark_no)   
      ELSE
         UPDATE xyc_app_base_bcme_t
            SET bcme003 =  l_data.bcae006,  
                bcme004 =  l_master.source_doc_detail[i].create_date,  
                bcme008 =  l_master.source_doc_detail[i].object_no,                
                bcme009 =  l_master.source_doc_detail[i].object_name, 
                bcme010 =  l_master.source_doc_detail[i].item_no, 
                bcme011 =  l_master.source_doc_detail[i].item_feature_no,
                bcme012 =  l_master.source_doc_detail[i].item_feature_name,
                bcme013 =  l_master.source_doc_detail[i].warehouse_no,
                bcme014 =  l_master.source_doc_detail[i].storage_spaces_no,
                bcme015 =  l_master.source_doc_detail[i].lot_no,
                bcme016 =  l_master.source_doc_detail[i].inventory_management_features,
                bcme017 =  l_master.source_doc_detail[i].doc_qty,
                bcme018 =  l_master.source_doc_detail[i].in_out_qty,              
                bcme019 =  l_master.source_doc_detail[i].in_out_date1,
                bcme020 =  l_master.source_doc_detail[i].in_out_date2,
                bcme021 =  l_master.source_doc_detail[i].done_stus,
                bcme022 =  l_master.source_doc_detail[i].closed_stus,
                bcme023 =  l_master.source_doc_detail[i].upper_no,
                bcme024 =  l_master.source_doc_detail[i].upper_seq,
                bcme025 =  l_master.source_doc_detail[i].upper_line_seq,
                bcme026 =  l_master.source_doc_detail[i].upper_batch_seq,
                bcme027 =  l_master.source_doc_detail[i].production_item_no,
                bcme028 =  l_master.source_doc_detail[i].production_qty,              
                bcme029 =  l_master.source_doc_detail[i].item_name,
                bcme030 =  l_master.source_doc_detail[i].production_unit_no,
                bcme031 =  l_master.source_doc_detail[i].upper_unit_no,
                bcme032 =  l_master.source_doc_detail[i].reference_unit_no,
                bcme033 =  l_master.source_doc_detail[i].reference_qty,
                bcme034 =  l_master.source_doc_detail[i].upper_qty,
                bcme035 =  l_master.source_doc_detail[i].unit_no,
                bcme036 =  l_master.source_doc_detail[i].allow_error_rate,
                bcme037 =  l_master.source_doc_detail[i].run_card_no,
                bcme038 =  l_master.source_doc_detail[i].qpa_molecular,
                bcme039 =  l_master.source_doc_detail[i].qpa_denominator,
                bcme040 =  l_master.source_doc_detail[i].main_organization,
                bcme041 =  l_master.source_doc_detail[i].outgoing_warehouse_no,
                bcme042 =  l_master.source_doc_detail[i].outgoing_storage_spaces_no,
                bcme043 =  l_master.source_doc_detail[i].item_name,
                bcme044 =  l_master.source_doc_detail[i].item_spec,
                bcme045 =  l_master.source_doc_detail[i].lot_control_type,
                bcme046 =  l_master.source_doc_detail[i].conversion_rate_denominator,
                bcme047 =  l_master.source_doc_detail[i].conversion_rate_molecular,
                bcme048 =  l_master.source_doc_detail[i].inventory_unit,
                bcme049 =  l_master.source_doc_detail[i].decimal_places,
                bcme050 =  l_master.source_doc_detail[i].decimal_places_type,
                bcme051 =  l_master.source_doc_detail[i].second_conversion_rate,
                bcme052 =  l_master.source_doc_detail[i].reference_decimal_places,
                bcme053 =  l_master.source_doc_detail[i].reference_decimal_places_type,
                bcme054 =  l_master.source_doc_detail[i].reference_in_out_qty,
                bcme055 =  l_master.source_doc_detail[i].valuation_unit_no,
                bcme056 =  l_master.source_doc_detail[i].valuation_qty,
                bcme057 =  l_master.source_doc_detail[i].multi_unit_type,
                bcme058 =  l_master.source_doc_detail[i].inventory_qty,
                bcme059 =  l_master.source_doc_detail[i].main_warehouse_no,
                bcme060 =  l_master.source_doc_detail[i].main_storage_no,
                bcme061 =  l_master.source_doc_detail[i].first_in_first_out_control,           
                bcme062 =  l_master.source_doc_detail[i].erp_warehousing,     
                bcme127 =  l_master.source_doc_detail[i].production_item_feature_no,
                bcme128 =  l_master.source_doc_detail[i].production_in_out_qty,       
                bcme999 =  l_data.info_id,
                bcmestus=  l_master.source_doc_detail[i].status,
                xshipping_mark_no= l_master.source_doc_detail[i].xshipping_mark_no
          WHERE bcmeent = l_master.source_doc_detail[i].enterprise_no
            AND bcmesite = l_master.source_doc_detail[i].site_no
            AND bcme001 = l_master.source_doc_detail[i].source_operation
            AND bcme002 = l_master.source_doc_detail[i].source_no
            AND bcme005 = l_master.source_doc_detail[i].seq
            AND bcme006 = l_master.source_doc_detail[i].doc_line_seq
            AND bcme007 = l_master.source_doc_detail[i].doc_batch_seq
            AND bcme013 = l_master.source_doc_detail[i].warehouse_no
            AND bcme014 = l_master.source_doc_detail[i].storage_spaces_no
            AND bcme015 = l_master.source_doc_detail[i].lot_no
            AND bcme999 = l_data.info_id
      END IF        
   END FOR
END FUNCTION