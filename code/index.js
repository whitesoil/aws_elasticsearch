const AWS = require('aws-sdk');
const ES = require('./elasticsearch');

const reko = new AWS.Rekognition({
    apiVersion: '2016-06-27'
});

ES.indexExists().then((exists)=>{
    if(!exists){
        ES.initIndex();
        ES.initMapping();
        return;
    }
}).catch((error)=>{console.error(error)});

// Make resource from sqs data to input to ElasticSearch
function indexNewDocument(imgTitle, imgS3Location, resultDictionary){
    let resultNestedObj = [];
    for(let key in resultDictionary){
        resultNestedObj.push({"tag":key, "score":resultDictionary[key]});
    }
    return ES.addImages(imgTitle, imgS3Location, resultNestedObj);
}

exports.handler = async (event) => {
    try{
        let body = JSON.parse(event["Records"][0]["body"]);
        let filenameKey = body["Records"][0]["s3"]["object"]["key"];
        
        const rekoParams = {
                Image: {
                    S3Object: {
                        Bucket: "ausg-architecture-seon",
                        Name: filenameKey
                    }
                },
            MaxLabels: 123,
            MinConfidence: 70
        };
        let resultDictionary = {};
        
        let labels = await reko.detectLabels(rekoParams).promise();            
            labels['Labels'].forEach((label)=>{
                resultDictionary[label['Name']] = label['Confidence'];
            });                    
        console.log(resultDictionary);
        /*
        * ex) `https://s3.ap-northeast-2.amazonaws.com/seonny-bucket/${filenameKey}`
        * 주의 : 서울리전 (ap-northeast-2)를 본인의 리전에 맞게 수정해주세요
        */
        let s3_location = `https://s3.ap-northeast-2.amazonaws.com/이곳에 S3 버킷이름을 넣어주세요/${filenameKey}`;
        await indexNewDocument(filenameKey,s3_location,resultDictionary);      
        console.log("Finish");
        const response = {
            statusCode: 200,
            body: JSON.stringify('Success'),
        };
        return response;
    }catch(error){
        console.error(error);
        const response = {
            statusCode: 400,
            body: JSON.stringify('Fail'),
        };
        return response;
    }
    
};