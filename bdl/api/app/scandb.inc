IMPORT util
SCHEMA ds
GLOBALS
    TYPE  scanDetail                  RECORD  
            barcode_no                  LIKE scan_detail.barcode_no,
            qty							LIKE scan_detail.qty,
            barcode_qty                 LIKE scan_detail.barcode_qty,
            barcode_inventory_qty       LIKE scan_detail.barcode_inventory_qty,
            allow_doc_qty               LIKE scan_detail.allow_doc_qty,
            maxqty                      LIKE scan_detail.maxqty,
            barcode_type                LIKE scan_detail.barcode_type,
            barcode_lot_no              LIKE scan_detail.barcode_lot_no,
            inventory_management_features   LIKE scan_detail.inventory_management_features,
            inventory_qty               LIKE scan_detail.inventory_qty,
            inventory_rate              LIKE scan_detail.inventory_rate,
            inventory_unit              LIKE scan_detail.inventory_unit,
            bc_source_batch_seq         LIKE scan_detail.bc_source_batch_seq,
            bc_source_line_seq          LIKE scan_detail.bc_source_line_seq,
            bc_source_no                LIKE scan_detail.bc_source_no,
            bc_source_seq               LIKE scan_detail.bc_source_seq,
            source_no                   LIKE scan_detail.source_no,
            seq                         LIKE scan_detail.seq,
            doc_line_seq                LIKE scan_detail.doc_line_seq,
            doc_batch_seq               LIKE scan_detail.doc_batch_seq,
            item_no                     LIKE scan_detail.item_no,
            item_name                   LIKE scan_detail.item_name,
            item_spec                   LIKE scan_detail.item_spec,
            lot_no                      LIKE scan_detail.lot_no,
            item_feature_no             LIKE scan_detail.item_feature_no,
            item_feature_name           LIKE scan_detail.item_feature_name,
            unit                        LIKE scan_detail.unit,						
            doc_qty                     LIKE scan_detail.doc_qty,					
            warehouse_name              LIKE scan_detail.warehouse_name,				
            warehouse_no                LIKE scan_detail.warehouse_no,				
            storage_spaces_name         LIKE scan_detail.storage_spaces_name,		
            storage_spaces_no           LIKE scan_detail.storage_spaces_no,			
            decimal_places              LIKE scan_detail.decimal_places,				
            decimal_places_type         LIKE scan_detail.decimal_places_type,		
            lot_control_type            LIKE scan_detail.lot_control_type,			
            main_organization           LIKE scan_detail.main_organization,			
            max_reference_qty           LIKE scan_detail.max_reference_qty,			
            multi_unit_type             LIKE scan_detail.multi_unit_type,			
            packing_barcode             LIKE scan_detail.packing_barcode,			
            packing_qty                 LIKE scan_detail.packing_qty,				
            reference_qty               LIKE scan_detail.reference_qty,				
            reference_rate              LIKE scan_detail.reference_rate,				
            reference_unit_no           LIKE scan_detail.reference_unit_no,			
            surplus_doc_qty             LIKE scan_detail.surplus_doc_qty,			
            valuation_qty               LIKE scan_detail.valuation_qty,				
            valuation_rate              LIKE scan_detail.valuation_rate,				
            valuation_unit_no           LIKE scan_detail.valuation_unit_no,			
            in_transit_cost_warehouse_no        LIKE scan_detail.in_transit_cost_warehouse_no,	
            in_transit_non_cost_warehouse_no    LIKE scan_detail.in_transit_non_cost_warehouse_no,
            ingoing_storage_spaces_no   LIKE scan_detail.ingoing_storage_spaces_no,		
            ingoing_warehouse_no        LIKE scan_detail.ingoing_warehouse_no,			
            op_name                     LIKE scan_detail.op_name,						
            op_no                       LIKE scan_detail.op_no,							
            reason_name                 LIKE scan_detail.reason_name,					
            reason_no                   LIKE scan_detail.reason_no,						
            run_card_no                 LIKE scan_detail.run_card_no,	
            all_inventory_qty           LIKE scan_detail.inventory_qty,
            all_qty                     LIKE scan_detail.inventory_qty,
            all_reference_qty           LIKE scan_detail.inventory_qty,    
            all_valuation_qty           LIKE scan_detail.inventory_qty,
            max_allow_doc_qty           LIKE scan_detail.inventory_qty,
            max_doc_qty                 LIKE scan_detail.inventory_qty
                                    END RECORD
END GLOBALS
