/* global angular */
(function() {
    'use strict';
    define(['angularAMD'], function(app) {
        app.factory('FileTransferService', ['$http', 'configUrl', '$q', 'userInfoService',
            function($http, configUrl, $q, userInfoService) {

                // Service基本request格式
                function ServiceInfo(name) {
                    this.key = 'f5458f5c0f9022db743a7c0710145903';
                    this.type = 'sync';
                    this.host = {
                        prod: 'APP',
                        ip: '10.40.71.91',
                        lang: userInfoService.userInfo.language || 'zh_TW',
                        acct: userInfoService.userInfo.account || 'tiptop',
                        timestamp: '20151211123204361'
                    };

                    this.service = {
                        prod: 'T100',
                        name: name,
                        ip: userInfoService.userInfo.server_ip || '10.40.40.18',
                        id: userInfoService.userInfo.account || 'topprd'
                    };

                    this.datakey = {
                        EntId: userInfoService.userInfo.enterprise_no || '99',
                        CompanyId: userInfoService.userInfo.site_no || 'DSCTC',
                        PlantId: userInfoService.userInfo.plant_id || 'DSCTC-01'
                    };

                    this.payload = {
                        std_data: {
                            parameter: {}
                        }
                    };
                }


                // document.upload request格式
                function FileUploadInfo(name, content, size, key, total, count, desc) {
                    ServiceInfo.call(this, 'document.upload');

                    this.payload.std_data.parameter = {
                        doc_key: key,
                        doc_name: name,
                        doc_desc: desc,
                        doc_size: size,
                        doc_mode: 'base64',
                        doc_content: content,
                        cnt: count,
                        tt_cnt: total
                    };
                }

                // app.qc.attachment.add request 格式
                function AddAttachmentInfo(no, keys) {
                    ServiceInfo.call(this, 'app.qc.attachment.add');

                    this.payload.std_data.parameter = {
                        doc_no: no,
                        document_detail: keys.map(function(key) {
                            return {
                                'doc_key': key
                            };
                        })
                    };
                }

                // 切割檔案
                var splitFileToChunks = function(content, size) {
                    var chunks = [];

                    for (var start = 0; start < content.length; start += size) {
                        chunks.push(content.substr(start, size));
                    }

                    return chunks;
                };

                // 處理response
                var responseHandler = function(res) {
                    if (res.data.srvcode !== '000') {
                        return $q.reject('Error requesting service.');
                    }

                    if (res.data.payload.std_data.execution.code !== '0') {
                        return $q.reject(res.data.payload.std_data.execution.description);
                    }

                    return $q.when(res);
                };

                var uploadFile = function(file, cancelPromise) {
                    var SIZE_LIMIT = 100 * 1024;
                    var chunks = splitFileToChunks(file.base64, SIZE_LIMIT);

                    var deferred = $q.defer();
                    var timeout;
                    var timeoutPromise = $q(function(resolve) {
                        if (cancelPromise) {
                            $q.when(cancelPromise).then(resolve);
                        }

                        timeout = function(reason) {
                          resolve(reason);

                          return $q.reject(reason);
                        };
                    });

                    var notifyUploadProcess = (function() {
                        var bytesToUpload = file.base64.length;
                        var bytesUploaded = 0;

                        return function(increment) {
                            bytesUploaded += increment;
                            deferred.notify({
                                uploaded: bytesUploaded,
                                total: bytesToUpload
                            });
                        };
                    })();

                    var onUploadRespond = function(res) {
                        return responseHandler(res).then(
                            function(res) {
                                notifyUploadProcess(res.config.data.payload.std_data.parameter.doc_content.length);

                                return res.data.payload.std_data.parameter.doc_key;
                            }, timeout);
                    };

                    $http.post(configUrl.url, new FileUploadInfo(file.name, chunks[0], file.size, '', chunks.length, 1, ''), {
                            timeout: timeoutPromise
                        })
                        .then(onUploadRespond)
                        .then(function(key) {

                            var promises = [];

                            for (var index = 1; index < chunks.length - 1; index++) {
                                promises.push($http.post(configUrl.url, new FileUploadInfo(file.name, chunks[index], file.size, key, chunks.length, index + 1, ''), {
                                    timeout: timeoutPromise
                                }).then(onUploadRespond));
                            }

                            $q.all(promises).then(function() {
                                if (chunks.length > 1) {
                                    $http.post(configUrl.url, new FileUploadInfo(file.name, chunks[chunks.length - 1], file.size, key, chunks.length, chunks.length, ''), {
                                            timeout: timeoutPromise
                                        }).then(onUploadRespond)
                                        .then(deferred.resolve, deferred.reject);
                                } else {
                                    deferred.resolve(key);
                                }

                            }, deferred.reject);
                        }, deferred.reject);

                    return deferred.promise;
                };

                var addAttachment = function(no, attachmentKeys) {
                    return $http.post(configUrl.url, new AddAttachmentInfo(no, attachmentKeys))
                        .then(responseHandler);
                };

                return {
                    uploadFile: uploadFile,
                    addAttachment: addAttachment
                };
            }
        ]);
    });
})();
