IMPORT os
IMPORT com
IMPORT util
IMPORT XML 
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION fil3_bcme_create(p_json)
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
      last_transaction_date            LIKE app_base_bcmc_t.bcmc999       #最后异动时间
                                    END RECORD
   TYPE type_bcme_t                 RECORD   #單身記錄
      enterprise_no                    LIKE app_base_bcme_t.bcmeent,      #企业编号
      site_no                          LIKE app_base_bcme_t.bcmesite,     #营运据点
      source_operation                 LIKE app_base_bcme_t.bcme001,      #来源作业
      source_no                        LIKE app_base_bcme_t.bcme002,      #来源单号
      doc_type                         LIKE app_base_bcme_t.bcme003,      #单据类型
      create_date                      LIKE app_base_bcme_t.bcme004,      #单据日期
      seq                              LIKE app_base_bcme_t.bcme005,      #单据项次
      doc_line_seq                     LIKE app_base_bcme_t.bcme006,      #单据项序
      doc_batch_seq                    LIKE app_base_bcme_t.bcme007,      #单据分批序
      object_no                        LIKE app_base_bcme_t.bcme008,      #对象编号
      object_name                      LIKE app_base_bcme_t.bcme009,      #对象名称
      item_no                          LIKE app_base_bcme_t.bcme010,      #料件编号
      item_feature_no                  LIKE app_base_bcme_t.bcme011,      #产品特征
      item_feature_name                LIKE app_base_bcme_t.bcme012,      #产品特征说明
      warehouse_no                     LIKE app_base_bcme_t.bcme013,      #库位
      storage_spaces_no                LIKE app_base_bcme_t.bcme014,      #储位
      lot_no                           LIKE app_base_bcme_t.bcme015,      #批号
      inventory_management_features    LIKE app_base_bcme_t.bcme016,      #库存管理特征
      doc_qty                          LIKE app_base_bcme_t.bcme017,      #单据数量
      in_out_qty                       LIKE app_base_bcme_t.bcme018,      #出入数量
      in_out_date1                     LIKE app_base_bcme_t.bcme019,      #出入日期1
      in_out_date2                     LIKE app_base_bcme_t.bcme020,      #出入日期2
      done_stus                        LIKE app_base_bcme_t.bcme021,      #数据处理否
      closed_stus                      LIKE app_base_bcme_t.bcme022,      #结案否
      upper_no                         LIKE app_base_bcme_t.bcme023,      #上阶单据编号
      upper_seq                        LIKE app_base_bcme_t.bcme024,      #上阶单据项次
      upper_line_seq                   LIKE app_base_bcme_t.bcme025,      #上阶单据项序
      upper_batch_seq                  LIKE app_base_bcme_t.bcme026,      #上阶单据分批序
      production_item_no               LIKE app_base_bcme_t.bcme027,      #生产料号
      production_qty                   LIKE app_base_bcme_t.bcme028,      #生产数量
      item_name_spec                   LIKE app_base_bcme_t.bcme029,      #品名规格
      production_unit_no               LIKE app_base_bcme_t.bcme030,      #生产单位
      upper_unit_no                    LIKE app_base_bcme_t.bcme031,      #上阶单据单位
      reference_unit_no                LIKE app_base_bcme_t.bcme032,      #参考单位
      reference_qty                    LIKE app_base_bcme_t.bcme033,      #参考数量
      upper_qty                        LIKE app_base_bcme_t.bcme034,      #上阶单据数量
      unit_no                          LIKE app_base_bcme_t.bcme035,      #原单单位
      allow_error_rate                 LIKE app_base_bcme_t.bcme036,      #允许误差率
      run_card_no                      LIKE app_base_bcme_t.bcme037,      #RUNCARD
      qpa_molecular                    LIKE app_base_bcme_t.bcme038,      #QPA分子
      qpa_denominator                  LIKE app_base_bcme_t.bcme039,      #QPA分母
      main_organization                LIKE app_base_bcme_t.bcme040,      #主營組織
      outgoing_warehouse_no            LIKE app_base_bcme_t.bcme041,      #撥出倉庫
      outgoing_storage_spaces_no       LIKE app_base_bcme_t.bcme042,      #撥出儲位
      item_name                        LIKE app_base_bcme_t.bcme043,      #品名
      item_spec                        LIKE app_base_bcme_t.bcme044,      #規格
      lot_control_type                 LIKE app_base_bcme_t.bcme045,      #批號管控方式
      conversion_rate_denominator      LIKE app_base_bcme_t.bcme046,      #單位轉換率分母
      conversion_rate_molecular        LIKE app_base_bcme_t.bcme047,      #單位轉換率分子
      inventory_unit                   LIKE app_base_bcme_t.bcme048,      #庫存單位
      decimal_places                   LIKE app_base_bcme_t.bcme049,      #小數位數
      decimal_places_type              LIKE app_base_bcme_t.bcme050,      #取位方式
      production_item_feature_no       LIKE app_base_bcme_t.bcme127,      #生产料号产品特征
      production_in_out_qty            LIKE app_base_bcme_t.bcme128,      #160125-00025#3 add 生产出入数量
      last_transaction_date            LIKE app_base_bcme_t.bcme999,      #最后异动时间
      status                           LIKE app_base_bcme_t.bcmestus
                                    END RECORD 
   DEFINE l_master                  RECORD                           
            barcode_detail             DYNAMIC ARRAY OF type_bcmc_t, 
            source_doc_detail          DYNAMIC ARRAY OF type_bcme_t                                      
                                    END RECORD
   DEFINE i                         INTEGER
   DEFINE l_cnt                     INTEGER
   DEFINE l_states                  DYNAMIC ARRAY OF RECORD
            code                       BOOLEAN,     #0:success, 其他:fail
            MESSAGE                    STRING,      #说明信息
            data                       STRING       #回传值 必需为JSON  String
                                    END RECORD
   DEFINE r_json                    util.JSONArray
   DEFINE r_return                  STRING

   WHENEVER ERROR CONTINUE
      
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_master)
   LET g_status.code = TRUE

   BEGIN WORK

   #插入bcmc表格
   #FOR i=1 TO l_master.barcode_detail.getLength() 
   #END FOR

   IF l_master.source_doc_detail.getLength() > 0 THEN
      SELECT COUNT(1) INTO l_cnt
        FROM app_base_bcme_t 
       WHERE bcmeent = l_master.source_doc_detail[1].enterprise_no
         AND bcmesite = l_master.source_doc_detail[1].site_no
         AND bcme001 = l_master.source_doc_detail[1].source_operation
         AND bcme002 = l_master.source_doc_detail[1].source_no
         AND bcme003  = l_master.source_doc_detail[1].doc_type
              
      IF l_cnt > 0 THEN
         DELETE FROM app_base_bcme_t
          WHERE bcmeent  = l_master.source_doc_detail[1].enterprise_no
            AND bcmesite = l_master.source_doc_detail[1].site_no
            AND bcme001  = l_master.source_doc_detail[1].source_operation
            AND bcme002  = l_master.source_doc_detail[1].source_no
            AND bcme003  = l_master.source_doc_detail[1].doc_type
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
      IF cl_null(l_master.source_doc_detail[i].storage_spaces_no) THEN
         LET l_master.source_doc_detail[i].storage_spaces_no = " "
      END IF 
      IF cl_null(l_master.source_doc_detail[i].lot_no) THEN
         LET l_master.source_doc_detail[i].lot_no = " "
      END IF 

      IF cl_null(l_master.source_doc_detail[i].last_transaction_date)  THEN
         LET l_master.source_doc_detail[i].last_transaction_date = cl_timestamp_from_datetime(CURRENT)
      ELSE
         LET l_master.source_doc_detail[i].last_transaction_date = cl_timestamp_from_datetime(l_master.source_doc_detail[i].last_transaction_date)
      END IF

      INSERT INTO app_base_bcme_t(bcmeent,bcmesite,
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
                                  bcme127,bcme128,bcme999,bcmestus)
         VALUES ( l_master.source_doc_detail[i].enterprise_no,
                  l_master.source_doc_detail[i].site_no,
                  l_master.source_doc_detail[i].source_operation,
                  l_master.source_doc_detail[i].source_no,
                  l_master.source_doc_detail[i].doc_type,
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
                  l_master.source_doc_detail[i].production_item_feature_no,
                  l_master.source_doc_detail[i].production_in_out_qty,          
                  l_master.source_doc_detail[i].last_transaction_date,
                  l_master.source_doc_detail[i].status)   
      IF SQLCA.SQLCODE THEN
         LET g_status.code = FALSE
         LET g_status.message = SQLCA.SQLCODE
         EXIT FOR
      END IF
   END FOR

   IF g_status.code THEN
      COMMIT WORK
   ELSE
      ROLLBACK WORK
   END IF

   LET l_states[1].* = g_status.*

   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION