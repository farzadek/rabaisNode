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
app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
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
	//$scope.bought = [];
	$scope.bill = {
		clientName : '',
		clientEmail : '',
		items:[],
		buyDate: ''
	};
	$scope.TotalBought = 0;
	$scope.user = {
		'username' : '',
		'name' : '',
		'password' : '',
		'email' : ''
	};

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

	$scope.loginWithGoogle = function(){
		gapi.client.load('plus', 'v1',function(){});
		param = {
			'clientid':'260490331032-cbpkp4b0dh1602n3ihpndb4c28o2gshl.apps.googleusercontent.com',
			'cookiepolicy':'single_host_origin',
			'callback':function(result){
				if(result['status']['signed_in']){
					var req = gapi.client.plus.people.get({'userId': 'me'});
					req.execute(function(res){
						$scope.$apply(function(){
							$scope.user.name = res.displayName;
							$scope.user.level = "User";
							$scope.loginText = 'Logout';
							$scope.userLoggedIn = true;
							$scope.mainPage = false;
							$scope.userFound = false;
							$('#loginModal').modal('hide');
							$('#loginModalButton').removeClass('btn-sm').addClass('btn-xs');
							$scope.user.password = '';
							$scope.user.email = res.emails[0].value;
						});
					});
				}
			},
			'approvalprompt':'force',
			'scope':'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
		};
		gapi.auth.signIn(param);
	}

	$scope.loginWithFb = function(){

		FB.login(function(res){
			if(res.authResponse){
				FB.api('/me', 'GET', {fields: 'email, name'}, function(res){
					$scope.$apply(function(){
						$scope.user.name = res.name;
						$scope.user.level = "User";
						$scope.loginText = 'Logout';
						$scope.userLoggedIn = true;
						$scope.mainPage = false;
						$scope.userFound = false;
						$('#loginModal').modal('hide');
						$('#loginModalButton').removeClass('btn-sm').addClass('btn-xs');
						$scope.user.password = '';
						$scope.user.email = res.email;
					}); 
				});
			}
			else{
				console.log(' NOT authorized!');
			}
		},{scope:'email', return_scopes:true});
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
								console.log('error submitRegForm1: '+res);
							}
						)
					} 
				}
			}, 
			function errorCallback(res) {
				console.log('error submitRegForm2: '+res);
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

/* Order confirmation ------------------------------------------------- */
	$scope.orderConfirmed = function(){
		$scope.totalBought = 0;
		$scope.bill = {
			clientName : $scope.user.name,
			clientEmail : $scope.user.email,
			items:[],
			buyDate: new Date()
		};
		$scope.products.forEach(function(element) {
			if(element.no){
				$scope.bill.items.push(element);
				$scope.totalBought += (element.price-element.promo)*element.no;
			}			
		}, this);
	}
/* read products in fo from db ------------------------------------------------- */
	function refresh(){
		$http.get('/products').then(
			function(res) { 
				$scope.products = res.data;		
			}
		);
	}

	refresh();

});