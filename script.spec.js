describe('realtime-webapp', function () {
  var socket;

  beforeEach(module('realtime-webapp'));
  beforeEach(function () {
    window.io = jasmine.createSpyObj('io', [
      'connect'
    ]);

    socket = jasmine.createSpyObj('socket', [
      'on',
      'emit'
    ]);

    window.io.connect.and.returnValue(socket);
  });

  describe('socketService', function () {
    var socketService;

    beforeEach(inject(function ($injector) {
      socketService = $injector.get('socketService');
    }));

    it('should connect', function () {
      expect(window.io.connect).toHaveBeenCalled();
    });

    it('should be able to add a listener', function () {
      socketService.on('foo', jasmine.createSpy('callback'));
      expect(socket.on).toHaveBeenCalledWith('foo', jasmine.any(Function));
    });

    it('should be able to emit an event', function () {
      var data = {};

      socketService.emit('foo', data);
      expect(socket.emit).toHaveBeenCalledWith('foo', data);
    });
  });

  describe('FormController', function () {
    var $controller,
        $scope,
        createController,
        socketService;

    createController = function () {
      $controller('FormController', {
        $scope: $scope,
        socketService: socketService
      });
    };

    beforeEach(inject(function ($injector) {
      var $rootScope = $injector.get('$rootScope');

      $controller = $injector.get('$controller');
      $scope = $rootScope.$new();
      socketService = jasmine.createSpyObj('socketService', [
        'emit'
      ]);
    }));

    it('should init', function () {
      createController();
      expect($scope.sendMessage).toBeDefined();
    });

    it('should send a message', function () {
      createController();
      $scope.message = 'foo';
      $scope.sendMessage(jasmine.createSpyObj('$event', [
        'preventDefault'
      ]));
      expect(socketService.emit).toHaveBeenCalledWith('add_message', $scope.message);
    });
  });

  describe('MessagesController', function () {
    var $controller,
        $scope,
        createController,
        socketService;

    createController = function () {
      $controller('MessagesController', {
        $scope: $scope,
        socketService: socketService
      });
    };

    beforeEach(inject(function ($injector) {
      var $rootScope = $injector.get('$rootScope');

      $controller = $injector.get('$controller');
      $scope = $rootScope.$new();
      socketService = jasmine.createSpyObj('socketService', [
        'on'
      ]);
    }));

    it('should init', function () {
      createController();
      expect(socketService.on).toHaveBeenCalledWith('messages', jasmine.any(Function));
    });

    it('should handle messages', function () {
      var message = 'foo',
          callback;

      socketService.on = function (event, func) {
        callback = func;
      };

      createController();
      $scope.$$phase = true;
      callback(message);

      expect($scope.messages.length).toBe(1);
      expect($scope.messages[0]).toBe(message);
    });

    it('should apply $scope', function () {
      var callback;

      socketService.on = function (event, func) {
        callback = func;
      };

      $scope.$$phase = false;
      spyOn($scope, '$apply');

      createController();
      callback('foo');

      expect($scope.$apply).toHaveBeenCalled();
    });
  });
});
