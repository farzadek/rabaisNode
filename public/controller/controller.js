app = angular.module('myApp', ['ui.bootstrap']);

app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});

app.controller('appCtrl', function($scope, $http) {

	$scope.loginText = 'Login';
	$scope.enterStore = false;
	edit = false;
	$scope.userFound = false;
	$scope.userLoggedIn = false;
	personId="";
	$scope.showStore = false;
	$scope.usernameOk = false;
	$scope.totalBought = 0;
    $scope.search = {};

    $scope.sortItems = [
        {id:1, label:'Name (A-Z)', subItem:{name:'name'}},
        {id:2, label:'Name (Z-A)', subItem:{name:'-name'}},
        {id:3, label:'Price (0-9)', subItem:{name:'price'}},
        {id:4, label:'Price (9-0)', subItem:{name:'-price'}},
        {id:5, label:'Category', subItem:{name:'cat'}}
    ];
    $scope.opt1 = $scope.sortItems[0].subItem.name;
    $scope.search.sort = $scope.sortItems[0];
    $scope.sortOptionChanged = function(){
        $scope.opt1 = $scope.search.sort.subItem.name;
    }

	$http.get('/').then(function(res) { /*$scope.mainPage = true;*/});

	$scope.showMeStore = function(){
  		$scope.maxSize = 3;
  		$scope.bigTotalItems = $scope.products.length;
  		$scope.bigCurrentPage = 1;
  		$scope.entryLimit = 12;
        $scope.showStore = true;
    }
	$scope.oneUp = function(id){
		this.product.no++;
		$scope.totalBought += this.product.price-this.product.promo;
	}
	$scope.oneDown = function(id){
		if(this.product.no>0){
			this.product.no--;
			$scope.totalBought -= this.product.price-this.product.promo;
		}
	}
/* register users ------------------------------------------------- */
	$scope.submitRegisterForm = function(username, password, name){
		$http.get('/users/'+username).then(
			function(res) {
				if(res.data._id){
					$scope.usernameOk = true;
				}
				else{
					$scope.usernameOk = false;
					if(res.status){
						$('#registerModal').modal('hide');
						$http.post('/users/'+username+'/'+password+'/'+name).then(
							function(res) {
								$scope.user.username = '';
								$scope.user.name = '';
								$scope.user.password = '';
								
							},
							function errorCallback(res) {
								console.log(res);
							}
						)
					} 
				}
			}, 
			function errorCallback(res) {
				console.log(res);
			}
		);
	}
/* login users ------------------------------------------------- */
	$scope.checkUser = function(username,password){
		$http.get('/users/'+username+'/'+password).then(
			function(res) {
				if(res.data._id){
					$scope.user.name = res.data.name;
					level = 0;
					if(res.data.level==1) {level="Admin";} else
					if(res.data.level==2) {level="Employee";} else
					if(res.data.level==3) level="User";
					$scope.user.level = level;
					$scope.loginText = 'Logout';
					$scope.userLoggedIn = true;
					$scope.mainPage = false;
					$scope.userFound = false;
					$('#loginModal').modal('hide');
					$('#loginModalButton').removeClass('btn-sm').addClass('btn-xs');
					$scope.user.password = '';
				}
				else{
					$scope.userFound = true;
				}
			}
		);
	}

	$scope.logout = function(){
		$scope.loginText = 'Login';
		$scope.userLoggedIn = false;
		$scope.mainPage = true;
		$scope.showStore = false;
		$('#loginModalButton').removeClass('btn-xs').addClass('btn-sm');
	}
/* tasks ------------------------------------------------- */
	function refresh(){
		$http.get('/products').then(
			function(res) { 
				$scope.products = res.data;		
			}
		);
	}

	refresh();
/*
		$scope.addPerson = function(){
			if(edit){
				edit = false;
				$http.put('/persons/'+personId, $scope.person).then(
	       			function(res){refresh();$scope.person={};personId="";},
	       			function(res){console.log('error in EDIT');}
	    		);
			}
			else{
				$http.post('/persons', $scope.person).then(
	       			function(res){refresh();$scope.person={};},
	       			function(res){console.log('error in NEW');}
	    		);
			}
		}

		$scope.remove = function(id){
			$http.delete('/persons/'+id).then(
       			function(res){refresh();},
       			function(res){console.log('No delete');}
    		); 
		}

		$scope.edit = function(id){
			edit = true;
			$http.get('/persons/'+id).then(
       			function(res){refresh();personId = id;$scope.person = res.data;},
       			function(res){console.log('Noo del');}
    		); 
		}
*/



/*

	function refresh(){
		$http.get('/persons').then(
			function(usersResponse) { $scope.persons = usersResponse.data;}
		);
	}

	refresh();

		$scope.addPerson = function(){
			if(edit){
				edit = false;
				$http.put('/persons/'+personId, $scope.person).then(
	       			function(res){refresh();$scope.person={};personId="";},
	       			function(res){console.log('error in EDIT');}
	    		);
			}
			else{
				$http.post('/persons', $scope.person).then(
	       			function(res){refresh();$scope.person={};},
	       			function(res){console.log('error in NEW');}
	    		);
			}
		}

		$scope.remove = function(id){
			$http.delete('/persons/'+id).then(
       			function(res){refresh();},
       			function(res){console.log('No delete');}
    		); 
		}

		$scope.edit = function(id){
			edit = true;
			$http.get('/persons/'+id).then(
       			function(res){refresh();personId = id;$scope.person = res.data;},
       			function(res){console.log('Noo del');}
    		); 
		}

*/
	});