IMPORT util
GLOBALS "../api.inc"

# 更換Header bar上的title
FUNCTION changeTitle(p_jsonarr)
   DEFINE p_jsonarr  util.JSONArray
   DEFINE l_jsonarr  util.JSONArray
   DEFINE l_jsonobj  util.JSONObject
   DEFINE l_title    STRING

   LET l_jsonarr = util.JSONArray.create()
   LET l_jsonobj = p_jsonarr.get(1)
   LET l_title = l_jsonobj.get("title")

   CALL fgl_setTitle(l_title)
    
   LET g_status.code = TRUE
   LET g_status.message = "ChangeTitle成功:",l_title

   RETURN l_jsonarr.toString()
END FUNCTION