describe('To do creation, delete and edit',() => {
    // define variables that we need on multiple occasions
    let uid // user id
    // let name // name of the user (firstName + ' ' + lastName)
    // let email // email of the user
    let task_id // task id
    // let task_title // title of the task
    // let task_description // description of the task

    before(function () {
        // create a fabricated user from fixtures
        cy.fixture('user.json')
        .then((user) => {
            cy.request({
                method: 'POST',
                url: 'http://localhost:5000/users/create',
                form: true,
                body: user
            }).then((response) => {
                uid = response.body._id.$oid
                console.log(typeof(uid))
                // name = user.firstName + ' ' + user.lastName
                // email = user.email
            })
        })

        // create a fabricated task from fixtures
        return cy.fixture('task_test.json')
        .then((task) => {
            task.userid = uid
            console.log(task)
            cy.request({
                method: 'POST',
                url: 'http://localhost:5000/tasks/create',
                form: true,
                body: task
            }).then((response) => {
                task_id = response.body._id.$oid
                // task_title = task.title
                // task_description = task.description
            })
        })
    })


    beforeEach(function () {
        // enter the main main page
        cy.visit('http://localhost:3000')
    })

    it('starting out on the landing screen', () => {
        // make sure the landing page contains a header with "login"
        cy.get('h1')
        .should('contain.text', 'Login')
    })
} )
