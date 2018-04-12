IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE detail                RECORD
      item_no                 LIKE xyc_app_base_bcme_t.bcme010,
      item_feature_no         LIKE xyc_app_base_bcme_t.bcme011,
      item_feature_name       LIKE xyc_app_base_bcme_t.bcme012,
      item_name               LIKE xyc_app_base_bcme_t.bcme043,
      item_spec               LIKE xyc_app_base_bcme_t.bcme044,
      already_qty             LIKE xyc_app_base_bcme_t.bcme017,
      should_qty              LIKE xyc_app_base_bcme_t.bcme017,
      unit                    LIKE xyc_app_base_bcme_t.bcme035, #揀貨單位
      multi_unit_type         LIKE xyc_app_base_bcme_t.bcme057, #多單位的單位控管方式
      reference_unit_no       LIKE xyc_app_base_bcme_t.bcme032, #參考單位
      already_ref_qty         LIKE xyc_app_base_bcme_t.bcme033, #參考數量
      should_ref_qty          LIKE xyc_app_base_bcme_t.bcme033, #參考數量
      valuation_unit_no       LIKE xyc_app_base_bcme_t.bcme055, #計價單位
      already_val_qty         LIKE xyc_app_base_bcme_t.bcme056, #計價數量
      should_val_qty          LIKE xyc_app_base_bcme_t.bcme056, #計價數量
      inventory_unit          LIKE xyc_app_base_bcme_t.bcme048, #庫存單位
      already_inv_qty         LIKE xyc_app_base_bcme_t.bcme058, #庫存數量
      should_inv_qty          LIKE xyc_app_base_bcme_t.bcme058, #庫存數量
      main_warehouse_no       LIKE xyc_app_base_bcme_t.bcme059, #主要倉庫
      main_storage_no         LIKE xyc_app_base_bcme_t.bcme060 , #主要儲位
      
      xshipping_mark_no       LIKE xyc_app_base_bcme_t.shipping_mark_no
                           END RECORD
PUBLIC FUNCTION xyc_bcme_get(p_json)
   DEFINE p_json           util.JSONArray
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            info_id           LIKE xyc_app_base_bcme_t.bcme999
                           END RECORD
   DEFINE l_sql            STRING
   DEFINE l_i              INTEGER
   DEFINE l_bcme           RECORD
            bcme010           LIKE xyc_app_base_bcme_t.bcme010,
            bcme011           LIKE xyc_app_base_bcme_t.bcme011,
            bcme012           LIKE xyc_app_base_bcme_t.bcme012,
            bcme043           LIKE xyc_app_base_bcme_t.bcme043,
            bcme044           LIKE xyc_app_base_bcme_t.bcme044,
            bcme057           LIKE xyc_app_base_bcme_t.bcme057, #多單位的單位控管方式
            bcme035           LIKE xyc_app_base_bcme_t.bcme035, #揀貨單位
            bcme017           LIKE xyc_app_base_bcme_t.bcme017,
            bcme017_sum       LIKE xyc_app_base_bcme_t.bcme017,
            bcme032           LIKE xyc_app_base_bcme_t.bcme032, #參考單位
            bcme033           LIKE xyc_app_base_bcme_t.bcme033, #參考數量
            bcme033_sum       LIKE xyc_app_base_bcme_t.bcme033, #參考數量
            bcme055           LIKE xyc_app_base_bcme_t.bcme055, #計價單位
            bcme056           LIKE xyc_app_base_bcme_t.bcme056, #計價數量
            bcme056_sum       LIKE xyc_app_base_bcme_t.bcme056, #計價數量
            bcme048           LIKE xyc_app_base_bcme_t.bcme048, #庫存單位
            bcme058           LIKE xyc_app_base_bcme_t.bcme058, #庫存數量
            bcme058_sum       LIKE xyc_app_base_bcme_t.bcme058, #庫存數量  
            bcme059           LIKE xyc_app_base_bcme_t.bcme059, #主要倉庫
            bcme060           LIKE xyc_app_base_bcme_t.bcme060  #主要儲位  
    
            ,xshipping_mark_no       LIKE xyc_app_base_bcme_t.shipping_mark_no        
                           END RECORD
   DEFINE r_obj            DYNAMIC ARRAY OF RECORD
            submit_show       BOOLEAN,
            list              DYNAMIC ARRAY OF detail
                           END RECORD
                      
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_data)
   
   LET l_sql = " SELECT bcme010, bcme011, bcme012, bcme043, bcme044, bcme057,    ",
               "        bcme035, SUM( bcme017 - COALESCE(bcme018,0)),            ",
               "        COALESCE((SELECT SUM(bcaf016)                            ",
               "                    FROM xyc_app_base_bcaf_t , app_base_bcae_t",
               "                   WHERE bcafent  = bcaeent",
               "                     AND bcafsite = bcaesite",
               "                     AND bcaf001  = COALESCE(bcae001,bcaf001)",
               "                     AND bcaf002  = COALESCE(bcae002,bcaf002)",
               "                     AND bcaf003  = COALESCE(bcae003,bcaf003)",
               "                     AND bcae006  = '",l_data.bcae006,"'",
               "                     AND bcae001  = '",l_data.info_id,"'",
               "                     AND bcafent  = bcmeent",
               "                     AND bcafsite = bcmesite",
               "                     AND bcaf007  = bcme010",
               "                AND xshipping_mark_no  = shipping_mark_no ",
               "                     AND COALESCE(bcaf008,' ') = COALESCE(bcme011,' ')),0),",
               "        bcme032, bcme033, ",
               "        COALESCE((SELECT SUM(bcaf043)",
               "                    FROM xyc_app_base_bcaf_t , app_base_bcae_t",
               "                   WHERE bcafent  = bcaeent",
               "                     AND bcafsite = bcaesite",
               "                     AND bcaf001  = COALESCE(bcae001,bcaf001)",
               "                     AND bcaf002  = COALESCE(bcae002,bcaf002)",
               "                     AND bcaf003  = COALESCE(bcae003,bcaf003)",
               "                     AND bcae006  = '",l_data.bcae006,"'",
               "                     AND bcae001  = '",l_data.info_id,"'",
               "                     AND bcafent  = bcmeent",
               "                     AND bcafsite = bcmesite",
               "                     AND bcaf007  = bcme010",
               "                     AND xshipping_mark_no  = shipping_mark_no ",
               "                     AND COALESCE(bcaf008,' ') = COALESCE(bcme011,' ')),0),",
               "        bcme055, bcme056, ",
               "        COALESCE((SELECT SUM(bcaf045)",
               "                    FROM xyc_app_base_bcaf_t , app_base_bcae_t",
               "                   WHERE bcafent  = bcaeent",
               "                     AND bcafsite = bcaesite",
               "                     AND bcaf001  = COALESCE(bcae001,bcaf001)",
               "                     AND bcaf002  = COALESCE(bcae002,bcaf002)",
               "                     AND bcaf003  = COALESCE(bcae003,bcaf003)",
               "                     AND bcae006  = '",l_data.bcae006,"'",
               "                     AND bcae001  = '",l_data.info_id,"'",
               "                     AND bcafent  = bcmeent",
               "                     AND bcafsite = bcmesite",
               "                     AND bcaf007  = bcme010",
               "                     AND COALESCE(bcaf008,' ') = COALESCE(bcme011,' ')),0),",
               "        bcme048, bcme058, ",
               "        COALESCE((SELECT SUM(bcaf047)",
               "                    FROM xyc_app_base_bcaf_t , app_base_bcae_t",
               "                   WHERE bcafent  = bcaeent",
               "                     AND bcafsite = bcaesite",
               "                     AND bcaf001  = COALESCE(bcae001,bcaf001)",
               "                     AND bcaf002  = COALESCE(bcae002,bcaf002)",
               "                     AND bcaf003  = COALESCE(bcae003,bcaf003)",
               "                     AND bcae006  = '",l_data.bcae006,"'",
               "                     AND bcae001  = '",l_data.info_id,"'",
               "                     AND bcafent  = bcmeent",
               "                     AND bcafsite = bcmesite",
               "                     AND bcaf007  = bcme010",
               "                     AND xshipping_mark_no  = shipping_mark_no ",
               "                     AND COALESCE(bcaf008,' ') = COALESCE(bcme011,' ')),0),",
               "        bcme059, bcme060 , shipping_mark_no ",
               "   FROM xyc_app_base_bcme_t ",
               "  WHERE bcmeent = '",g_userInfo.enterprise_no,"'",
               "    AND bcmesite = '",g_userInfo.site_no,"'",
               "    AND bcme003 = '",l_data.bcae006,"'",
               "    AND bcme999 = '",l_data.info_id,"'",                
               "  GROUP BY bcme010 ,bcme011,shipping_mark_no"
               
   PREPARE bcme_pre FROM l_sql 
   DECLARE bcme_cr  CURSOR FOR bcme_pre 

   LET r_obj[1].submit_show = FALSE
   
   LET l_i = 1
   FOREACH bcme_cr INTO l_bcme.bcme010,   l_bcme.bcme011,   l_bcme.bcme012,
                        l_bcme.bcme043,   l_bcme.bcme044,   l_bcme.bcme057,
                        l_bcme.bcme035,   l_bcme.bcme017,   l_bcme.bcme017_sum,
                        l_bcme.bcme032,   l_bcme.bcme033,   l_bcme.bcme033_sum,
                        l_bcme.bcme055,   l_bcme.bcme056,   l_bcme.bcme056_sum,
                        l_bcme.bcme048,   l_bcme.bcme058,   l_bcme.bcme058_sum,
                        l_bcme.bcme059,   l_bcme.bcme060    ,l_bcme.xshipping_mark_no
                           
      LET r_obj[1].list[l_i].item_no            = l_bcme.bcme010
      LET r_obj[1].list[l_i].item_feature_no    = l_bcme.bcme011
      LET r_obj[1].list[l_i].item_feature_name  = l_bcme.bcme012
      LET r_obj[1].list[l_i].item_name          = l_bcme.bcme043
      LET r_obj[1].list[l_i].item_spec          = l_bcme.bcme044
      LET r_obj[1].list[l_i].multi_unit_type    = l_bcme.bcme057
      LET r_obj[1].list[l_i].unit               = l_bcme.bcme035
      LET r_obj[1].list[l_i].already_qty        = l_bcme.bcme017_sum
      LET r_obj[1].list[l_i].should_qty         = l_bcme.bcme017
      LET r_obj[1].list[l_i].reference_unit_no  = l_bcme.bcme032
      LET r_obj[1].list[l_i].already_ref_qty    = l_bcme.bcme033_sum
      LET r_obj[1].list[l_i].should_ref_qty     = l_bcme.bcme033
      LET r_obj[1].list[l_i].valuation_unit_no  = l_bcme.bcme055
      LET r_obj[1].list[l_i].already_val_qty    = l_bcme.bcme056_sum
      LET r_obj[1].list[l_i].should_val_qty     = l_bcme.bcme056
      LET r_obj[1].list[l_i].inventory_unit     = l_bcme.bcme048
      LET r_obj[1].list[l_i].already_inv_qty    = l_bcme.bcme058_sum
      LET r_obj[1].list[l_i].should_inv_qty     = l_bcme.bcme058
      LET r_obj[1].list[l_i].main_warehouse_no  = l_bcme.bcme059
      LET r_obj[1].list[l_i].main_storage_no    = l_bcme.bcme060
      LET r_obj[1].list[l_i].xshipping_mark_no     = l_bcme.xshipping_mark_no
      IF (l_bcme.bcme017_sum > 0 AND r_obj[1].submit_show = FALSE) THEN
         LET r_obj[1].submit_show = TRUE
      END IF
      
      LET l_i = l_i + 1
   END FOREACH
      
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION
