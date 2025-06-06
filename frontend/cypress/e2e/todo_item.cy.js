describe('To do creation, delete and edit',() => {
  // define variables that we need on multiple occasions
  let uid // user id
  let email // email of the user
  let task_id // task id
  let task_title // title of the task

  beforeEach(function () {
    return cy.fixture('user.json').then((user) => {
      return cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((response) => {
        uid = response.body._id.$oid
        email = user.email
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
            console.log("task_id response:", task_id)
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
          })
        })
      })
    })
  })

  // beforeEach(function () {
  //   cy.visit('http://localhost:3000')

  //   // detect a div which contains "Email Address", find the input and type
  //   cy.contains('div', 'Email Address')
  //     .find('input[type=text]')
  //     .type(email)

  //   // submit the form on this page
  //   cy.get('form')
  //     .submit()

  //   // click the task created
  //   cy.contains('div', task_title)
  //   .click()
  // })

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

  it('Click unchecked todo checked item', () => {
    cy.get('ul > li')
      .filter(':has(span)')
      .last()
      .children()
      .eq(0)
      .click({ force: true })
      .should('have.class', 'checked')
      .parents()
      .children()
      .eq(1)
      .should('have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)')
  })

  it('Click checked todo unchecked item', () => {
    cy.get('ul > li')
      .filter(':has(span)')
      .last()
      .children()
      .eq(0)
      .click({ force: true })
      .should('have.class', 'unchecked')
      .parents()
      .children()
      .eq(1)
      .should('not.have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)')
  })

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

  afterEach(function () {
    // clean up by deleting the data created from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
      cy.log(response.body)
    })
  })
})
