cat << EOF
gora.datastore.default=org.apache.gora.dynamodb.store.DynamoDBStore
gora.datastore.autocreateschema=true

preferred.schema.name=webpage
gora.dynamodb.client=sync
gora.dynamodb.consistent.reads=true
gora.dynamodb.endpoint=http://dynamodb.us-east-1.amazonaws.com/
gora.dynamodb.serialization.type=dynamo
EOF
