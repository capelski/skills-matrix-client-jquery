(function(js, navigation, ajax, paginatedList, htmlNodes, render) {

    var state = {
        employeesList: paginatedList.getState(),
        addEmployeesList: paginatedList.getState(),
        skill: {
            Id: -1,
            Name: '',
            Employees: []
        },
        loading: true
    };
    state.addEmployeesList.hasSearcher = true;
    state.addEmployeesList.searcherPlaceholder = "Add employees...";

    function addEmployee (state, event) {
        var employeeId = getEmployeeId(event);
        var employee = state.addEmployeesList.results.find(function(employee) {
            return employee.Id === employeeId;
        });
        state.addEmployeesList.results = [];
        state.addEmployeesList.keywords = '';
        if (employee) {
            state.skill.Employees.push(employee);
            render.skillEmployees(state);
        }
        render.foundEmployees(state);
    }

    function skillName (state, event) {
        var name = event.target.value;
        state.skill.Name = name;
        render.skillName(state);
    }

    function getEmployeeId(event) {
        var $element = $(event.target);
        if ($element.hasClass('fa')) {
            $element = $element.parent();
        }
        var employeeId = $element.data('employee-id');
        return employeeId;
    }

    function getEmployees() {
        var employeesPromise = Promise.resolve(paginatedList.defaultInstance);
        if (state.addEmployeesList.keywords.length > 0) {
            employeesPromise = ajax.get('/api/employee', {
                keywords: state.addEmployeesList.keywords
            }, paginatedList.defaultInstance);
        }
        js.stallPromise(employeesPromise, 1500)
        .then(function(paginatedList) {
            state.addEmployeesList.loadPhase = 'loaded';
            state.addEmployeesList.results = js.arrayDifference(paginatedList.Items, state.skill.Employees, 'Id');
            render.foundEmployees(state);
        });
    }
    
    function removeSkill(state, event) {
        js.actionModal('<div>Are you sure you want to delete ' + state.skill.Name + '?</div>', 'Delete')
        .then(function() {
            state.loading = true;
            render(state);
            return ajax.remove('/api/skill?id=' + state.skill.Id);
        })
        .then(function (skill) {
            basicModal.close();
            if (skill) {
                Navigation.navigate('skills-list-section');
            }
            else {
                state.loading = false;
                render(state);
            }
        });
    }

    function removeEmployee(state, event) {
        var employeeId = getEmployeeId(event);
        state.skill.Employees = state.skill.Employees.filter(function(employee) {
            return employee.Id !== employeeId;
        });
        state.employeesList.results = state.skill.Employees;
        render.skillEmployees(state);
    }

    function save(state, event) {
        state.loading = true;
        render(state);
        ajax.save('/api/skill', state.skill)
        .then(function (skill) {
            if (skill) {
                Navigation.navigate('skill-details-section', {
                    skillId: skill.Id,
                    readOnly: true
                });
            }
            else {
                state.loading = false;
                render(state);
            }
        });
    }

    htmlNodes.elementName.on('blur', function(event) {
        skillName(state, event);
    });
    htmlNodes.deleteButton.on('click', function(event) {
        removeSkill(state, event);
    });
    htmlNodes.saveButton.on('click', function(event) {
        save(state, event);
    });
    htmlNodes.addEmployeesList.list.on('click', '.add-employee', function(event) {
        addEmployee(state, event);
    });
    htmlNodes.employeesList.list.on('click', '.remove-employee', function(event) {
        removeEmployee(state, event);
    });
    paginatedList.attachEvents(htmlNodes.addEmployeesList, state.addEmployeesList,
        () => render.foundEmployees(state), getEmployees);

    navigation.register('skill-details-section', function(navigationData) {
        state.skill = {
            Id: navigationData.skillId,
            Name: '',
            Employees: []
        };
        state.readOnly = navigationData.readOnly,
        state.loading = true;        
        render(state);
        
        var skillPromise = Promise.resolve(state.skill);
        if (state.skill.Id != 0) {
            skillPromise = ajax.get('/api/skill/getById', {
                id : state.skill.Id
            });
        }

        return js.stallPromise(skillPromise, 1500)
        .then(function(skill) {
            state.loading = false;
            if (skill) {
                state.skill = skill;
                state.employeesList.results = state.skill.Employees;
            }
            else {
                state.skill.Id = -1;
                state.readOnly = true;
            }
            render(state);
        });
    });

})(window.JsCommons,
    window.Navigation,
    window.Ajax,
    window.PaginatedList,
    window.application.skillDetails.htmlNodes,
    window.application.skillDetails.render);
