"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl,globalTranslate, ace, Form, Extensions */
// Проверка нет ли ошибки занятого другой учеткой номера
$.fn.form.settings.rules.existRule = function (value, parameter) {
  return $("#".concat(parameter)).hasClass('hidden');
};

var dialplanApplication = {
  $number: $('#extension'),
  defaultExtension: '',
  $formObj: $('#dialplan-application-form'),
  $typeSelectDropDown: $('#dialplan-application-form .type-select'),
  $dirrtyField: $('#dirrty'),
  $tabMenuItems: $('#application-code-menu .item'),
  editor: '',
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.da_ValidateNameIsEmpty
      }]
    },
    extension: {
      identifier: 'extension',
      rules: [{
        type: 'number',
        prompt: globalTranslate.da_ValidateExtensionNumber
      }, {
        type: 'empty',
        prompt: globalTranslate.da_ValidateExtensionIsEmpty
      }, {
        type: 'existRule[extension-error]',
        prompt: globalTranslate.da_ValidateExtensionDouble
      }]
    }
  },
  initialize: function () {
    function initialize() {
      dialplanApplication.$tabMenuItems.tab();

      if (dialplanApplication.$formObj.form('get value', 'name').length === 0) {
        dialplanApplication.$tabMenuItems.tab('change tab', 'main');
      }

      dialplanApplication.$typeSelectDropDown.dropdown({
        onChange: dialplanApplication.changeAceMode
      }); // Динамическая проверка свободен ли внутренний номер

      dialplanApplication.$number.on('change', function () {
        var newNumber = dialplanApplication.$formObj.form('get value', 'extension');
        Extensions.checkAvailability(dialplanApplication.defaultExtension, newNumber);
      });
      dialplanApplication.initializeAce();
      dialplanApplication.initializeForm();
      dialplanApplication.changeAceMode();
      dialplanApplication.defaultExtension = dialplanApplication.$formObj.form('get value', 'extension');
    }

    return initialize;
  }(),
  initializeAce: function () {
    function initializeAce() {
      dialplanApplication.editor = ace.edit('application-code');
      dialplanApplication.editor.setTheme('ace/theme/monokai');
      dialplanApplication.editor.resize();
      dialplanApplication.editor.getSession().on('change', function () {
        dialplanApplication.$dirrtyField.val(Math.random());
        dialplanApplication.$dirrtyField.trigger('change');
      });
    }

    return initializeAce;
  }(),
  changeAceMode: function () {
    function changeAceMode() {
      var mode = dialplanApplication.$formObj.form('get value', 'type');
      var NewMode;

      if (mode === 'php') {
        NewMode = ace.require('ace/mode/php').Mode;
      } else {
        NewMode = ace.require('ace/mode/julia').Mode;
      }

      dialplanApplication.editor.session.setMode(new NewMode());
      dialplanApplication.editor.setTheme('ace/theme/monokai');
    }

    return changeAceMode;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = dialplanApplication.$formObj.form('get values');
      result.data.applicationlogic = dialplanApplication.editor.getValue();
      return result;
    }

    return cbBeforeSendForm;
  }(),
  cbAfterSendForm: function () {
    function cbAfterSendForm() {}

    return cbAfterSendForm;
  }(),
  initializeForm: function () {
    function initializeForm() {
      Form.$formObj = dialplanApplication.$formObj;
      Form.url = "".concat(globalRootUrl, "dialplan-applications/save");
      Form.validateRules = dialplanApplication.validateRules;
      Form.cbBeforeSendForm = dialplanApplication.cbBeforeSendForm;
      Form.cbAfterSendForm = dialplanApplication.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};
$(document).ready(function () {
  dialplanApplication.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EaWFscGxhbkFwcGxpY2F0aW9ucy9kaWFscGxhbi1hcHBsaWNhdGlvbnMtbW9kaWZ5LmpzIl0sIm5hbWVzIjpbIiQiLCJmbiIsImZvcm0iLCJzZXR0aW5ncyIsInJ1bGVzIiwiZXhpc3RSdWxlIiwidmFsdWUiLCJwYXJhbWV0ZXIiLCJoYXNDbGFzcyIsImRpYWxwbGFuQXBwbGljYXRpb24iLCIkbnVtYmVyIiwiZGVmYXVsdEV4dGVuc2lvbiIsIiRmb3JtT2JqIiwiJHR5cGVTZWxlY3REcm9wRG93biIsIiRkaXJydHlGaWVsZCIsIiR0YWJNZW51SXRlbXMiLCJlZGl0b3IiLCJ2YWxpZGF0ZVJ1bGVzIiwibmFtZSIsImlkZW50aWZpZXIiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwiZGFfVmFsaWRhdGVOYW1lSXNFbXB0eSIsImV4dGVuc2lvbiIsImRhX1ZhbGlkYXRlRXh0ZW5zaW9uTnVtYmVyIiwiZGFfVmFsaWRhdGVFeHRlbnNpb25Jc0VtcHR5IiwiZGFfVmFsaWRhdGVFeHRlbnNpb25Eb3VibGUiLCJpbml0aWFsaXplIiwidGFiIiwibGVuZ3RoIiwiZHJvcGRvd24iLCJvbkNoYW5nZSIsImNoYW5nZUFjZU1vZGUiLCJvbiIsIm5ld051bWJlciIsIkV4dGVuc2lvbnMiLCJjaGVja0F2YWlsYWJpbGl0eSIsImluaXRpYWxpemVBY2UiLCJpbml0aWFsaXplRm9ybSIsImFjZSIsImVkaXQiLCJzZXRUaGVtZSIsInJlc2l6ZSIsImdldFNlc3Npb24iLCJ2YWwiLCJNYXRoIiwicmFuZG9tIiwidHJpZ2dlciIsIm1vZGUiLCJOZXdNb2RlIiwicmVxdWlyZSIsIk1vZGUiLCJzZXNzaW9uIiwic2V0TW9kZSIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJkYXRhIiwiYXBwbGljYXRpb25sb2dpYyIsImdldFZhbHVlIiwiY2JBZnRlclNlbmRGb3JtIiwiRm9ybSIsInVybCIsImdsb2JhbFJvb3RVcmwiLCJkb2N1bWVudCIs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XG4gKiBDb3B5cmlnaHQgKEMpIE1JS08gTExDIC0gQWxsIFJpZ2h0cyBSZXNlcnZlZFxuICogVW5hdXRob3JpemVkIGNvcHlpbmcgb2YgdGhpcyBmaWxlLCB2aWEgYW55IG1lZGl1bSBpcyBzdHJpY3RseSBwcm9oaWJpdGVkXG4gKiBQcm9wcmlldGFyeSBhbmQgY29uZmlkZW50aWFsXG4gKiBXcml0dGVuIGJ5IE5pa29sYXkgQmVrZXRvdiwgMTIgMjAxOVxuICpcbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCxnbG9iYWxUcmFuc2xhdGUsIGFjZSwgRm9ybSwgRXh0ZW5zaW9ucyAqL1xuXG4vLyDQn9GA0L7QstC10YDQutCwINC90LXRgiDQu9C4INC+0YjQuNCx0LrQuCDQt9Cw0L3Rj9GC0L7Qs9C+INC00YDRg9Cz0L7QuSDRg9GH0LXRgtC60L7QuSDQvdC+0LzQtdGA0LBcbiQuZm4uZm9ybS5zZXR0aW5ncy5ydWxlcy5leGlzdFJ1bGUgPSAodmFsdWUsIHBhcmFtZXRlcikgPT4gJChgIyR7cGFyYW1ldGVyfWApLmhhc0NsYXNzKCdoaWRkZW4nKTtcblxuY29uc3QgZGlhbHBsYW5BcHBsaWNhdGlvbiA9IHtcblx0JG51bWJlcjogJCgnI2V4dGVuc2lvbicpLFxuXHRkZWZhdWx0RXh0ZW5zaW9uOiAnJyxcblx0JGZvcm1PYmo6ICQoJyNkaWFscGxhbi1hcHBsaWNhdGlvbi1mb3JtJyksXG5cdCR0eXBlU2VsZWN0RHJvcERvd246ICQoJyNkaWFscGxhbi1hcHBsaWNhdGlvbi1mb3JtIC50eXBlLXNlbGVjdCcpLFxuXHQkZGlycnR5RmllbGQ6ICQoJyNkaXJydHknKSxcblx0JHRhYk1lbnVJdGVtczogJCgnI2FwcGxpY2F0aW9uLWNvZGUtbWVudSAuaXRlbScpLFxuXHRlZGl0b3I6ICcnLFxuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0bmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ25hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRleHRlbnNpb246IHtcblx0XHRcdGlkZW50aWZpZXI6ICdleHRlbnNpb24nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdudW1iZXInLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLmRhX1ZhbGlkYXRlRXh0ZW5zaW9uTnVtYmVyLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5kYV9WYWxpZGF0ZUV4dGVuc2lvbklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZXhpc3RSdWxlW2V4dGVuc2lvbi1lcnJvcl0nLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLmRhX1ZhbGlkYXRlRXh0ZW5zaW9uRG91YmxlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXHRpbml0aWFsaXplKCkge1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uJHRhYk1lbnVJdGVtcy50YWIoKTtcblx0XHRpZiAoZGlhbHBsYW5BcHBsaWNhdGlvbi4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCAnbmFtZScpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kdGFiTWVudUl0ZW1zLnRhYignY2hhbmdlIHRhYicsICdtYWluJyk7XG5cdFx0fVxuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uJHR5cGVTZWxlY3REcm9wRG93bi5kcm9wZG93bih7XG5cdFx0XHRvbkNoYW5nZTogZGlhbHBsYW5BcHBsaWNhdGlvbi5jaGFuZ2VBY2VNb2RlLFxuXHRcdH0pO1xuXHRcdC8vINCU0LjQvdCw0LzQuNGH0LXRgdC60LDRjyDQv9GA0L7QstC10YDQutCwINGB0LLQvtCx0L7QtNC10L0g0LvQuCDQstC90YPRgtGA0LXQvdC90LjQuSDQvdC+0LzQtdGAXG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kbnVtYmVyLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdOdW1iZXIgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICdleHRlbnNpb24nKTtcblx0XHRcdEV4dGVuc2lvbnMuY2hlY2tBdmFpbGFiaWxpdHkoZGlhbHBsYW5BcHBsaWNhdGlvbi5kZWZhdWx0RXh0ZW5zaW9uLCBuZXdOdW1iZXIpO1xuXHRcdH0pO1xuXG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplQWNlKCk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplRm9ybSgpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uY2hhbmdlQWNlTW9kZSgpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZGVmYXVsdEV4dGVuc2lvbiA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ2V4dGVuc2lvbicpO1xuXHR9LFxuXHRpbml0aWFsaXplQWNlKCkge1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yID0gYWNlLmVkaXQoJ2FwcGxpY2F0aW9uLWNvZGUnKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXRUaGVtZSgnYWNlL3RoZW1lL21vbm9rYWknKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5yZXNpemUoKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5nZXRTZXNzaW9uKCkub24oJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdGRpYWxwbGFuQXBwbGljYXRpb24uJGRpcnJ0eUZpZWxkLnZhbChNYXRoLnJhbmRvbSgpKTtcblx0XHRcdGRpYWxwbGFuQXBwbGljYXRpb24uJGRpcnJ0eUZpZWxkLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHRcdH0pO1xuXHR9LFxuXHRjaGFuZ2VBY2VNb2RlKCkge1xuXHRcdGNvbnN0IG1vZGUgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICd0eXBlJyk7XG5cdFx0bGV0IE5ld01vZGU7XG5cdFx0aWYgKG1vZGUgPT09ICdwaHAnKSB7XG5cdFx0XHROZXdNb2RlID0gYWNlLnJlcXVpcmUoJ2FjZS9tb2RlL3BocCcpLk1vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE5ld01vZGUgPSBhY2UucmVxdWlyZSgnYWNlL21vZGUvanVsaWEnKS5Nb2RlO1xuXHRcdH1cblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXNzaW9uLnNldE1vZGUobmV3IE5ld01vZGUoKSk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3Iuc2V0VGhlbWUoJ2FjZS90aGVtZS9tb25va2FpJyk7XG5cdH0sXG5cdGNiQmVmb3JlU2VuZEZvcm0oc2V0dGluZ3MpIHtcblx0XHRjb25zdCByZXN1bHQgPSBzZXR0aW5ncztcblx0XHRyZXN1bHQuZGF0YSA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdHJlc3VsdC5kYXRhLmFwcGxpY2F0aW9ubG9naWMgPSBkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblxuXHR9LFxuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gZGlhbHBsYW5BcHBsaWNhdGlvbi4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9ZGlhbHBsYW4tYXBwbGljYXRpb25zL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IGRpYWxwbGFuQXBwbGljYXRpb24udmFsaWRhdGVSdWxlcztcblx0XHRGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBkaWFscGxhbkFwcGxpY2F0aW9uLmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBkaWFscGxhbkFwcGxpY2F0aW9uLmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcblxuIl19