[![Build Status](https://snap-ci.com/rafbgarcia/angular-parse-wrapper/branch/master/build_image)](https://snap-ci.com/rafbgarcia/angular-parse-wrapper/branch/master)

Parse Wrapper
=====================

A wrapper that integrates Parse with Angular's lifecycle.


## Using

I. Install it

```
bower install angular-parse-wrapper
```

I. Include the module in your project

```javascript
angular.module('myApp', ['Controllers']);
angular.module('Controllers', ['Models']);
angular.module('Models', ['wrapParse']); // At this point Parse is already integrated with Angular's lifecycle.
```

II. Use it.


## Bind your Object's properties directly with your views, using the same name as your columns

#### This is your model
```javascript
angular.module('Models')

.factory('Product', function(wrapParse, Company) {
  var Product = wrapParse('Product', {
    price: Number,
    weight: Number,
    name: String,
    in_stock: Boolean,
    company: Company,
    date: Date,
    available: {type: Boolean, default: true}
  });

  Product.prototype.beforeSave = function() {
    // some awesome logic
  };

  return Product;
})


.factory('Company', function(wrapParse) {
  var Company = wrapParse('Product', {
    name: String
  });

  Company.byName = function() {
    Company.query().ascending('name').find().then.apply(this, arguments);
  };

  return Company;
});
```

#### This is your controller
```javascript
angular.module('Controllers')

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
    {{product.in_stock}}
    {{product.company.name}}
    {{product.date}}
    {{product.available ? 'Yes' : 'No'}}
  </li>
</ul>
```

#### new.html
```html
<form ng-submit="save()">
  <input type="text" ng-model="product.name">
  <input type="text" ng-model="product.weight">

  <label><input type="radio" value="1" ng-model="product.in_stock"> Yes</label>
  <label><input type="radio" value="0" ng-model="product.in_stock"> No</label>
  <!-- Or -->
  <label>
    <input type="checkbox" ng-model="product.in_stock"> In stock
  </label>

  <select ng-model="product.company" ng-options="c.id as c.name for c in companies">
    <option value="">- Choose -</option>
  </select>

  <button type="submit">Save</button>
</form>
```



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

