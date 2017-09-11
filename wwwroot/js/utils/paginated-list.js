(function(js, loader) {

    var PaginatedList = {};

    PaginatedList.attachActions = function(store, htmlNodes, updateResults) {
        
            function pageButtons(event) {
                store.dispatch(function(dispatch) {
                    dispatch({
                        event: event,
                        type: 'pageButtons'
                    });
                    updateResults(store.getState(), dispatch);
                });
            }

            function pageSizeList(event) {
                store.dispatch(function(dispatch) {
                    dispatch({
                        event: event,
                        type: 'pageSizeList'
                    });
                    updateResults(store.getState(), dispatch);
                });
            }

            function searcher(event) {
                store.dispatch(function(dispatch) {
                    dispatch({
                        event: event,
                        type: 'searcher'
                    });
                    updateResults(store.getState(), dispatch);
                });
            }

            function initialize(event) {
                store.dispatch(function(dispatch) {
                    dispatch({
                        type: 'initialize'
                    });
                    updateResults(store.getState(), dispatch);
                });
            }

        htmlNodes.keywords.on('keyup', js.eventDelayer(searcher));
        htmlNodes.pageSizeList.on('click', '.dropdown-option', pageSizeList);
        htmlNodes.pages.on('click', '.enabled > .page-button', pageButtons);
        htmlNodes.clearKeywords.on('click', initialize);
    };

    PaginatedList.attachEvents = function(htmlNodes, state, render, resultsUpdater) {

        resultsUpdater = resultsUpdater || function(state) {
            state.loadPhase = 'loaded';
        };

        function initialize(event) {
            PaginatedList.stateHandlers.initialize(state, event);
            render();
            resultsUpdater(state);
        }

        function pageButtons(event) {
            PaginatedList.stateHandlers.pageButtons(state, event);
            render();
            resultsUpdater(state);
        }

        function pageSizeList(event) {
            PaginatedList.stateHandlers.pageSizeList(state, event);
            render();
            resultsUpdater(state);
        }

        function searcher(event) {
            PaginatedList.stateHandlers.searcher(state, event);
            render();
            resultsUpdater(state);
        }

        htmlNodes.keywords.on('keyup', js.eventDelayer(searcher));
        htmlNodes.pageSizeList.on('click', '.dropdown-option', pageSizeList);
        htmlNodes.pages.on('click', '.enabled > .page-button', pageButtons);
        htmlNodes.clearKeywords.on('click', initialize);
    };

    PaginatedList.defaultInstance = {
        Items: [],
        TotalPages: 0
    };

    PaginatedList.getHtmlNodes = function(listId) {
        $('#' + listId).html(
            '<div id="' + listId + '-wrapper" class="paginated-list">' +
            '    <div id="' + listId + '-searcher" class="input-group" style="display: none;">' +
            '        <span class="input-group-addon"><i class="fa fa-search"></i></span>' +
            '        <input id="' + listId + '-keywords" class="form-control" />' +
            '        <span id="' + listId + '-clear-keywords" class="fa fa-times clear-icon"></span>' +
            '    </div>' +
            '    <div class="dynamic-content">' +
            '        <ul id="' + listId + '-list" class="list-group clickable"></ul>' +
            '        <div id="' + listId + '-loader" class="loader"></div>' +
            '        <div id="' + listId + '-pagination" class="pagination-bar" style="display: none;">' +
            '            <ul id="' + listId + '-pages" class="pagination clickable">' +
            '            </ul>' +
            '            <div class="dropup pull-right">' +
            '                <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
            '                    <span id="' + listId + '-page-size">10</span>' +
            '                    <span class="caret"></span>' +
            '                </button>' +
            '                <ul id="' + listId + '-page-size-dropdown" class="dropdown-menu" aria-labelledby="dropdownMenu1">' +
            '                </ul>' +
            '            </div>' +
            '            <div class="clearfix"></div>' +
            '        </div>' +
            '    </div>' +
            '</div>'
        );
        loader.create();
        return {
            clearKeywords: $('#'+ listId + '-clear-keywords'),
            keywords: $('#'+ listId + '-keywords'),
            list: $('#'+ listId + '-list'),
            loader: $('#'+ listId + '-loader'),
            pages: $('#'+ listId + '-pages'),
            pageSize: $('#'+ listId + '-page-size'),
            pageSizeList: $('#'+ listId + '-page-size-dropdown'),
            paginationBar: $('#'+ listId + '-pagination'),
            searcher: $('#'+ listId + '-searcher'),
            wrapper: $('#'+ listId + '-wrapper')
        };
    };

    PaginatedList.getState = function() {
        var state = {
            hasSearcher: false,
            hasPagination: false,
            keywords: '',
            loadPhase: 'not-loaded',
            loadPhases: ['not-loaded', 'loading', 'loaded'],
            page: 0,
            pageSize: 10,
            pageSizeOptions: [10, 25, 50],
            pageOffset: 0,
            pagesNumber: 5,
            results: [],
            searcherPlaceholder: 'Search ...',
            totalPages: 0
        };
        return state;
    };

    PaginatedList.reducer = function (state, action) {
        if (typeof state === 'undefined') {
            state = PaginatedList.getState();
        }

        switch (action.type) {
            case 'pageButtons':
                PaginatedList.stateHandlers.pageButtons(state, action.event);
                return state;
            case 'pageSizeList':
                PaginatedList.stateHandlers.pageSizeList(state, action.event);
                return state;
            case 'searcher':
                PaginatedList.stateHandlers.searcher(state, action.event);
                return state;
            case 'initialize':
                PaginatedList.stateHandlers.initialize(state, action.event);
                if (action.config) {
                    state.hasSearcher = typeof action.config.hasSearcher === "undefined" ? state.hasSearcher : action.config.hasSearcher;
                    state.hasPagination = typeof action.config.hasPagination === "undefined" ? state.hasPagination : action.config.hasPagination;
                }
                return state;
            case 'updateResults':
                state.results = action.paginatedList.Items;
                state.totalPages = action.paginatedList.TotalPages;
                state.loadPhase = 'loaded';
                return state;
            default:
                return state;
        }
    };

    PaginatedList.render = function(htmlNodes, state, options) {
        options = options || {};
        options.noResultsHtml = options.noResultsHtml || '<i>No results found</i>';
        options.elementDrawer = options.elementDrawer || function (element) {
            return '<li class="list-group-item">' + element + '</li>';
        };

        htmlNodes.loader.parent().removeClass(state.loadPhases.join(' ')).addClass(state.loadPhase);
        PaginatedList.render.searcher(htmlNodes, state);

        if (state.loadPhase !== 'loading') {
            PaginatedList.render.pagination(htmlNodes, state);
            PaginatedList.render.results(htmlNodes, state, options);
        }
    };

    PaginatedList.render.pagination = function(htmlNodes, state) {
        if (state.hasPagination) {
            var pagesNumber = Math.min(state.pagesNumber, state.totalPages - state.pageOffset);
            if (pagesNumber) {
                var pagination = '<li class="' + ((state.pageOffset - state.pagesNumber) >= 0 ? 'enabled' : 'disabled') +
                '"><span class="page-button" data-page-action="previous">&laquo;</span></li>';
                for (var i = 0; i < pagesNumber; ++i) {
                    pagination += '<li class="' + (state.page === i ? 'active' : 'enabled') + '"><span class="page-button" data-page-action="' +
                    i + '">' + (state.pageOffset + i + 1) + '</span></li>';
                }
                pagination += '<li class="' + ((state.pageOffset + state.pagesNumber) < state.totalPages ? 'enabled' : 'disabled') +
                '"><span class="page-button" data-page-action="following">&raquo;</span></li>';
                htmlNodes.pages.html(pagination);

                htmlNodes.pageSizeList.empty();
                state.pageSizeOptions.forEach(function(option) {
                    htmlNodes.pageSizeList.append('<li class="text-right"><span class="dropdown-option" data-size="' + option + '">' + option + '</span></li>');
                });

                htmlNodes.paginationBar.show();
            }
            else {
                htmlNodes.paginationBar.hide();
            }
            
            htmlNodes.pageSize.text(state.pageSize);
        }
        else {
            htmlNodes.paginationBar.hide();
        }
    };

    PaginatedList.render.results = function(htmlNodes, state, options) {
        htmlNodes.list.empty();
        if (!state.results || !state.results.length) {
            htmlNodes.list.append(options.noResultsHtml);
        }
        else {
            state.results.map(options.elementDrawer)
            .forEach(function(element) {
                htmlNodes.list.append(element);
            });
        }
    };

    PaginatedList.render.searcher = function(htmlNodes, state) {
        htmlNodes.keywords.attr('placeholder', state.searcherPlaceholder);
        if (state.hasSearcher) {
            htmlNodes.keywords.val(state.keywords);
            if (state.keywords && state.keywords.length > 0) {
                htmlNodes.clearKeywords.show();
            }
            else {
                htmlNodes.clearKeywords.hide();
            }
            htmlNodes.searcher.show();
        }
        else {
            htmlNodes.searcher.hide();
        }
    };

        PaginatedList.stateHandlers = {};

    PaginatedList.stateHandlers.initialize = function(state, event)  {
        state.loadPhase = 'loading';
        state.keywords = '';
        state.page = 0;
        state.pageOffset = 0;
    };
    PaginatedList.stateHandlers.pageButtons = function(state, event)  {
        state.loadPhase = 'loading';
        var action = $(event.target).data('page-action');
        if (!isNaN(action)) {
            state.page = parseInt(action);
        }
        else if (action === 'previous') {
            if ((state.pageOffset - state.pagesNumber) >= 0) {
                state.pageOffset -= state.pagesNumber;                    
            }
            state.page = 0;
        }
        else if (action === 'following') {
            if ((state.pageOffset + state.pagesNumber) < state.totalPages) {
                state.pageOffset += state.pagesNumber;
            }
            state.page = 0;
        }
    };
    PaginatedList.stateHandlers.pageSizeList = function(state, event)  {
        state.loadPhase = 'loading';            
        var element = $(event.target);
        state.pageSize = element.data('size');
        state.page = 0;
        state.pageOffset = 0;
    };
    PaginatedList.stateHandlers.searcher = function(state, event)  {
        state.loadPhase = 'loading';
        state.keywords = event.target.value;
        state.page = 0;
        state.pageOffset = 0;
    };

    window.PaginatedList = PaginatedList;

})(window.JsCommons, window.Loader);