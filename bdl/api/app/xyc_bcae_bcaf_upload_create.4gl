IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE scandetail                           RECORD
      enterprise_no                          LIKE xyc_app_base_bcaf_t.bcafent, #企业编号,
      site_no                                LIKE xyc_app_base_bcaf_t.bcafsite,#门店编号,
      info_id                                LIKE xyc_app_base_bcaf_t.bcaf001, #信息ID,
      info_lot_no                            LIKE xyc_app_base_bcaf_t.bcaf002, #信息批号,
      scan_doc_no                            LIKE xyc_app_base_bcaf_t.bcaf003, #扫描单号,
      scan_seq                               LIKE xyc_app_base_bcaf_t.bcaf004, #扫描项次,
      in_out_no                              LIKE xyc_app_base_bcaf_t.bcaf005, #出入库码,
      barcode_no                             STRING,                       #条码编号,
      item_no                                LIKE xyc_app_base_bcaf_t.bcaf007, #料件编号,
      item_feature_no                        LIKE xyc_app_base_bcaf_t.bcaf008, #产品特征,
      item_feature_name                      LIKE xyc_app_base_bcaf_t.bcaf009, #产品特征说明,
      warehouse_no                           LIKE xyc_app_base_bcaf_t.bcaf010, #库位,
      storage_spaces_no                      LIKE xyc_app_base_bcaf_t.bcaf011, #储位,
      lot_no                                 STRING,                       #批号,
      inventory_management_features          LIKE xyc_app_base_bcaf_t.bcaf013, #库存管理特征,
      plot_no                                LIKE xyc_app_base_bcaf_t.bcaf014, #制造批号,
      serial_no                              LIKE xyc_app_base_bcaf_t.bcaf015, #制造序号,
      picking_qty                            LIKE xyc_app_base_bcaf_t.bcaf016, #拣货数量,
      picking_unit_no                        LIKE xyc_app_base_bcaf_t.bcaf017, #拣货单位,
      picking_date                           LIKE xyc_app_base_bcaf_t.bcaf018, #拣货日期时间,
      doc_no                                 LIKE xyc_app_base_bcaf_t.bcaf020, #单号,
      seq                                    LIKE xyc_app_base_bcaf_t.bcaf021, #项次,
      line_seq                               LIKE xyc_app_base_bcaf_t.bcaf022, #项序,
      batch_seq                              LIKE xyc_app_base_bcaf_t.bcaf023, #分批序,
      source_unit_no                         LIKE xyc_app_base_bcaf_t.bcaf031, #来源单位,
      source_qty                             LIKE xyc_app_base_bcaf_t.bcaf032, #来源数量,
      objective_unit_no                      LIKE xyc_app_base_bcaf_t.bcaf033, #目的单位,
      objective_qty                          LIKE xyc_app_base_bcaf_t.bcaf034, #目的数量,
      conversion_qty                         LIKE xyc_app_base_bcaf_t.bcaf035, #换算后数量
      ingoing_warehouse_no                   LIKE xyc_app_base_bcaf_t.bcaf036, #撥入倉庫
      ingoing_storage_spaces_no              LIKE xyc_app_base_bcaf_t.bcaf037, #撥入儲位
      in_transit_cost_warehouse_no           LIKE xyc_app_base_bcaf_t.bcaf038, #在途成本倉
      in_transit_non_cost_warehouse_no       LIKE xyc_app_base_bcaf_t.bcaf039, #在途非成本倉
      run_card_no                            LIKE xyc_app_base_bcaf_t.bcaf040, #RunCard
      reason_no                              LIKE xyc_app_base_bcaf_t.bcaf041, #理由碼
      reference_unit_no                      LIKE xyc_app_base_bcaf_t.bcaf042, #參考單位
      reference_qty                          LIKE xyc_app_base_bcaf_t.bcaf043, #參考數量
      valuation_unit_no                      LIKE xyc_app_base_bcaf_t.bcaf044, #計價單位
      valuation_qty                          LIKE xyc_app_base_bcaf_t.bcaf045, #計價數量
      inventory_unit                         LIKE xyc_app_base_bcaf_t.bcaf046, #庫存單位
      inventory_qty                          LIKE xyc_app_base_bcaf_t.bcaf047, #庫存數量
      packing_barcode                        LIKE xyc_app_base_bcaf_t.bcafPcode,#裝箱條碼
      packing_qty                            LIKE xyc_app_base_bcaf_t.bcafPqty,  #裝箱數量
      xshipping_mark_no                      LIKE xyc_app_base_bcaf_t.xshipping_mark_no,
      xshipping_mark_cn                      LIKE xyc_app_base_bcaf_t.xshipping_mark_cn
         
      END RECORD
TYPE scanhead                             RECORD
      errmsg                                 STRING,                       #errmsg
      enterprise_no                          LIKE app_base_bcae_t.bcaeent, #企业编号",
      site_no                                LIKE app_base_bcae_t.bcaesite,#门店编号",
      info_id                                LIKE app_base_bcae_t.bcae001, #信息ID",
      info_lot_no                            LIKE app_base_bcae_t.bcae002, #信息批号",
      scan_doc_no                            LIKE app_base_bcae_t.bcae003, #扫描单号",
      objective_doc_no                       LIKE app_base_bcae_t.bcae004, #目的单号",
      in_out_no                              LIKE app_base_bcae_t.bcae005, #出入库码",
      transaction_type                       LIKE app_base_bcae_t.bcae006, #库存异动类型",
      scan_employee_no                       LIKE app_base_bcae_t.bcae007, #扫描人员",
      report_stus                            LIKE app_base_bcae_t.bcae008, #上传状态",
      report_datetime                        LIKE app_base_bcae_t.bcae009, #上传时间",
      abnormal_no                            LIKE app_base_bcae_t.bcae010, #异常原因",
      batch_processing_stus                  LIKE app_base_bcae_t.bcae011, #批次处理状态码",
      batch_processing_anomaly_descriptions  LIKE app_base_bcae_t.bcae012, #批次处理异常说明",
      batch_processing_time                  LIKE app_base_bcae_t.bcae013, #批次接收处理时间",
      recommended_operations                 LIKE app_base_bcae_t.bcae014, #建议运行作业",
      recommended_function                   LIKE app_base_bcae_t.bcae015, #建议运行功能",
      main_organization                      LIKE app_base_bcae_t.bcae016, #主營組織,
      last_transaction_date                  LIKE app_base_bcae_t.bcae999, #最后异动时间",
      status                                 LIKE app_base_bcae_t.bcaestus,#状态码",
      scan_detail                            DYNAMIC ARRAY OF scandetail
                                          END RECORD

PUBLIC FUNCTION xyc_bcae_bcaf_upload_create(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_sql            STRING
   DEFINE l_i,l_j          INTEGER
   DEFINE l_info_lot_no    STRING
   DEFINE l_data           RECORD
          bcae005             LIKE app_base_bcae_t.bcae005,  #出入庫瑪
          bcae006             LIKE app_base_bcae_t.bcae006,  #作業代號
          bcae014             LIKE app_base_bcae_t.bcae014,  #記錄作業編號
          bcae015             LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
          bcae002             LIKE app_base_bcae_t.bcae002,
          info_id             LIKE app_base_bcme_t.bcme999   
                           END RECORD
   DEFINE l_bcae_t         RECORD LIKE app_base_bcae_t.*
   DEFINE head             DYNAMIC ARRAY OF scanhead
   DEFINE l_success        BOOLEAN

   LET l_success = TRUE
   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_data)

   IF l_success THEN
      LET l_sql = " SELECT bcafent,             IFNULL(bcafsite,' '), IFNULL(bcaf001,' '), IFNULL(bcaf002,' '), IFNULL(bcaf003,' '),",
                  "        IFNULL(bcaf004,0),   IFNULL(bcaf005,0),    IFNULL(bcaf006,' '), IFNULL(bcaf007,' '), IFNULL(bcaf008,' '),",
                  "        IFNULL(bcaf009,' '), IFNULL(bcaf010,' '),  IFNULL(bcaf011,' '), IFNULL(bcaf012,' '), IFNULL(bcaf013,' '),",
                  "        IFNULL(bcaf014,' '), IFNULL(bcaf015,' '),  IFNULL(bcaf016,0),   IFNULL(bcaf017,' '), IFNULL(bcaf018,' '),",
                  "        IFNULL(bcaf020,' '), IFNULL(bcaf021,0),    IFNULL(bcaf022,0),   IFNULL(bcaf023,0),   IFNULL(bcaf031,' '),",
                  "        IFNULL(bcaf032,0),   IFNULL(bcaf033,' '),  IFNULL(bcaf034,0),   IFNULL(bcaf035,0),   IFNULL(bcaf036,' '),",
                  "        IFNULL(bcaf037,' '), IFNULL(bcaf038,' '),  IFNULL(bcaf039,' '), IFNULL(bcaf040,0),   IFNULL(bcaf041,' '),",
                  "        IFNULL(bcaf042,' '), IFNULL(bcaf043,0),    IFNULL(bcaf044,' '), IFNULL(bcaf045,0) ,  IFNULL(bcaf046,' '),",
                  "        IFNULL(bcaf047,0),   IFNULL(bcafPcode,' '),IFNULL(bcafPqty,' ') ,  IFNULL(xshipping_mark_no,' ') , IFNULL(xshipping_mark_cn,' ')                                          ",
                  "   FROM xyc_app_base_bcaf_t ",
                  "  WHERE bcafent =  ?  ",
                  "    AND bcafsite = ?  ",
                  "    AND bcaf001 =  ?  ",
                  "    AND bcaf002 =  ?  ",
                  "    AND bcaf003 =  ?  "

      IF NOT cl_null(l_data.bcae002) THEN
          LET l_sql = l_sql , " AND bcaf002 = '",l_data.bcae002,"' "
      END IF 

      PREPARE s_scandetail_pre FROM l_sql
      DECLARE s_scandetail_cur CURSOR FOR s_scandetail_pre

      LET l_sql = " SELECT bcaeent,IFNULL(bcaesite,' '),IFNULL(bcae001,' '),IFNULL(bcae002,' '),IFNULL(bcae003,' '),IFNULL(bcae004,' '),IFNULL(bcae005,0),",
                  "        IFNULL(bcae006,' '),IFNULL(bcae007,' '),IFNULL(bcae008,' '),IFNULL(bcae009,' '),IFNULL(bcae010,' '),IFNULL(bcae011,' '),IFNULL(bcae012,' '),",
                  "        IFNULL(bcae013,' '),IFNULL(bcae014,' '),IFNULL(bcae015,''),IFNULL(bcae016,0),IFNULL(bcae999,' '),IFNULL(bcaestus,' ')",
                  "   FROM app_base_bcae_t ",
                  "  WHERE bcae006 = '",l_data.bcae006,"'",
                  "    AND bcaeent = '",g_userInfo.enterprise_no,"'",
                  "    AND bcaesite = '",g_userInfo.site_no,"'",
                  "    AND bcae001  = '",l_data.info_id,"'"
                  
      IF NOT cl_null(l_data.bcae002) THEN
         LET l_sql = l_sql , " AND bcae002 = '",l_data.bcae002,"' "
      END IF 
                  
      PREPARE s_scan_pre FROM l_sql
      DECLARE s_scan_cur CURSOR FOR s_scan_pre
      LET l_i = 1
      FOREACH s_scan_cur INTO l_bcae_t.bcaeent, l_bcae_t.bcaesite, l_bcae_t.bcae001, l_bcae_t.bcae002, l_bcae_t.bcae003, 
                              l_bcae_t.bcae004, l_bcae_t.bcae005,  l_bcae_t.bcae006, l_bcae_t.bcae007, l_bcae_t.bcae008, 
                              l_bcae_t.bcae009, l_bcae_t.bcae010,  l_bcae_t.bcae011, l_bcae_t.bcae012, l_bcae_t.bcae013, 
                              l_bcae_t.bcae014, l_bcae_t.bcae015,  l_bcae_t.bcae016, l_bcae_t.bcae999, l_bcae_t.bcaestus

         LET head[l_i].enterprise_no                           = l_bcae_t.bcaeent
         LET head[l_i].site_no                                 = l_bcae_t.bcaesite
         LET head[l_i].info_id                                 = l_bcae_t.bcae001
         LET head[l_i].info_lot_no                             = l_bcae_t.bcae002
         LET head[l_i].scan_doc_no                             = l_bcae_t.bcae003
         LET head[l_i].objective_doc_no                        = l_bcae_t.bcae004
         LET head[l_i].in_out_no                               = l_bcae_t.bcae005
         LET head[l_i].transaction_type                        = l_bcae_t.bcae014,l_bcae_t.bcae015   
         LET head[l_i].scan_employee_no                        = l_bcae_t.bcae007
         LET head[l_i].report_stus                             = l_bcae_t.bcae008
         LET head[l_i].report_datetime                         = l_bcae_t.bcae009
         LET head[l_i].abnormal_no                             = l_bcae_t.bcae010
         LET head[l_i].batch_processing_stus                   = l_bcae_t.bcae011
         LET head[l_i].batch_processing_anomaly_descriptions   = l_bcae_t.bcae012
         LET head[l_i].batch_processing_time                   = l_bcae_t.bcae013
         LET head[l_i].recommended_operations                  = l_bcae_t.bcae014
         LET head[l_i].recommended_function                    = l_bcae_t.bcae015
         LET head[l_i].main_organization                       = l_bcae_t.bcae016
         LET head[l_i].last_transaction_date                   = l_bcae_t.bcae999
         LET head[l_i].status                                  = l_bcae_t.bcaestus

         IF cl_null(head[l_i].errmsg) THEN
            LET head[l_i].errmsg = " "
         END IF
         LET l_j = 1
         FOREACH s_scandetail_cur USING head[l_i].enterprise_no, head[l_i].site_no , head[l_i].info_id,
                                        head[l_i].info_lot_no  , head[l_i].scan_doc_no
                                   INTO head[l_i].scan_detail[l_j].*
            #代码中含有特殊字元时，特別處理
            LET head[l_i].scan_detail[l_j].barcode_no = util.strings.urlEncode(head[l_i].scan_detail[l_j].barcode_no)
            LET head[l_i].scan_detail[l_j].packing_barcode = util.strings.urlEncode(head[l_i].scan_detail[l_j].packing_barcode)
            
            IF NOT cl_null(head[l_i].scan_detail[l_j].lot_no) THEN
               LET head[l_i].scan_detail[l_j].lot_no = util.strings.urlEncode(head[l_i].scan_detail[l_j].lot_no)
            END IF
               
            IF l_data.bcae014 = '9' THEN   #完工入庫訊息批號 抓上階單號(FQC)
               SELECT bcme023 INTO l_info_lot_no
                 FROM app_base_bcme_t
                WHERE bcmeent = g_userInfo.enterprise_no
                  AND bcmesite = g_userinfo.site_no
                  AND bcme002 = head[l_i].scan_detail[l_j].doc_no
                  AND bcme005 = head[l_i].scan_detail[l_j].seq
                  AND bcme006 = head[l_i].scan_detail[l_j].line_seq
                  AND bcme007 = head[l_i].scan_detail[l_j].batch_seq   
                  AND bcme999 = head[l_i].scan_detail[l_j].info_id

               IF cl_null(l_info_lot_no) THEN
                  LET l_info_lot_no = " "
               END IF

               LET head[l_i].scan_detail[l_j].info_lot_no = l_info_lot_no
            END IF

            LET l_j= l_j+1
         END FOREACH
         CALL head[l_i].scan_detail.deleteElement(l_j)

         IF l_data.bcae014 = '9' THEN 
            LET head[l_i].info_lot_no = l_info_lot_no
         END IF
         
         LET l_i = l_i + 1
      END FOREACH
      CALL head.deleteElement(l_i)

   END IF

   LET r_json  = util.JSONArray.fromFGL(head)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
