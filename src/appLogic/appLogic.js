//load mongoose
const mongoose = require('./../db/mongoose');

// load Users, Incomes, Expenses
const {users} = require('./../models/users');
const {incomes} = require('./../models/incomes');
const {expenses} = require('./../models/expenses');


let dataStructure = {
  allData: {
    incomes: [],
    expenses: []
  },
  totals: {
    income: 0,
    expense: 0,
    remain: 0
  },
  percentage: -1
};

const clearDataStructure = () => {
  dataStructure = {
    allData: {
      incomes: [],
      expenses: []
    },
    totals: {
      income: 0,
      expense: 0,
      remain: 0
    },
    percentage: -1
  };
};

class Income{
  constructor(_id, description, amount, creator_id, createOn, updatedOn) {
    this._id = _id;
    this.description = description;
    this.amount = amount;
    this.creator_id = creator_id;
    this.createdOn = createOn;
    this.updatedOn = updatedOn;
  }
}

class Expense{
  constructor(_id, description, amount, creator_id, createOn, updatedOn, percentage) {
    this._id = _id;
    this.description = description;
    this.amount = amount;
    this.creator_id = creator_id;
    this.createdOn = createOn;
    this.updatedOn = updatedOn;
    this.percentage = -1;
  }
}

const addIncomes = (userId) => {
  return new Promise((resolve, reject) => {
    incomes.find({ 'creator_id':userId})
    .then(incomes_arr => {
      if(incomes_arr.length > 0) {
        for(const income of incomes_arr) {
          const newIncome = new Income(income._id, income.description, income.amount, income.creator_id, income.created, income.updated);
          dataStructure.allData.incomes.push(newIncome);
        }
      }
      resolve('GO');
    })
  });
};

const addExpense = (userId) => {
  return new Promise((resolve, reject) => {
    expenses.find({ 'creator_id': userId})
    .then(expenses_arr => {
      if(expenses_arr.length > 0) {
        for(const expense of expenses_arr) {
          const newExpense = new Expense(expense._id, expense.description, expense.amount, expense.creator_id, expense.created, expense.updated);
          dataStructure.allData.expenses.push(newExpense);
        }
      }
      resolve('GO');
    })
  });
};

const addTotals = () => {
  return new Promise((resolve, reject) => {
    // total income
    //console.log(dataStructure.allData.incomes.length);
    if(dataStructure.allData.incomes.length > 0) {
      dataStructure.allData.incomes.forEach(cur => {
        dataStructure.totals.income += cur.amount;
      });
    }
    // total expense
    if(dataStructure.allData.expenses.length > 0) {
        dataStructure.allData.expenses.forEach(cur => {
        dataStructure.totals.expense += cur.amount;
      });
    }
    // remaining amount
    dataStructure.totals.remain = dataStructure.totals.income - dataStructure.totals.expense;

    // total expense percentage
    if(dataStructure.totals.income > 0) {
      dataStructure.percentage = Math.round((dataStructure.totals.expense * 100) / dataStructure.totals.income);
    }
    resolve('GO');
  });
};

const addIndividualPercent = () => {
  return new Promise((resolve, reject) => {
    const totalIncome = dataStructure.totals.income;
    if(totalIncome > 0) {
      dataStructure.allData.expenses.forEach(cur => {
        cur.percentage = Math.round((cur.amount * 100) / totalIncome);
      });
    }
    resolve('GO');
  });
};

const allDone = function(userId) {
  return new Promise((resolve, reject) => {
    addIncomes(userId)
    .then(addIncomesReply => {
      if(addIncomesReply === 'GO') {
        addExpense(userId)
        .then(addExpenseReply  => {
          if(addExpenseReply === 'GO') {
            addTotals()
            .then(addTotalsReply => {
              if(addTotalsReply === 'GO') {
                addIndividualPercent()
                .then(addIndividualPercentReply => {
                  if(addIndividualPercentReply === 'GO') {
                    resolve(dataStructure);
                  }
                })
              }
            })
          }
        })
      }
    })
  });
};

const setDataStructure = function(userId) {
  return new Promise((resolve, reject) => {
    allDone(userId).then(dataStructure => {
      resolve(dataStructure);
    });
  });
};


module.exports = {setDataStructure, clearDataStructure};
