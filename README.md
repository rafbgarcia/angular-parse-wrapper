Parse Wrapper
=====================

A wrapper for better using Parse with AngularJs


## Using

#### This is your model

```javascript
    angular.module('Models', ['wrapParse'])
    
    .factory('Product', function(wrapParse, Company) {
      var Product = wrapParse('Product', {
        price: Number,
        weight: Number,
        name: String,
        inStock: Boolean,
        company: Company,
        createDate: Date
      });

      Product.prototype.beforeSave = function() {
        this.createDate = new Date();
      };

      return Product;
    })


    .factory('Company', function(wrapParse) {
      var Company = wrapParse('Product', {
        name: String
      });

      Company.byName = function(callback) {
        Company.query().ascending('name').find(callback);
      };

      return Company;
    });
```


#### This is your controller

```javascript
    angular.module('Controllers', ['Models'])

    .controller('ExampleIndexCtrl', function($scope, Product, $location) {
      Product.find(function(products) {
        $scope.products = products;
      });
    })

    .controller('ExampleNewCtrl', function($scope, $location, Product, Company) {
      Company.byName(function(companies) {
        $scope.companies = companies;
      });

      $scope.product = new Product();

      $scope.save = function() {
        $scope.product.save(function(product) {
          $location.path('#/products/' + product.id);
        });
      }
    });
```

#### index.html

```html
    <ul>
      <li ng-repeat="product in products">
        {{product.price}}
        {{product.weight}}
        {{product.name}}
        {{product.inStock}}
        {{product.company.name}}
        {{product.createDate}}
      </li>
    </ul>
```

#### new.html

```html
    <form ng-submit="save()">
      <input type="text" ng-model="product.name">
      <input type="text" ng-model="product.weight">

      <label><input type="radio" value="1" ng-model="product.inStock"> Yes</label>
      <label><input type="radio" value="0" ng-model="product.inStock"> No</label>
      <!-- Or -->
      <label>
        <input type="checkbox" ng-model="p.interviews_completed"> In stock
      </label>

      <select ng-model="product.company" ng-options="c.id as c.name for c in companies">
        <option value="">- Choose -</option>
      </select>

      <button type="submit">Save</button>
    </form>
```


Parse Angular Patch
=========

Brought to you by the [BRANDiD](https://www.getbrandid.com) team

  - Seamless Parse integration with AngularJS, using promises ($q)
  - Never worry about $scope digests again
  - Additional (and optional) module to enhance Parse Objects and Collections



How to use
----


```
bower install parse-angular-patch
```

I. Include the module in your project

```javascript
angular.module('myApp', ['ngAnimate', 'parse-angular'])
```

II. That's it. How hard was that?! You can now do ANYWHERE in your angular app things such as :

```javascript
// Queries
var query = new Parse.Query("Monsters");
query.equalTo("name", "Frankeistein");
query.first()
.then(function(result){
        $scope.monsters = result;
});
// Cloud Code is patched too!
Parse.Cloud.run("myCloudCodeFunction", function(results) {
    $scope.data = results;
});
```

  And your scope will always be updated. Any asynchronous Parse method is patched and wrapped inside Angular kingdom (Parse.FacebookUtils methods, Parse.User methods, etc etc)


Wanna build a large Parse+Angular app?
----

Wait no more and check our [parse-angular-demo](https://github.com/brandid/parse-angular-demo) project



## License

The MIT License

Copyright (c) 2014 Rafael Garcia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

