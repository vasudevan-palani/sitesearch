cat << EOF
<?xml version="1.0"?>
<!--
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<configuration>

    <property>
        <name>oozie.service.ProxyUserService.proxyuser.${USERNAME}.hosts</name>
        <value>*</value>
        <description>
            List of hosts the '#USER#' user is allowed to perform 'doAs'
            operations.

            The '#USER#' must be replaced with the username o the user who is
            allowed to perform 'doAs' operations.

            The value can be the '*' wildcard or a list of hostnames.

            For multiple users copy this property and replace the user name
            in the property name.
        </description>
    </property>
    <property>
            <name>oozie.service.HadoopAccessorService.hadoop.configurations</name>
            <value>*=${HADOOP_HOME}/etc/hadoop</value>
            <description>
                Comma separated AUTHORITY=HADOOP_CONF_DIR, where AUTHORITY is the HOST:PORT of
                the Hadoop service (JobTracker, HDFS). The wildcard '*' configuration is
                used when there is no exact match for an authority. The HADOOP_CONF_DIR contains
                the relevant Hadoop *-site.xml files. If the path is relative is looked within
                the Oozie configuration directory; though the path can be absolute (i.e. to point
                to Hadoop client conf/ directories in the local filesystem.
            </description>
    </property>
    <property>
        <name>oozie.service.WorkflowAppService.system.libpath</name>
        <value>hdfs://${HADOOP_NAME_SERVER}:${HADOOP_NAME_SERVER_PORT}/user/${USERNAME}/share/lib</value>
        <description>
            System library path to use for workflow applications.
            This path is added to workflow application if their job properties sets
            the property 'oozie.use.system.libpath' to true.
        </description>
    </property>
    <property>
        <name>oozie.service.ProxyUserService.proxyuser.${USERNAME}.groups</name>
        <value>*</value>
        <description>
            List of groups the '#USER#' user is allowed to impersonate users
            from to perform 'doAs' operations.

            The '#USER#' must be replaced with the username o the user who is
            allowed to perform 'doAs' operations.

            The value can be the '*' wildcard or a list of groups.

            For multiple users copy this property and replace the user name
            in the property name.
        </description>
    </property>
    <property>
        <name>oozie.db.schema.name</name>
        <value>oozie</value>
    </property>
    <property>
        <name>oozie.service.JPAService.create.db.schema</name>
        <value>false</value>
    </property>
    <property>
        <name>oozie.service.JPAService.validate.db.connection</name>
        <value>true</value>
    </property>
    <property>
      <name>oozie.service.JPAService.jdbc.driver</name>
        <value>com.mysql.jdbc.Driver</value>
        <description>JDBC driver class.</description>
    </property>
    <property>
        <name>oozie.test.db.port</name>
        <value>3306</value>
    </property>
    <property>
      <name>oozie.service.JPAService.jdbc.url</name>
        <value>jdbc:mysql://${OOZIE_DB_HOST}:${OOZIE_DB_PORT}/oozie</value>
        <description>JDBC URL.</description>
    </property>
    <property>
        <name>oozie.service.JPAService.jdbc.username</name>
        <value>oozie</value>
        <description>DB user name.</description>
    </property>
    <property>
        <name>oozie.service.JPAService.jdbc.password</name>
        <value>oozie</value>
        <description>
            DB user password. IMPORTANT: if password is emtpy leave a 1 space string, the service trims the
            value, if empty Configuration assumes it is NULL.
        </description>
    </property>
    <property>
        <name>oozie.service.JPAService.pool.max.active.conn</name>
        <value>10</value>
    </property>

</configuration>
EOF
