(function(js, navigation, ajax, paginatedList, htmlNodes, state, render) {

    function addSkill (state, event) {
        var skillId = getSkillId(event);
        var skill = state.addSkillsList.results.find(function(skill) {
            return skill.Id === skillId;
        });
        state.addSkillsList.results = [];
        state.addSkillsList.keywords = '';
        if (skill) {
            state.employee.Skills.push(skill);
            render.employeeSkills();
        }
        render.foundSkills();
    }

    function employeeName (state, event) {
        var name = event.target.value;
        state.employee.Name = name;
        render.employeeName();
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
            render.foundSkills();
        });
    }
    
    function removeEmployee(state, event) {
        js.actionModal('<div>Are you sure you want to delete ' + state.employee.Name + '?</div>', 'Delete')
        .then(function() {
            state.loading = true;
            render();
            return ajax.remove('/api/employee?id=' + state.employee.Id);
        })
        .then(function (employee) {
            if (employee) {
                document.location.href = '/employees/';
            }
            else {
                basicModal.close();
                state.loading = false;
                render();
            }
        });
    }

    function removeSkill(state, event) {
        var skillId = getSkillId(event);
        state.employee.Skills = state.employee.Skills.filter(function(skill) {
            return skill.Id !== skillId;
        });
        state.skillsList.results = state.employee.Skills;
        render.employeeSkills();
    }

    function save(state, event) {
        state.loading = true;
        render();
        ajax.save('/api/employee', state.employee)
        .then(function (employee) {
            if (employee) {
                document.location.href = '/employees/details/' + employee.Id;
            }
            else {
                state.loading = false;
                render();
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
    paginatedList.attachEvents(htmlNodes.addSkillsList, state.addSkillsList, render.foundSkills, getSkills);

    navigation.register('employee-details-section', function(navigationData) {
        state.loading = true;
        render();
        
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
            render();
        });
    });

})(window.JsCommons,
    window.Navigation,
    window.Ajax,
    window.PaginatedList,
    window.application.employeeDetails.htmlNodes,
    window.application.employeeDetails.state,
    window.application.employeeDetails.render);
