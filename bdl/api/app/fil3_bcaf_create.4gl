IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

 TYPE type_bcae     RECORD
         bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
         bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
         bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
         bcae015           LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
         bcae002           LIKE app_base_bcae_t.bcae002,  #單號
         info_id           LIKE app_base_bcme_t.bcme999
                    END RECORD

#新增掃描紀錄
FUNCTION fil3_bcaf_create(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray 
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_sql            STRING
   DEFINE l_cnt            INTEGER
   DEFINE l_bcme_cnt       INTEGER
   DEFINE l_allow_qty      LIKE app_base_bcme_t.bcme017
   DEFINE l_bcme           RECORD
            doc_qty              LIKE app_base_bcme_t.bcme017,
            in_out_qty           LIKE app_base_bcme_t.bcme018,
            allow_qty            LIKE app_base_bcme_t.bcme017,
            scan_qty             LIKE app_base_bcme_t.bcme017,
            allow_error_rate     LIKE app_base_bcme_t.bcme036,
            decimal_places       LIKE app_base_bcme_t.bcme049,
            decimal_places_type  LIKE app_base_bcme_t.bcme050
                           END RECORD
   DEFINE use_allow_qty    DECIMAL(26,10)
   DEFINE use_allow_rate   BOOLEAN
   DEFINE l_bcae003        LIKE app_base_bcae_t.bcae003
   DEFINE l_i,l_j          INTEGER
   DEFINE l_bcae_t         RECORD LIKE app_base_bcae_t.*
   DEFINE l_bcaf_t         RECORD LIKE app_base_bcaf_t.*
   DEFINE a_bcmc_t         DYNAMIC ARRAY OF RECORD LIKE app_base_bcmc_t.*
   DEFINE l_states         DYNAMIC ARRAY OF RECORD
      code                    BOOLEAN,     #0:success, 其他:fail
      MESSAGE                 STRING,      #说明信息
      data                    STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                           END RECORD
   DEFINE l_data           type_bcae

   WHENEVER ERROR CONTINUE

   INITIALIZE l_data TO NULL
   INITIALIZE a_bcmc_t TO NULL

   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_data)

   #產生掃描單號
   LET g_datetime = CURRENT YEAR TO SECOND
   LET g_scanno = cl_timestamp_from_datetime(CURRENT)
   LET g_status.code = TRUE

   IF l_data.bcae002 IS NULL THEN
      LET l_data.bcae002 = ""
   END IF

   LET l_bcae003 = ""
   SELECT bcae003
     INTO l_bcae003
     FROM app_base_bcae_t
    WHERE bcaeent = g_userInfo.enterprise_no
      AND bcaesite = g_userInfo.site_no
      AND bcae014 = l_data.bcae014
      AND bcae015 = l_data.bcae015
      AND bcae002 = l_data.bcae002
      
   IF l_bcae003 IS NOT NULL THEN
      BEGIN WORK      
      DELETE FROM app_base_bcae_t 
       WHERE bcaeent = g_userInfo.enterprise_no
         AND bcaesite = g_userInfo.site_no
         AND bcae003 = l_bcae003
         
      DELETE FROM app_base_bcaf_t 
       WHERE bcafent = g_userInfo.enterprise_no
         AND bcafsite = g_userInfo.site_no
         AND bcaf003 = l_bcae003

      IF g_status.code THEN
         COMMIT WORK
      ELSE
         ROLLBACK WORK
      END IF
   END IF

   BEGIN WORK

   LET l_bcme_cnt = 0 
   SELECT COUNT(1)
     INTO l_bcme_cnt
     FROM app_base_bcme_t
    WHERE bcmeent = g_userInfo.enterprise_no
      AND bcmesite = g_userInfo.site_no
      AND bcme003 = l_data.bcae006
      AND bcme002 = l_data.bcae002
   
   LET l_sql = " SELECT bcme017, COALESCE(bcme018,0), bcme036,       ",
               "        COALESCE((SELECT SUM(bcmc998)                ",
               "                    FROM app_base_bcmc_t             ",
               "                   WHERE bcmcent  = bcmeent          ",
               "                     AND bcmcsite = bcmesite         ",
               "                     AND bcmc002  = bcme010          ",
               "                     AND COALESCE(bcmc003,' ') = COALESCE(bcme011,' ')",
               "                     AND bcmc014  = bcme003          ",
               "                     AND bcmc015  = bcme002) ,0),    ",
               "        COALESCE(bcme049,6), COALESCE(bcme050,1)     ",
               "   FROM app_base_bcme_t ",
               "  WHERE bcmeent = '",g_userInfo.enterprise_no,"'",
               "    AND bcmesite = '",g_userInfo.site_no,"'",
               "    AND bcme003 = '",l_data.bcae006,"'",
               "    AND bcme002 = '",l_data.bcae002,"'",
               "    AND bcme010 = ? ",
               "    AND bcme011 = COALESCE( ? ,' ') "
   PREPARE bcme2_pre FROM l_sql 

   LET l_sql = " SELECT bcmcent, bcmcsite,bcmc001, bcmc002, bcmc003, ",
               "        bcmc004, bcmc005, bcmc006, bcmc007, bcmc008, ",
               "        bcmc009, bcmc010, bcmc011, bcmc012, bcmc013, ",
               "        bcmc014, bcmc015, bcmc016, bcmc017, bcmc018, ",
               "        bcmc019, bcmc020, bcmc021, bcmc022, bcmc023, ",
               "        bcmc995, bcmc996, bcmc997, bcmc998, bcmc999  ",
               "   FROM app_base_bcmc_t                              ",
               "  WHERE bcmcent = '",g_userInfo.enterprise_no,"'",
               "    AND bcmcsite = '",g_userInfo.site_no,"'",
               "    AND bcmc014 = '",l_data.bcae006,"' ",
               "    AND bcmc015 = '",l_data.bcae002,"' "

   PREPARE bcmc_pre FROM l_sql 
   DECLARE bcmc_cr  CURSOR FOR bcmc_pre 
   
   LET l_i = 1
   FOREACH bcmc_cr INTO a_bcmc_t[l_i].*
      INITIALIZE l_bcaf_t TO NULL
      INITIALIZE l_bcae_t TO NULL
      LET use_allow_rate = FALSE
      LET use_allow_qty = 0

      LET l_cnt = 0
      SELECT COUNT(*) INTO l_cnt
        FROM app_base_bcae_t
       WHERE bcaeent = g_userInfo.enterprise_no
         AND bcaesite = g_userInfo.site_no
         AND COALESCE(bcae002,' ') = COALESCE(l_data.bcae002,' ')
         AND bcae003 = g_scanno
      
      IF l_cnt = 0 THEN
         CALL fil3_gat_bcae_def(a_bcmc_t[l_i].*,l_data.*) RETURNING l_bcae_t.*
      
         INSERT INTO app_base_bcae_t VALUES(l_bcae_t.*)
         IF SQLCA.SQLCODE THEN
            LET g_status.code = FALSE
            LET g_status.message = SQLCA.SQLCODE
         END IF
      ELSE
         SELECT * INTO l_bcae_t.*
           FROM app_base_bcae_t
          WHERE bcaeent = g_userInfo.enterprise_no
            AND bcaesite = g_userInfo.site_no
            AND COALESCE(bcae002,' ') = COALESCE(l_data.bcae002,' ')
            AND bcae003 = g_scanno
      END IF
      IF l_bcme_cnt > 0 THEN

         EXECUTE bcme2_pre USING a_bcmc_t[l_i].bcmc002, a_bcmc_t[l_i].bcmc003
                            INTO l_bcme.doc_qty,          l_bcme.in_out_qty, 
                                 l_bcme.allow_error_rate, l_bcme.scan_qty,
                                 l_bcme.decimal_places, l_bcme.decimal_places_type

         IF l_bcme.allow_error_rate = "99999999999999" THEN
            LET l_bcme.allow_qty = l_bcme.allow_error_rate
         ELSE
            LET l_allow_qty = l_bcme.doc_qty * ( 1 + l_bcme.allow_error_rate / 100) - l_bcme.in_out_qty
            LET l_bcme.allow_qty =  s_num_rounding(l_bcme.decimal_places_type,l_allow_qty,l_bcme.decimal_places)
         END IF
                            
         IF l_bcme.scan_qty > (l_bcme.doc_qty - l_bcme.in_out_qty) AND l_bcme.scan_qty <= l_bcme.allow_qty THEN 
            LET use_allow_rate = TRUE
            LET use_allow_qty = l_bcme.scan_qty - (l_bcme.doc_qty - l_bcme.in_out_qty)
         END IF
                            
         FOR l_j = 1 TO l_bcme_cnt
            IF a_bcmc_t[l_i].bcmc998 > 0 THEN
               CALL fil3_gat_bcaf_def(l_bcae_t.*,a_bcmc_t[l_i].*,use_allow_rate,use_allow_qty) RETURNING l_bcaf_t.*, use_allow_qty
               IF l_bcaf_t.bcaf016 > 0 THEN
                  INSERT INTO app_base_bcaf_t VALUES(l_bcaf_t.*)
                  IF SQLCA.SQLCODE THEN
                     LET g_status.code = FALSE
                     LET g_status.message = SQLCA.SQLCODE
                     EXIT FOREACH
                  END IF
               END IF
            ELSE
               EXIT FOR
            END IF 
            LET a_bcmc_t[l_i].bcmc998 = a_bcmc_t[l_i].bcmc998 - l_bcaf_t.bcaf016
         END FOR
      ELSE
         CALL fil3_gat_bcaf_def(l_bcae_t.*,a_bcmc_t[l_i].*,use_allow_rate,use_allow_qty) RETURNING l_bcaf_t.*, use_allow_qty
         INSERT INTO app_base_bcaf_t VALUES(l_bcaf_t.*)
         IF SQLCA.SQLCODE THEN
            LET g_status.code = FALSE
            LET g_status.message = SQLCA.SQLCODE
            EXIT FOREACH
         END IF
      END IF
      
      LET l_i = l_i + 1
   END FOREACH

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
                    
#掃描紀錄檔單頭預設值
FUNCTION fil3_gat_bcae_def(p_bcmc_t,p_data)
   DEFINE p_data           type_bcae
   DEFINE p_bcmc_t         RECORD LIKE app_base_bcmc_t.*
   DEFINE l_bcae_t         RECORD LIKE app_base_bcae_t.*
   
   IF p_bcmc_t.bcmc015 IS NULL THEN
      LET p_bcmc_t.bcmc015 = " "
   END IF
   
   LET l_bcae_t.bcaeent = g_userInfo.enterprise_no
   LET l_bcae_t.bcaesite = g_userinfo.site_no
   LET l_bcae_t.bcae001 = p_data.info_id
   LET l_bcae_t.bcae002 = p_bcmc_t.bcmc015
   LET l_bcae_t.bcae003 = g_scanno
   LET l_bcae_t.bcae005 = p_data.bcae005
   LET l_bcae_t.bcae006 = p_data.bcae006
   LET l_bcae_t.bcae007 = g_userInfo.employee_no
   LET l_bcae_t.bcae014 = p_data.bcae014
   LET l_bcae_t.bcae015 = p_data.bcae015

   SELECT bcme040
     INTO l_bcae_t.bcae016
     FROM app_base_bcme_t
    WHERE bcmeent = g_userInfo.enterprise_no
      AND bcmesite = g_userinfo.site_no
      AND bcme002 = p_bcmc_t.bcmc015

   LET l_bcae_t.bcae999 = g_datetime
   LET l_bcae_t.bcaestus = 'Y'
   
   RETURN l_bcae_t.*

END FUNCTION

#掃描紀錄檔單身預設值
FUNCTION fil3_gat_bcaf_def(p_bcae_t,p_bcmc_t,use_allow_rate,use_allow_qty)
   DEFINE p_bcae_t         RECORD LIKE app_base_bcae_t.*
   DEFINE p_bcmc_t         RECORD LIKE app_base_bcmc_t.*
   DEFINE l_bcaf_t         RECORD LIKE app_base_bcaf_t.*
   DEFINE l_bcaf004        LIKE app_base_bcaf_t.bcaf004      #掃描項次
   DEFINE l_sql            STRING
   DEFINE l_i              INTEGER
   DEFINE l_cnt            INTEGER
   DEFINE use_allow_qty    DECIMAL(26,10)
   DEFINE use_allow_rate   BOOLEAN
   DEFINE use_doc_qty      DECIMAL(26,10)
   DEFINE allow_qty        DECIMAL(26,10)
   DEFINE l_bcme           DYNAMIC ARRAY OF RECORD
      bcme017                 LIKE app_base_bcme_t.bcme017,
      bcme018                 LIKE app_base_bcme_t.bcme018,
      bcme015                 LIKE app_base_bcme_t.bcme015,
      bcme002                 LIKE app_base_bcme_t.bcme002, 
      bcme005                 LIKE app_base_bcme_t.bcme005, 
      bcme006                 LIKE app_base_bcme_t.bcme006, 
      bcme007                 LIKE app_base_bcme_t.bcme007,      
      bcme035                 LIKE app_base_bcme_t.bcme035,
      bcme036                 LIKE app_base_bcme_t.bcme036,
      bcme049                 LIKE app_base_bcme_t.bcme049,
      bcme050                 LIKE app_base_bcme_t.bcme050,
      should_qty              LIKE app_base_bcme_t.bcme017,
      already_qty             LIKE app_base_bcme_t.bcme017
                           END RECORD
                                 
   WHENEVER ERROR CONTINUE
   
   SELECT MAX(bcaf004)+1 INTO l_bcaf004
     FROM app_base_bcaf_t
    WHERE bcafent  = g_userInfo.enterprise_no
      AND bcafsite = g_userinfo.site_no
      AND bcaf003  = g_scanno

   IF cl_null(l_bcaf004) THEN
      LET l_bcaf004 = 1
   END IF
   
   LET l_bcaf_t.bcafent  = p_bcae_t.bcaeent
   LET l_bcaf_t.bcafsite = p_bcae_t.bcaesite
   LET l_bcaf_t.bcaf001  = p_bcae_t.bcae001
   LET l_bcaf_t.bcaf002  = p_bcae_t.bcae002
   LET l_bcaf_t.bcaf003  = p_bcae_t.bcae003
   LET l_bcaf_t.bcaf004  = l_bcaf004
   LET l_bcaf_t.bcaf005  = p_bcae_t.bcae005
   LET l_bcaf_t.bcaf006  = p_bcmc_t.bcmc001
   LET l_bcaf_t.bcaf007  = p_bcmc_t.bcmc002
   LET l_bcaf_t.bcaf008  = p_bcmc_t.bcmc003
   LET l_bcaf_t.bcaf009  = p_bcmc_t.bcmc004
   LET l_bcaf_t.bcaf010  = p_bcmc_t.bcmc005
   LET l_bcaf_t.bcaf011  = p_bcmc_t.bcmc006
   LET l_bcaf_t.bcaf012  = p_bcmc_t.bcmc007
   LET l_bcaf_t.bcaf013  = ''
   LET l_bcaf_t.bcaf014  = ''
   LET l_bcaf_t.bcaf015  = ''
   LET l_bcaf_t.bcaf016  = p_bcmc_t.bcmc998
   LET l_bcaf_t.bcaf017  = p_bcmc_t.bcmc011

   LET l_cnt = 0
   SELECT COUNT(1)
     INTO l_cnt
     FROM app_base_bcme_t
    WHERE bcmeent = g_userInfo.enterprise_no
      AND bcmesite= g_userInfo.site_no
      AND bcme003 = p_bcmc_t.bcmc014
      AND bcme010 = p_bcmc_t.bcmc002
      AND bcme011 = p_bcmc_t.bcmc003
      AND bcme002 = p_bcmc_t.bcmc015

   IF l_cnt > 0 THEN
      LET l_sql = " SELECT bcme017, bcme018, bcme017 - bcme018,      ",
                  "        COALESCE(( SELECT SUM(bcaf016)            ",
                  "                     FROM app_base_bcaf_t         ",
                  "                    WHERE bcme010 = bcaf007       ",
                  "                      AND bcme011 = bcaf008       ",
                  "                      AND bcme002 = bcaf020       ",
                  "                      AND bcme005 = bcaf021       ",
                  "                      AND bcme006 = bcaf022       ",   
                  "                      AND bcme007 = bcaf023 ),0), ",
                  "        COALESCE(bcme036,0), bcme035, bcme015,                ",
                  "        bcme002, bcme005, bcme006, bcme007,       ",
                  "        COALESCE(bcme049,6), COALESCE(bcme050,1)  ",
                  "   FROM app_base_bcme_t                           ",
                  "  WHERE bcmeent = '",g_userInfo.enterprise_no,"'  ",
                  "    AND bcmesite= '",g_userInfo.site_no,"'",
                  "    AND bcme003 = '",p_bcmc_t.bcmc014,"'",
                  "    AND bcme010 = '",p_bcmc_t.bcmc002,"' ",
                  "    AND bcme011 = '",p_bcmc_t.bcmc003,"' ",
                  "    AND bcme002 = '",p_bcmc_t.bcmc015,"' "
   
      PREPARE bcme_pre FROM l_sql 
      DECLARE bcme_cr  CURSOR FOR bcme_pre 
      LET l_i = 1
      FOREACH bcme_cr INTO l_bcme[l_i].bcme017, l_bcme[l_i].bcme018, l_bcme[l_i].should_qty, l_bcme[l_i].already_qty,
                           l_bcme[l_i].bcme036, l_bcme[l_i].bcme035, l_bcme[l_i].bcme015,
                           l_bcme[l_i].bcme002, l_bcme[l_i].bcme005, l_bcme[l_i].bcme006, l_bcme[l_i].bcme007,
                           l_bcme[l_i].bcme049, l_bcme[l_i].bcme050

         LET allow_qty = 0
         IF l_bcme[l_i].bcme036 = "99999999999999" OR 
            l_bcme[l_i].bcme036 = 99999999999999 THEN
            LET allow_qty = l_bcme[l_i].bcme036
         ELSE
            LET allow_qty = l_bcme[l_i].bcme017 * ( 1 + l_bcme[l_i].bcme036 / 100) - l_bcme[l_i].bcme018
            LET allow_qty = s_num_rounding(l_bcme[l_i].bcme050,allow_qty,l_bcme[l_i].bcme049)
         END IF
         
         LET use_doc_qty = l_bcme[l_i].should_qty - l_bcme[l_i].already_qty
         IF use_allow_rate THEN
            LET use_doc_qty = allow_qty - l_bcme[l_i].already_qty
         END IF

         IF use_doc_qty > 0 THEN
            IF p_bcmc_t.bcmc998 > use_doc_qty THEN
               LET l_bcaf_t.bcaf016 = use_doc_qty
               LET use_allow_qty = use_allow_qty - allow_qty + l_bcme[l_i].should_qty
            END IF 

            IF NOT cl_null(l_bcme[l_i].bcme035) THEN
               LET l_bcaf_t.bcaf017  = l_bcme[l_i].bcme035
            END IF 
            
            #批號控管
            IF p_bcae_t.bcae005 = "1" OR p_bcae_t.bcae005 = "0" THEN
               IF p_bcmc_t.bcmc023 = "1" OR p_bcmc_t.bcmc023 = "3" THEN
                  IF NOT cl_null(l_bcme[l_i].bcme015) THEN
                     LET l_bcaf_t.bcaf012  = l_bcme[l_i].bcme015
                  END IF 
               END IF
   
               IF p_bcmc_t.bcmc023 = "2" THEN
                  LET l_bcaf_t.bcaf012 = " "
               END IF
            END IF 
            
            LET l_bcaf_t.bcaf020 = l_bcme[l_i].bcme002
            LET l_bcaf_t.bcaf021 = l_bcme[l_i].bcme005
            LET l_bcaf_t.bcaf022 = l_bcme[l_i].bcme006
            LET l_bcaf_t.bcaf023 = l_bcme[l_i].bcme007
   
            EXIT FOREACH
         END IF 
         LET l_i = l_i + 1
      END FOREACH
   END IF 
   
   LET l_bcaf_t.bcaf018 = g_datetime
   LET l_bcaf_t.bcaf019 = NULL
   LET l_bcaf_t.bcaf036 = p_bcmc_t.bcmc995
   LET l_bcaf_t.bcaf037 = p_bcmc_t.bcmc996
   LET l_bcaf_t.bcaf038 = g_basicInfo.warehouse_way_cost
   LET l_bcaf_t.bcaf039 = g_basicInfo.warehouse_way
   
   #LET l_bcaf_t.bcaf040 = p_scan.run_card_no
   LET l_bcaf_t.bcaf041 = p_bcmc_t.bcmc997
   LET l_bcaf_t.bcaf042 = p_bcmc_t.bcmc021
   LET l_bcaf_t.bcaf043 = p_bcmc_t.bcmc022

   RETURN l_bcaf_t.*, use_allow_qty

END FUNCTION
