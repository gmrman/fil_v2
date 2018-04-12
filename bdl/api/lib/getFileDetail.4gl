IMPORT util
IMPORT os
IMPORT security
GLOBALS "../api.inc"

FUNCTION getFileDetail(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray
   DEFINE l_jsonarr        util.JSONArray
   DEFINE l_jsonobj        util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE r_file_detail    DYNAMIC ARRAY OF RECORD
            path              STRING,
            name              STRING,
            extension         STRING,
            size              INTEGER,
            base64            STRING
                           END RECORD
   DEFINE l_full_path      STRING
   DEFINE l_tmp_name       STRING
   DEFINE l_path           STRING

   INITIALIZE r_file_detail TO NULL

   LET l_jsonarr = util.JSONArray.create()
   LET l_jsonobj = p_jsonarr.get(1)
   LET l_path = l_jsonobj.get("photo_path")

   IF l_path.getLength() <= 0 THEN
      LET g_status.code = FALSE
      LET g_status.message = "取得相片位置失敗:"
      RETURN r_return
   END IF

   LET l_full_path = os.Path.fullPath(l_path)

   IF NOT base.Application.isMobile() THEN
      LET l_full_path = l_path
      LET l_tmp_name = os.Path.makeTempName()
      CALL fgl_getfile(l_full_path, l_tmp_name)
      LET l_full_path = l_tmp_name
   END IF

   IF os.Path.exists(l_full_path) THEN
      IF os.path.isFile(l_full_path) THEN
         IF os.path.readable(l_full_path) THEN
            LET r_file_detail[1].path = l_full_path
            LET r_file_detail[1].name = os.Path.baseName(l_path)
            LET r_file_detail[1].extension = os.Path.extension(r_file_detail[1].name)
            LET r_file_detail[1].size = os.Path.size(l_full_path)
            LET r_file_detail[1].base64 = security.Base64.LoadBinary(l_full_path)
         END IF
      END IF
   END IF

   IF NOT base.Application.isMobile() THEN
      IF os.Path.delete(l_tmp_name) THEN END IF
   END IF

   LET r_json  = util.JSONArray.fromFGL(r_file_detail)
   LET r_return = r_json.toString()
   
   RETURN r_return
END FUNCTION





