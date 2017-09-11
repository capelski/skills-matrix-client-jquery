(function(paginatedList) {

    var htmlNodes = {
        addSkillsList: paginatedList.getHtmlNodes('employee-details-add-skills'),
        loader : $('#employee-loader'),
        pageTitle : $('#employee-page-title'),
        elementName : $('#employee-model-name'),
        skillsList : paginatedList.getHtmlNodes('employee-details-skills'),
        editButton : $('#employee-edit-button'),
        deleteButton : $('#employee-delete-button'),
        saveButton : $('#employee-save-button'),
        cancelButton : $('#employee-cancel-button'),
        viewWrapper : $('#employee-view-wrapper')
    };

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

    function render() {
        // State would be retrieved from the store in Redux        
        render.readOnly();
        render.employeeName();
        render.employeeSkills();
        render.foundSkills();
        render.viewWrapper();
    }

    render.foundSkills = function () {
        paginatedList.render(htmlNodes.addSkillsList, state.addSkillsList, {
            elementDrawer: function (skill) {
                return '<li class="list-group-item"><span class="add-skill" data-skill-id="' + skill.Id +
                '"><i class="fa fa-plus text-success"></i> '
                + skill.Name + '</span></li>';
            },
            noResultsHtml: '<i>No skills found</i>'
        });
    };

    render.employeeName = function() {
        htmlNodes.pageTitle.html(state.employee.Name);
        htmlNodes.elementName.val(state.employee.Name);
    };

    render.employeeSkills = function() {
        paginatedList.render(htmlNodes.skillsList, state.skillsList, {
            elementDrawer: function (skill) {
                var html = '<li class="list-group-item"><a class="reset" href="#"' +
                'onclick="Navigation.navigate(\'skill-details-section\', {skillId: ' + skill.Id +
                ', readOnly: true})">' + skill.Name + '</a></li>';
                if (!state.readOnly) {
                    html = '<li class="list-group-item"><span class="remove-skill" data-skill-id="' + skill.Id +
                    '"><i class="fa fa-times text-danger"></i> '
                    + skill.Name + '</span></li>';
                }
                return html;
            },
            noResultsHtml: '<i>No skills assigned yet</i>'
        });
    };

    render.readOnly = function() {
        htmlNodes.addSkillsList.wrapper.hide();
        htmlNodes.editButton.hide();
        htmlNodes.editButton.removeAttr('onclick');
        htmlNodes.deleteButton.hide();
        htmlNodes.pageTitle.text('Employee not found');            
        htmlNodes.saveButton.hide();
        htmlNodes.cancelButton.hide();
        htmlNodes.cancelButton.removeAttr('onclick');

        if (state.readOnly) {
            htmlNodes.elementName.attr('disabled', 'disabled');
            if (state.employee.Id > 0) {
                htmlNodes.pageTitle.text(state.employee.Name);
                htmlNodes.editButton.attr('onclick', 'Navigation.navigate(\'employee-details-section\', ' +
                '{employeeId: ' + state.employee.Id + ', readOnly: false})');
                htmlNodes.editButton.show();
                htmlNodes.deleteButton.show();
            }
        }
        else {
            htmlNodes.elementName.removeAttr('disabled');                
            if (state.employee.Id >= 0) {
                htmlNodes.pageTitle.text('New employee');
                htmlNodes.addSkillsList.wrapper.show();
                htmlNodes.saveButton.show();
                htmlNodes.cancelButton.show();
                htmlNodes.cancelButton.attr('onclick', 'Navigation.navigate(\'employees-list-section\')');

                if (state.employee.Id > 0) {
                    htmlNodes.pageTitle.text(state.employee.Name);
                    htmlNodes.cancelButton.attr('onclick', 'Navigation.navigate(\'employee-details-section\', ' +
                    '{employeeId: ' + state.employee.Id + ', readOnly: true})');
                }
            }
        }
    };

    render.viewWrapper = function() {
        if (state.loading) {
            htmlNodes.viewWrapper.css({
                visibility: 'hidden'
            });
            htmlNodes.loader.parent().removeClass('loaded').addClass('loading');
        }
        else {
            htmlNodes.viewWrapper.css({
                visibility: 'visible'
            });
            htmlNodes.loader.parent().removeClass('loading').addClass('loaded');
        }
    };

    window.application = window.application || {};
    window.application.employeeDetails = window.application.employeeDetails || {};
    window.application.employeeDetails.htmlNodes = htmlNodes;
    window.application.employeeDetails.state = state;
    window.application.employeeDetails.render = render;

})(window.PaginatedList);
