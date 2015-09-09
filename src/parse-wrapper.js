(function(window, undef){

	var angular = window.angular;

	if (angular !== undef) {

		var module = angular.module('wrapParse', []);

		module.factory('wrapParse', function () {
			var conversion, wrapParse;

		  conversion = {
		    'Number': function(value) {
		      return Number(value);
		    },
		    'Boolean': function(value) {
		      if(typeof value === 'boolean')
		        return value;
		      return Boolean(Number(value));
		    },
		    'Date': function(value) {
		      return (value instanceof Date) ? value : moment(value, wrapParse.dateFormat).toDate();
		    },
		    'Relation': function(value, fieldType) {
		      if(value instanceof fieldType)
		        return value;
		      return new fieldType({id: value});
		    }
		  };

		  wrapParse = function(modelName, cols) {
        if(typeof modelName === 'function' && modelName._name && modelName._name === 'Relation') {
          return modelName;
        }

		    var obj;
		    if(modelName === Parse.User)
		      obj = modelName;
		    else
		      obj = Parse.Object.extend(modelName);


		    // Define properties
		    _.forOwn(cols, function(fieldType, fieldName) {
		    	var defaultValue;
		    	if(typeof fieldType === 'object') {
		    		defaultValue = fieldType['default'] || fieldType.defaultVal;
		    		fieldType = fieldType.type;
		    	}

		      Object.defineProperty(obj.prototype, fieldName, {
		        enumerable: true,
		        configurable: false,
		        get: function() {
		          var value = this.get(fieldName);
		          if(value === undefined){
		            //when defaultVal is needed, give this model its own copy.
		            //this matters if defaultVal is a js object or array that can be changed
		            //subsequently by the client, we don't want the changes to be applied to
		            //the one copy of defaultVal that's shared with other models of the wrapped class.
		            this.parseWrapperDefaults = this.parseWrapperDefaults || {};
		            if(!_.has(this.parseWrapperDefaults, fieldName)) this.parseWrapperDefaults[fieldName] = _.clone(defaultValue);
		            value = this.parseWrapperDefaults[fieldName];
		          }

		          if(value !== undefined && fieldType.name === 'Boolean')
		            return conversion['Boolean'](value);
		          return value;
		        },
		        set: function(value) {
		          this.set(fieldName, value);
		        }
		      });
		    });

		    obj = _.extend(obj, {
		      _name: 'Relation',
		      query: function() {
		        return new Parse.Query(obj);
		      },
		      find: function(onSuccess, onError) {
		        obj.query().find(onSuccess, onError);
		        return this;
		      },
		      get: function (id, onSuccess, onError) {
		        obj.query().get(id, onSuccess, onError);
		        return this;
		      }
		    });

		    var originalSave = Parse.Object.prototype.save;
		    Parse.Object.prototype = _.extend(Parse.Object.prototype, {
		    	save: function (data) {
		    		if(typeof data === 'object') {
		          this.set(data);
		    		}

		        this.beforeSave.apply(this, arguments);
		        this.parseFields(data);

		    		return originalSave.apply(this, arguments);
		    	},

		      parseFields: function (data) {
		        var self = this;
		        var fields = _.isEmpty(data) ? _.pick(cols, this.dirtyKeys()) : _.pick(cols, _.keys(data));
		        _.forOwn(fields, function(fieldType, fieldName) {
		          var type = fieldType.name || fieldType._name;

		          if (self[fieldName] !== undefined && typeof conversion[type] === 'function') {
		            self[fieldName] = conversion[type](self[fieldName], fieldType);
		          }
		        });
		        return self;
		      },

		      beforeSave: function () {}
		    });

		    return obj;
		  };


		  // wrapParse properties
		  wrapParse.dateFormat = 'YYYY-MM-DD';

		  return wrapParse;
		});

		module.run(['$q', '$window', function($q, $window){


			// Process only if Parse exist on the global window, do nothing otherwise
			if (!angular.isUndefined($window.Parse) && angular.isObject($window.Parse)) {

				// Keep a handy local reference
				var Parse = $window.Parse;

				//-------------------------------------
				// Structured object of what we need to update
				//-------------------------------------

				var methodsToUpdate = {
					"Object": {
						prototype: ['save', 'fetch', 'destroy'],
						static: ['saveAll', 'destroyAll']
					},
					"Query": {
						prototype: ['find', 'first', 'count', 'get'],
						static: []
					},
					"Cloud": {
						prototype: [],
						static: ['run']
					},
					"User": {
						prototype: ['signUp'],
						static: ['requestPasswordReset', 'logIn']
					},
					"FacebookUtils": {
						prototype: [],
						static: ['logIn', 'link', 'unlink']
					}
				};

				//// Let's loop over Parse objects
				for (var k in methodsToUpdate) {

					var currentClass = k;
					var currentObject = methodsToUpdate[k];

					var currentProtoMethods = currentObject.prototype;
					var currentStaticMethods = currentObject.static;


					/// Patching prototypes
					currentProtoMethods.forEach(function(method){

						var origMethod = Parse[currentClass].prototype[method];

						// Overwrite original function by wrapping it with $q
						Parse[currentClass].prototype[method] = function() {

							return origMethod.apply(this, arguments)
							.then(function(data){
								var defer = $q.defer();
								defer.resolve(data);
								return defer.promise;
							}, function(err){
								var defer = $q.defer();
								defer.reject(err);
								return defer.promise;
							});


						};

					});


					///Patching static methods too
					currentStaticMethods.forEach(function(method){

						var origMethod = Parse[currentClass][method];

						// Overwrite original function by wrapping it with $q
						Parse[currentClass][method] = function() {

							return origMethod.apply(this, arguments)
							.then(function(data){
								var defer = $q.defer();
								defer.resolve(data);
								return defer.promise;
							}, function(err){
								var defer = $q.defer();
								defer.reject(err);
								return defer.promise;
							});

						};

					});


				}
			}

		}]);
	}

})(this);
