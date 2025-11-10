/// <reference types="google-apps-script" />
import { AppConstants } from './../constants/AppConstants';
import { UtilDateTime } from './UtilDateTime';

export const UtilLastCheck = (() => {
  function getLastCheckCanonical(): Date | null {
    const utcIso = PropertiesService.getScriptProperties().getProperty(
      AppConstants.PROP_LAST_CHECK_TIMESTAMP_ISO_UTC
    );
    return utcIso ? new Date(utcIso) : null;
  }

  function setLastCheckCanonical(): void {
    PropertiesService.getScriptProperties().setProperty(
      AppConstants.PROP_LAST_CHECK_TIMESTAMP_ISO_UTC,
      UtilDateTime.nowCanonical()
    );
  }

  return { getLastCheckCanonical, setLastCheckCanonical };
})();
