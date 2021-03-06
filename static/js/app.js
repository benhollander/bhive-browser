var app = angular.module('app', ['ngRoute']);

app.controller('ProjectController', function($scope, $http, $q) {
    $scope.skip = 0;
    $scope.maxResults = 100;

    $scope.browseProject = function(offset) {
        offset = Math.max(0, Number(offset));

        if (offset !== $scope.skip) {
            $scope.skip = offset;
        }

        $http({
            method: 'GET',
            url: '/bhive/',
            params: {
                url: $scope.projectName + '/doc/',
                skip: $scope.skip || 0,
                pathLike: $scope.pathLike || '',
                maxResults: $scope.maxResults || 100,
                v: 1
            }
        }).success(function(data, status, headers, config) {
            $scope.project = data;
            $scope.maxResults = data.query && data.query.maxResults || $scope.maxResults;
            $scope.file = null;
            $scope.path = null;
            $scope.selectedRevisionContents = null;
            $scope.diff_a = null;
            $scope.diff_b = null;
            $scope.revisionsDifference = null;
        }).error(function(data, status, headers, config) {
            console.log('something is f****d up');
        });
    };

    $scope.browseFile = function(path) {
        if (path !== $scope.path) {
            $scope.path = path;
        }
        $http({
            method: 'GET',
            url: '/bhive/',
            params: {
                url: $scope.projectName + '/doc/',
                skip: $scope.skipFile || 0,
                path: $scope.path || ''
            }
        }).success(function(data, status, headers, config) {
            $scope.file = data;
            $scope.selectedRevisionContents = null;
            $scope.diff_a = null;
            $scope.diff_b = null;
            $scope.revisionsDifference = null;
        }).error(function(data, status, headers, config) {
            console.log('something is f****d up');
        });
    };

    $scope.showRevision = function(revision) {
        $http({
            method: 'GET',
            url: '/bhive/',
            params: {
                url: $scope.projectName + '/doc/' + revision.path,
                v: revision.version
            }
        }).success(function(data, status, headers, config) {
            $scope.selectedRevisionContents = JSON.stringify(data, null, 4);
            $scope.diff_a = null;
            $scope.diff_b = null;
            $scope.revisionsDifference = null;
        }).error(function(data, status, headers, config) {
            console.log('something is f****d up');
        });
    };

    $scope.compare = function() {
        if (!($scope.diff_a && $scope.diff_b)) {
            return;
        }
        $scope.selectedRevisionContents = null;
        var contents_a = $http({
            method: 'GET',
            url: '/bhive/',
            params: {
                url: $scope.projectName + '/doc/' + $scope.path,
                v: $scope.diff_a
            }
        });

        var contents_b = $http({
            method: 'GET',
            url: '/bhive/',
            params: {
                url: $scope.projectName + '/doc/' + $scope.path,
                v: $scope.diff_b
            }
        });

        $q.all([contents_a, contents_b]).then(function(results) {
            var a = results[0].data;
            var b = results[1].data;
            $scope.revisionsDifference = JSON.stringify(json_diff(a, b), null, 4);
        }, function() {
            console.log('something f****d up', arguments);
        });
    };

    $scope.revisionIndex = function(revision) {
        if(!$scope.file) {
            return;
        }
        var revisions = $scope.file.values;
        for (var i = 0; i < revisions.length; i++) {
            if (revisions[i].version === revision) {
                return i;
            }
        }
        return -1;
    };

    $scope.updateDiff = function(delta) {
        var revisions = $scope.file.values;
        var diff_a_idx = $scope.revisionIndex($scope.diff_a);
        $scope.diff_a = revisions[diff_a_idx+delta].version;

        var diff_b_idx = $scope.revisionIndex($scope.diff_b);
        $scope.diff_b = revisions[diff_b_idx+delta].version;
        $scope.compare();
    };
});
