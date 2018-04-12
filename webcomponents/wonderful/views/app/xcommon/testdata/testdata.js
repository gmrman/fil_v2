define(["app", "API", "APIS", "array"
], function (app) {
    app.service('testdata', ['APIService', function (APIService) {

        var self = this;
        self.testData = false;


        self.getBarcode = function (barcode,success,error) {
            var DeliveryDetail = self.getDeliveryDetail();
            var ScanData = self.getScanData();
            var index = DeliveryDetail.findIndex(function (item) {
                return item.DeliveryDetail.doc_no == barcode;
            });
            //返回单据信息
            if(index != -1){
                success(DeliveryDetail[index]);
            }else {
                //返回品号条码信息
                index = ScanData.findIndex(function (item) {
                  return  item.barcode_detail.barcode_no == barcode;
                });
                if (index != -1){
                    success(ScanData[index]);
                }
                else {
                    error();
                }
            }
        }

        self.getDeliveryDetail = function () {
            return [{
                DeliveryDetail: {
                    doc_no: 'lan20170310001',
                    warehouse_no: 'test01',
                    doc_d: [
                        {
                            lot_no: '1',
                            item_no: 'qb',
                            seq_no: '01',
                            item_name: '铅笔',
                            item_spec: '10*2',
                            business_qty: 20
                        }, {
                            barcode_no: "20170310002",
                            lot_no: '1',
                            item_no: 'gb',
                            seq_no: '01',
                            item_name: '钢笔',
                            item_spec: '10*2',
                            business_qty: 20
                        }
                    ]
                }

            },
                {
                    DeliveryDetail: {
                        doc_no: 'lan20170310002',
                        warehouse_no: 'test01',
                        doc_d: [
                            {
                                lot_no: '1',
                                item_no: 'qb',
                                seq_no: '01',
                                item_name: '铅笔',
                                item_spec: '10*2',
                                business_qty: 20
                            }, {
                                barcode_no: "20170310002",
                                lot_no: '1',
                                item_no: 'gb',
                                seq_no: '01',
                                item_name: '钢笔',
                                item_spec: '10*2',
                                business_qty: 20
                            }
                        ]
                    }
                },]
        };
        self.getScanData = function () {
            return [{
                barcode_detail: {
                    barcode_no: "20170310002",
                    warehouse_no: 'test01',
                    storage_no: '01',
                    lot_no: '1',
                    item_no: 'qb',
                    item_name: '铅笔',
                    item_spec: '10*2',
                    qty: 0
                }


            },
                {
                    barcode_detail: {
                        barcode_no: "20170310003",
                        warehouse_no: 'test01',
                        storage_no: '01',
                        lot_no: '1',
                        item_no: 'qb',
                        item_name: '铅笔',
                        item_spec: '10*2',
                        qty: 0
                    }
                },
                {
                    barcode_detail: {

                        barcode_no: "20170310004",
                        warehouse_no: 'test01',
                        storage_no: '01',
                        lot_no: '1',
                        item_no: 'qb',
                        item_name: '铅笔',
                        item_spec: '10*2',
                        qty: 0

                    }
                },
                {
                    barcode_detail: {
                        barcode_no: "20170310005",
                        warehouse_no: 'test01',
                        storage_no: '01',
                        lot_no: '1',
                        item_no: 'qb',
                        item_name: '铅笔',
                        item_spec: '10*2',
                        qty: 0

                    }
                }
            ]
        };

        self.getTransferDocs = function () {
            return [{
                transfer_doc_no: 'test01',
            },
                {
                    transfer_doc_no: 'test02',
                }, {
                    transfer_doc_no: 'test03',
                }, {
                    transfer_doc_no: 'test04',
                },];
        };
        self.getEmployees = function () {
            return [{
                employee_no: 'zyc01',
                employee_name: 'zyc01'
            },
                {
                    employee_no: 'zyc02',
                    employee_name: 'zyc02'
                }, {
                    employee_no: 'zyc03',
                    employee_name: 'zyc03'
                },
                {
                    employee_no: 'zyc04',
                    employee_name: 'zyc04'
                },];
        };
        self.getDevs = function () {
            return [{
                dev_no: '001'
            },
                {
                    dev_no: '002'
                },
                {
                    dev_no: 'pen'
                },]
        };

        self.getTestData = function (job_no) {
            switch (job_no) {
                case "9-1":
                    return [{
                        docno: "20170222001",
                        doc_id: "test01",
                        item_no: "qb",
                        item_name: '铅笔',
                        specification: '10*20mm',
                        transfer_doc_no: "x20170222001",
                        employee_no: 'zyc01',
                        dev_info: "pen",
                        item_out_seq: "1",
                        item_out_name: "1",
                        item_in_seq: "1",
                        item_in_name: "1",
                        business_qty: 0,
                        acceptance_qty: 0,
                        destroyed_qty: 0,
                        scrap_qty: 0,
                        return_qty: 0,
                        remark: "remark",
                        barcode_no: "001",
                    }, {
                        docno: "20170222001",
                        doc_id: "test01",
                        item_no: "qb",
                        item_name: '铅笔',
                        specification: '10*20mm',
                        transfer_doc_no: "x20170222001",
                        employee_no: 'zyc01',
                        dev_info: "pen",
                        item_out_seq: "1",
                        item_out_name: "1",
                        item_in_seq: "1",
                        item_in_name: "1",
                        business_qty: 0,
                        acceptance_qty: 0,
                        destroyed_qty: 0,
                        scrap_qty: 0,
                        return_qty: 0,
                        remark: "remark",
                        barcode_no: "002",
                    }, {
                        docno: "20170222001",
                        doc_id: "test01",
                        item_no: "qb",
                        item_name: '铅笔',
                        specification: '10*20mm',
                        transfer_doc_no: "x20170222001",
                        employee_no: 'zyc01',
                        dev_info: "pen",
                        item_out_seq: "1",
                        item_out_name: "1",
                        item_in_seq: "1",
                        item_in_name: "1",
                        business_qty: 0,
                        acceptance_qty: 0,
                        destroyed_qty: 0,
                        scrap_qty: 0,
                        return_qty: 0,
                        remark: "remark",
                        barcode_no: "003",
                    }, {
                        docno: "20170222001",
                        doc_id: "test01",
                        item_no: "qb",
                        item_name: '铅笔',
                        specification: '10*20mm',
                        transfer_doc_no: "x20170222001",
                        employee_no: 'zyc01',
                        dev_info: "pen",
                        item_out_seq: "1",
                        item_out_name: "1",
                        item_in_seq: "1",
                        item_in_name: "1",
                        business_qty: 0,
                        acceptance_qty: 0,
                        destroyed_qty: 0,
                        scrap_qty: 0,
                        return_qty: 0,
                        remark: "remark",
                        barcode_no: "004",
                    }, {
                        docno: "20170222001",
                        doc_id: "test01",
                        item_no: "qb",
                        item_name: '铅笔',
                        specification: '10*20mm',
                        transfer_doc_no: "x20170222001",
                        employee_no: 'zyc01',
                        dev_info: "pen",
                        item_out_seq: "1",
                        item_out_name: "1",
                        item_in_seq: "1",
                        item_in_name: "1",
                        business_qty: 0,
                        acceptance_qty: 0,
                        destroyed_qty: 0,
                        scrap_qty: 0,
                        return_qty: 0,
                        remark: "remark",
                        barcode_no: "005",
                    }, {
                        docno: "20170222001",
                        doc_id: "test01",
                        item_no: "qb",
                        item_name: '铅笔',
                        specification: '10*20mm',
                        transfer_doc_no: "x20170222001",
                        employee_no: 'zyc01',
                        dev_info: "pen",
                        item_out_seq: "1",
                        item_out_name: "1",
                        item_in_seq: "1",
                        item_in_name: "1",
                        business_qty: 0,
                        acceptance_qty: 0,
                        destroyed_qty: 0,
                        scrap_qty: 0,
                        return_qty: 0,
                        remark: "remark",
                        barcode_no: "006",
                    },]
                    break;
                default:
                    break;
            }

        }

        self.WaitTestData = [{
            doc_no: 'doc-201702150001',
            seq_no: '1',
            item_no: 'qbx',
            item_name: '铅笔',
            lot_no: '1',
            item_spec: '10*20mm',
            item_from_no: 'tt',
            barcode_no: '20170215001',
            qty: 2,//业务数量
            out_qty: 1,//已出1
            delivery: false
        }, {
            doc_no: 'doc-201702150001',
            seq_no: '2',
            item_no: 'gb',
            item_name: '钢笔',
            lot_no: '1',
            item_spec: '10*20mm',
            item_from_no: 'tt',
            barcode_no: '20170215002',
            qty: 2,//业务数量
            out_qty: 1,//已出1
            delivery: false

        }, {
            doc_no: 'doc-201702150001',
            seq_no: '3',
            item_no: 'yzb',
            item_name: '圆珠笔',
            lot_no: '1',
            item_spec: '10*20mm',
            item_from_no: 'tt',
            barcode_no: '20170215003',
            qty: 2,//业务数量
            out_qty: 1,//已出1
            delivery: false
        }, {
            doc_no: 'doc-201702150001',
            seq_no: '4',
            item_no: 'mgb',
            item_name: '美工笔',
            lot_no: '1',
            item_spec: '10*20mm',
            item_from_no: 'tt',
            barcode_no: '20170215004',
            qty: 2,//业务数量
            out_qty: 1,//已出1
            delivery: false
        }, {
            doc_no: 'doc-201702150001',
            seq_no: '5',
            item_no: 'kz',
            item_name: '筷子',
            lot_no: '1',
            item_spec: '10*20mm',
            item_from_no: 'tt',
            barcode_no: '20170215005',
            qty: 2,//业务数量
            out_qty: 1,//已出1
            delivery: false
        }, {
            doc_no: 'doc-201702150001',
            seq_no: '6',
            item_no: 'qbx',
            item_name: '铅笔',
            lot_no: '1',
            item_spec: '10*20mm',
            item_from_no: 'tt',
            barcode_no: '20170215006',
            qty: 2,//业务数量
            out_qty: 1,//已出1
            delivery: false
        },
            {
                doc_no: 'doc-201702150002',
                seq_no: '1',
                item_no: 'qbx',
                item_name: '铅笔',
                lot_no: '1',
                item_spec: '10*20mm',
                item_from_no: 'tt',
                barcode_no: '20170215011',
                qty: 2,//业务数量
                out_qty: 1,//已出1
                delivery: false,

            },
            {
                doc_no: 'doc-201702150002',
                seq_no: '2',
                item_no: 'yzb',
                item_name: '圆珠笔',
                lot_no: '1',
                item_spec: '10*20mm',
                item_from_no: 'tt',
                barcode_no: '20170215012',
                qty: 2,//业务数量
                out_qty: 1,//已出1
                delivery: false
            },
            {
                doc_no: 'doc-201702150002',
                seq_no: '3',
                item_no: 'gb',
                item_name: '钢笔',
                lot_no: '1',
                item_spec: '10*20mm',
                item_from_no: 'tt',
                barcode_no: '20170215013',
                qty: 2,//业务数量
                out_qty: 1,//已出1
                delivery: false
            },
            {
                doc_no: 'doc-201702150002',
                seq_no: '4',
                item_no: 'mgb',
                item_name: '美工笔',
                lot_no: '1',
                item_spec: '10*20mm',
                item_from_no: 'tt',
                barcode_no: '20170215014',
                qty: 2,//业务数量
                out_qty: 1,//已出1
                delivery: false
            }, {
                doc_no: 'doc-201702150002',
                seq_no: '5',
                item_no: 'csb',
                item_name: '测试笔',
                lot_no: '1',
                item_spec: '10*20mm',
                item_from_no: 'tt',
                barcode_no: '20170215015',
                qty: 2,//业务数量
                out_qty: 1,//已出1
                delivery: false
            }, {
                doc_no: 'doc-201702150002',
                seq_no: '6',
                item_no: 'kz',
                item_name: '筷子',
                lot_no: '1',
                item_spec: '10*20mm',
                item_from_no: 'tt',
                barcode_no: '20170215016',
                qty: 2,//业务数量
                out_qty: 1,//已出1
                delivery: false
            },

        ];


        self.createDeliverydocs = function () {
            var Deliverydocs = [];
            angular.forEach(self.WaitTestData, function (a) {
                var tmp = {};
                var index = Deliverydocs.findIndex(function (b) {
                    return a.doc_no == b.doc_no;
                })
                if (index != -1) {
                    Deliverydocs[index].alreadyDelivery += a.out_qty;
                    Deliverydocs[index].shouldDelivery += a.qty;
                } else {
                    tmp.doc_no = a.doc_no;
                    tmp.alreadyDelivery = a.out_qty;
                    tmp.shouldDelivery = a.qty;
                    Deliverydocs.push(tmp);
                }

            });
            return Deliverydocs;
        }

        return self;
    }]);
});
