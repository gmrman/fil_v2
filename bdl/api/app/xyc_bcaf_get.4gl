IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE detail             RECORD
      item_no              LIKE xyc_app_base_bcaf_t.bcaf007,   #料件編號
      item_feature_no      LIKE xyc_app_base_bcaf_t.bcaf008,   #產品特徵
      item_feature_name    LIKE xyc_app_base_bcaf_t.bcaf009,   #產品特徵說明
      item_name	         LIKE xyc_app_base_bcaf_t.bcafname,   #品名
      item_spec            LIKE xyc_app_base_bcaf_t.bcafname,   #規格
      already_qty          LIKE xyc_app_base_bcaf_t.bcaf016,   #揀貨數量
      unit                 LIKE xyc_app_base_bcaf_t.bcaf017,   #揀貨單位
      multi_unit_type      LIKE xyc_app_base_bcaf_t.bcafMunit, #多單位的單位控管方式
      reference_unit_no    LIKE xyc_app_base_bcaf_t.bcaf042,   #參考單位
      already_ref_qty      LIKE xyc_app_base_bcaf_t.bcaf043,   #參考數量
      valuation_unit_no    LIKE xyc_app_base_bcaf_t.bcaf044,   #計價單位
      already_val_qty      LIKE xyc_app_base_bcaf_t.bcaf045,   #計價數量
      inventory_unit       LIKE xyc_app_base_bcaf_t.bcaf046,   #庫存單位
      already_inv_qty      LIKE xyc_app_base_bcaf_t.bcaf047,   #庫存數量
      packing_barcode      LIKE xyc_app_base_bcaf_t.bcafPcode, #裝箱條碼
      packing_qty          LIKE xyc_app_base_bcaf_t.bcafPqty,  #裝箱數量
      submit_show          BOOLEAN
                        END RECORD
PUBLIC FUNCTION xyc_bcaf_get(p_json)
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
   DEFINE l_bcaf           RECORD
            bcaf007           LIKE xyc_app_base_bcaf_t.bcaf007,   #料件編號
            bcaf008           LIKE xyc_app_base_bcaf_t.bcaf008,   #產品特徵
            bcaf009           LIKE xyc_app_base_bcaf_t.bcaf009,   #產品特徵說明
            bcafname          LIKE xyc_app_base_bcaf_t.bcafname,  #品名
            bcafspec          LIKE xyc_app_base_bcaf_t.bcafspec,  #規格
            bcaf016           LIKE xyc_app_base_bcaf_t.bcaf016,   #數量
            bcaf017           LIKE xyc_app_base_bcaf_t.bcaf017,   #揀貨單位
            bcafMunit         LIKE xyc_app_base_bcaf_t.bcafMunit, #多單位的單位控管方式
            bcaf042           LIKE xyc_app_base_bcaf_t.bcaf042,   #參考單位
            bcaf043           LIKE xyc_app_base_bcaf_t.bcaf043,   #參考數量
            bcaf044           LIKE xyc_app_base_bcaf_t.bcaf044,   #計價單位
            bcaf045           LIKE xyc_app_base_bcaf_t.bcaf045,   #計價數量
            bcaf046           LIKE xyc_app_base_bcaf_t.bcaf046,   #庫存單位
            bcaf047           LIKE xyc_app_base_bcaf_t.bcaf047,   #庫存數量
            bcafPcode         LIKE xyc_app_base_bcaf_t.bcafPcode, #裝箱條碼
            bcafPqty          LIKE xyc_app_base_bcaf_t.bcafPqty   #裝箱數量
                           END RECORD
   DEFINE r_obj            DYNAMIC ARRAY OF RECORD
            submit_show       BOOLEAN,
            list              DYNAMIC ARRAY OF detail
                           END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_data)
   
   LET l_sql = " SELECT bcaf007,       bcaf008,    bcaf009,    ",
               "        bcafname,      bcafspec,   bcafMunit,  ",
               "        SUM(bcaf016),  bcaf017,                ",
               "        bcaf042,       SUM(bcaf043),           ",
               "        bcaf044,       SUM(bcaf045),           ",
               "        bcaf046,       SUM(bcaf047),           ",
               "        bcafPcode,     bcafPqty                ",
               "   FROM app_base_bcae_t,xyc_app_base_bcaf_t",
               "  WHERE bcafent = bcaeent",
               "    AND bcafsite = bcaesite",
               "    AND bcaf001 = COALESCE(bcae001,bcaf001)",
               "    AND bcaf002 = COALESCE(bcae002,bcaf002)",
               "    AND bcaf003 = COALESCE(bcae003,bcaf003)",
               "    AND bcaeent = '",g_userInfo.enterprise_no,"'",
               "    AND bcaesite = '",g_userInfo.site_no,"'",
               "    AND bcae006 = '",l_data.bcae006,"'",
               "    AND bcae001 = '",l_data.info_id,"'",
               "  GROUP BY bcaf007"
   PREPARE bcaf_pre FROM l_sql 
   DECLARE bcaf_cs  CURSOR FOR bcaf_pre 
   LET r_obj[1].submit_show = FALSE
   
   LET l_i = 1
   FOREACH bcaf_cs INTO l_bcaf.bcaf007,   l_bcaf.bcaf008,   l_bcaf.bcaf009, 
                        l_bcaf.bcafname,  l_bcaf.bcafspec,  l_bcaf.bcafMunit,
                        l_bcaf.bcaf016,   l_bcaf.bcaf017,
                        l_bcaf.bcaf042,   l_bcaf.bcaf043,
                        l_bcaf.bcaf044,   l_bcaf.bcaf045,
                        l_bcaf.bcaf046,   l_bcaf.bcaf047,
                        l_bcaf.bcafPcode, l_bcaf.bcafPqty

      LET r_obj[1].list[l_i].item_no           = l_bcaf.bcaf007
      LET r_obj[1].list[l_i].item_feature_no   = l_bcaf.bcaf008
      LET r_obj[1].list[l_i].item_feature_name = l_bcaf.bcaf009
      LET r_obj[1].list[l_i].item_name	        = l_bcaf.bcafname
      LET r_obj[1].list[l_i].item_spec         = l_bcaf.bcafspec
      LET r_obj[1].list[l_i].multi_unit_type   = l_bcaf.bcafMunit
      LET r_obj[1].list[l_i].already_qty       = l_bcaf.bcaf016
      LET r_obj[1].list[l_i].unit              = l_bcaf.bcaf017
      LET r_obj[1].list[l_i].reference_unit_no = l_bcaf.bcaf042                        
      LET r_obj[1].list[l_i].already_ref_qty   = l_bcaf.bcaf043
      LET r_obj[1].list[l_i].valuation_unit_no = l_bcaf.bcaf044
      LET r_obj[1].list[l_i].already_val_qty   = l_bcaf.bcaf045        
      LET r_obj[1].list[l_i].inventory_unit    = l_bcaf.bcaf046
      LET r_obj[1].list[l_i].already_inv_qty   = l_bcaf.bcaf047
      LET r_obj[1].list[l_i].packing_barcode   = l_bcaf.bcafPcode
      LET r_obj[1].list[l_i].packing_qty       = l_bcaf.bcafPqty
                  
      LET r_obj[1].list[l_i].submit_show       = l_bcaf.bcaf007

      IF (l_bcaf.bcaf016 > 0 AND r_obj[1].submit_show = FALSE) THEN
         LET r_obj[1].submit_show = TRUE
      END IF
      LET l_i = l_i + 1
   END FOREACH

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()
   RETURN r_return
END FUNCTION
