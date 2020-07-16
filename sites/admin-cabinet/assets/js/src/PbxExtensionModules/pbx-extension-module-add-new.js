/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global UserMessage, globalTranslate, PbxApi, upgradeStatusLoopWorker */ 

const addNewExtension = {
	$uploadButton: $('#add-new-button'),
	$progressBar: $('#upload-progress-bar'),
	$progressBarLabel: $('#upload-progress-bar').find('.label'),
	uploadInProgress: false,
	initialize() {
		addNewExtension.$progressBar.hide();
		addNewExtension.$uploadButton.on('click', (e) => {
			e.preventDefault();
			if (
				addNewExtension.$uploadButton.hasClass('loading')
				|| addNewExtension.uploadInProgress
			) { return; }
			$('input:file', $(e.target).parents()).click();
		});

		$('input:file').on('change', (e) => {
			if (e.target.files[0] !== undefined) {
				const filename = e.target.files[0].name;
				$('input:text', $(e.target).parent()).val(filename);
				const data = $('input:file')[0].files[0];
				PbxApi.SystemUploadFile(data, addNewExtension.cbResumableUploadFile);
			}
		});
	},
	/**
	 * Upload file by chunks
	 * @param action
	 * @param params
	 */
	cbResumableUploadFile(action, params){
		switch (action) {
			case 'fileSuccess':
				addNewExtension.checkStatusFileMerging(params.response);
				break;
			case 'uploadStart':
				addNewExtension.uploadInProgress = true;
				addNewExtension.$uploadButton.addClass('loading');
				addNewExtension.$progressBar.show();
				addNewExtension.$progressBarLabel.text(globalTranslate.ext_UploadInProgress);
				break;
			case 'progress':
				addNewExtension.$progressBar.progress({
					percent: parseInt(params.percent, 10),
				});
				break;
			case 'error':
				addNewExtension.$progressBarLabel.text(globalTranslate.ext_UploadError);
				addNewExtension.$uploadButton.removeClass('loading');
				UserMessage.showError(globalTranslate.ext_UploadError);
				break;
			default:
		}
	},
	/**
	 * Wait for file ready to use
	 *
	 * @param response ответ функции /pbxcore/api/upload/status
	 */
	checkStatusFileMerging(response) {
		if (response === undefined || PbxApi.tryParseJSON(response) === false) {
			UserMessage.showError(`${globalTranslate.ext_UploadError}`);
			return;
		}
		const json = JSON.parse(response);
		if (json === undefined || json.data === undefined) {
			UserMessage.showError(`${globalTranslate.ext_UploadError}`);
			return;
		}
		const fileID = json.data.upload_id;
		const filePath = json.data.filename;
		mergingCheckWorker.initialize(fileID, filePath);
	},
	cbAfterUploadFile(response, success) {
		if (response.length === 0 || response === false || success === false) {
			addNewExtension.$uploadButton.removeClass('loading');
			addNewExtension.uploadInProgress = false;
			UserMessage.showError(globalTranslate.ext_UploadError);
		} else if (response.function === 'upload_progress' && success) {
			addNewExtension.$progressBar.progress({
				percent: parseInt(response.percent, 10),
			});
			if (response.percent < 100) {
				addNewExtension.$progressBarLabel.text(globalTranslate.ext_UploadInProgress);
			} else {
				addNewExtension.$progressBarLabel.text(globalTranslate.ext_InstallationInProgress);
			}
		} else if (response.function === 'uploadNewModule' && success) {
			upgradeStatusLoopWorker.initialize(response.uniqid, false);
		} else {
			UserMessage.showMultiString(response.message);
		}
	},
};

const mergingCheckWorker = {
	timeOut: 3000,
	timeOutHandle: '',
	errorCounts: 0,
	$progressBarLabel: $('#upload-progress-bar').find('.label'),
	fileID: null,
	filePath: '',
	initialize(fileID, filePath) {
		// Запустим обновление статуса провайдера
		mergingCheckWorker.fileID = fileID;
		mergingCheckWorker.filePath = filePath;
		mergingCheckWorker.restartWorker(fileID);
	},
	restartWorker() {
		window.clearTimeout(mergingCheckWorker.timeoutHandle);
		mergingCheckWorker.worker();
	},
	worker() {
		PbxApi.SystemGetStatusUploadFile(mergingCheckWorker.fileID, mergingCheckWorker.cbAfterResponse);
		mergingCheckWorker.timeoutHandle = window.setTimeout(
			mergingCheckWorker.worker,
			mergingCheckWorker.timeOut,
		);
	},
	cbAfterResponse(response) {
		if (mergingCheckWorker.errorCounts > 10) {
			mergingCheckWorker.$progressBarLabel.text(globalTranslate.ext_UploadError);
			UserMessage.showError(globalTranslate.ext_UploadError);
			addNewExtension.$uploadButton.removeClass('loading');
			window.clearTimeout(mergingCheckWorker.timeoutHandle);
		}
		if (response === undefined || Object.keys(response).length === 0) {
			mergingCheckWorker.errorCounts += 1;
			return;
		}
		if (response.d_status === 'UPLOAD_COMPLETE') {
			mergingCheckWorker.$progressBarLabel.text(globalTranslate.ext_InstallationInProgress);
			PbxApi.SystemInstallModule(mergingCheckWorker.filePath, mergingCheckWorker.cbAfterModuleInstall);
			window.clearTimeout(mergingCheckWorker.timeoutHandle);
		} else if (response.d_status !== undefined) {
			mergingCheckWorker.$progressBarLabel.text(globalTranslate.ext_UploadInProgress);
			mergingCheckWorker.errorCounts = 0;
		} else {
			mergingCheckWorker.errorCounts += 1;
		}
	},
	cbAfterModuleInstall(response){
		if (response===true){
			window.location.reload();
		} else {
			UserMessage.showError(globalTranslate.ext_InstallationError);
		}
	},
};

$(document).ready(() => {
	addNewExtension.initialize();
});
