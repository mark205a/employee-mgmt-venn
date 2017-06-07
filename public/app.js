const socket = io();

// socket (real-time crud)
socket.on('update pie', data => {
    vueApp.countEmployees()
    setTimeout(function() {
        vueApp.pie_load = true
    }, 100)
    
})

socket.on('add user', data => {
    vueApp.employees.push(data)
})

socket.on('remove user', _id => {
    for (let x = 0; x <= vueApp.employees.length; x++) {
        if (vueApp.employees[x]._id == _id) {
            vueApp.employees.splice(x, 1)
        }
    }
})

socket.on('update user', data => {
    for (let x = 0; x <= vueApp.employees.length; x++) {
        if (vueApp.employees[x]._id == data._id) {
            vueApp.employees[x] = Object.assign({}, data);
        }
    }
})
// socket (real-time crud)

const is_she_with_you = new Howl({
    src: ['ww.mp3'],
    loop: true
})

Vue.use(VueCharts);

const vueApp = new Vue({
    el: "#app",
    data: {
        drawer: true,
        links: [{
                name: 'Dashboard',
                icon: 'dashboard',
                url: '/'
            },
            {
                name: 'Employees',
                icon: 'people',
                url: '/employees'
            },
            {
                name: 'Search',
                icon: 'search',
                url: '/search'
            }
        ],
        search_emp: null,
        employees: [],
        progress_linear: false,
        employee: {
            agency_id: null,
            name: null,
            status: null
        },
        employee_edit: {},
        sortBy: 'name',
        sort_list: [{
                name: 'Name',
                field: 'name'
            },
            {
                name: 'Agency ID',
                field: 'agency_id'
            },
            {
                name: 'Created At',
                field: 'created_at'
            },
            {
                name: 'Status',
                field: 'status'
            }
        ],
        employee_add_success: false,
        employee_update_success: false,
        employee_success_msg: null,
        employee_add_dialog: false,
        employee_edit_dialog: false,
        form_error: false,
        selected_employee: {},
        delete_success: false,
        delete_dialog: false,
        status: ['Permanent', 'Contractual', 'Job Order'],
        play_icon: 'play_circle_filled',
        stop_btn: false,
        pie_load: false,
        pie_status_data: []
    },
    created() {
        this.loadEmployees()
        
        var self = this
        setTimeout(function() {
            self.pie_load = true
        }, 100)
    },
    methods: {
        go(url, index) {
            this.links[index].name = "Loading..."
            setTimeout(() => {
                window.location.href = url
            }, 0)
        },
        openEmployeeDialog(type) {
            this.employee_add_dialog = true
        },
        openEditEmployeeDialog(emp) {
            this.employee_edit = Object.assign({}, emp);
            this.employee_edit_dialog = true
        },
        closeEmployeeAddDialog() {
            this.employee = {
                agency_id: null,
                name: null,
                status: null
            }
            this.selected_employee = null
            this.form_error = false
            this.employee_add_dialog = false
        },
        closeEmployeeEditDialog() {
            this.employee_edit = {}
            this.form_error = false
            this.employee_edit_dialog = false
        },
        loadEmployees() {
            const self = this;
            this.progress_linear = true
            axios.get('/all_employees').then(response => {
                self.progress_linear = false
                self.employees = response.data
                console.log(response.data)
                self.countEmployees()
            })
        },
        addEmployee() {
            const self = this;
            if (!this.employee.agency_id || !this.employee.name || !this.employee.status) {
                this.form_error = true
                return false
            }
            this.progress_linear = true
            axios.post('/employees', this.employee).then(response => {
                const data = response.data;
                if (data.success) {
                    self.progress_linear = false
                    self.employee_success_msg = "Employee Added"
                    self.employee_success = true
                    setTimeout(() => {
                        self.employee_success = false
                    }, 3000)
                    socket.emit('add user', data.doc) //add in real time
                    self.employee = {
                        agency_id: null,
                        name: null,
                        status: null
                    }
                } else {
                    console.log(data.err)
                }
            })
        },
        updateEmployee() {
            const self = this;
            if (!this.employee_edit.agency_id || !this.employee_edit.name || !this.employee_edit.status) {
                this.form_error = true
                return false
            }
            console.log(this.employee_edit)
            this.progress_linear = true
            axios.patch('/employees', this.employee_edit).then(response => {
                console.log(response.data)
                const data = response.data;
                if (data.success) {
                    self.progress_linear = false
                    self.employee_update_success = true
                    socket.emit('update user', self.employee_edit) //update in real time
                    self.pie_load = false
                    socket.emit('update pie', 1)
                    setTimeout(() => {
                        self.employee_success = false
                    }, 3000)
                } else {
                    console.log(data.err)
                }
            })
        },
        openDeleteDialog(emp) {
            this.selected_employee = emp
            this.delete_dialog = true
        },
        cancelRemove() {
            this.selected_employee = null
            this.delete_dialog = false
        },
        removeUser(index) {
            const self = this;
            const _id = this.selected_employee._id;
            this.progress_linear = true
            axios.delete(`/employees/${_id}`).then(response => {
                const data = response.data;
                console.log(response.data)
                if (data.success) {
                    self.progress_linear = false
                    self.delete_success = true
                    setTimeout(() => {
                        self.delete_success = false
                    }, 3000)
                    self.selected_employee = null
                    self.delete_dialog = false
                    socket.emit('remove user', _id) //remove in real time
                } else {
                    console.log(data.err)
                }
            })
        },
        playSound() {
            if (this.play_icon == 'play_circle_filled') {
                this.play_icon = 'pause_circle_filled'
                this.stop_btn = true
                is_she_with_you.play()
            } else {
                this.play_icon = 'play_circle_filled'
                this.stop_btn = true
                is_she_with_you.pause()
            }
        },
        stopSound() {
            is_she_with_you.stop()
            this.play_icon = 'play_circle_filled'
            this.stop_btn = false
        },
        countEmployees() {
            var p, c, j;
            this.pie_status_data = []
            p = this.employees.filter(function(e) {
                return e.status == "Permanent"
            }).length

            c = this.employees.filter(function(e) {
                return e.status == "Contractual"
            }).length

            j = this.employees.filter(function(e) {
                return e.status == "Job Order"
            }).length
            
            this.pie_status_data.push(p, c, j)
        }
    }
});