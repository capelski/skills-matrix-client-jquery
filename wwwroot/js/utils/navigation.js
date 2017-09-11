(function() {
    var pages = [];
    var navigation = {
        register: function(pageId, loadPromise) {
            pages.push({
                id: pageId,
                loadPromise: loadPromise
            });
        },
        navigate: function(pageId, pageData) {
            $('.navigation-section').removeClass('visible');
            $('#' + pageId).addClass('visible');
            var page = pages.find(page => page.id == pageId);
            return page.loadPromise(pageData);

            /*$('.navigation-section').removeClass('visible');
            var page = pages.find(page => page.id == pageId);
            return page.loadPromise(pageData)
            .then(function() {
                $('#' + pageId).addClass('visible');
            });*/
        }
    };
    window.Navigation = navigation;
})();