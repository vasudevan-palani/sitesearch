cat << EOF

gora.datastore.default=org.apache.gora.mongodb.store.MongoStore
gora.mongodb.override_hadoop_configuration=false
gora.mongodb.mapping.file=/gora-mongodb-mapping.xml
gora.mongodb.servers=${NUTCH_DB_HOST}:${NUTCH_DB_PORT}
gora.mongodb.db=nutch

EOF
