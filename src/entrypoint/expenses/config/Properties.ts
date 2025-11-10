export const Properties = (() => {

  function get(key: string): string {
    const value = PropertiesService.getScriptProperties().getProperty(key);
    if (!value) throw new Error('Property ' + value + ' is not defined');
    return value;
  }

  function getOptional(key: string): string | null {
    return PropertiesService.getScriptProperties().getProperty(key);
  }

  function set(key: string, value: string) {
    PropertiesService.getScriptProperties().setProperty(key, value);
  }

  return { get, getOptional, set };
})();