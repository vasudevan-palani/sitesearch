rm sitesearch-api.zip
zip -r sitesearch-api.zip .
sls deploy --aws-profile personal --region us-east-1 --stage dev
