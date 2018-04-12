define([], function () {

	bridge().dispatchCustomEvent('viewsready');
	// controller
	return ["$scope", function ($scope) {
	    // properties
	    $scope.title = "MultipleViews (NestedRoute)";
	}];
});
