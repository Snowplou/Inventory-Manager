const fs = require('fs');
const request = require('request');

// const url = "https://7wbcfqdqjn-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.13.1)%3B%20Browser%3B%20instantsearch.js%20(4.41.0)%3B%20Magento2%20integration%20(3.8.1)%3B%20JS%20Helper%20(3.8.2)"

// const formData = {"requests":[{"indexName":"vex_m2_vexrobotics_products","params":"highlightPreTag=__ais-highlight__&highlightPostTag=__%2Fais-highlight__&page=0&ruleContexts=%5B%22magento_filters%22%5D&hitsPerPage=500&clickAnalytics=true&query=&maxValuesPerFacet=10&facets=%5B%22vex_com_searchable_product%22%2C%22vex_classrooom%22%2C%22vex_application%22%2C%22vex_product_type%22%2C%22vex_product_line%22%5D&tagFilters=&numericFilters=%5B%22visibility_search%3D1%22%5D"}]}

let data = {}
data = JSON.parse(fs.readFileSync('data.json'))

// // Make a request
// request({
//     url: url,
//     method: "POST",
//     headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         "X-Algolia-API-Key": "MDcyMjUzNjU3NzZkNjNiMjg1NWFhNjFlZWIyZGNhNWYwYWMwYjdkN2NmMTMxOTI1MDM4ODZjZmNhMDIyNDM2YXRhZ0ZpbHRlcnM9",
//         "X-Algolia-Application-Id": "7WBCFQDQJN",
//     },
//     body: JSON.stringify(formData)
// }, function (error, response, body) {
//     if(error) {
//         console.log(error);
//     }
// data = body
// });

data = data.results[0].hits

products = []
for(let product of data){
    productInfo = {}
    productInfo.name = product.name
    productInfo.url = product.image_url
    productInfo.inStock = product.stock > 0 ? true : false
    productInfo.price = product.price.USD.default
    if(product.short_description){
        productInfo.description = product.short_description.value
    }
    if(product.vex_kit_contents){
        productInfo.contents = product.vex_kit_contents.value
    }
    productInfo.sku = product.sku[0]
    productInfo.type = product.vex_product_type
    if(typeof(productInfo.type) != 'object' && productInfo.type){
        productInfo.type = [productInfo.type]
    }
    productInfo.category = product.vex_application
    if(typeof(productInfo.category) != 'object' && productInfo.category){
        productInfo.category = [productInfo.category]
    }
    products.push(productInfo)
}

fs.writeFileSync('products.json', JSON.stringify(products, null, 1))