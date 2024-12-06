var isPreview = window.location.pathname.toLowerCase().includes('/preview/'),
    hasCanonical = !!document.querySelector('link[rel="canonical"]');

if (!isPreview && !hasCanonical) {
    var clientDomain = window.location.origin,
        canonicalUrl = clientDomain,
        hasItemId = window.location.search.toLowerCase().includes('itemid='),
        hasFilingId = window.location.search.toLowerCase().includes('filingid=');
    
    canonicalUrl += window.location.pathname.split('/default.aspx')[0];
    canonicalUrl = trimUrl(canonicalUrl);
    canonicalUrl += canonicalUrl.endsWith('/') ? '' : '/';

    if (hasItemId) {
        var itemId = window.location.search.replace('?', '').split('&').find(function (query) { return query.toLowerCase().includes('itemid='); }).split('=')[1];
        if (itemId) canonicalUrl += '?itemid=' + itemId;
    } else if (hasFilingId) {
        var filingId = window.location.search.replace('?', '').split('&').find(function (query) { return query.toLowerCase().includes('filingid='); }).split('=')[1];
        if (filingId) canonicalUrl += '?filingid=' + filingId;
    }

    var canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.href = canonicalUrl;
    document.head.appendChild(canonical);
    
    function trimUrl(url) {
        var arr = url.split('/');
        if (arr.slice(-1)[0].length === 0 || !!arr.slice(-1)[0].match(/^\d{4}$/)) {
            arr.splice(-1);
            return trimUrl(arr.join('/'));
        } else {
            return url;
        }
    }
}