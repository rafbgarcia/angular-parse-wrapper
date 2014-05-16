Parse Wrapper
=====================

A wrapper for better using Parse with AngularJs


## Using

#### This is your model

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
    })

    ;



#### This is your controller

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


#### index.html

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

#### new.html

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



## Developing

`$ npm install`

`$ bower install`

`$ grunt # watch and test`


Parse Angular Patch
=========

Brought to you by the [BRANDiD](https://www.getbrandid.com) team

  - Seamless Parse integration with AngularJS, using promises ($q)
  - Never worry about $scope digests again
  - Additional (and optional) module to enhance Parse Objects and Collections



How to use
----

I. [Grab the latest version of the patch here](https://raw2.github.com/brandid/parse-angular-patch/master/dist/parse-angular.js) or install it using [Bower](http://bower.io/)

```
bower install parse-angular-patch
```

II. Include the module in your project

```javascript
angular.module('myApp', ['ngAnimate', 'parse-angular'])
```

III. That's it. How hard was that?! You can now do ANYWHERE in your angular app things such as :

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


Extra Features
----

This patch also extends the Parse SDK to add the following features :
* Automatic getters & setters generation from a simple attrs array
* loadMore() method on Collections for an easy pagination
* Adds a static getClass() method on Objects and Collections to fetch them easily anywhere in your apps

### How to use

Simply add the 'parse-angular.enhance' module after the 'parse-angular' one in your app dependencies

```javascript
angular.module('myApp', ['ngAnimate', 'parse-angular', 'parse-angular.enhance'])
```

### Auto generate getters & setters

Nothing simpler, just attach an array of attributes to your Object definition, and the enhancer will generate according getters/setters. Please note that the first letter of your attribute will be transformed to uppercase.

```javascript
Parse.Object.extend({
  className: "Monster",
  attrs: ['kind', 'name', 'place_of_birth']
});


var myMonster = new Parse.Object("Monster");
// You can do :
myMonster.getKind();
myMonster.getName();
myMonster.setPlace_of_birth('London');
```

Please note that if you already set a getter or setter on the Object, it won't be overrided. It is just a double-check protection, otherwise just don't add the attribute to your attrs array.


### collection.loadMore

##### Pre-requisites:

your collection needs to have a query attached to it

##### Example:

```javascript
var collection = Parse.Collection.extend({
    model: Parse.User
});

var myUsers = new collection();
myUsers.query = new Parse.Query(Parse.User);
myUsers.query.limit(50);
// Let's load the 50 first users in our collection
myUsers.fetch()
.then(function(){
   // myUsers.length == 50
   // Cool, let's load 50 more
    myUsers.loadMore()
    .then(function(newData){
        // newData contains here the 50 next models (newly fetched ones)
        // but they've also been added to the collection ()myUsers.length == 100)
        // myUsers.query's skip is now 100
    });
});
```

**NB:** loadMore() uses the exact same query defined on your collection. That means it will use the current skip set as a starting point, and will auto-increment it.

##### Options

Prevent loadMore() from adding the new models to the collection

```javascript
myUsers.loadMore({add: false})
.then(function(newModels){
  // Here myUsers is the same
  // we're just catching the newModels here
});
```
##### Extra

A **hasMoreToLoad** attribute will be set to **false** on the collection object itself if the number of new models is < to the limit. Can be useful to show/hide paginator buttons. It will be undefined (not set) otherwise

```javascript
myUsers.query.skip(10000000);
myUsers.loadMore()
.then(function(){
    /// That's a huge skip! Obv we don't have any models anymore.
    /// myUsers.hasMoreToLoad === false
});
```


### getClass static method

With this extra module, you get a static getClass method on Parse.Object and Parse.Collection that allows you to retrieve a previously defined class. Let's see some example that will make it clearer

```javascript
// Define an object with static methods
Parse.Object.extend({
    className: "Monster",
    getName: function() {
        return this.get('name');
    }
},
// Static methods
{
    loadAll: function() {
        var query = new Parse.Query("Monster");
        query.limit(1000);
        return query.find();
    }
}
});
```

The problem here is that if you want to call loadAll() on the Class definition, you need a reference to it. To make it easier, the getClass static method allow you to grab it anywhere in your code.

```javascript
Parse.Object.getClass("Monster").loadAll()
.then(function(monsters){
 // my array of monsters is here
});

var newMonster = new Parse.Object("Monster");
var otherMonster = new (Parse.Object.getClass("Monster"));

// ^ both are equivalent, first syntax is preferred cuz shorter
```

You can use the same thing on collection.

**NB** : if you want to use getClass on your collections, you need to assign them a 'className' (just like with Objects) when defining them.

```javascript
Parse.Collection.extend({
    model: Monster,
    className: "Monster",
    getMonsterNames: function() {
        return this.map(function(monster){
            return monster.getName();
        });
    }
});


/// Anywhere else in your app

var collection = new (Parse.Collection.getClass("Monster"))

```


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

