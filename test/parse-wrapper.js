describe('Wrap Parse', function() {
  var Product, wrapParse;

  beforeEach(module('wrapParse'));

  beforeEach(inject(function(_wrapParse_) {
    wrapParse = _wrapParse_;

    Company = wrapParse('Company', {
      name: String
    });

    Product = wrapParse('Product', {
      price: Number,
      weight: Number,
      name: String,
      inStock: Boolean,
      company: Company,
      createDate: Date,
      available: {type: Boolean, default: true}
    });

    product = new Product({
      price: 10.5,
      weight: 200,
      inStock: false
    });
  }));


  it('has attribute _name equal to Relation', function() {
    expect(Product._name).toBe('Relation');
  });

  it('has a dateFormat attribute with value YYYY-MM-DD by default', function() {
    expect(wrapParse.dateFormat).toBe('YYYY-MM-DD');
  });

  it('allows enhancement of Parse.User', function() {
    var User = wrapParse(Parse.User, {
      username: String,
      password: String
    });

    var user = new User({username: 'test', password: '1234'});

    expect(user.username).toBe('test');
    expect(user.password).toBe('1234');
  });

  describe('attributes', function() {
    it('defines given attributes', function() {
      expect(product.price).toBeDefined();
      expect(product.weight).toBeDefined();
    });

    it('converts boolean values on get', function() {
      product.inStock = '0';

      expect(product.inStock).toBe(false);

      product.inStock = '1';

      expect(product.inStock).toBe(true);
    });

    it('accepts default value', function() {
      expect(product.available).toEqual(true);
    });
  });

  describe('Angular form integration', function() {
    var $rootScope, $compile, element;

    function changeInputVal(val) {
      element.val(val).trigger('input');
    }

    beforeEach(inject(function(_$rootScope_, _$compile_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $rootScope.product = product;
      $rootScope.$apply(function () {
        element = $compile('<input ng-model="product.price" type="text">')($rootScope);
      });
    }));

    it('shows de input with correct values', function() {
      expect(element.val()).toBe('10.5');
    });

    it('updates the input when the param is updated', function() {
      $rootScope.product.price = 13;

      $rootScope.$digest();

      expect(element.val()).toBe('13');
    });

    it('changes object param when input value changes', function() {
      changeInputVal(15);

      expect($rootScope.product.price).toBe('15');
    });
  });

  describe('Parse.Object', function() {
    describe('#save', function() {
      beforeEach(function() {
        spyOn(product, 'parseFields');
      });

      it('parses the fields before save', function() {
        product.save();

        expect(product.parseFields).toHaveBeenCalled();
      });

      it('executes beforeSave hook', function() {
        spyOn(product, 'beforeSave');

        product.save();

        expect(product.beforeSave).toHaveBeenCalled();
      });
    });

    describe('#get', function() {
      it('finds by id', function() {
        spyOn(Parse.Query.prototype, 'get');

        var id = '3ax44wef';
        Product.get(id);

        expect(Parse.Query.prototype.get).toHaveBeenCalledWith(id, undefined, undefined);
      });
    });
  });

  describe('Conversions', function() {
    describe('Number', function() {
      it('converts String to Int', function() {
        product.price = '10';

        product.parseFields();

        expect(product.price).toBe(10);
      });

      it('keeps undefined as undefined', function() {
        product.price = undefined;

        product.parseFields();

        expect(product.price).toBe(undefined);
      });
    });

    describe('Boolean', function() {
      it('converts numeric String different from "0" to true', function() {
        product.inStock = '1';

        product.parseFields();

        expect(product.inStock).toBe(true);
      });

      it('converts numeric String "0" to false', function() {
        product.inStock = '0';

        product.parseFields();

        expect(product.inStock).toBe(false);
      });

      it('converts non-zero numbers to true', function() {
        product.inStock = 1;

        product.parseFields();

        expect(product.inStock).toBe(true);
      });

      it('converts 0 to false', function() {
        product.inStock = 0;

        product.parseFields();

        expect(product.inStock).toBe(false);
      });

      it('keeps Boolean value', function() {
        product.inStock = true;

        product.parseFields();

        expect(product.inStock).toBe(true);
      });

      it('keeps undefined as undefined', function() {
        product.inStock = undefined;

        product.parseFields();

        expect(product.inStock).toBe(undefined);
      });
    });

    describe('Date', function() {
      var date;
      beforeEach(function() {
        date = new Date(2014, 02, 03, 0, 0, 0);
      });

      it('converts String to Date according to the dateFormat', function() {
        product.createDate = '2014-03-03';

        product.parseFields();

        expect(product.createDate.getTime()).toBe(date.getTime());
      });

      it('keeps Date value, setting time to 00:00:00', function() {
        product.createDate = new Date('2014-03-03');

        product.parseFields();

        expect(product.createDate.getTime()).toBe(date.getTime());
      });

      it('keeps undefined value', function() {
        product.createDate = undefined;

        product.parseFields();

        expect(product.createDate).toBe(undefined);
      });

      it('changes dateFormat', function() {
        wrapParse.dateFormat = 'DD/MM/YYYY';
        product.createDate = new Date('03/03/2014');

        product.parseFields();

        expect(product.createDate.getTime()).toBe(date.getTime());
      });
    });

    describe('Relations', function() {
      var companyId = '12Xca12d';

      it('create a new Relation for a given id', function() {
        product.company = companyId;

        product.parseFields();

        expect(product.company instanceof Company).toBeTruthy();
        expect(product.company.id).toBe(companyId);
      });

      it('keeps the Relation value', function() {
        product.company = new Company({id: companyId})

        product.parseFields();

        expect(product.company.id).toBe(companyId);
      })
    });
  });

});