IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION stockinformation_upd(p_json)
   DEFINE p_json util.JSONArray
   DEFINE l_sql STRING
   DEFINE l_ins_sql STRING
   DEFINE l_today   DATETIME YEAR TO DAY
   DEFINE obj DYNAMIC ARRAY OF  RECORD
      status              VARCHAR(1),
      enterprise_no       LIKE stockinformation.enterprise_no,
      site_no             LIKE stockinformation.site_no,
      warehouse_no        LIKE stockinformation.warehouse_no,
      warehouse_name      LIKE stockinformation.warehouse_name,
      storage_spaces_no   LIKE stockinformation.storage_spaces_no,
      storage_spaces_name LIKE stockinformation.storage_spaces_name,
      warehouse_cost      LIKE stockinformation.warehouse_cost,
      storage_spaces      LIKE stockinformation.storage_management
              END RECORD
   DEFINE l_i     INTEGER
   DEFINE l_str   STRING
   DEFINE l_cnt   INTEGER

   LET l_sql = "DELETE FROM stockinformation",
               " WHERE enterprise_no = ?",
               "   AND site_no = ?",
               "   AND warehouse_no = ?",
               "   AND storage_spaces_no = ?"
   PREPARE stockinf_del_pre FROM l_sql

   LET l_ins_sql = "REPLACE INTO stockinformation(enterprise_no, site_no, warehouse_no,",
                   "                              warehouse_name, storage_spaces_no, ",
                   "                              storage_spaces_name, report_datetime,",
                   "                              warehouse_cost, storage_management)",
                   "      VALUES  "

   LET l_today = CURRENT YEAR TO DAY
   DISPLAY 'Start:', CURRENT HOUR TO FRACTION(3)
   LET l_cnt = 0
   CALL p_json.toFGL(obj)
   FOR l_i = 1 TO p_json.getlength()
      IF (obj[l_i].status) = 'Y' THEN
         IF l_cnt > 0 THEN LET l_str = l_str,"," END IF
         LET l_str = l_str,
                          "('",obj[l_i].enterprise_no,"','",obj[l_i].site_no,"',",
                          " '",obj[l_i].warehouse_no, "','",obj[l_i].warehouse_name,"',",
                          " COALESCE('",obj[l_i].storage_spaces_no,"','Y'),'",obj[l_i].storage_spaces_name,"',",
                          " '",l_today,"',COALESCE('", obj[l_i].warehouse_cost,"',' '),",
                          " COALESCE('",obj[l_i].storage_spaces,"','N'))"
         LET l_cnt = l_cnt + 1
         IF l_cnt MOD 500 = 0 THEN
            LET l_sql = l_ins_sql,l_str
            PREPARE stockinf_rep_pre FROM l_sql
            EXECUTE stockinf_rep_pre
            IF SQLCA.sqlcode THEN EXIT FOR END IF
            LET l_str = NULL
            LET l_cnt = 0
         END IF
      ELSE
         #失效刪除
         EXECUTE stockinf_del_pre
           USING obj[l_i].enterprise_no, obj[l_i].site_no,
                 obj[l_i].warehouse_no,  obj[l_i].storage_spaces_no
         IF SQLCA.sqlcode THEN
            LET SQLCA.sqlcode = 0
         END IF
      END IF
   END FOR

   IF NOT cl_null(l_str) THEN
      LET l_sql = l_ins_sql,l_str
      PREPARE stockinf_rep_pre1 FROM l_sql
      EXECUTE stockinf_rep_pre1
   END IF
   DISPLAY 'End:', CURRENT HOUR TO FRACTION(3)
   #清除不同ent資料
   IF NOT cl_null(obj[l_i].enterprise_no) AND p_json.getlength() > 0 THEN
      DELETE FROM stockinformation
       WHERE enterprise_no     <> obj[l_i].enterprise_no
   END IF

   CASE
      WHEN SQLCA.sqlcode <> 0
          RETURN '[{"data":false}]'
      OTHERWISE
          RETURN '[{"data":true}]'
   END CASE

END FUNCTION
