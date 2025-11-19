/// <reference types="google-apps-script" />
import { Props } from '../constants/Props';

const TriggerConfig = (() => {
  
  function deleteTrigger(handlerFuncName: string) {
    ScriptApp.getProjectTriggers().forEach((t) => {
      if (t.getHandlerFunction && t.getHandlerFunction() === handlerFuncName) {
        ScriptApp.deleteTrigger(t);
      }
    });
  }

  function createTrigger(handlerFuncName: string) {
    deleteTrigger(handlerFuncName);
    const mins = Number(PropertiesService.getScriptProperties().getProperty(Props.TRIGGER_EVERY_MINUTES));

    ScriptApp
      .newTrigger(handlerFuncName)
      .timeBased()
      .everyMinutes(Math.max(1, Math.min(30, mins)))
      .create();
  }

  return { createTrigger: createTrigger };
})();

export default TriggerConfig;