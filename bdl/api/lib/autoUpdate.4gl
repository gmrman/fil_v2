IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../api.inc"
GLOBALS "../../wonderful/app.inc"
SCHEMA ds

PUBLIC FUNCTION autoUpdate()
   DEFINE update_url    STRING
   DEFINE l_per_ip      STRING
   DEFINE l_ip          STRING
  
   SELECT permission_ip
     INTO l_per_ip
     FROM basicinformation

   #預設IP 如果權限主機無設定抓此IP
   #例如： LET l_ip = "10.40.61.59"  
   LET l_ip = ""
   IF NOT cl_null(l_per_ip) THEN
      IF l_per_ip.getIndexOf(":",1) > 0 THEN
         LET l_ip = l_per_ip.subString(1,l_per_ip.getIndexOf(":",1)-1)
      END IF
   END IF

   #如果無預設IP 檢查38主機是否有新版APK
   IF NOT cl_null(l_ip) THEN 
      #LET update_url = "http://",l_ip,":8080/app/release.json"   #tomcat
      LET update_url = "http://",l_ip,"/app/release.json"         #IIS
   ELSE
      LET update_url = "http://10.40.41.38/app/release.json"
   END IF
   
   TRY
      CALL ui.Interface.frontCall("com.digiwin.versionup","Update",[update_url],[res])
      DISPLAY "APP更新成功"
   CATCH
      DISPLAY "APP更新失败"      
   END TRY

   RETURN 
END FUNCTION
