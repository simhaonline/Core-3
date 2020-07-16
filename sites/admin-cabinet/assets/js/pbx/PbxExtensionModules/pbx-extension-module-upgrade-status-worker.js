"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl, PbxApi, globalTranslate, UserMessage, extensionModules */

/**
 * Мониторинг статуса обновления или установки модуля
 *
 */
var upgradeStatusLoopWorker = {
  timeOut: 1000,
  timeOutHandle: '',
  moduleUniqid: '',
  iterations: 0,
  oldPercent: 0,
  needEnableAfterInstall: false,
  initialize: function () {
    function initialize(uniqid, needEnable) {
      upgradeStatusLoopWorker.moduleUniqid = uniqid;
      upgradeStatusLoopWorker.iterations = 0;
      upgradeStatusLoopWorker.needEnableAfterInstall = needEnable;
      upgradeStatusLoopWorker.restartWorker();
    }

    return initialize;
  }(),
  restartWorker: function () {
    function restartWorker() {
      window.clearTimeout(upgradeStatusLoopWorker.timeoutHandle);
      upgradeStatusLoopWorker.worker();
    }

    return restartWorker;
  }(),
  worker: function () {
    function worker() {
      window.clearTimeout(upgradeStatusLoopWorker.timeoutHandle);
      PbxApi.SystemModuleDownloadStatus(upgradeStatusLoopWorker.moduleUniqid, upgradeStatusLoopWorker.cbRefreshModuleStatus, upgradeStatusLoopWorker.restartWorker);
    }

    return worker;
  }(),
  cbRefreshModuleStatus: function () {
    function cbRefreshModuleStatus(response) {
      upgradeStatusLoopWorker.iterations += 1;
      upgradeStatusLoopWorker.timeoutHandle = window.setTimeout(upgradeStatusLoopWorker.worker, upgradeStatusLoopWorker.timeOut); // Check download status

      if (response === false && upgradeStatusLoopWorker.iterations < 50) {
        window.clearTimeout(upgradeStatusLoopWorker.timeoutHandle);
      } else if (upgradeStatusLoopWorker.iterations > 50 || response.d_status === 'DOWNLOAD_ERROR' || response.d_status === 'NOT_FOUND') {
        window.clearTimeout(upgradeStatusLoopWorker.timeoutHandle);
        var errorMessage = response.d_error !== undefined ? response.d_error : '';
        errorMessage = errorMessage.replace(/\n/g, '<br>');
        UserMessage.showError(errorMessage, globalTranslate.ext_UpdateModuleError);
        $("#".concat(upgradeStatusLoopWorker.moduleUniqid)).find('i').removeClass('loading');
        $('.new-module-row').find('i').addClass('download').removeClass('redo');
        $('a.button').removeClass('disabled');
      } else if (response.d_status === 'DOWNLOAD_IN_PROGRESS') {
        if (upgradeStatusLoopWorker.oldPercent !== response.d_status_progress) {
          upgradeStatusLoopWorker.iterations = 0;
        }

        $('i.loading.redo').closest('a').find('.percent').text("".concat(response.d_status_progress, "%"));
        upgradeStatusLoopWorker.oldPercent = response.d_status_progress;
      } else if (response.d_status === 'DOWNLOAD_COMPLETE') {
        PbxApi.SystemInstallModule(response.filePath, upgradeStatusLoopWorker.cbAfterModuleInstall);
        window.clearTimeout(upgradeStatusLoopWorker.timeoutHandle);
      }
    }

    return cbRefreshModuleStatus;
  }(),
  cbAfterModuleInstall: function () {
    function cbAfterModuleInstall(response) {
      if (response.length === 0 || response === false) {
        UserMessage.showError(globalTranslate.ext_InstallationError);
      } else {
        // Check installation status
        $('a.button').removeClass('disabled');

        if (upgradeStatusLoopWorker.needEnableAfterInstall) {
          PbxApi.SystemEnableModule(upgradeStatusLoopWorker.moduleUniqid, function () {
            extensionModules.reloadModuleAndPage(upgradeStatusLoopWorker.moduleUniqid);
          });
        } else {
          window.location = "".concat(globalRootUrl, "pbx-extension-modules/index/");
        }
      }
    }

    return cbAfterModuleInstall;
  }()
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYnhFeHRlbnNpb25Nb2R1bGVzL3BieC1leHRlbnNpb24tbW9kdWxlLXVwZ3JhZGUtc3RhdHVzLXdvcmtlci5qcyJdLCJuYW1lcyI6WyJ1cGdyYWRlU3RhdHVzTG9vcFdvcmtlciIsInRpbWVPdXQiLCJ0aW1lT3V0SGFuZGxlIiwibW9kdWxlVW5pcWlkIiwiaXRlcmF0aW9ucyIsIm9sZFBlcmNlbnQiLCJuZWVkRW5hYmxlQWZ0ZXJJbnN0YWxsIiwiaW5pdGlhbGl6ZSIsInVuaXFpZCIsIm5lZWRFbmFibGUiLCJyZXN0YXJ0V29ya2VyIiwid2luZG93IiwiY2xlYXJUaW1lb3V0IiwidGltZW91dEhhbmRsZSIsIndvcmtlciIsIlBieEFwaSIsIlN5c3RlbU1vZHVsZURvd25sb2FkU3RhdHVzIiwiY2JSZWZyZXNoTW9kdWxlU3RhdHVzIiwicmVzcG9uc2UiLCJzZXRUaW1lb3V0IiwiZF9zdGF0dXMiLCJlcnJvck1lc3NhZ2UiLCJkX2Vycm9yIiwidW5kZWZpbmVkIiwicmVwbGFjZSIsIlVzZXJNZXNzYWdlIiwic2hvd0Vycm9yIiwiZ2xvYmFsVHJhbnNsYXRlIiwiZXh0X1VwZGF0ZU1vZHVsZUVycm9yIiwiJCIsImZpbmQiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwiZF9zdGF0dXNfcHJvZ3Jlc3MiLCJjbG9zZXN0IiwidGV4dCIsIlN5c3RlbUluc3RhbGxNb2R1bGUiLCJmaWxlUGF0aCIsImNiQWZ0ZXJNb2R1bGVJbnN0YWxsIiwibGVuZ3RoIiwiZXh0X0luc3RhbGxhdGlvbkVycm9yIiwiU3lzdGVtRW5hYmxlTW9kdWxlIiwiZXh0ZW5zaW9uTW9kdWxlcyIsInJlbG9hZE1vZHVsZUFuZFBhZ2UiLCJsb2NhdGlvbiIsImdsb2JhbFJvb3RVcmwiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBUUE7O0FBRUE7Ozs7QUFJQSxJQUFNQSx1QkFBdUIsR0FBRztBQUMvQkMsRUFBQUEsT0FBTyxFQUFFLElBRHNCO0FBRS9CQyxFQUFBQSxh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N0Q7QUFDQSxXQUpGO0FBTUEsU0FQRCxNQU9PO0FBQ05RLFVBQUFBLE1BQU0sQ0FBQ2lDLFFBQVAsYUFBcUJDLGFBQXJCO0FBQ0E7QUFDRDtBQUVEOztBQXpFOEI7QUFBQTtBQUFBLENBQWhDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoQykgTUlLTyBMTEMgLSBBbGwgUmlnaHRzIFJlc2VydmVkXG4gKiBVbmF1dGhvcml6ZWQgY29weWluZyBvZiB0aGlzIGZpbGUsIHZpYSBhbnkgbWVkaXVtIGlzIHN0cmljdGx5IHByb2hpYml0ZWRcbiAqIFByb3ByaWV0YXJ5IGFuZCBjb25maWRlbnRpYWxcbiAqIFdyaXR0ZW4gYnkgTmlrb2xheSBCZWtldG92LCAxMiAyMDE5XG4gKlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBQYnhBcGksIGdsb2JhbFRyYW5zbGF0ZSwgVXNlck1lc3NhZ2UsIGV4dGVuc2lvbk1vZHVsZXMgKi9cblxuLyoqXG4gKiDQnNC+0L3QuNGC0L7RgNC40L3QsyDRgdGC0LDRgtGD0YHQsCDQvtCx0L3QvtCy0LvQtdC90LjRjyDQuNC70Lgg0YPRgdGC0LDQvdC+0LLQutC4INC80L7QtNGD0LvRj1xuICpcbiAqL1xuY29uc3QgdXBncmFkZVN0YXR1c0xvb3BXb3JrZXIgPSB7XG5cdHRpbWVPdXQ6IDEwMDAsXG5cdHRpbWVPdXRIYW5kbGU6ICcnLFxuXHRtb2R1bGVVbmlxaWQ6ICcnLFxuXHRpdGVyYXRpb25zOiAwLFxuXHRvbGRQZXJjZW50OiAwLFxuXHRuZWVkRW5hYmxlQWZ0ZXJJbnN0YWxsOiBmYWxzZSxcblx0aW5pdGlhbGl6ZSh1bmlxaWQsIG5lZWRFbmFibGUpIHtcblx0XHR1cGdyYWRlU3RhdHVzTG9vcFdvcmtlci5tb2R1bGVVbmlxaWQgPSB1bmlxaWQ7XG5cdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIuaXRlcmF0aW9ucyA9IDA7XG5cdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIubmVlZEVuYWJsZUFmdGVySW5zdGFsbCA9IG5lZWRFbmFibGU7XG5cdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIucmVzdGFydFdvcmtlcigpO1xuXHR9LFxuXHRyZXN0YXJ0V29ya2VyKCkge1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodXBncmFkZVN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG5cdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIud29ya2VyKCk7XG5cdH0sXG5cdHdvcmtlcigpIHtcblx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLnRpbWVvdXRIYW5kbGUpO1xuXHRcdFBieEFwaS5TeXN0ZW1Nb2R1bGVEb3dubG9hZFN0YXR1cyhcblx0XHRcdHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLm1vZHVsZVVuaXFpZCxcblx0XHRcdHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLmNiUmVmcmVzaE1vZHVsZVN0YXR1cyxcblx0XHRcdHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLnJlc3RhcnRXb3JrZXIsXG5cdFx0KTtcblx0fSxcblx0Y2JSZWZyZXNoTW9kdWxlU3RhdHVzKHJlc3BvbnNlKSB7XG5cdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIuaXRlcmF0aW9ucyArPSAxO1xuXHRcdHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLnRpbWVvdXRIYW5kbGUgPVxuXHRcdFx0d2luZG93LnNldFRpbWVvdXQodXBncmFkZVN0YXR1c0xvb3BXb3JrZXIud29ya2VyLCB1cGdyYWRlU3RhdHVzTG9vcFdvcmtlci50aW1lT3V0KTtcblx0XHQvLyBDaGVjayBkb3dubG9hZCBzdGF0dXNcblx0XHRpZiAocmVzcG9uc2UgPT09IGZhbHNlXG5cdFx0XHQmJiB1cGdyYWRlU3RhdHVzTG9vcFdvcmtlci5pdGVyYXRpb25zIDwgNTApIHtcblx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodXBncmFkZVN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG5cdFx0fSBlbHNlIGlmICh1cGdyYWRlU3RhdHVzTG9vcFdvcmtlci5pdGVyYXRpb25zID4gNTBcblx0XHRcdHx8IHJlc3BvbnNlLmRfc3RhdHVzID09PSAnRE9XTkxPQURfRVJST1InXG5cdFx0XHR8fCByZXNwb25zZS5kX3N0YXR1cyA9PT0gJ05PVF9GT1VORCdcblx0XHQpIHtcblx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodXBncmFkZVN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG5cdFx0XHRsZXQgZXJyb3JNZXNzYWdlID0gKHJlc3BvbnNlLmRfZXJyb3IgIT09IHVuZGVmaW5lZCkgPyByZXNwb25zZS5kX2Vycm9yIDogJyc7XG5cdFx0XHRlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UucmVwbGFjZSgvXFxuL2csICc8YnI+Jyk7XG5cdFx0XHRVc2VyTWVzc2FnZS5zaG93RXJyb3IoZXJyb3JNZXNzYWdlLCBnbG9iYWxUcmFuc2xhdGUuZXh0X1VwZGF0ZU1vZHVsZUVycm9yKTtcblx0XHRcdCQoYCMke3VwZ3JhZGVTdGF0dXNMb29wV29ya2VyLm1vZHVsZVVuaXFpZH1gKS5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdCQoJy5uZXctbW9kdWxlLXJvdycpLmZpbmQoJ2knKS5hZGRDbGFzcygnZG93bmxvYWQnKS5yZW1vdmVDbGFzcygncmVkbycpO1xuXHRcdFx0JCgnYS5idXR0b24nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2UgaWYgKHJlc3BvbnNlLmRfc3RhdHVzID09PSAnRE9XTkxPQURfSU5fUFJPR1JFU1MnKSB7XG5cdFx0XHRpZiAodXBncmFkZVN0YXR1c0xvb3BXb3JrZXIub2xkUGVyY2VudCAhPT0gcmVzcG9uc2UuZF9zdGF0dXNfcHJvZ3Jlc3MpIHtcblx0XHRcdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIuaXRlcmF0aW9ucyA9IDA7XG5cdFx0XHR9XG5cdFx0XHQkKCdpLmxvYWRpbmcucmVkbycpLmNsb3Nlc3QoJ2EnKS5maW5kKCcucGVyY2VudCcpLnRleHQoYCR7cmVzcG9uc2UuZF9zdGF0dXNfcHJvZ3Jlc3N9JWApO1xuXHRcdFx0dXBncmFkZVN0YXR1c0xvb3BXb3JrZXIub2xkUGVyY2VudCA9IHJlc3BvbnNlLmRfc3RhdHVzX3Byb2dyZXNzO1xuXHRcdH0gZWxzZSBpZiAocmVzcG9uc2UuZF9zdGF0dXMgPT09ICdET1dOTE9BRF9DT01QTEVURScpIHtcblx0XHRcdFBieEFwaS5TeXN0ZW1JbnN0YWxsTW9kdWxlKHJlc3BvbnNlLmZpbGVQYXRoLCB1cGdyYWRlU3RhdHVzTG9vcFdvcmtlci5jYkFmdGVyTW9kdWxlSW5zdGFsbCk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLnRpbWVvdXRIYW5kbGUpO1xuXHRcdH1cblx0fSxcblx0Y2JBZnRlck1vZHVsZUluc3RhbGwocmVzcG9uc2UpIHtcblx0XHRpZiAocmVzcG9uc2UubGVuZ3RoID09PSAwIHx8IHJlc3BvbnNlID09PSBmYWxzZSkge1xuXHRcdFx0VXNlck1lc3NhZ2Uuc2hvd0Vycm9yKGdsb2JhbFRyYW5zbGF0ZS5leHRfSW5zdGFsbGF0aW9uRXJyb3IpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBDaGVjayBpbnN0YWxsYXRpb24gc3RhdHVzXG5cdFx0XHQkKCdhLmJ1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0aWYgKHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLm5lZWRFbmFibGVBZnRlckluc3RhbGwpIHtcblx0XHRcdFx0UGJ4QXBpLlN5c3RlbUVuYWJsZU1vZHVsZShcblx0XHRcdFx0XHR1cGdyYWRlU3RhdHVzTG9vcFdvcmtlci5tb2R1bGVVbmlxaWQsXG5cdFx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdFx0ZXh0ZW5zaW9uTW9kdWxlcy5yZWxvYWRNb2R1bGVBbmRQYWdlKHVwZ3JhZGVTdGF0dXNMb29wV29ya2VyLm1vZHVsZVVuaXFpZCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbiA9IGAke2dsb2JhbFJvb3RVcmx9cGJ4LWV4dGVuc2lvbi1tb2R1bGVzL2luZGV4L2A7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0sXG59O1xuIl19