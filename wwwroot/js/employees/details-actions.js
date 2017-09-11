(function(js, navigation, ajax, paginatedList, htmlNodes, render) {

    var state = {
        skillsList: paginatedList.getState(),
        addSkillsList: paginatedList.getState(),
        employee: {
            Id: -1,
            Name: '',
            Skills: []
        },
        loading: true
    };
    state.addSkillsList.hasSearcher = true;
    state.addSkillsList.searcherPlaceholder = "Add skills...";

    function addSkill (state, event) {
        var skillId = getSkillId(event);
        var skill = state.addSkillsList.results.find(function(skill) {
            return skill.Id === skillId;
        });
        state.addSkillsList.results = [];
        state.addSkillsList.keywords = '';
        if (skill) {
            state.employee.Skills.push(skill);
            render.employeeSkills(state);
        }
        render.foundSkills(state);
    }

    function employeeName (state, event) {
        var name = event.target.value;
        state.employee.Name = name;
        render.employeeName(state);
    }

    function getSkillId(event) {
        var $element = $(event.target);
        if ($element.hasClass('fa')) {
            $element = $element.parent();
        }
        var skillId = $element.data('skill-id');
        return skillId;
    }

    function getSkills() {
        var skillsPromise = Promise.resolve(paginatedList.defaultInstance);
        if (state.addSkillsList.keywords.length > 0) {
            skillsPromise = ajax.get('/api/skill', {
                keywords: state.addSkillsList.keywords
            }, paginatedList.defaultInstance);
        }
        js.stallPromise(skillsPromise, 1500)
        .then(function(paginatedList) {
            state.addSkillsList.loadPhase = 'loaded';
            state.addSkillsList.results = js.arrayDifference(paginatedList.Items, state.employee.Skills, 'Id');
            render.foundSkills(state);
        });
    }
    
    function removeEmployee(state, event) {
        js.actionModal('<div>Are you sure you want to delete ' + state.employee.Name + '?</div>', 'Delete')
        .then(function() {
            state.loading = true;
            render(state);
            return ajax.remove('/api/employee?id=' + state.employee.Id);
        })
        .then(function (employee) {
            basicModal.close();
            if (employee) {
                Navigation.navigate('employees-list-section');
            }
            else {
                state.loading = false;
                render(state);
            }
        });
    }

    function removeSkill(state, event) {
        var skillId = getSkillId(event);
        state.employee.Skills = state.employee.Skills.filter(function(skill) {
            return skill.Id !== skillId;
        });
        state.skillsList.results = state.employee.Skills;
        render.employeeSkills(state);
    }

    function save(state, event) {
        state.loading = true;
        render(state);
        ajax.save('/api/employee', state.employee)
        .then(function (employee) {
            if (employee) {
                Navigation.navigate('employee-details-section', {
                    employeeId: employee.Id,
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
        employeeName(state, event);
    });
    htmlNodes.deleteButton.on('click', function(event) {
        removeEmployee(state, event);
    });
    htmlNodes.saveButton.on('click', function(event) {
        save(state, event);
    });
    htmlNodes.addSkillsList.list.on('click', '.add-skill', function(event) {
        addSkill(state, event);
    });
    htmlNodes.skillsList.list.on('click', '.remove-skill', function(event) {
        removeSkill(state, event);
    });
    paginatedList.attachEvents(htmlNodes.addSkillsList, state.addSkillsList,
        () => render.foundSkills(state), getSkills);

    navigation.register('employee-details-section', function(navigationData) {
        state.employee = {
            Id: navigationData.employeeId,
            Name: '',
            Skills: []
        };
        state.readOnly = navigationData.readOnly,
        state.loading = true;
        render(state);
        
        var employeePromise = Promise.resolve(state.employee);
        if (state.employee.Id != 0) {
            employeePromise = ajax.get('/api/employee/getById', {
                id : state.employee.Id
            });
        }

        return js.stallPromise(employeePromise, 1500)
        .then(function(employee) {
            state.loading = false;
            if (employee) {
                state.employee = employee;
                state.skillsList.results = state.employee.Skills;
            }
            else {
                state.employee.Id = -1;
                state.readOnly = true;
            }
            render(state);
        });
    });

})(window.JsCommons,
    window.Navigation,
    window.Ajax,
    window.PaginatedList,
    window.application.employeeDetails.htmlNodes,
    window.application.employeeDetails.render);
