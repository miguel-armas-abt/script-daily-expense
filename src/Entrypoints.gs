/** @OnlyCurrentDoc */

// WebApp
function doGet(e) {
  return App.expenseController.doGet(e);
}
function saveExpenseCategory(payload) {
  return App.expenseController.saveExpenseCategory(payload);
}
function saveNewExpense(payload) {
  return App.expenseController.saveNewExpense(payload);
}

// Jobs (0-args)
function createTrigger() {
  return App.runner.createTrigger();
}
function findConstanciesAndPersist() {
  return App.runner.findConstanciesAndPersist();
}
function sendEmail() {
  return App.runner.sendEmail();
}
function sortExpenses() {
  return App.runner.sortExpenses();
}
function lastCheckDate() {
  return App.runner.lastCheckDate();
}
function setLastCheckDate() {
  return App.runner.setLastCheckDate();
}
