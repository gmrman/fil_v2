IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
GLOBALS "../../api/app/scandb.inc"
SCHEMA ds
#传入条码信息
#1匹配来源单，并分配数量
PUBLIC FUNCTION insertIntoScan(p_json)
    DEFINE p_json util.JSONArray
    DEFINE tempobj util.JSONObject
    DEFINE r_json            util.JSONArray
    DEFINE r_return          STRING
    DEFINE l_param   RECORD
                        enterprise_no                   LIKE app_base_bcaf_t.bcafent,
                        site_no                         LIKE app_base_bcaf_t.bcafsite,
                        barcode_no                      LIKE app_base_bcaf_t.bcaf006,
                        item_no                         LIKE app_base_bcaf_t.bcaf007,
                        item_feature_no                 LIKE app_base_bcaf_t.bcaf008,
                        item_feature_name               LIKE app_base_bcaf_t.bcaf009,
                        warehouse_no                    LIKE app_base_bcaf_t.bcaf010,
                        storage_spaces_no               LIKE app_base_bcaf_t.bcaf011,
                        lot_no                          LIKE app_base_bcaf_t.bcaf012,
                        inventory_management_features   LIKE app_base_bcaf_t.bcaf013,
                        plot_no                         LIKE app_base_bcaf_t.bcaf014,
                        serial_no                       LIKE app_base_bcaf_t.bcaf015,
                        inventory_unit                  LIKE app_base_bcaf_t.bcaf017,
                        barcode_qty                     LIKE app_base_bcaf_t.bcaf016,
                        inventory_qty                   LIKE app_base_bcaf_t.bcaf016,
                        source_operation                LIKE app_base_bcaf_t.bcaf009,
                        source_no                       LIKE app_base_bcaf_t.bcaf020,
                        source_seq                      LIKE app_base_bcaf_t.bcaf021,
                        source_line_seq                 LIKE app_base_bcaf_t.bcaf022,
                        source_batch_seq                LIKE app_base_bcaf_t.bcaf023,   
                        barcode_lot_no                  LIKE app_base_bcaf_t.bcaf012,
                        last_transaction_date           LIKE app_base_bcaf_t.bcaf019,
                        barcode_type                    LIKE scan_detail.barcode_type,
                        item_name                       LIKE scan_detail.item_name,
                        item_spec                       LIKE scan_detail.item_spec,
                        lot_control_type                LIKE scan_detail.lot_control_type,
                        packing_barcode                 LIKE scan_detail.packing_barcode,
                        packing_qty                     LIKE scan_detail.packing_qty
                END RECORD 
     DEFINE l_data                     RECORD
         bcae005                          LIKE app_base_bcae_t.bcae005,  #出入庫瑪
         bcae006                          LIKE app_base_bcae_t.bcae006,  #作業代號
         bcae014                          LIKE app_base_bcae_t.bcae014,  #記錄作業編號
         bcae015                          LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
         info_id                          LIKE app_base_bcme_t.bcme999,
         doc_no                           LIKE app_base_bcaf_t.bcaf020 #当前出通单号
                                       END RECORD
    DEFINE l_sql            STRING
    DEFINE l_i              INTEGER 
    DEFINE l_cnt              INTEGER 
    DEFINE l_bcme           RECORD LIKE app_base_bcme_t.*
    DEFINE l_scan_detail    RECORD LIKE scan_detail.*
    DEFINE l_all_qty        LIKE scan_detail.packing_qty  #当前扫描的条码，被分配的总数量
    DEFINE l_scaned_qty     LIKE scan_detail.packing_qty  #已扫描过的数量
    DEFINE l_doc_all_qty    LIKE scan_detail.packing_qty
    DEFINE l_inventory_qty  LIKE scan_detail.packing_qty  #当前扫描的条码库存数量
    DEFINE temp_qty         LIKE scan_detail.packing_qty  #用于记录foreach中条码分配给单据项次的数量
    DEFINE l_showInfo        DYNAMIC ARRAY OF scanDetail  
    DEFINE l_states          DYNAMIC ARRAY OF RECORD
          code              BOOLEAN,     #0:success, 其他:fail
          MESSAGE           STRING,      #说明信息
          data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                            END RECORD
    
    LET tempobj = p_json.get(1)
    CALL tempobj.toFGL(l_param)

    LET tempobj = p_json.get(2)
    CALL tempobj.toFGL(l_data)

    SELECT COUNT(1) INTO l_cnt FROM app_base_bcme_t 
                        WHERE bcmeent = g_userInfo.enterprise_no
                          AND bcmesite = g_userinfo.site_no
                          AND bcme002 = l_data.doc_no
                          AND bcme010 = l_param.item_no
                          AND bcme011 = l_param.item_feature_no
    IF l_cnt = 0 THEN
        LET g_status.code = FALSE
        LET g_status.message = "单据无此料件"
    END IF
    #判断条码重复
    #重复判断结束

    #分配数量
    LET l_sql = "SELECT bcme002,bcme005,bcme006,bcme007,bcme017,bcme032,",
                "       bcme033,bcme040,bcme049,bcme050,SUM(qty)",
                "  FROM app_base_bcme_t ",
                "       LEFT JOIN scan_detail",
                "              ON bcme002 = source_no and bcme010 = item_no and bcme005 = seq",
                "        WHERE bcmeent = ? ",
                "          AND bcmesite = ?",
                "          AND bcme002 = ?",
                "          AND bcme010 = ?",
                "          AND bcme011 =?",
                "     GROUP BY bcme002,bcme005,bcme006,bcme007,bcme017,bcme032,bcme033,bcme040,bcme049,bcme050"

    PREPARE bcme_get_pre FROM l_sql 
    DECLARE bcme_get_cr  CURSOR FOR bcme_get_pre 

    LET l_i = 1
    LET l_all_qty = 0
    LET l_inventory_qty = l_param.inventory_qty
    #寻找料件+产品特征相同的单据项次，并分配数量
    FOREACH bcme_get_cr USING g_userInfo.enterprise_no, g_userinfo.site_no,
                              l_data.doc_no  , l_param.item_no,l_param.item_feature_no
                         INTO l_bcme.bcme002,l_bcme.bcme005,l_bcme.bcme006,l_bcme.bcme007,l_bcme.bcme017,
                              l_bcme.bcme032,l_bcme.bcme033,l_bcme.bcme040,l_bcme.bcme049,l_bcme.bcme050,
                              l_scaned_qty
        #如果已扫描的数量等于单据数量，则继续下一笔
        IF l_scaned_qty = l_bcme.bcme017 THEN
            CONTINUE FOREACH
        END IF
        #插入已扫描档中
        LET l_scan_detail.barcode_no                          = l_param.barcode_no
        IF  l_inventory_qty > l_bcme.bcme017 THEN
            LET temp_qty = l_bcme.bcme017
        ELSE
            LET temp_qty = l_inventory_qty
        END IF
        LET l_all_qty = l_all_qty + temp_qty
        LET l_param.inventory_qty = l_param.inventory_qty - temp_qty
        LET l_scan_detail.qty							      = temp_qty
        LET l_scan_detail.barcode_qty                         = l_param.barcode_qty
        LET l_scan_detail.barcode_inventory_qty               = l_inventory_qty
        LET l_scan_detail.allow_doc_qty                       = l_bcme.bcme017
        LET l_scan_detail.maxqty                              = temp_qty
        LET l_scan_detail.barcode_type                        = l_param.barcode_type
        LET l_scan_detail.barcode_lot_no                      = l_param.lot_no
        LET l_scan_detail.inventory_management_features       = l_param.inventory_management_features
        LET l_scan_detail.inventory_qty                       = 0
        LET l_scan_detail.inventory_rate                      = 0
        LET l_scan_detail.inventory_unit                      = l_param.inventory_unit
        LET l_scan_detail.bc_source_batch_seq                 = l_param.source_no
        LET l_scan_detail.bc_source_line_seq                  = l_param.source_line_seq
        LET l_scan_detail.bc_source_no                        = l_param.source_no
        LET l_scan_detail.bc_source_seq                       = l_param.source_seq
        LET l_scan_detail.source_no                           = l_bcme.bcme002
        LET l_scan_detail.seq                                 = l_bcme.bcme005
        LET l_scan_detail.doc_line_seq                        = l_bcme.bcme006
        LET l_scan_detail.doc_batch_seq                       = l_bcme.bcme007
        LET l_scan_detail.item_no                             = l_param.item_no
        LET l_scan_detail.item_name                           = l_param.item_name
        LET l_scan_detail.item_spec                           = l_param.item_spec
        LET l_scan_detail.lot_no                              = l_param.lot_no
        LET l_scan_detail.item_feature_no                     = l_param.item_feature_no
        LET l_scan_detail.item_feature_name                   = l_param.item_feature_name
        LET l_scan_detail.unit                                = l_param.inventory_unit
        LET l_scan_detail.doc_qty                             = l_bcme.bcme017
        LET l_scan_detail.warehouse_name                      = " "
        LET l_scan_detail.warehouse_no                        = l_param.warehouse_no
        LET l_scan_detail.storage_spaces_name                 = " "
        LET l_scan_detail.storage_spaces_no                   = l_param.storage_spaces_no
        LET l_scan_detail.decimal_places                      = l_bcme.bcme049
        LET l_scan_detail.decimal_places_type                 = l_bcme.bcme050
        LET l_scan_detail.lot_control_type                    = l_param.lot_control_type
        LET l_scan_detail.main_organization                   = l_bcme.bcme040
        LET l_scan_detail.max_reference_qty                   = 0
        LET l_scan_detail.multi_unit_type                     = " "
        LET l_scan_detail.packing_barcode                     = l_param.packing_barcode
        LET l_scan_detail.packing_qty                         = l_param.packing_qty
        LET l_scan_detail.reference_qty                       = l_bcme.bcme033
        LET l_scan_detail.reference_rate                      = 1
        LET l_scan_detail.reference_unit_no                   = l_bcme.bcme032
        LET l_scan_detail.surplus_doc_qty                     = 0
        LET l_scan_detail.valuation_qty                       = 0
        LET l_scan_detail.valuation_rate                      = 0
        LET l_scan_detail.valuation_unit_no                   = " "
        LET l_scan_detail.in_transit_cost_warehouse_no        = " "
        LET l_scan_detail.in_transit_non_cost_warehouse_no    = " "
        LET l_scan_detail.ingoing_storage_spaces_no           = " "
        LET l_scan_detail.ingoing_warehouse_no                = " "
        LET l_scan_detail.op_name                             = " "
        LET l_scan_detail.op_no                               = " "
        LET l_scan_detail.reason_name                         = " "
        LET l_scan_detail.reason_no                           = " "
        LET l_scan_detail.run_card_no                         = 0

        INSERT INTO scan_detail VALUES(l_scan_detail.*)

        IF l_inventory_qty <=0 THEN
            EXIT FOREACH
        END IF 
        LET l_i = l_i + 1
    END FOREACH
    #for循环没有执行说明单据数量已满
    IF l_i = 1 AND g_status.code = TRUE THEN
        LET g_status.code = FALSE
        LET g_status.message = "单据数量已收满"
    END IF
   
    LET l_states[1].* = g_status.*
    IF l_i>1 THEN                 
        LET l_showInfo[1].barcode_no                          = util.strings.urlEncode(l_scan_detail.barcode_no)               
        LET l_showInfo[1].qty							      = l_scan_detail.qty							         
        LET l_showInfo[1].barcode_qty                         = l_scan_detail.barcode_qty                      
        LET l_showInfo[1].barcode_inventory_qty               = l_scan_detail.barcode_inventory_qty            
        LET l_showInfo[1].allow_doc_qty                       = l_scan_detail.allow_doc_qty                    
        LET l_showInfo[1].maxqty                              = l_scan_detail.maxqty                           
        LET l_showInfo[1].barcode_type                        = l_scan_detail.barcode_type                     
        LET l_showInfo[1].barcode_lot_no                      = l_scan_detail.barcode_lot_no                   
        LET l_showInfo[1].inventory_management_features       = l_scan_detail.inventory_management_features    
        LET l_showInfo[1].inventory_qty                       = l_scan_detail.inventory_qty                    
        LET l_showInfo[1].inventory_rate                      = l_scan_detail.inventory_rate                   
        LET l_showInfo[1].inventory_unit                      = l_scan_detail.inventory_unit                   
        LET l_showInfo[1].bc_source_batch_seq                 = l_scan_detail.bc_source_batch_seq              
        LET l_showInfo[1].bc_source_line_seq                  = l_scan_detail.bc_source_line_seq               
        LET l_showInfo[1].bc_source_no                        = l_scan_detail.bc_source_no                     
        LET l_showInfo[1].bc_source_seq                       = l_scan_detail.bc_source_seq                    
        LET l_showInfo[1].source_no                           = l_scan_detail.source_no                        
        LET l_showInfo[1].seq                                 = l_scan_detail.seq                              
        LET l_showInfo[1].doc_line_seq                        = l_scan_detail.doc_line_seq                     
        LET l_showInfo[1].doc_batch_seq                       = l_scan_detail.doc_batch_seq                    
        LET l_showInfo[1].item_no                             = l_scan_detail.item_no                          
        LET l_showInfo[1].item_name                           = l_scan_detail.item_name                        
        LET l_showInfo[1].item_spec                           = l_scan_detail.item_spec                        
        LET l_showInfo[1].lot_no                              = l_scan_detail.lot_no                           
        LET l_showInfo[1].item_feature_no                     = l_scan_detail.item_feature_no                  
        LET l_showInfo[1].item_feature_name                   = l_scan_detail.item_feature_name                
        LET l_showInfo[1].unit                                = l_scan_detail.unit                             
        LET l_showInfo[1].doc_qty                             = l_scan_detail.doc_qty                          
        LET l_showInfo[1].warehouse_name                      = l_scan_detail.warehouse_name                   
        LET l_showInfo[1].warehouse_no                        = l_scan_detail.warehouse_no                     
        LET l_showInfo[1].storage_spaces_name                 = l_scan_detail.storage_spaces_name              
        LET l_showInfo[1].storage_spaces_no                   = l_scan_detail.storage_spaces_no                
        LET l_showInfo[1].decimal_places                      = l_scan_detail.decimal_places                   
        LET l_showInfo[1].decimal_places_type                 = l_scan_detail.decimal_places_type              
        LET l_showInfo[1].lot_control_type                    = l_scan_detail.lot_control_type                 
        LET l_showInfo[1].main_organization                   = l_scan_detail.main_organization                
        LET l_showInfo[1].max_reference_qty                   = l_scan_detail.max_reference_qty                
        LET l_showInfo[1].multi_unit_type                     = l_scan_detail.multi_unit_type                  
        LET l_showInfo[1].packing_barcode                     = l_scan_detail.packing_barcode                  
        LET l_showInfo[1].packing_qty                         = l_scan_detail.packing_qty                      
        LET l_showInfo[1].reference_qty                       = l_scan_detail.reference_qty                    
        LET l_showInfo[1].reference_rate                      = l_scan_detail.reference_rate                   
        LET l_showInfo[1].reference_unit_no                   = l_scan_detail.reference_unit_no                
        LET l_showInfo[1].surplus_doc_qty                     = l_scan_detail.surplus_doc_qty                  
        LET l_showInfo[1].valuation_qty                       = l_scan_detail.valuation_qty                    
        LET l_showInfo[1].valuation_rate                      = l_scan_detail.valuation_rate                   
        LET l_showInfo[1].valuation_unit_no                   = l_scan_detail.valuation_unit_no                
        LET l_showInfo[1].in_transit_cost_warehouse_no        = l_scan_detail.in_transit_cost_warehouse_no     
        LET l_showInfo[1].in_transit_non_cost_warehouse_no    = l_scan_detail.in_transit_non_cost_warehouse_no 
        LET l_showInfo[1].ingoing_storage_spaces_no           = l_scan_detail.ingoing_storage_spaces_no        
        LET l_showInfo[1].ingoing_warehouse_no                = l_scan_detail.ingoing_warehouse_no             
        LET l_showInfo[1].op_name                             = l_scan_detail.op_name                          
        LET l_showInfo[1].op_no                               = l_scan_detail.op_no                            
        LET l_showInfo[1].reason_name                         = l_scan_detail.reason_name                      
        LET l_showInfo[1].reason_no                           = l_scan_detail.reason_no                        
        LET l_showInfo[1].run_card_no                         = l_scan_detail.run_card_no             
        LET l_showInfo[1].all_inventory_qty                   =0
        LET l_showInfo[1].all_qty                             =l_all_qty
        LET l_showInfo[1].all_reference_qty                   =0
        LET l_showInfo[1].all_valuation_qty                   =0
        LET l_showInfo[1].max_allow_doc_qty                   =l_all_qty
        LET l_showInfo[1].max_doc_qty                         =l_all_qty
        LET r_json  = util.JSONArray.fromFGL(l_showInfo)
        LET l_states[1].data = r_json.toString()
    END IF
    
    LET r_json  = util.JSONArray.fromFGL(l_states)
    LET r_return = r_json.toString()
    
    RETURN r_return
END FUNCTION
#获取所有已扫描的数据
PUBLIC FUNCTION scan_get()
    DEFINE r_arry    DYNAMIC ARRAY OF RECORD LIKE scan_detail.*
    DEFINE l_i      INTEGER
    DEFINE l_sql    STRING
    DEFINE r_json           util.JSONArray
    DEFINE r_return         STRING

    LET l_sql = " SELECT barcode_no,qty,barcode_qty,barcode_inventory_qty,allow_doc_qty,",
                "        maxqty,barcode_type,barcode_lot_no,inventory_management_features,inventory_qty,",
                "        inventory_rate,inventory_unit,bc_source_batch_seq,bc_source_line_seq,bc_source_no,",                
                "        bc_source_seq,source_no,seq,doc_line_seq,doc_batch_seq,item_no,",                    
                "        item_name,item_spec,lot_no,item_feature_no,item_feature_name,",           
                "        unit,doc_qty,warehouse_name,warehouse_no,storage_spaces_name,storage_spaces_no,",           	
                "        decimal_places,decimal_places_type,lot_control_type,main_organization,max_reference_qty,",           	
                "        multi_unit_type,packing_barcode,packing_qty,reference_qty,reference_rate,",              		
                "        reference_unit_no,surplus_doc_qty,valuation_qty,valuation_rate,valuation_unit_no,",           	
                "        in_transit_cost_warehouse_no,in_transit_non_cost_warehouse_no,ingoing_storage_spaces_no,ingoing_warehouse_no,",        
                "       op_name,op_no,reason_name,reason_no,run_card_no",                 
                "   FROM scan_detail"
    PREPARE scan_pre FROM l_sql 
    DECLARE scan_cr  CURSOR FOR scan_pre 

    LET l_i = 1
    FOREACH scan_cr INTO r_arry[l_i].barcode_no,r_arry[l_i].qty,r_arry[l_i].barcode_qty,r_arry[l_i].barcode_inventory_qty,r_arry[l_i].allow_doc_qty,
                         r_arry[l_i].maxqty,r_arry[l_i].barcode_type,r_arry[l_i].barcode_lot_no,r_arry[l_i].inventory_management_features,r_arry[l_i].inventory_qty,
                         r_arry[l_i].inventory_rate,r_arry[l_i].inventory_unit,r_arry[l_i].bc_source_batch_seq,r_arry[l_i].bc_source_line_seq,r_arry[l_i].bc_source_no,             
                         r_arry[l_i].bc_source_seq,r_arry[l_i].source_no,r_arry[l_i].seq,r_arry[l_i].doc_line_seq,r_arry[l_i].doc_batch_seq,r_arry[l_i].item_no,                   
                         r_arry[l_i].item_name,r_arry[l_i].item_spec,r_arry[l_i].lot_no,r_arry[l_i].item_feature_no,r_arry[l_i].item_feature_name,           
                         r_arry[l_i].unit,r_arry[l_i].doc_qty,r_arry[l_i].warehouse_name,r_arry[l_i].warehouse_no,r_arry[l_i].storage_spaces_name,r_arry[l_i].storage_spaces_no,          	
                         r_arry[l_i].decimal_places,r_arry[l_i].decimal_places_type,r_arry[l_i].lot_control_type,r_arry[l_i].main_organization,r_arry[l_i].max_reference_qty,         	
                         r_arry[l_i].multi_unit_type,r_arry[l_i].packing_barcode,r_arry[l_i].packing_qty,r_arry[l_i].reference_qty,r_arry[l_i].reference_rate,            		
                         r_arry[l_i].reference_unit_no,r_arry[l_i].surplus_doc_qty,r_arry[l_i].valuation_qty,r_arry[l_i].valuation_rate,r_arry[l_i].valuation_unit_no,           	
                         r_arry[l_i].in_transit_cost_warehouse_no,r_arry[l_i].in_transit_non_cost_warehouse_no,r_arry[l_i].ingoing_storage_spaces_no,r_arry[l_i].ingoing_warehouse_no,
                         r_arry[l_i].op_name,r_arry[l_i].op_no,r_arry[l_i].reason_name,r_arry[l_i].reason_no,r_arry[l_i].run_card_no                 
        LET r_arry[l_i].barcode_no = util.strings.urlEncode(r_arry[l_i].barcode_no)               
        LET l_i = l_i + 1
    END FOREACH

    CALL r_arry.deleteElement(r_arry.getLength())

    LET r_json  = util.JSONArray.fromFGL(r_arry)
    LET r_return = r_json.toString()

    RETURN r_return
END FUNCTION
#根据已扫条码，生成bcae及bcaf
PUBLIC FUNCTION bcae_af_create()
    INSERT INTO app_base_bcaf_t 
    SELECT bcaeent,bcaesite,bcae001,bcae002,bcae003,rowid,
           bcae005,barcode_no,item_no,item_feature_no,item_feature_name,
           warehouse_no,storage_spaces_no,lot_no,inventory_management_features,
           '','',qty,unit,g_datetime,NULL,source_no,seq,doc_line_seq,doc_batch_seq,
           ingoing_warehouse_no,ingoing_storage_spaces_no,in_transit_cost_warehouse_no,
           in_transit_non_cost_warehouse_no,run_card_no,reason_no,reference_unit_no,
           reference_qty,valuation_unit_no,valuation_qty,inventory_unit,inventory_qty,
           packing_barcode,packing_qty
           FROM scan_detail
                LEFT JOIN app_base_bcae_t 
                       ON bcaeent = '99'
                      #AND bcaesite = 
                      #AND bcae001 = 
                      #AND bcae002 = 
                      #AND bcae003 =

                        
    #select bcme005,bcme010,rowid from app_base_bcme_t
    #  CALL gat_bcaf_def(l_bcae_t.*,l_scan[l_i].*,l_data.*) RETURNING l_bcaf_t.*
    

  # RETURN r_return

END FUNCTION
#删除已扫条码
PUBLIC FUNCTION delete_scan()
    DELETE FROM scan_detail
END FUNCTION

