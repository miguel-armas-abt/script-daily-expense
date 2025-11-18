/** @OnlyCurrentDoc */

// fill out expenses
function fillConstanciesAndNotify() {
  App.ExpenseFillerService.fillConstanciesAndNotify();
}

function createTrigger() {
  App.TriggerConfig.createTrigger('fillConstanciesAndNotify');
}

// view
function doGet(e) {
  return App.ExpenseView.doGet(e);
}

function include(filename, data) {
  var t = HtmlService.createTemplateFromFile(filename);
  if (data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        t[key] = data[key];
      }
    }
  }

  return t.evaluate().getContent();
}

// services consumed by view
function updateExpense(payload) {
  return App.ExpenseUpdateService.updateExpense(payload);
}

function saveExpense(payload) {
  return App.ExpenseSaveService.saveExpense(payload);
}

function findExpensesByFilters(filters) {
  return App.ExpenseSearchService.findExpensesByFilters(filters);
}