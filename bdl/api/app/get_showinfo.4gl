IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
GLOBALS "../../api/app/scandb.inc"
SCHEMA ds
#获取当前扫描条码的显示信息
PUBLIC FUNCTION get_showinfo(p_json)
    DEFINE p_json util.JSONArray
    DEFINE tempobj util.JSONObject
    DEFINE r_json            util.JSONArray
    DEFINE r_return          STRING
    DEFINE l_scan_detail     scanDetail
    DEFINE l_showinfo       DYNAMIC ARRAY OF scanDetail
    #根据单号+条码+料号+仓库+储位+批号求和

    LET tempobj = p_json.get(1)
    CALL tempobj.toFGL(l_scan_detail)

    #SELECT barcode_no,qty,barcode_qty,barcode_inventory_qty,              
    #       allow_doc_qty,maxqty,barcode_type,barcode_lot_no,inventory_management_features,     
    #       inventory_qty,inventory_rate,inventory_unit,bc_source_batch_seq,bc_source_line_seq                 
    #       bc_source_no,bc_source_seq,source_no,seq,doc_line_seq,doc_batch_seq,item_no,item_name,                        
    #       item_spec,lot_no,item_feature_no,item_feature_name,unit,doc_qty,warehouse_name,warehouse_no,                       
    #       storage_spaces_name,storage_spaces_no,decimal_places,decimal_places_type,lot_control_type,                   
    #       main_organization,max_reference_qty,multi_unit_type,packing_barcode,packing_qty,reference_qty                      
    #       reference_rate,reference_unit_no,surplus_doc_qty,valuation_qty,valuation_rate,valuation_unit_no,                  
    #       in_transit_cost_warehouse_no,in_transit_non_cost_warehouse_no,ingoing_storage_spaces_no,
    #       ingoing_warehouse_no,op_name,op_no,reason_name,reason_no,run_card_no
    #  INTO l_showinfo[1].*
    #  FROM scan_detail
    # WHERE barcode_no = l_scan_detail.barcode_no
    #   AND source_no = l_scan_detail.source_no
    #   AND seq = l_scan_detail.seq
    #   AND doc_line_seq = l_scan_detail.doc_line_seq
    #   AND doc_batch_seq = l_scan_detail.doc_batch_seq
    #   AND item_no = l_scan_detail.item_no
    #   AND warehouse_no = l_scan_detail.warehouse_no
    #   AND storage_spaces_no = l_scan_detail.storage_spaces_no
    #   AND barcode_lot_no =    l_scan_detail.barcode_lot_no*/
         
           
    LET l_showinfo[1].* = l_scan_detail.*
    
    LET l_showinfo[1].barcode_no  = util.strings.urlEncode(l_showinfo[1].barcode_no)      
    LET l_showinfo[1].all_inventory_qty = 0
    
    SELECT SUM(qty) INTO l_showinfo[1].all_qty 
      FROM scan_detail 
     WHERE barcode_no = l_scan_detail.barcode_no
       AND source_no = l_scan_detail.source_no
       AND item_no = l_scan_detail.item_no
       AND warehouse_no = l_scan_detail.warehouse_no
       AND storage_spaces_no = l_scan_detail.storage_spaces_no
       AND barcode_lot_no = l_scan_detail.barcode_lot_no
          

    LET l_showinfo[1].all_reference_qty = 0
    LET l_showinfo[1].all_valuation_qty = 0
    LET l_showinfo[1].max_allow_doc_qty = 0 
    #SELECT bcme017 INTO l_showinfo[1].max_allow_doc_qty
    LET l_showinfo[1].max_doc_qty = 0
    
    LET r_json  = util.JSONArray.fromFGL(l_showinfo)
    LET r_return = r_json.toString()
    
    RETURN r_return
END FUNCTION