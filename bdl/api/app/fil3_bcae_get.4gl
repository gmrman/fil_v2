IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE type_bcae_t                          RECORD
      enterprise_no                          LIKE app_base_bcae_t.bcaeent,
      site_no                                LIKE app_base_bcae_t.bcaesite,
      info_id                                LIKE app_base_bcae_t.bcae001,
      info_lot_no                            LIKE app_base_bcae_t.bcae002,
      scan_doc_no                            LIKE app_base_bcae_t.bcae003,
      objective_doc_no                       LIKE app_base_bcae_t.bcae004,
      in_out_no                              LIKE app_base_bcae_t.bcae005,
      transaction_type                       LIKE app_base_bcae_t.bcae006,
      scan_employee_no                       LIKE app_base_bcae_t.bcae007,
      report_stus                            LIKE app_base_bcae_t.bcae008,
      report_datetime                        LIKE app_base_bcae_t.bcae009,
      abnormal_no                            LIKE app_base_bcae_t.bcae010,
      batch_processing_stus                  LIKE app_base_bcae_t.bcae011,
      batch_processing_anomaly_descriptions  LIKE app_base_bcae_t.bcae012,
      batch_processing_time                  LIKE app_base_bcae_t.bcae013,
      recommended_operations                 LIKE app_base_bcae_t.bcae014,
      recommended_function                   LIKE app_base_bcae_t.bcae015,
      main_organization                      LIKE app_base_bcae_t.bcae016,
      last_transaction_date                  LIKE app_base_bcae_t.bcae999,
      status                                 LIKE app_base_bcae_t.bcaestus
                                          END RECORD

PUBLIC FUNCTION fil3_bcae_get(p_json)
   DEFINE p_json           util.JSONArray
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            bcae002           LIKE app_base_bcae_t.bcae002   #單號
                           END RECORD
   DEFINE l_sql            STRING
   DEFINE l_bcae006        STRING
   DEFINE l_count          INTEGER
   DEFINE l_i              INTEGER
   DEFINE r_obj            DYNAMIC ARRAY OF RECORD
                              submit_show    BOOLEAN,
                              bcae           DYNAMIC ARRAY OF type_bcae_t
                           END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_data)

   LET l_bcae006 = l_data.bcae006
   LET l_count = 0
   SELECT COUNT(1) INTO l_count
     FROM app_base_bcae_t
    WHERE bcaeent = g_userInfo.enterprise_no
      AND bcaesite = g_userInfo.site_no
      AND bcae006 = l_bcae006
      
   LET r_obj[1].submit_show = FALSE
   IF l_count > 0 THEN 
      LET r_obj[1].submit_show = TRUE
   END IF 

   IF r_obj[1].submit_show THEN
      
      LET l_sql = " SELECT bcaeent, bcaesite,bcae001, bcae002, bcae003, ",
                  "        bcae004, bcae005, bcae006, bcae007, bcae008, ",
                  "        bcae009, bcae010, bcae011, bcae012, bcae013, ",
                  "        bcae014, bcae015, bcae016, bcae999, bcaestus ",
                  "   FROM app_base_bcaf_t,app_base_bcae_t  ",
                  "  WHERE bcafent = bcaeent",
                  "    AND bcafsite = bcaesite",
                  "    AND bcaf001 = COALESCE(bcae001,bcaf001)",
                  "    AND bcaf002 = COALESCE(bcae002,bcaf002)",
                  "    AND bcaf003 = COALESCE(bcae003,bcaf003)",
                  "    AND bcaeent = '",g_userInfo.enterprise_no,"'",
                  "    AND bcaesite = '",g_userInfo.site_no,"'",
                  "    AND bcae006 = '",l_bcae006,"'"
                  
      PREPARE bcae_pre FROM l_sql 
      DECLARE bcae_cs  CURSOR FOR bcae_pre 

      LET l_i = 1
      FOREACH bcae_cs INTO r_obj[1].bcae[l_i].*
         LET l_i = l_i + 1
      END FOREACH
      CALL r_obj[1].bcae.deleteElement(l_i)

   END IF 
   
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()
   RETURN r_return
END FUNCTION
