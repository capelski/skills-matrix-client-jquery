(function(js, ajax, paginatedList) {

    var htmlNodes = paginatedList.getHtmlNodes('skills-list-wrapper');

    var state = paginatedList.getState();
    state.hasSearcher = true;
    state.hasPagination = true;

    function render() {
        // State would be retrieved from the store in Redux
        paginatedList.render(htmlNodes, state, {
            elementDrawer: function (skill) {
                return '<li class="list-group-item"><a class="reset" href="/skills/details?id=' + skill.Id + '">' + skill.Name + '</a></li>';
            },
            noResultsHtml: '<i>No skills found</i>'
        });
    };

    function getSkills(state) {
        js.stallPromise(ajax.get('/api/skill', {
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

    // Actions
    function initialize(state, event) {
        state.loadPhase = 'loading';
        render();
        getSkills(state);
    }

    paginatedList.attachEvents(htmlNodes, state, render, getSkills);

    $().ready(function(event) {
        initialize(state);
    });

})(window.JsCommons, window.Ajax, window.PaginatedList);
