'use strict';

angular.module('ffolioApp')
.controller('PortfolioCtrl',function($scope, $http, $location, $upload, $rootScope){

    $scope.pendingImages = [];

    $http.get('/api/images').success(function(data){
        $scope.images = data;
        console.log(data);
    })

    $scope.$watch($scope.images,function(){
        $scope.$apply();
    })

    $scope.imageUploads = [];
        $scope.abort = function(index) {
            $scope.upload[index].abort();
            $scope.upload[index] = null;
        };

        $scope.onFileSelect = function ($files) {
            $scope.files = $files;
            $scope.upload = [];
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                file.progress = parseInt(0);
                (function (file, i) {
                    $http.get('/api/s3?mimeType='+ file.type).success(function(response) {
                        var s3Params = response;
                        var filePath = 's3UploadExample/'+ Math.round(Math.random()*10000) + '$$' + file.name;
                        $http.post('/api/images', {url: 'https://s3.amazonaws.com/ffolio/' + filePath.replace('$$', '%24')}).success(function(newImage){
                            $scope.pendingImages.push(newImage);
                        })    

                        $scope.upload[i] = $upload.upload({
                            url: 'https://ffolio.s3.amazonaws.com/',
                            method: 'POST',
                            data: {
                                'key' : filePath,
                                'acl' : 'public-read',
                                'Content-Type' : file.type,
                                'AWSAccessKeyId': s3Params.key,
                                'Policy' : s3Params.policy,
                                'Signature' : s3Params.signature
                            },
                            file: file,

                        }).then(function(response) {
                            console.log(response)
                            file.progress = parseInt(100);
                            if (response.status === 201) {
                                var data = xml2json.parser(response.data),
                                parsedData;
                                parsedData = {
                                    location: data.postresponse.location,
                                    bucket: data.postresponse.bucket,
                                    key: data.postresponse.key,
                                    etag: data.postresponse.etag
                                };
                                $scope.imageUploads.push(parsedData);

                            } else {
                                console.log('Upload Failed');
                                $scope.images.push($scope.pendingImages.pop());
                            }
                        }, null, function(evt) {
                            file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                        });
                    });
                }(file, i));
            }
        };
});
