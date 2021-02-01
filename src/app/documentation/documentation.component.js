const documentationComponent = require('./documentation.component.ejs');
const sommelierConfig = require('../sommelier-constants-node.js');

const documentationHtml = documentationComponent({
    documentationUri: sommelierConfig.SOMMELIER_DOCS_LOCAL_ADDR,
});

$(document).ready(function() {
    $('#content-wrapper').html(documentationHtml);
});

