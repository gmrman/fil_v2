IMPORT util
IMPORT security

GLOBALS "../api.inc"

# 调用设备照片功能
FUNCTION takePhoto(p_jsonarr)
   DEFINE p_jsonarr     util.JSONArray
   DEFINE l_jsonarr     util.JSONArray
   DEFINE r_str         STRING
   DEFINE l_pic         STRING
   DEFINE l_pic_path    STRING
   DEFINE r_arr         DYNAMIC ARRAY OF RECORD
            l_pic          STRING
                        END RECORD
                        
   CONSTANT l_tmp = "mypic.tmp"

   WHENEVER ERROR CONTINUE
    
   TRY
      CALL ui.Interface.frontCall("mobile", "takePhoto", [], [l_pic_path])
      CALL fgl_getfile(l_pic_path,l_tmp)
      LET r_arr[1].l_pic = security.Base64.LoadBinary(l_tmp)
      LET g_status.code = TRUE 
      LET g_status.message = "调用照片功能成功"
   CATCH
      DISPLAY "Error takePhoto!"
      LET g_status.code = FALSE
      LET g_status.message = "调用照片功能失败"
   END TRY
   
   IF cl_null(r_arr[1].l_pic) THEN
      LET r_arr[1].l_pic = ""
   END IF 

   RETURN util.JSON.stringify(r_arr)
END FUNCTION