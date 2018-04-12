IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION stockinformation_get(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE r_json     util.JSONArray
   DEFINE r_return   STRING
   DEFINE r_obj      DYNAMIC ARRAY OF RECORD
                        enterprise_no  	    LIKE stockinformation.enterprise_no,
                        site_no               LIKE stockinformation.site_no,
	                     warehouse_no          LIKE stockinformation.warehouse_no,
                        warehouse_name        LIKE stockinformation.warehouse_name,
                        storage_spaces_no     LIKE stockinformation.storage_spaces_no,
	                     storage_spaces_name   LIKE stockinformation.storage_spaces_name,
	                     report_datetime       LIKE stockinformation.report_datetime,
                        warehouse_cost        LIKE stockinformation.warehouse_cost
                     END RECORD

   SELECT enterprise_no,
          site_no,
          warehouse_no,
          warehouse_name,
          storage_spaces_no,
          storage_spaces_name,
          report_datetime,
          warehouse_cost
     INTO r_obj[1].enterprise_no,
          r_obj[1].site_no,
          r_obj[1].warehouse_no,
          r_obj[1].warehouse_name,
          r_obj[1].storage_spaces_no,
          r_obj[1].storage_spaces_name,
          r_obj[1].report_datetime,
          r_obj[1].warehouse_cost
     FROM stockinformation
    WHERE enterprise_no = g_enterprise
      AND site_no = g_site


   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION

PUBLIC FUNCTION warehouse_get(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE r_json     util.JSONArray
   DEFINE tempobj    util.JSONObject
   DEFINE r_return   STRING
   DEFINE l_sql      STRING 
   DEFINE l_cost     STRING
   DEFINE cnt        INTEGER
   DEFINE l_i,l_j    INTEGER
   TYPE spaces_type  RECORD
                        storage_spaces_no     LIKE stockinformation.storage_spaces_no,
	                     storage_spaces_name   LIKE stockinformation.storage_spaces_name
                     END RECORD
   DEFINE r_obj      DYNAMIC ARRAY OF RECORD
	                     warehouse_no          LIKE stockinformation.warehouse_no,
                        warehouse_name        LIKE stockinformation.warehouse_name,
                        warehouse_cost        LIKE stockinformation.warehouse_cost,
                        storage_management    LIKE stockinformation.storage_management,
                        storage_spaces        DYNAMIC ARRAY OF spaces_type
                     END RECORD

                     
   LET l_sql =  "SELECT storage_spaces_no , storage_spaces_name ",
                "  FROM stockinformation                        ",
                " WHERE enterprise_no = '",g_userInfo.enterprise_no,"'",
                "   AND site_no = '",g_userInfo.site_no,"'",
                "   AND warehouse_no = ? "
 
   PREPARE storage_pre FROM l_sql
   DECLARE storage_cr  CURSOR FOR storage_pre

   LET l_sql =  "SELECT DISTINCT warehouse_no ,warehouse_name , warehouse_cost , storage_management ",
                "  FROM stockinformation ",
            " WHERE enterprise_no = '",g_userInfo.enterprise_no,"'",
            "   AND site_no = '",g_userInfo.site_no,"'"         
   PREPARE stock_pre FROM l_sql
   DECLARE stock_cr  CURSOR FOR stock_pre
   LET l_i = 1
   FOREACH stock_cr INTO r_obj[l_i].warehouse_no , r_obj[l_i].warehouse_name , r_obj[l_i].warehouse_cost , r_obj[l_i].storage_management
      IF cl_null(r_obj[l_i].warehouse_name) THEN
         LET r_obj[l_i].warehouse_name = r_obj[l_i].warehouse_no
      ELSE
         LET r_obj[l_i].warehouse_name = r_obj[l_i].warehouse_no,"(",r_obj[l_i].warehouse_name,")"
      END IF

      IF cl_null(r_obj[l_i].storage_management) THEN
         LET r_obj[l_i].storage_management = "N" 
      END IF 

      LET l_j = 1
      FOREACH storage_cr USING r_obj[l_i].warehouse_no
                          INTO r_obj[l_i].storage_spaces[l_j].storage_spaces_no,r_obj[l_i].storage_spaces[l_j].storage_spaces_name
         IF cl_null(r_obj[l_i].storage_spaces[l_j].storage_spaces_name) THEN
            LET r_obj[l_i].storage_spaces[l_j].storage_spaces_name = r_obj[l_i].storage_spaces[l_j].storage_spaces_no
         ELSE
            LET r_obj[l_i].storage_spaces[l_j].storage_spaces_name = r_obj[l_i].storage_spaces[l_j].storage_spaces_no,"(",r_obj[l_i].storage_spaces[l_j].storage_spaces_name,")"
         END IF

         LET l_j = l_j + 1
      END FOREACH
      CALL r_obj[l_i].storage_spaces.deleteElement(r_obj[l_i].storage_spaces.getLength())

      LET l_i = l_i + 1
   END FOREACH

   CALL r_obj.deleteElement(r_obj.getLength())

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION

PUBLIC FUNCTION storage_spaces_get(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE r_json     util.JSONArray
   DEFINE tempobj    util.JSONObject
   DEFINE r_return   STRING
   DEFINE l_sql      STRING 
   DEFINE l_i        INTEGER
   DEFINE obj        RECORD
                        decideCost       BOOLEAN
                     END RECORD
   DEFINE r_obj      DYNAMIC ARRAY OF  RECORD
                        storage_spaces_no     LIKE stockinformation.storage_spaces_no,
	                     storage_spaces_name   LIKE stockinformation.storage_spaces_name
                     END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(obj)
      
   LET l_sql =  "SELECT storage_spaces_no , storage_spaces_name ",
                "  FROM stockinformation                       ",
                " WHERE enterprise_no = '",g_userInfo.enterprise_no,"'",
                "   AND site_no = '",g_userInfo.site_no,"'",
                "   AND storage_spaces_no != ' ' "
 
   PREPARE storage_spaces_pre FROM l_sql
   DECLARE storage_spaces_cr  CURSOR FOR storage_spaces_pre
   LET l_i = 1
   FOREACH storage_spaces_cr INTO r_obj[l_i].storage_spaces_no,r_obj[l_i].storage_spaces_name
         IF cl_null(r_obj[l_i].storage_spaces_name) THEN
            LET r_obj[l_i].storage_spaces_name = r_obj[l_i].storage_spaces_no
         ELSE
            LET r_obj[l_i].storage_spaces_name = r_obj[l_i].storage_spaces_no,"(",r_obj[l_i].storage_spaces_name,")"
         END IF

         LET l_i = l_i + 1
      END FOREACH
      CALL r_obj.deleteElement(r_obj.getLength())

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION