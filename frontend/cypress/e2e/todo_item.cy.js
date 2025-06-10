// define variables that we need on multiple occasions
let uid         // user id
let email       // email of the user
let task_id     // task id
let todo_id     // todo id
let task_title  // title of the task

/**
 * Utility function to access the task page.
 * Used to refresh page after request to backend.
 * @params {string} email       email of the created user
 * @params {string} task_title  title of the created task
*/
function accessTask(email, task_title) {
  cy.visit('http://localhost:3000')

  // detect a div which contains "Email Address", find the input and type
  cy.contains('div', 'Email Address')
    .find('input[type=text]')
    .type(email)

  // submit the form on this page
  cy.get('form')
    .submit()

  // click the task created
  cy.contains('div', task_title)
  .click()
}

beforeEach(function () {
  // create a user
  return cy.fixture('user.json').then((user) => {
    return cy.request({
      method: 'POST',
      url: 'http://localhost:5000/users/create',
      form: true,
      body: user
    }).then((response) => {
      uid = response.body._id.$oid
      email = user.email

      // create a task for the user
      return cy.fixture('task_test.json').then((task) => {
        task.userid = uid
        task_title = task.title
        return cy.request({
          method: 'POST',
          url: 'http://localhost:5000/tasks/create',
          form: true,
          body: task
        }).then((response) => {
          task_id = response.body[0]["_id"]["$oid"]
          todo_id = response.body[0]["todos"][0]["_id"]["$oid"]
          console.log("task_id response:", task_id)

          // call accessTask to refresh page
          accessTask(email, task_title)
        })
      })
    })
  })
})

afterEach(function () {
  // clean up by deleting the data created from the database
  cy.request({
    method: 'DELETE',
    url: `http://localhost:5000/users/${uid}`
  }).then((response) => {
    cy.log(response.body)
  })
})

describe('R8UC1',() => {
  it('Add button disabled when description empty', () => {
    cy.contains('Add')
      .should('be.disabled')
  })

  it('Add button not disabled when description not empty', () => {
    cy.get('input[placeholder="Add a new todo item"]')
      .type('Test a todo')
    cy.contains('Add')
      .should('not.be.disabled')
  })

  it('Click add button append new todo', () => {
    cy.get('input[placeholder="Add a new todo item"]')
      .type('Test a todo')
    cy.contains('Add')
      .parents('form')
      .submit()
    cy.get('ul > li')
      .filter(':has(span)')
      .last()
      .children()
      .eq(1)
      .should('contain', 'Test a todo')
  })
})

describe('R8UC2',() => {
  it('Click unchecked todo checked item, done set to true', () => {
    cy.request({
      method: 'PUT',
      url: `http://localhost:5000/todos/byid/${todo_id}`,
      form: true,
      body: { data: JSON.stringify({"$set": {"done": false}})
      }
    }).then(() => {
      accessTask(email, task_title)

      cy.get('ul > li')
        .filter(':has(span)')
        .last()
        .children()
        .as('todoItem')
        .eq(0)
        .click({ force: true })

      cy.get('@todoItem')
        .should('have.class', 'checked')
        .parents()
        .children()
        .eq(1)
        .should('have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)')

      cy.request({
        method: 'GET',
        url: `http://localhost:5000/todos/byid/${todo_id}`
      }).its('body.done')
        .should('eq', true)
    })
  })

  it('Click checked todo unchecked item, done set to false', () => {
    cy.request({
      method: 'PUT',
      url: `http://localhost:5000/todos/byid/${todo_id}`,
      form: true,
      body: { data: JSON.stringify({"$set": {"done": true}})
      }
    }).then(() => {
      accessTask(email, task_title)

      cy.get('ul > li')
        .filter(':has(span)')
        .last()
        .children()
        .as('todoItem')
        .eq(0)
        .click({ force: true })

      cy.get('@todoItem')
        .should('have.class', 'unchecked')
        .parents()
        .children()
        .eq(1)
        .should('not.have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)')

      cy.request({
        method: 'GET',
        url: `http://localhost:5000/todos/byid/${todo_id}`
      }).its('body.done')
        .should('eq', false)
    })
  })
})

describe('R8UC3',() => {
  it('Click x item removed', () => {
    cy.get('ul > li')
      .filter(':has(span)')
      .last()
      .children()
      .eq(2)
      .click({ force: true })

    cy.get('ul > li')
      .filter(':has(span)')
      .last()
      .children()
      .eq(1)
      .should('not.contain', 'Test a todo')
  })
})
