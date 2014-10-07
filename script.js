angular.module('realtime-webapp', [])
  .service('socketService', ['$location', (function () {
      function SocketService ($location) {
        this.socket = io.connect('http://' + $location.host() + ':8001');
      }

      SocketService.prototype.on = function(event, callback) {
        this.socket.on(event, callback);
      };

      SocketService.prototype.emit = function(event, data) {
        this.socket.emit(event, data);
      };

      return SocketService;
    })()]
  )
  .controller('FormController', [
    '$scope',
    'socketService',
    (function () {
      function FormController ($scope, socketService) {
        this.$scope = $scope;
        this.socketService = socketService;

        this.init();
      }

      FormController.prototype.init = function() {
        this.addScopeMethods();
      };

      FormController.prototype.addScopeMethods = function() {
        this.$scope.sendMessage = angular.bind(this, this.sendMessage);
      };

      FormController.prototype.sendMessage = function($event) {
        $event.preventDefault();

        this.socketService.emit('add_message', this.$scope.message);
      };

      return FormController;
    })()]
  )
  .controller('MessagesController', [
    '$scope',
    'socketService',
    (function () {
      function MessagesController ($scope, socketService) {
        this.$scope = $scope;
        this.socketService = socketService;

        this.init();
      }

      MessagesController.prototype.init = function() {
        this.$scope.messages = [];

        this.addSocketListeners();
      };

      MessagesController.prototype.addSocketListeners = function() {
        this.socketService.on('messages', angular.bind(this, this.handleMessage));
      };

      MessagesController.prototype.handleMessage = function(message) {
        this.$scope.messages.unshift(message);

        if (!this.$scope.$$phase) {
          this.$scope.$apply();
        }
      };

      return MessagesController;
    })()]
  );
