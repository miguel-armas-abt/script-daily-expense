/// <reference types="google-apps-script" />
import { Props } from '../constants/Props';

export const TriggerService = (() => {
  function deleteExisting(handlerFuncName: string) {
    ScriptApp.getProjectTriggers().forEach((t) => {
      if (t.getHandlerFunction && t.getHandlerFunction() === handlerFuncName) {
        ScriptApp.deleteTrigger(t);
      }
    });
  }

  function createTimeTriggerEveryMinutes(handlerFuncName: string) {
    deleteExisting(handlerFuncName);
    const mins = Number(PropertiesService.getScriptProperties().getProperty(Props.TRIGGER_EVERY_MINUTES));

    ScriptApp.newTrigger(handlerFuncName).timeBased().everyMinutes(Math.max(1, Math.min(30, mins))).create();
  }

  return { createTimeTriggerEveryMinutes };
})();
