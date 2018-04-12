IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION qbecondition_upd(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray 
   DEFINE temparr          util.JSONArray
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_cnt            INTEGER
   DEFINE l_i              INTEGER
   DEFINE l_states         DYNAMIC ARRAY OF RECORD
            code              BOOLEAN,     #0:success, 其他:fail
            MESSAGE           STRING,      #说明信息
            data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                           END RECORD
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015   #A開立新單/S過賬/Y確認
                           END RECORD
   DEFINE l_condition      DYNAMIC ARRAY OF RECORD
            enterprise_no     LIKE qbecondition.enterprise_no,
            site_no           LIKE qbecondition.site_no,
            account           LIKE qbecondition.account,
            program_job_no    LIKE qbecondition.program_job_no,
            seq               LIKE qbecondition.seq,
            value             LIKE qbecondition.condition_value,
            isdefault         LIKE qbecondition.isdefault,
            set_type          LIKE qbecondition.set_type
                           END RECORD
   DEFINE l_qbecondition   RECORD LIKE qbecondition.*

   WHENEVER ERROR CONTINUE

   LET g_status.code = TRUE
   INITIALIZE l_data TO NULL
   INITIALIZE l_condition TO NULL
   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_data)   
   LET temparr = p_jsonarr.get(2)
   CALL temparr.toFGL(l_condition)
      
   BEGIN WORK

   FOR l_i = 1 TO l_condition.getLength()
      INITIALIZE l_qbecondition TO NULL
      
      LET l_qbecondition.enterprise_no    = l_condition[l_i].enterprise_no
      LET l_qbecondition.site_no          = l_condition[l_i].site_no
      LET l_qbecondition.account          = l_condition[l_i].account
      LET l_qbecondition.program_job_no   = l_condition[l_i].program_job_no
      LET l_qbecondition.seq              = l_condition[l_i].seq
      LET l_qbecondition.condition_value  = l_condition[l_i].value
      LET l_qbecondition.isdefault        = l_condition[l_i].isdefault
      LET l_qbecondition.set_type         = l_condition[l_i].set_type

      IF cl_null(l_qbecondition.enterprise_no) THEN
         LET l_qbecondition.enterprise_no = g_userInfo.enterprise_no
      END IF 

      IF cl_null(l_qbecondition.site_no) THEN
         LET l_qbecondition.site_no = g_userInfo.site_no
      END IF 

      IF cl_null(l_qbecondition.account) THEN
         LET l_qbecondition.account = g_userInfo.account
      END IF 

      IF cl_null(l_qbecondition.program_job_no) THEN
         LET l_qbecondition.program_job_no = l_data.bcae006
      END IF 

      IF cl_null(l_qbecondition.condition_value) THEN
         LET l_qbecondition.condition_value = " "
      END IF
      
      SELECT COUNT(1) INTO l_cnt
        FROM qbecondition 
       WHERE enterprise_no       = l_qbecondition.enterprise_no
         AND site_no             = l_qbecondition.site_no
         AND account             = l_qbecondition.account
         AND program_job_no      = l_qbecondition.program_job_no
         AND seq                 = l_qbecondition.seq
              
      IF l_cnt > 0 THEN
         DELETE FROM qbecondition 
          WHERE enterprise_no    = l_qbecondition.enterprise_no
            AND site_no          = l_qbecondition.site_no
            AND account          = l_qbecondition.account
            AND program_job_no   = l_qbecondition.program_job_no
            AND seq              = l_qbecondition.seq
      END IF 

      IF l_qbecondition.set_type = 0 AND cl_null(l_qbecondition.condition_value) THEN
         CONTINUE FOR
      END IF
                               
      INSERT INTO qbecondition VALUES(l_qbecondition.*)
      IF SQLCA.SQLCODE THEN
         LET g_status.code = FALSE
         LET g_status.message = SQLCA.SQLCODE
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

PUBLIC FUNCTION qbecondition_get(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray 
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_sql            STRING
   DEFINE l_i              INTEGER
   DEFINE obj              RECORD
            type_no           STRING
                           END RECORD
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015   #A開立新單/S過賬/Y確認
                           END RECORD
   DEFINE r_obj            DYNAMIC ARRAY OF RECORD
            enterprise_no     LIKE qbecondition.enterprise_no,   
            site_no           LIKE qbecondition.site_no,
            account           LIKE qbecondition.account,
            program_job_no    LIKE qbecondition.program_job_no,
            seq               LIKE qbecondition.seq,
            value             LIKE qbecondition.condition_value,
            isdefault         LIKE qbecondition.isdefault,
            set_type          LIKE qbecondition.set_type
                           END RECORD

   WHENEVER ERROR CONTINUE

   LET g_status.code = TRUE
   INITIALIZE l_data TO NULL
   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(obj)     
   LET tempobj = p_jsonarr.get(2)
   CALL tempobj.toFGL(l_data)

   LET l_sql = " SELECT enterprise_no, site_no,          account,    program_job_no,   ",
               "        seq,           condition_value,  isdefault,  set_type          ",
               "   FROM qbecondition "
               
   IF obj.type_no = "2" THEN
      LET l_sql = l_sql ,  
                  "  WHERE enterprise_no = '",g_userInfo.enterprise_no,"'",
                  "    AND site_no = '",g_userInfo.site_no,"'",
                  "    AND account = '",g_userInfo.account,"'",
                  "    AND program_job_no = '",l_data.bcae006,"'"
   END IF
                
   DISPLAY l_sql
   PREPARE qbe_pre FROM l_sql 
   DECLARE qbe_cr  CURSOR FOR qbe_pre 
   LET l_i = 1
   FOREACH qbe_cr INTO r_obj[l_i].*
      IF r_obj[l_i].isdefault = 1 THEN
         LET r_obj[l_i].isdefault = TRUE
      ELSE
         LET r_obj[l_i].isdefault = FALSE
      END IF
   
      LET l_i = l_i + 1
   END FOREACH
   CALL r_obj.deleteElement(l_i)
      
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION

