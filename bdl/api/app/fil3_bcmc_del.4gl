IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

#刪除掃描紀錄
FUNCTION fil3_bcmc_del(p_json)
   DEFINE p_json                       util.JSONArray 
   DEFINE tempobj                      util.JSONObject
   DEFINE temparr                      util.JSONArray 
   DEFINE r_return                     STRING
   DEFINE l_sql                        STRING
   DEFINE l_i                          INTEGER
   DEFINE r_json                       util.JSONArray
   DEFINE l_states                     DYNAMIC ARRAY OF RECORD
      code                                BOOLEAN,     
      MESSAGE                             STRING,     
      data                                STRING
                                       END RECORD
   DEFINE l_data                       RECORD
      bcae005                             LIKE app_base_bcae_t.bcae005,  #出入庫瑪
      bcae006                             LIKE app_base_bcae_t.bcae006,  #作業代號
      bcae014                             LIKE app_base_bcae_t.bcae014,  #記錄作業編號
      bcae015                             LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
      bcae002                             LIKE app_base_bcae_t.bcae002   #單號
                                       END RECORD
   DEFINE barcode_info                 DYNAMIC ARRAY OF RECORD   #單身記錄
      barcode_no                          LIKE app_base_bcmc_t.bcmc001,      #条码编号
      warehouse_no                        LIKE app_base_bcmc_t.bcmc005,      #库位编号
      storage_spaces_no                   LIKE app_base_bcmc_t.bcmc006,      #储位编号
      lot_no                              LIKE app_base_bcmc_t.bcmc007       #批号
                                       END RECORD
   WHENEVER ERROR CONTINUE

   INITIALIZE barcode_info TO NULL
   INITIALIZE l_data TO NULL
                                       
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_data)
   LET temparr = p_json.get(2)
   CALL temparr.toFGL(barcode_info)
   LET g_status.code = TRUE

   LET l_sql = " DELETE FROM app_base_bcmc_t ",
               " WHERE bcmcent  = '",g_userInfo.enterprise_no,"' ",
               "   AND bcmcsite = '",g_userInfo.site_no,"' ",
               "   AND bcmc001  = ? ",
               "   AND bcmc005  = ? ",
               "   AND bcmc006  = ? ",
               "   AND bcmc007  = ? ",
               "   AND bcmc014  = '",l_data.bcae006,"' ",
               "   AND bcmc015  = '",l_data.bcae002,"' "
 

   PREPARE bcmc_pre FROM l_sql 

   FOR l_i=1 TO barcode_info.getLength()
   
      EXECUTE bcmc_pre USING barcode_info[l_i].barcode_no,
                             barcode_info[l_i].warehouse_no,
                             barcode_info[l_i].storage_spaces_no,
                             barcode_info[l_i].lot_no

      IF SQLCA.SQLCODE THEN
         LET g_status.code = FALSE
         LET g_status.message = SQLCA.SQLCODE
      END IF

   END FOR
      
   LET l_states[1].* = g_status.*
   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()
   
   RETURN r_return

END FUNCTION
