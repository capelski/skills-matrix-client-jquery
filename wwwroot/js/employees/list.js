(function(js, navigation, ajax, paginatedList) {

    var htmlNodes = paginatedList.getHtmlNodes('employees-list-wrapper');

    var state = paginatedList.getState();
    state.hasSearcher = true;
    state.hasPagination = true;

    function render() {
        // State would be retrieved from the store in Redux
        paginatedList.render(htmlNodes, state, {
            elementDrawer: function (employee) {
                return '<li class="list-group-item"><a class="reset" href="#" '+
                'onclick="Navigation.navigate(\'employee-details-section\', {employeeId: ' + employee.Id +
                ', readOnly: true})">' + employee.Name + '</a></li>';
            },
            noResultsHtml: '<i>No employees found</i>'
        });
    };

    function getEmployees(state) {
        js.stallPromise(ajax.get('/api/employee', {
            keywords: state.keywords,
            page: state.page + state.pageOffset,
            pageSize: state.pageSize
        }, paginatedList.defaultInstance), 1500)
        .then(function(paginatedList) {
            state.loadPhase = 'loaded';
            state.results = paginatedList.Items;
            state.totalPages = paginatedList.TotalPages;
            render();
        });
    }

    paginatedList.attachEvents(htmlNodes, state, render, getEmployees);

    navigation.register('employees-list-section', function(navigationData) {
        state.loadPhase = 'loading';
        render();
        getEmployees(state);
    });

})(window.JsCommons, window.Navigation, window.Ajax, window.PaginatedList);
