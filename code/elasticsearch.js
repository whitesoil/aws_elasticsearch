let ES = require('elasticsearch');

let elasticClient = new ES.Client({  
    //ex)host : https://search-ausg-seonny-asdfbkogrpovmsku.ap-northeast-2.es.amazonaws.com
    host: '***이곳에 Amazon Elasticsearch의 엔드포인트를 입력하세요***',
    log: 'info'
});

let indexName = "imagerepository";

/**
* Delete an existing index
*/
function deleteIndex() {  
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
* Create the index
*/
function initIndex() {  
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/*
* Check wether the index exists
*/
function indexExists() {  
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;

function initMapping() {  
    return elasticClient.indices.putMapping({
        index: indexName,
        type: "image",
        body: {
            properties: {
                title: { type: "text" },
                s3_location: { type: "text" },
                labels: {
                    type: "nested"                    
                }
            }
        }
    });
}
exports.initMapping = initMapping;

function addImages(imgTitle,imgS3Location,resultNestedObj) {  
    return elasticClient.index({
        index: indexName,
        type: "image",
        body: {
            title: imgTitle,
            s3_location: imgS3Location,
            labels: resultNestedObj
        }
    });
}
exports.addImages = addImages;